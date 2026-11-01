# VEX design system

Version 99 of the projectvex.ai home. Every value here was read from the running page (computed styles), not estimated.
The same content is presented live inside the page: open the menu (grid key, top left) → **Design system**. The panel is `src/ds.js` + `src/ds-data.js`; its styles are the `v95` block of `src/v16.css`.

Machine-readable copies: [`tokens.css`](tokens.css) and [`tokens.json`](tokens.json). The rules that go with these tokens are in [`DESIGN-RULES.md`](DESIGN-RULES.md).

---

## 1. Principles

1. **Black and tactical.** Near-black grounds, cool white ink. Depth is one step of lightness. No shadows, no glass on the frame, no glow.
2. **Square cells, one hairline.** Everything sits in square cells cut by 1px rules at 7% white. The chosen cell lifts its rule to 24%. Corners are square; only chat bubbles are rounded.
3. **Blue is an action.** VEX blue appears on four things only: Send, Download, the Tutorial tag and the chosen risk mode.
4. **Filled glyphs.** Icons are solid shapes on a 24px grid, never outlines. Labels are uppercase and tracked; what Vex says is sentence case.
5. **Model proposes, runtime enforces, you decide.** The interface always shows which of the three is acting: the reasoning trace labels each step Model / Tool / Runtime, and every value the runtime checks is on the order card before you sign.

---

## 2. Colour

All colours are OKLCH. Every surface carries hue 264 (VEX blue) at very low chroma.

### Ground

| Token | Value | Used for |
|---|---|---|
| `--vx-page` | `oklch(9% 0.012 264)` | body, behind everything |
| `--vx-header` | `oklch(7% 0.01 264 / 0.82)` + 16px backdrop blur | top bar |
| `--vx-panel` | `oklch(8.5% 0.008 264)` | chat column, composer |
| `--vx-rail` | `oklch(6% 0.006 264)` | history rail |
| `--vx-dial` | `oklch(5.5% 0.006 264)` | menu overlay |
| `--vx-card` | `oklch(10.5% 0.006 264)` | order card, reasoning block |
| `--vx-cell` | `oklch(11% 0.006 264)` | New chat, quiet keys |
| `--vx-cell-raised` | `oklch(13% 0.004 264)` | Whitelist, dial links |

### Ink

| Token | Value | Used for |
|---|---|---|
| `--vx-ink` | `oklch(97% 0.005 264)` | text, filled glyphs |
| `--vx-ink-2` | `oklch(80% 0.012 264)` | quiet keys, labels at rest, reasoning text |
| `--vx-muted` | `oklch(62% 0.02 264)` | field names, metadata, timers |
| `--vx-faint` | `oklch(100% 0 0 / 0.55)` | the limit beside a value (`1% / 10%`) |

### Lines and fills

| Token | Value | Used for |
|---|---|---|
| `--vx-rule` | `oklch(100% 0 0 / 0.07)` | every cell edge |
| `--vx-rule-chosen` | `oklch(100% 0 0 / 0.24)` | the selected cell |
| `--vx-bubble` | `oklch(100% 0 0 / 0.06)` | Vex speaking |
| `--vx-bubble-you` | `oklch(100% 0 0 / 0.13)` | you speaking |
| `--vx-chosen-row` | `linear-gradient(90deg, oklch(20% 0.004 264), transparent)` | a selected row (history, design system index); no border |
| `--vx-scan-fill` | `oklch(100% 0 0 / 0.055)` | the row lift during the card scan |

### Blue

| Token | Value | Used for |
|---|---|---|
| `--vx-blue` | `oklch(45.2% 0.313 264.1)` | Send, Download, Tutorial tag, chosen risk mode |
| `--vx-blue-hover` | `oklch(52% 0.3 264)` | pointer over a blue key |
| `--vx-blue-edge` | `oklch(70% 0.2 264)` | chosen risk cell edge |
| `--vx-blue-light` | `oklch(80% 0.12 264)` | chosen risk arc line |

### Status

Each status colour has a 16% tint for its ground (`color / 0.16`).

