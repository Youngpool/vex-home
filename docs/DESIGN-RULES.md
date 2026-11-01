# VEX design rules

The rules the VEX home was built and reviewed against. Each one is a decision taken during the build; follow them when you add or change anything. Tokens are in [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md).

## Surface

1. **Black ground, cool white ink.** Every surface is a near-black OKLCH with hue 264. Depth comes from one step of lightness (see the Ground table), never from a shadow.
2. **No glow, anywhere.** No `text-shadow`, no blurred or coloured `box-shadow`, no `drop-shadow` filter, no light sweeps across text or keys, no blur on arriving text. A hover or active state changes a fill or a rule, nothing else.
3. **No glass on the frame.** The header's backdrop blur is the only blur. Panels, cards and cells are opaque.
4. **No gradients**, with three exceptions: the chosen row (dark grey from 100% to 0%), Kimm's Gradient ASCII stage, and lines that fade at both ends.
5. **Open lines fade at both ends.** A line that does not close a box fades in at its tail and out at its head.

## Lines and cells

6. **One stroke weight: 1px.** All borders and strokes are 1px, from one balanced set: 7% white for every edge, 24% white for the chosen cell, 10% for internal guides such as the reasoning rail.
7. **Square cells, square corners.** Keys, cells, cards, tags and panels have square corners (`body.one * { border-radius: 0 !important }`). Only chat bubbles, avatars and the cursor are round.
8. **Selected means a lift, not a border.** A selected row gets the dark grey gradient, no outline. A selected cell gets the 24% rule.

## Colour

9. **Blue is an action, and only four things are blue:** Send, Download, the Tutorial tag and the chosen risk mode. Do not use blue for links, focus, decoration or status.
10. **Status has three colours**: green for signed or cleared, red for blocked or failed, amber for simulated or in development. Each uses its colour at 16% as a ground and a lighter tone for text.
11. **The text wave stays blue** (red for a refusal, green for a signed line) but has no halo and no blur.

## Type

12. **Two families.** Be Vietnam Pro for words a person reads, Roboto Mono for values the runtime checks.
13. **Labels are uppercase and tracked** (13px, 500, 0.08em). What Vex says is sentence case. Values (`99% of quote`, `7xKq…9fPz`) keep their own case.
14. **Numbers are tabular** wherever they can change: timers, limits, prices, durations.

## Icons

15. **Filled glyphs** on a 24px grid, `fill: currentColor`. Never outline icons. A second tone is an opacity step (.7, .45), not a second colour.
16. **No icon where a word does the job.** The header keys (Whitelist, Download) are words only.

## Behaviour

17. **Show who is acting.** Every step of an order is labelled Model, Tool or Runtime. The model proposes, the runtime enforces, the person decides.
18. **Every value that will be signed is on the card** before the person approves. Nothing is signed without a press.
19. **The runtime explains a refusal**: the failing row turns red with its limit, and Vex says the outcome first ("Blocked. … Nothing signed.").
20. **Scan, don't pop.** Card rows arrive scanned by a 1px head, one after another; a check scans exactly when the runtime reads it.
21. **Reasoning folds itself.** While she works the trace is open; when she answers it folds to one line, and a click opens it again. A manual open or close is respected.
22. **New chat always works.** It voids a running order (nothing signed), stops her voice and clears the talk. It never refuses with a shake.
23. **She never interrupts you.** The idle nudge waits while you are typing.
24. **Kimm reacts, never decorates.** Every mood has one runtime trigger (see Character).

## Motion

25. **Arrive slowly, leave fast.** Long-tailed ease-outs for arrivals; exits shorter.
26. **Move transform and opacity only.** The one exception is the reasoning fold, which eases height through the Web Animations API.
27. **Respect reduced motion.** With `prefers-reduced-motion: reduce` every animation is instant and nothing loops.

## Layers

28. **The cursor is above everything** (z-index 10000): dial (menu), design system (9600), reel player (2500).
29. **Fine pointers only** get the custom cursor; touch keeps the system behaviour. Over text fields the caret takes over.

## Accessibility

30. Every interactive element is a real `button`, `a` or `input`, reachable by keyboard, with a visible focus (2px white outline, inset where it would clip).
31. The thread is an `aria-live` region; the reasoning header carries `aria-expanded`; the design system and dial are dialogs closed by Esc.
32. Sound starts only after the first touch or key press, and Voice and Music each have a switch that is remembered.
