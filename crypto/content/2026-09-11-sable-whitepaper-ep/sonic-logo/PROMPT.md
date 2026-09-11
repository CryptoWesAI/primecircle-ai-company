# The sting: Suno prompt for the sonic logo source

Suno has no duration control, so the render may come back longer than the
ident we want. That is fine: the logo is the best two seconds, cut with
`cut.sh`. The prompt asks for a short, two-event shape so that moment exists.

Shape of the ident, from the whitepaper's own sequence: a seal (a low, closed
hit, the request sealed on arrival) and a receipt (a bright rising chime that
resolves, the signed receipt). Same palette as the EP so it sounds like the
record's opening breath.

## Title
Sable Ident

## Settings
Custom mode. Newest model. Voice: OG THE MOGI (keeps the palette; there is
no voice in the sting). Instrumental: ON. Remixing: OFF.

## Style (paste into "Style of Music")
Audio logo, sonic ident, short instrumental sting. Melodic rap palette: one mellow piano chord, a smooth synth pad, a g-funk style synth lead, a soulful string swell, a single boom-bap drum hit with modern polish, 90 BPM. Two events only: first a low, closed, sealed thud like a lock closing, a beat of silence, then a bright rising three-note chime that resolves and rings out. Confident, triumphant, futuristic, clean and dry. Tight and short, ends with a clean decay into silence.

## If the render ignores the two-event shape
Second attempt with Instrumental OFF and only these tags in the Lyrics field,
nothing else, so the structure is explicit:

[Instrumental intro: one low sealed hit, then silence]
[Instrumental hook: bright rising three-note chime, resolves, rings out]
[Instrumental outro: clean decay to silence]

If a take hums or sings over the tags, reject it and go back to Instrumental ON.

## Picking the moment
Listen for a place where the low hit is followed by the chime within about
two seconds. Note the second where the hit starts. Save the WAV as
`sonic-logo/sting.wav`, then from the EP folder:

    bash sonic-logo/cut.sh sonic-logo/sting.wav <start-second> 2.0

The script trims, fades, normalises and prints loudness and duration. Two or
three candidate starts are cheap; run the script once per candidate and
listen to `sonic-logo/out/sable-ident.mp3` each time.
