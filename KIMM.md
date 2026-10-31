# Kimm (Live2D Vex) — how she is set up and what we learned

## Files

| Path | What |
|---|---|
| `model-source/kimm-original/` | the original model as delivered: `kimm님.moc3`, 8192 textures, physics, cdi3 (parameter names), 13 expressions (`*.exp3.json`), idle motion, VTube Studio settings (`kimm님.vtube.json`) |
| `model/` | the web build used by the page: same moc renamed `kimm.moc.wasm` (the artifact host refuses `.moc3`), textures re-encoded to 4096 webp (t2 at 4096×2048), physics, idle motion |
| `src/kimm.js` | everything that drives her on the page |

Libraries: `live2dcubismcore`, `pixi.js@6.5.10`, `pixi-live2d-display@0.4.0` (cubism4). Copies are in `dist/lib`.

## Parameters the page drives

From `kimm님.cdi3.json` (198 parameters in total; the page uses these):

| Id | Name (KR) | Meaning | Used for |
|---|---|---|---|
| ParamAngleX/Y/Z | 각도 | head turn, nod, tilt | gaze, acts, idle sway |
| ParamBodyAngleX/Y/Z | 몸의 회전 | body | follows the head, slower |
| ParamEyeBallX/Y | 눈 | eyes | gaze (fast) |
| ParamEyeLOpen/ROpen | 눈 깜빡임 | lids | auto blink (EyeBlink group) + "stretch" eyes shut |
| ParamEyeRSmile | 눈 미소 | smiling eyes | moods |
| ParamMouthForm / ParamMouthOpenY | 입변형 / 입벌림 | mouth shape / open | moods / lip sync |
| ParamBreath | 호흡 | breath | 3.4 s cycle |
| T1 | 눈발광 | glowing eyes | mood "sign" (approving) |
| T4 | 손_팔짱 | arms crossed | refused / wait |
| T5 | 손_입가 | hand to mouth | think |
| T6 | 손_가리키기 | pointing | point |
| T7 | 손_내밀기 | hand held out | offer (waiting for your approval) |
| T8 | 손_브이 | V sign | done / hi |
| E1 / FeceAngry | 5_빠직 / ios_화남 | anger mark / angry face | refused |
| E4 | 3_땀 | sweat | oops (spam) |
| E7 | 1_홍조 | blush | done / hi |

Unused but available: T2 eye pattern off, T3 coat on, E3 serious face, E6 tears, CheekPuff, MouthX, plus 150+ physics outputs (hair, clothes).

## The hand rig (why hand changes can look like a dissolve)

Measured on the moc with the Cubism core:

- T4–T8 are **opacity toggles**, linear from 0 to 1, with a small built-in drift of the arm toward the new pose while it fades.
- Two arm sides: T5/T6 replace the right rest arm, T7/T8 the left one, T4 replaces both.
- The rest arm stays hidden only while the toggles on its side **add up to 1**. Swapping hand A → hand B as one crossfade (A 1→0 while B 0→1) never shows the rest arm; going through 0 makes it flash.
- The author's own VTube Studio fade for hands is 0.18 s (crossed arms 0.10 s).

What the page does (`src/kimm.js`, "hands, as the model was rigged"):
- one crossfade clock for all five toggles, smootherstep, 0.34 s (0.26 s for crossed arms);
- a hold of 0.65 s per pose so rapid events cannot flicker;
- a small body dip, nod and lean toward the raised side at each swap, so the eye follows motion instead of the dissolve.

**To make hands truly smooth** the rig needs in-between keyforms: e.g. a 0 → 0.5 → 1 sweep where the arm actually travels (deformers moving the forearm up) before the opacity switch at the end. That is a Live2D Cubism Editor job for the rigger; the page code would not need to change (it already eases the toggle values).

## Moods and acts

`MOODS` in `src/kimm.js` maps a mood to toggles and face:
rest, think (T5), point (T6), offer (T7), v (T8 + blush), sign (eye glow), no (T4 + anger), oops (sweat), hi (T8 + blush).

Page events → moods (`window.kimm.on(event)`): request → think, propose → rest + smile, wait → offer, approve → sign,
done → v + hop, refused → no, hi → hi + hop, spam → oops + hop, nudge → offer, press → glance at the key.

Idle acts (one every 3.5–7 s when nothing is happening): scan, ponder, survey, hello, invite, wait, stretch, present.
Each act's offsets ride a 20% ease-in / 20% ease-out envelope.

Motion: head, body and eyes on critically damped springs (eyes fastest); faces and marks on springs; mouth on a fast ease;
hop is an under-damped spring (a small bounce); a slow uneven sway runs under everything so she never freezes.

Lip sync: with sound, `ParamMouthOpenY` follows the voice level (WebAudio analyser); without sound, a soft flap while text types.

## Placement

Desktop: head-to-waist crop (60% of the model height), top offset 20% of the column to leave room for the risk arc.
Phone: crop 42%, top offset 10%. The risk arc is centred on her head (about 4.2% of the column height left of centre).
