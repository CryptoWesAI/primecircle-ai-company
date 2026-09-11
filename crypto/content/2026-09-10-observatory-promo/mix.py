"""Lay narration and a music bed under the silent promo.

    python mix.py <silent.mp4> <narration.mp3> <music.wav> <out.mp4>

The narration is one continuous MP3 read from SCRIPT below, one sentence group
per scene. It is cut at pauses: every pause of 0.12 s or more is a candidate,
and the 12 cut points are chosen so each group's length best matches the share
of the script it carries (dynamic programming over the candidates). Each group
is then placed at the start of its scene, never overlapping the previous group.
Music sits at low level and ducks under speech.
"""
import re, subprocess, sys
from pathlib import Path

video, narr, music, out = (Path(a) for a in sys.argv[1:5])

INTRO, END = 2.6, 7.0                                              # same as build.py
HOLDS = [5.0, 4.0, 2.6, 4.0, 3.6, 4.0, 4.5, 4.5, 3.5, 2.6, 4.0]   # same as build.py SCENES
END_AT = INTRO + sum(HOLDS)                                        # end card starts here
TOTAL = END_AT + END
# scene starts for the 13 sentence groups: intro card, 11 scenes, end card
STARTS = [0.4] + [round(INTRO + sum(HOLDS[:i]), 3) for i in range(len(HOLDS))] + [END_AT]
SCRIPT = [
    "This is the Sable Observatory.",
    "The whitepaper as a solar system, every dot a sentence.",
    "Three promises, in plain words: it forgets, it cannot overspend, it shows its work.",
    "Send a prompt through the door.",
    "Sealed, budget held, opened once, and receipted.",
    "Let it loop, and the cap refuses it.",
    "Check Sable yourself: live status, signer, and supply.",
    "The token: a thousand lights, one per million, read straight from Solana.",
    "Play Gatekeeper. You are the door. Climb the board.",
    "Every hour the whitepaper is checked, and every change is logged.",
    "Built in the open.",
    "And if you get lost, ask Lisa, the guide.",
    "Sable dot primecircle dot cloud. Independent, and the author holds the token.",
]
assert len(SCRIPT) == len(STARTS)


def probe_duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def silences(path, noise, min_d):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", f"silencedetect=noise={noise}dB:d={min_d}", "-f", "null", "-"],
                       capture_output=True, text=True)
    starts = [float(m) for m in re.findall(r"silence_start: ([0-9.]+)", r.stderr)]
    ends = [float(m) for m in re.findall(r"silence_end: ([0-9.]+)", r.stderr)]
    return list(zip(starts, ends))


narr_dur = probe_duration(narr)
sil = [(s, e) for s, e in silences(narr, -40, 0.12) if s > 0.3 and e < narr_dur - 0.3]
cands = [((s + e) / 2, e - s) for s, e in sil]          # (cut point, pause length)
print(f"{len(cands)} candidate pauses")

# expected group lengths: the script share of the speech, pauses included
lead = sil and sil[0][0] < 0.5 and 0 or 0.0
chars = [len(s) for s in SCRIPT]
speech = narr_dur
expect = [speech * c / sum(chars) for c in chars]

# DP: choose K-1 cut points (in order) to minimise the relative squared error of every group length
K = len(SCRIPT)
points = [0.0] + [c for c, _ in cands] + [narr_dur]
bonus = {c: min(l, 0.6) for c, l in cands}                # long pauses are sentence ends
N = len(points)
INF = float("inf")
best = [[INF] * N for _ in range(K + 1)]                  # best[g][j]: g groups ending at point j
back = [[-1] * N for _ in range(K + 1)]
best[0][0] = 0.0
for g in range(1, K + 1):
    for j in range(1, N):
        if g == K and j != N - 1:
            continue
        for i in range(j):
            if best[g - 1][i] == INF:
                continue
            d = points[j] - points[i]
            cost = best[g - 1][i] + ((d - expect[g - 1]) / expect[g - 1]) ** 2 - 0.4 * bonus.get(points[j], 0.0)
            if cost < best[g][j]:
                best[g][j] = cost
                back[g][j] = i
j = N - 1
idx = []
for g in range(K, 0, -1):
    idx.append(j)
    j = back[g][j]
idx.append(0)
idx.reverse()
segments = [(points[idx[i]], points[idx[i + 1]]) for i in range(K)]
for (a, b), e, s in zip(segments, expect, SCRIPT):
    flag = "" if abs((b - a) - e) / e < 0.35 else "  <-- off"
    print(f"{a:6.2f}-{b:6.2f}  {b - a:5.2f}s  expected {e:5.2f}s  {s[:40]}{flag}")

# Cut a group short at a pause inside it (source time in the narration file). The last
# sentence was recorded as "Independent, and the author holds the token."; the founder
# wanted it to end on the link (10 Sep 2026): the pause after "cloud." sits at 44.90-45.07 s.
TRIM_END = {12: 44.98}
segments = [(a, min(b, TRIM_END[i])) if i in TRIM_END else (a, b) for i, (a, b) in enumerate(segments)]

placed = []   # (src_start, src_end, place_at)
prev_end = 0.0
for (a, b), start in zip(segments, STARTS):
    at = max(start + 0.25, prev_end + 0.2)
    placed.append((a, b, at))
    prev_end = at + (b - a)
last_end = placed[-1][2] + (placed[-1][1] - placed[-1][0])
print("narration ends at", round(last_end, 2), "of", TOTAL)
if last_end > TOTAL - 0.4:
    raise SystemExit("narration runs past the end card: lengthen END in build.py or speed the narration up")

chain = []
names = []
for i, (a, b, at) in enumerate(placed):
    ms = int(round(at * 1000))
    chain.append(f"[1:a]atrim=start={a:.3f}:end={b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.04,afade=t=out:st={b - a - 0.06:.3f}:d=0.06,adelay={ms}|{ms}[n{i}]")
    names.append(f"[n{i}]")
chain.append("".join(names) + f"amix=inputs={len(names)}:normalize=0,apad=whole_dur={TOTAL},asplit=2[narr][sc]")
chain.append(f"[2:a]atrim=0:{TOTAL},asetpts=PTS-STARTPTS,volume=0.22,afade=t=in:d=1.5,afade=t=out:st={TOTAL - 3.0}:d=3.0[mus]")
chain.append("[mus][sc]sidechaincompress=threshold=0.03:ratio=5:attack=60:release=700:makeup=1[musd]")
chain.append("[musd][narr]amix=inputs=2:normalize=0,alimiter=limit=0.95[aout]")

cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(video), "-i", str(narr), "-i", str(music),
       "-filter_complex", ";".join(chain), "-map", "0:v", "-map", "[aout]",
       "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-t", f"{TOTAL}", "-movflags", "+faststart", str(out)]
subprocess.run(cmd, check=True)
print("wrote", out, "narration", round(narr_dur, 1), "s")
