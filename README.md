# VEX home (projectvex.ai rebuild)

One-screen home: Kimm (Live2D Vex) on the left, the chat with Vex on the right, the vEXIT key in the footer,
the risk arc over her head, the dial menu behind the grid key. Version 87 of the preview artifact.

## Run it

`dist/` is ready to serve. Kimm's model is fetched at runtime, so open it over http, not as a file:

    cd dist
    python3 -m http.server 8000
    # open http://localhost:8000

Libraries are in `dist/lib`, so the page works offline. Sound starts after the first click or key press (browser rule).

## Rebuild after editing

    python3 build.py          # local libraries (dist/lib)
    python3 build.py --cdn    # libraries from jsdelivr, as in the published artifact

`build.py` inlines everything into `dist/index.html`: CSS, scripts, Hairline figures, fonts, voice lines.

## Where things are

| Path | What |
|---|---|
| `src/index.html` | page template ({{CSS}}, {{SCRIPT}}, {{VOICE}}, {{HAIRLINE}}, {{MARK}} are filled by the build) |
| `src/v16.css` | all styles; later blocks override earlier ones (v38 … v59 at the end are the current design) |
| `src/v7.js` | page logic: chat engine and scenarios, voice + music, vEXIT key, ASCII field, risk arc, loader |
| `src/dial.js` | the dial menu opened by the grid key |
| `src/cursor.js` | the cursor: one white disc following the pointer with gsap.quickTo, grows over targets (fine pointers only) |
| `src/reel.js` | the showreel: a corner loop that opens full screen |
| `src/user-avatar.webp` | the user's default avatar in the chat |
| `reel/vex-reel.mp4` | the 20 s showreel (page capture + the music loop) |
| `src/gradient-ascii.js` | the background behind Kimm: React Bits Gradient ASCII ported to plain JS (MIT + Commons Clause, David Haz) |
| `src/kimm.js` | Kimm: Live2D loading, moods, idle acts, hand crossfades, springs, lip sync |
| `src/hl/`, `src/vendor/hairline-kernel.js` | Hairline line figures |
| `src/fonts/` | Be Vietnam Pro, Roboto Mono (woff2) |
| `model/` | Kimm Live2D model for the web (moc renamed `kimm.moc.wasm`, 4096 webp textures) |
| `model-source/kimm-original/` | the original Kimm model as delivered (8192 textures, expressions, VTube settings) |
| `music/` | the music loop rendered to mp3/wav, and the tool that renders it |
| `voice/*.mp3`, `voice/lines.json` | Vex's recorded lines and their text |
| `voice/scripts/` | Kokoro render scripts (af_bella 0.7 + jf_gongitsune 0.3, pitch lift 1.16) |

## More

- `KIMM.md`: Kimm's parameters, the hand rig findings, moods, acts, motion, placement.
- `MUSIC.md`: the generated night-drive loop, how it ducks under her voice, how to change and re-render it.

## Notes

- Design rules: black, ASCII field, tactical modernism; one 1px rule at 7% (24% for selected); no gradients except fading rules;
  blue only on Send and Download; filled icons.
- Risk presets live in `RISK` in `src/v7.js` (slippage / size / price age limits per strategy).
- Lines without a recorded take are read live by the browser's speech engine (different voice from Vex's recordings).
- To add a recorded line: render it with `voice/scripts/render2.py`, drop the mp3 in `voice/`, rebuild.