| Token | Value | Used for |
|---|---|---|
| `--vx-live` | `oklch(52% 0.13 150)` | signed, cleared, OK |
| `--vx-live-text` | `oklch(78% 0.13 150)` | status words on dark |
| `--vx-err` | `oklch(54% 0.2 27)` | blocked, refused |
| `--vx-err-text` | `oklch(74% 0.17 27)` | failed check, refusal text |
| `--vx-dev` | `oklch(52% 0.11 75)` | simulated, in development |

### The text wave

Vex's words arrive as a colour wave, no glow and no blur: each character fades up from `oklch(62% 0.16 264)` through `oklch(80% 0.12 250)` and `oklch(92% 0.05 235)` to the ink colour, over 1100ms. A refusal waves red (`oklch(55% 0.2 27)` → `oklch(85% 0.12 40)`), a signed line waves green (`oklch(55% 0.13 150)` → `oklch(92% 0.1 150)`).

---

## 3. Type

Two families, both self-hosted as woff2 in `src/fonts/` and inlined by the build.

- **Be Vietnam Pro** 300 / 400 / 500 / 600: every word a person reads.
- **Roboto Mono** 400 / 600: every value the runtime checks (tabular figures).

| Role | Spec | Example |
|---|---|---|
| Display | Be Vietnam Pro 600 · `clamp(3.1rem, 8.6vw, 9.6rem)` · -0.045em | Inside your limits |
| Display 3 | Be Vietnam Pro 600 · `clamp(1.9rem, 3vw, 3.2rem)` · -0.03em | Model proposes. Runtime enforces. |
| Headline (foot copy) | Be Vietnam Pro 600 · 19.44px · uppercase · 0.01em; second clause in muted | AN AI TRADING AGENT, INSIDE YOUR LIMITS. |
| Chat | Be Vietnam Pro 400 · 16px / 23.2px · -0.005em | Route found on KyberSwap. Checking your limits. |
| Order title | Be Vietnam Pro 500 · 18px · -0.01em | 200 USDC → ETH |
| Reasoning step | Be Vietnam Pro 400 · 14px / 1.45 | Proposing 200 USDC → ETH via KyberSwap. |
| Key / label | Be Vietnam Pro 500 · 13px · uppercase · 0.08em | DOWNLOAD |
| Field | Roboto Mono 400 · 12px · uppercase · 0.06em (value: sentence case, tabular) | MIN. RECEIVED · 99% of quote |
| Tool step | Roboto Mono 400 · 11.5px · uppercase · 0.06em | KYBERSWAP / ROUTE ON BASE |
| Tag | Roboto Mono 600 · 12px · uppercase · 0.02em | TUTORIAL |

---

## 4. Layout

A frame of square cells (see `assets/screens/12-ds-layout.png`):

- **Header** across the top, 76px; every cell in it is square.
- **History rail** on the far left, 76px wide; collapsed it holds the toggle and your avatar.
- **Kimm's stage**: Kimm in a Gradient ASCII field, the risk arc over her head, the Tutorial reel in the corner.
- **Chat column**: the thread, then the **composer** (72px: New chat | input | Send).
- **Copy line** at the foot, 76px.

| Measure | Value | Note |
|---|---|---|
| Header | 76px | square cells |
| Rail | 76px | square cells |
| Composer | 72px | |
| Edge | 8px | inner offset of the frame |
| Pad | `clamp(20px, 2.6vw, 40px)` | outer gutter |
| Pad x | `clamp(20px, 2.2vw, 40px)` | column gutter on wide screens |
| Gap | `clamp(16px, 1.7vw, 28px)` | between blocks |
| Side | 44% | Kimm's column in the landscape-phone layout |
| Zoom | `clamp(1, 100vw / 1760, 1.5)` | chat and composer scale up on large screens |

Layout modes (set in `kimm.js` `mode()` and the media queries): **wide** (desktop, Kimm framed like a portrait and closer the bigger the screen), **side** (landscape phone, side by side), **stack** (portrait phone).

---

## 5. Components

Frozen copies with their exact computed styles are in the in-page design system (Components chapter).

