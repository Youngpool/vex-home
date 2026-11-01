# Music — the night-drive loop

The page's music is **generated live with WebAudio**, not played from a file: `const Music = (() => { … })()` in `src/v7.js`.
A rendered copy is included for use elsewhere:

- `music/vex-night-drive.mp3` (192 kbps) and `music/vex-night-drive.wav` (48 kHz, 16-bit, loudness −16 LUFS)
- 41.7 s = 16 bars, seamless loop (rendered twice, the second pass kept so the reverb tail carries over)

## What it is

| | |
|---|---|
| Tempo | 92 BPM, 16th-note grid |
| Harmony | Am – F – C – G, one bar each |
| Pad | each chord on two detuned saws (±7 cents), low-passed at 1.1 kHz, slow attack, into a 2.6 s dark reverb |
| Bass | root two octaves down, saw, low-passed at 320 Hz, on every 8th |
| Drums | sine kick (120 → 42 Hz) on 1, 3 and the "and" of 3; noise clap on 2 and 4 into the reverb; closed hat on off-16ths |
| Arp | triangle, chord tones up an octave, dotted-8th echo (feedback 0.35) |
| Mix | master 0.22 into a compressor |

## Behaviour on the page

- Starts on the first click or key press (browser rule); the Music key in the header turns it on or off, and the choice is remembered.
- **Ducks under Vex's voice**: drops to 35% while she speaks, back up when she stops.
- The Music icon shows when it is playing.

## Change it

Edit `BPM`, `PROG` (MIDI notes per bar), `VOL` or the parts inside `tick()` in `src/v7.js`, then `python3 build.py`.
To re-render the file: copy the same changes into `music/tools/render.html`, then `node music/tools/render.cjs`
(needs Node + Playwright) and normalise with ffmpeg:
`ffmpeg -i vex-night-drive.raw.wav -af loudnorm=I=-16:TP=-1.5 vex-night-drive.mp3`.
