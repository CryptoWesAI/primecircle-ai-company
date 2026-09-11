"""Build the Sable Observatory promo video from the captured shots.

    python build.py <scratchDir> [outFile]

<scratchDir> holds shots/NN-name.png (3840x2160), shots/positions.json and
cursor.png. The browser part is rendered by the bundled browser-video-recording
renderer; captions, intro and end cards are composed with Pillow and ffmpeg.
"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

SCRATCH = Path(sys.argv[1])
OUT = Path(sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith("--") else "sable-observatory-promo.mp4")
RENDERER = Path.home() / ".claude/skills/browser-video-recording/scripts/render_browser_demo.py"
SHOTS = SCRATCH / "shots"
WORK = SCRATCH / "work"
WORK.mkdir(exist_ok=True)
FPS = 60
W, H = 1920, 1080
SRC = (3840, 2160)          # shots are 1920x1080 CSS px at device scale 2
S = 2                        # CSS px -> source px

INK = (10, 17, 24)
CYAN = (24, 191, 255)
CYAN_SOFT = (114, 220, 255)
WHITE = (240, 246, 250)
GREY = (150, 168, 182)
MONO = "C:/Windows/Fonts/consola.ttf"
MONO_B = "C:/Windows/Fonts/consolab.ttf"
UF = Path.home() / "AppData/Local/Microsoft/Windows/Fonts"
SANS = str(UF / "Inter-Regular.ttf")
SANS_M = str(UF / "Inter-Medium.ttf")
SANS_B = str(UF / "Inter-SemiBold.ttf")

pos = json.loads((SHOTS / "positions.json").read_text())

# name, shot, hold seconds, camera start (css x, css y, zoom), camera end, next click key, eyebrow, caption
SCENES = [
    ("overview",  "01-overview",  5.0, (960, 540, 1.00), (930, 560, 1.12), "explained", "01 / OVERVIEW",  "The whitepaper as a solar system. Every dot is a sentence."),
    ("explained", "02-explained", 4.0, (1000, 430, 1.28), (1000, 470, 1.32), "door",     "02 / EXPLAINED", "Sable in plain words: three promises."),
    ("door",      "03-door",      2.6, (1000, 430, 1.28), (1000, 450, 1.30), "send",     "03 / TRY IT",    "Send a prompt through the door. Nothing leaves your browser."),
    ("door-sent", "04-door-sent", 4.0, (1000, 560, 1.32), (1000, 600, 1.36), "loop",     "03 / TRY IT",    "Sealed. Budget held. Opened once. Receipted."),
    ("door-loop", "05-door-loop", 3.6, (1000, 600, 1.32), (980, 640, 1.36),  "check",    "03 / TRY IT",    "A runaway agent hits the cap and is refused."),
    ("verify",    "06-verify",    4.0, (1000, 470, 1.28), (1000, 520, 1.32), "token",    "04 / VERIFY",    "Check Sable yourself: live status, signer, supply."),
    ("token",     "07-token",     4.5, (1000, 540, 1.28), (1000, 600, 1.34), "play",     "06 / TOKEN",     "A thousand lights, one per million SABL, read from Solana."),
    ("play",      "08-play",      4.5, (1000, 560, 1.28), (1000, 600, 1.34), "log",      "PLAY",           "Gatekeeper: you are the door. Climb the leaderboard."),
    ("log",       "09-log",       3.5, (1000, 500, 1.28), (1000, 540, 1.32), "community","LOG",            "The whitepaper watched hourly. Every change on record."),
    ("community", "10-community", 2.6, (960, 540, 1.00), (960, 560, 1.10),   "guide",    "COMMUNITY",      "Built in the open, by a community member."),
    ("guide",     "11-guide",     4.0, (1500, 680, 1.20), (1620, 720, 1.36), None,       "GUIDE",          "Ask Lisa, the guide, to walk you through."),
]

# ---- timeline -------------------------------------------------------------
shots, scene_starts, cursor_keys, camera_keys, click_times, caption_windows = {}, [], [], [], [], []
t = 0.0
rest = (1100, 620)                       # where the cursor idles before the first move
for name, shot, hold, cam_a, cam_b, nxt, eyebrow, caption in SCENES:
    shots[name] = str(SHOTS / (shot + ".png"))
    scene_starts.append([round(t, 3), name, "fade"])
    camera_keys.append([round(t, 3), cam_a[0] * S, cam_a[1] * S, cam_a[2]])
    camera_keys.append([round(t + hold - 0.01, 3), cam_b[0] * S, cam_b[1] * S, cam_b[2]])
    caption_windows.append((round(t, 3), round(t + hold, 3), eyebrow, caption))
    cursor_keys.append([round(t, 3), rest[0] * S, rest[1] * S])
    if nxt:
        target = (pos[nxt]["x"], pos[nxt]["y"])
        click = t + hold - 0.3
        cursor_keys.append([round(click - 0.95, 3), rest[0] * S, rest[1] * S])
        cursor_keys.append([round(click - 0.35, 3), target[0] * S, target[1] * S])
        click_times.append(round(click, 3))
        rest = target
    else:
        cursor_keys.append([round(t + hold, 3), (rest[0] - 40) * S, (rest[1] - 30) * S])
    t += hold
MAIN_DUR = round(t, 3)

config = {
    "duration": MAIN_DUR, "fps": FPS, "output_size": [W, H], "source_size": list(SRC),
    "cursor_asset": str(SCRATCH / "cursor.png"), "cursor_hotspot": [2, 2], "cursor_scale": 2.4,
    "click_strength": 15, "rotation_strength_degrees": 6, "preset": "veryfast", "crf": 17,
    "shots": shots, "scene_starts": scene_starts, "cursor_keys": cursor_keys,
    "camera_keys": camera_keys, "click_times": click_times,
}
(WORK / "render-config.json").write_text(json.dumps(config, indent=2))

# ---- cards and captions ---------------------------------------------------
def font(path, size):
    return ImageFont.truetype(path, size)

def tracked(draw, xy, text, fnt, fill, tracking):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + tracking

def card(path, lines):
    im = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(im)
    # faint rings, a nod to the orrery on the home page
    for r, a in ((520, 28), (400, 22), (290, 18)):
        d.ellipse((W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r), outline=(INK[0] + a, INK[1] + a, INK[2] + a + 6), width=1)
    tracked(d, (96, 72), "PRIME CIRCLE", font(MONO_B, 22), CYAN_SOFT, 6)
    d.text((96, 104), "Sable Observatory  ·  independent", font=font(MONO, 20), fill=GREY)
    total = sum(h for _, _, _, h in lines)
    y = (H - total) / 2 - 20
    for text, fnt, fill, h in lines:
        w = d.textlength(text, font=fnt)
        d.text(((W - w) / 2, y), text, font=fnt, fill=fill)
        y += h
    im.save(path)

card(WORK / "intro.png", [
    ("Sable Observatory", font(SANS_B, 108), WHITE, 140),
    ("sable.primecircle.cloud", font(MONO_B, 50), CYAN, 92),
    ("An independent page about Sable Network. Read it, try it, check it yourself.", font(SANS, 34), GREY, 60),
])
card(WORK / "end.png", [
    ("sable.primecircle.cloud", font(MONO_B, 88), CYAN, 130),
    ("Try the door. Check Sable. Play Gatekeeper. Watch the whitepaper change.", font(SANS_M, 40), WHITE, 78),
    ("Independent, by a community member. Not run by Sable Network. The author holds SABL.", font(SANS, 30), GREY, 50),
])

caption_files = []
for i, (a, b, eyebrow, caption) in enumerate(caption_windows):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    f_eye, f_cap = font(MONO_B, 24), font(SANS_M, 38)
    pad, x0, y0 = 28, 72, H - 72
    tw = max(d.textlength(eyebrow, font=f_eye) + len(eyebrow) * 4, d.textlength(caption, font=f_cap))
    box_h = 24 + 46 + 12 + 24
    d.rounded_rectangle((x0, y0 - box_h, x0 + tw + pad * 2, y0), radius=14, fill=(INK[0], INK[1], INK[2], 214))
    d.rectangle((x0, y0 - box_h, x0 + 5, y0), fill=CYAN + (255,))
    tracked(d, (x0 + pad, y0 - box_h + 22), eyebrow, f_eye, CYAN_SOFT, 4)
    d.text((x0 + pad, y0 - box_h + 56), caption, font=f_cap, fill=WHITE + (255,))
    p = WORK / f"cap{i:02d}.png"
    im.save(p)
    caption_files.append((p, a, b))

# ---- render the browser part --------------------------------------------
main = WORK / "main.mp4"
if "--compose-only" in sys.argv and main.exists():
    print("reusing", main)
else:
    subprocess.run([sys.executable, str(RENDERER), "--config", str(WORK / "render-config.json"), "--output", str(main)], check=True)

# ---- compose: intro + captioned main + end --------------------------------
INTRO, END = 2.6, 7.0        # END leaves room for the last narration line (see mix.py)
cmd = ["ffmpeg", "-y", "-loglevel", "error",
       "-loop", "1", "-framerate", str(FPS), "-t", str(INTRO), "-i", str(WORK / "intro.png"),
       "-i", str(main),
       "-loop", "1", "-framerate", str(FPS), "-t", str(END), "-i", str(WORK / "end.png")]
for p, _, _ in caption_files:
    cmd += ["-loop", "1", "-framerate", str(FPS), "-i", str(p)]
chain = [f"[0:v]format=yuv420p,fade=t=in:st=0:d=0.5,fade=t=out:st={INTRO - 0.5}:d=0.5[a]"]
prev = "[1:v]"
for i, (p, a, b) in enumerate(caption_files):
    chain.append(f"{prev}[{3 + i}:v]overlay=shortest=1:enable='between(t,{a + 0.15},{b - 0.05})'[m{i}]")
    prev = f"[m{i}]"
chain.append(f"{prev}fade=t=in:st=0:d=0.4,fade=t=out:st={MAIN_DUR - 0.5}:d=0.5,format=yuv420p[b]")
chain.append(f"[2:v]format=yuv420p,fade=t=in:st=0:d=0.5,fade=t=out:st={END - 0.6}:d=0.6[c]")
chain.append("[a][b][c]concat=n=3:v=1:a=0,format=yuv420p[v]")
cmd += ["-filter_complex", ";".join(chain), "-map", "[v]", "-r", str(FPS),
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-movflags", "+faststart", str(OUT)]
subprocess.run(cmd, check=True)
print("main", MAIN_DUR, "s; total", INTRO + MAIN_DUR + END, "s ->", OUT)