- **Keys**: Download and Send blue; Whitelist on cell-raised; New chat on cell. 72–76px tall, square, 13px uppercase labels.
- **Tags**: Tutorial (blue), Cleared (ink on white), Blocked (red tint), Signed (green tint). Mono 12px.
- **Composer**: New chat | input | Send. New chat mirrors Send. New chat always works: it voids a running order (nothing signed), stops her voice and clears the talk.
- **Chat bubbles**: Vex (radius 4 18 18 18, white 6%), you (radius 18 4 18 18, white 13%, avatar on the right).
- **Reasoning block**: one per order. Header: a 3×3 cell glyph that steps while she works, the label, a live clock, a chevron. Body: a hairline trace; each step has a node, a tag (**Model**, **Tool**, **Runtime**), text that decodes into place, a spinner, then its time in ms. When done it folds to one line ("Reasoned for 2.8s · 5 steps"); a click opens it again.
- **Order card**: kind and status tag; title; field rows (mono); check rows (name, value / limit, PASS or FAIL); foot status. Every row arrives under a cover and is scanned open by a 1px head that crosses it; the field rows scan one after another, each check scans as the runtime reads it.
- **Blocked card**: the failing row on a red tint, "Nothing signed" in the foot.
- **Risk arc**: Conservative / Balanced / Aggressive over Kimm's head; the chosen segment is blue with its name tag under it.
- **History panel**: rows of icon, title, result (Signed, Answered, Blocked, Cancelled), a gradient for the selected row, no group labels.
- **Dial menu**: a knob, a ring of groups (On chain, Community, Design system), links on an arc with a wire to the selected one.
- **Cursor**: one white disc (`mix-blend-mode: difference`) that follows with a short lag and grows over anything pressable; above every layer (z-index 10000).

---

## 6. Icons

Filled glyphs on a 24px grid, `fill: currentColor`. Opacity steps of .7 and .45 stand in for a second colour. All of them are exported as standalone SVGs in `assets/icons/`; in code they live in `window.VEX_ICONS` (`dial.js`) and `window.VEX_RAIL_ICONS` (`rail.js`).

---

## 7. Motion

Things arrive slowly and leave fast. Only transform and opacity move (the reasoning fold eases height with the Web Animations API). With `prefers-reduced-motion: reduce`, every animation is instant.

| Name | Curve | Duration | Used for |
|---|---|---|---|
| Ease | `cubic-bezier(0.625, 0.05, 0, 1)` | 300ms | every state change: fills, strokes, rows |
| Push | `cubic-bezier(0.22, 1, 0.36, 1)` | 720ms | history panel and the stage it pushes |
| Dial | `cubic-bezier(0.22, 1, 0.36, 1)` | 420ms | menu in and out, the ring turning |
| Fold | `cubic-bezier(0.22, 1, 0.36, 1)` | 420ms | reasoning block folding and opening |
| Scan | `cubic-bezier(0.65, 0.05, 0.36, 1)` | 480ms (+1000ms row lift) | order card rows scanning in |
| Wave | `cubic-bezier(0.2, 0.7, 0.2, 1)` | 1100ms | Vex's text arriving |
| Reel | `expo.inOut` (GSAP) | 900ms | Tutorial grows from its corner |
| Caption | `cubic-bezier(0.22, 1, 0.36, 1)` | 620ms | pills and toasts |

---

## 8. Character (Kimm)

Kimm is Vex's face (Live2D, `kimm.js`). She reacts to what the runtime does, never to decorate it. Transparent stills of each mood are in `assets/kimm-states/`.

| Mood | Trigger (`kimm.on(...)`) | What she does |
|---|---|---|
| Hi | page opens, New chat, a click on her | a V at you, a small hop |
| Think | `request` | hand to her mouth while the runtime routes |
| Offer | `wait` | holds the order out, glances at your key |
| Signed | `done` | a V and a hop once it lands |
| Refused | `refused` | arms crossed, nothing signed |
| Rest | `idle` | follows the pointer, small acts every few seconds |

Details of the rig, hands, springs and placement: [`KIMM.md`](KIMM.md).

---

## 9. Voice

Vex speaks like a careful trader at your side: short, in the first person, the outcome before the reason. Full copy rules and every recorded line: [`COPY.md`](COPY.md).
