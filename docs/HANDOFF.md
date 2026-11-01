# VEX home: engineering handoff

The projectvex.ai home rebuilt as one screen: Kimm (the Live2D face of Vex) on the left, a chat with Vex on the right, the history rail on the far left, the dial menu behind the grid key, and a design system inside the menu. Version 99 of the preview artifact.

It is a static page with no backend: the orders, routes and checks are a scripted simulation of what VEX Desktop does (KyberSwap swaps, Relay bridges, limit checks, signing on your computer). To ship it against the real runtime, replace the scenario engine described in §5.

---

## 1. Run and build

```
cd dist && python3 -m http.server 8000      # open http://localhost:8000
python3 build.py                             # rebuild dist/ with local libraries (works offline)
python3 build.py --cdn                       # rebuild with libraries from jsdelivr (as published)
```

Serve over http (Kimm's model is fetched at runtime). Sound starts after the first click or key press, a browser rule.

`build.py` reads `src/`, then inlines into `dist/index.html`: the CSS, every script, the Hairline line figures, both fonts (woff2 as data URIs), every voice line (mp3 as data URIs) and the user avatar. It copies the Live2D model to `dist/kimm/`, the libraries to `dist/lib/` and the reel to `dist/reel/`.

Libraries (pinned): GSAP 3.15.0 (+ CustomEase, ScrollTrigger, SplitText), PIXI 6.5.10, pixi-live2d-display 0.4.0 (Cubism 4), Live2D Cubism Core. All in `dist/lib/`.

## 2. File map

| Path | What |
|---|---|
| `src/index.html` | page template; `{{CSS}}`, `{{SCRIPT}}`, `{{VOICE}}`, `{{HAIRLINE}}`, `{{MARK}}`, `/*FONTS*/` are filled by the build |
| `src/v16.css` | every style. Later blocks override earlier ones; the `v84`–`v99` blocks at the end are the current design (rail, design system, reasoning, no-glow, scan) |
| `src/v7.js` | the page engine: chat, scenarios (`SC`), `fromText()`, risk presets (`RISK`), reasoning trace, order card and scan, voice, music, the vEXIT key and bars, loader |
| `src/kimm.js` | Kimm: Live2D load, framing per layout mode, moods, idle acts, hand crossfades, springs, lip sync |
| `src/rail.js` | history rail and panel (localStorage `vexHist2`), New chat wiring |
| `src/dial.js` | the dial menu: groups On chain, Community, Design system |
| `src/ds.js`, `src/ds-data.js` | the in-page design system panel; `ds-data.js` holds the frozen components and Kimm stills (generated) |
| `src/cursor.js` | the custom cursor (fine pointers only) |
| `src/reel.js` | the Tutorial reel: a corner loop that grows full screen |
| `src/gradient-ascii.js` | the ASCII field behind Kimm (React Bits Gradient ASCII, ported; MIT + Commons Clause, David Haz) |
| `src/hl/`, `src/vendor/` | Hairline line figures (loader gate and small figures) |
| `src/fonts/` | Be Vietnam Pro 300/400/600, Roboto Mono 400 (woff2) |
| `src/mark.svg.html` | the VEX mark as an SVG symbol `#vexmark` |
| `model/` | Kimm for the web (moc as `kimm.moc.wasm`, 4096px webp textures) |
| `model-source/kimm-original/` | the model as delivered (8192px textures, expressions, VTube settings) |
| `voice/` | Vex's recorded lines, `lines.json`, render scripts |
| `music/` | the night-drive loop (mp3, wav) and the tool that renders it |
| `reel/vex-reel.mp4` | the Tutorial video |
| `assets/` | handoff assets: icons, brand mark, Kimm stills, screenshots (see §8) |
| `docs/` | this file, the design system, rules, copy, tokens, Kimm and music notes, changelog |

## 3. Layout modes

Three modes, chosen by media queries and mirrored in `kimm.js` `mode()`:

- **wide** (desktop): rail | Kimm's stage | chat. Kimm is framed like a portrait, face centred, head under the risk arc, closer the bigger the screen (`KM`, `span`, `k` in `kimm.js`). Chat and composer zoom with `--z = clamp(1, 100vw/1760, 1.5)`.
- **side** (landscape phone): Kimm 44% | chat.
- **stack** (portrait phone): Kimm above, chat below.

Resizing is smooth: the Live2D renderer resizes in its ResizeObserver; `html.rs` turns transitions off while resizing; `html.swap` crossfades when the mode changes.

## 4. Page APIs and events

Globals other scripts (or you) can call:

| API | Does |
|---|---|
| `vexAsk(text)` | sends an order as if typed; returns false while she is busy |
| `vexNew()` | New chat: voids any running order, stops her voice, clears the talk, greets again; always returns true |
| `vexPress()` | the vEXIT key: send, hurry, or approve depending on state |
| `vexVoice` | `.play(id)`, `.stop()`, `.set(on)`, `.speaking()`, `.level()` |
| `vexMusic` | `.set(on)`, `.hush(bool)`, `.playing()` |
| `vexDial` | `.open()`, `.close()` |
| `vexDS` | `.open(chapter)`, `.close()`; chapters: principles, colour, type, layout, components, icons, motion, character, voice. `#ds-colour` in the URL opens it on load |
| `kimm.on(event, data)` | drive Kimm: request, propose, wait, approve, done, refused, hi, idle, say, nudge, reset |
| `vexRiskPlace()` | re-place the risk arc over Kimm |
| `VEX_ICONS`, `VEX_RAIL_ICONS` | the glyph paths |

Window events: `vex:run` `{q, kind}` when an order starts; `vex:end` `{q, kind, result}` when it ends (`Signed`, `Answered`, `Blocked`, `Cancelled`); `vex:load` `{p, s}` while Kimm loads.

Stored in localStorage: `vexHist2` (history, max 24), `vexRisk` (c, b, a), `vexVoice` (on, off), `vexMusic` (on, off).

## 5. The order flow (`run()` in `src/v7.js`)

1. Your bubble; Kimm `request` (think).
2. **Reasoning block** (`reasoning()`): steps from `reasonOf(S)`: Model parses the order, each Tool call, Model proposes, Runtime takes over. Each step decodes, spins, then shows its time. Folds when done.
3. For a card: Vex's lead line, Kimm `propose`, then the **card** (`cardOf()`), whose rows scan in; then each check runs against the current `RISK` preset (`withRisk()`), PASS or FAIL.
4. Any FAIL: Blocked, "Nothing signed", Kimm `refused`. All PASS: Cleared, a 59:59 approval timer, Kimm `wait`; the key (or Enter) approves → Signing on this computer → Signed, Kimm `done`.
5. `vex:end` with the result; the history rail records it.

Every await in `run()` goes through a ticket (`gen`): New chat bumps it and the old run stops at its next step without touching the new chat.

**To connect the real runtime**, keep the UI functions and replace the scripted parts:
- `fromText()` / `SC` → your intent parser and route request;
- `reasonOf(S)` → the real trace (model thoughts and tool calls, streamed in as they happen);
- `cardOf(S.card)` fields and checks → the real proposal and the runtime's limit verdicts;
- the approval press → the real signing call (keys stay on the user's machine);
- `RISK` → the user's real limits.

## 6. Sound

- **Voice**: `VEX_VOICE` holds every mp3 as a data URI; `vex(text, cls, id)` plays the take and types the text in step with it, as a blue wave. To add a line: render it with `voice/scripts/render2.py`, put the mp3 in `voice/`, add it to `lines.json`, rebuild.
- **Music**: a night-drive loop generated in the browser (no file, no licence), ducked under her voice. Notes in `docs/MUSIC.md`.

## 7. Tutorial reel

`reel/vex-reel.mp4` (59 s, 1280×720, H.264 + AAC): a capture of the page running the realistic script (BTC read, swap with every field on the card, signing, a blocked bridge, risk modes, history), with her lines and the music. `reel.js` shows it as a muted corner loop that grows full screen with sound.

## 8. Handoff assets

| Path | What |
|---|---|
| `assets/brand/vex-mark.svg`, `vex-mark-black.svg` | the VEX mark, light and dark |
| `assets/icons/*.svg` | every glyph (24px grid, `currentColor`); `rail-*` are the history rail's |
| `assets/kimm-states/kimm-*.png` | Kimm's six moods, transparent (hi, think, offer, signed, refused, rest) |
| `assets/screens/` | every state: home, reasoning, awaiting approval, signed, blocked, market read, history, dial, each design system chapter, mobile, landscape, 2560 wide |

## 9. Browser support and limits

- Tested in Chromium (desktop 1440 and 2560, phone 390×844 and 844×390). Uses OKLCH, `:has()`, Web Audio, Web Animations, ResizeObserver, IntersectionObserver: current Chrome, Edge, Safari 16.4+, Firefox 113+.
- The custom cursor is for fine pointers only; touch devices keep their own behaviour.
- Everything is simulated: prices, routes and the chart are samples (the chart is drawn from a fixed seed and marked "Sample").
- Lines without a recorded take fall back to the browser's speech engine.
- `src/v16.css` has grown by appended blocks; a cleanup into one stylesheet per component is the obvious next refactor (keep `docs/tokens.css` as the single source of values).

## 10. Docs index

- [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md): tokens, type, layout, components, icons, motion, character, voice.
- [`DESIGN-RULES.md`](DESIGN-RULES.md): the 32 rules the build follows.
- [`COPY.md`](COPY.md): voice rules, page copy, scenarios, risk presets, every recorded line.
- [`tokens.css`](tokens.css), [`tokens.json`](tokens.json): the tokens as code.
- [`KIMM.md`](KIMM.md): Kimm's rig, moods, acts, motion and placement.
- [`MUSIC.md`](MUSIC.md): the generated music loop.
- [`CHANGELOG.md`](CHANGELOG.md): what changed, version by version.
