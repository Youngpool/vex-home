/**
 * Cap: a carriage on a rail with a hard stop clamped across it. The pointer
 * pushes the carriage along the rail, on a spring; past the stop it cannot go,
 * however far the hand reaches. Dots along the base count the percent. At rest
 * the carriage sits at 1, the default, and the stop is the bright edge. The
 * slider moves the stop, in percent.
 */
const {
  Cam, clamp, facing, fit, prism, proj, rings, rrect, unproj, seg,
  spring, stepS, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const X0 = 0, X1 = 252, Y0 = 0, Y1 = 40, PZ = 6, RY0 = 15, RY1 = 25, RZ = 11;
const U0 = 18, DU = 15, CW = 13, REST = 1;
const pos = (v) => U0 + v * DU;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let cap = value;
  const C = Cam(45, 0.5, 1.5);
  fit(C, [[X0, Y0, 0], [X1, Y1, 0], [X1, Y0, 0], [X0, Y1, 0], [X0, Y0, 40], [X1, Y0, 32]], 200, 170);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the base: a plate on four feet, with a groove along its near edge
  for (const [x, y] of [[8, 6], [X1 - 8, 6]]) { const [r, i] = rings(x - 5, y - 4, x + 5, y + 4, 2, 0.8); put(solid(g), prism(P, front, r, i, -4, 0)); }
  const [pr, pi] = rings(X0, Y0, X1, Y1, 7, 2);
  put(solid(g), prism(P, front, pr, pi, 0, PZ));
  for (const [x, y] of [[8, Y1 - 6], [X1 - 8, Y1 - 6]]) { const [r, i] = rings(x - 5, y - 4, x + 5, y + 4, 2, 0.8); put(solid(g), prism(P, front, r, i, -4, 0)); }
  mk("path", { d: seg(P(X0 + 12, Y1 - 4, PZ), P(X1 - 12, Y1 - 4, PZ)), class: "nf lo" }, g);

  // the rail, its end blocks, and the percent dots between rail and groove
  const [rr, ri] = rings(X0 + 6, RY0, X1 - 6, RY1, 2.4, 1);
  put(solid(g), prism(P, front, rr, ri, PZ, RZ));
  for (const x of [X0 + 6, X1 - 14]) { const [r, i] = rings(x, RY0 - 2, x + 8, RY1 + 2, 2, 0.8); put(solid(g), prism(P, front, r, i, PZ, RZ + 3)); }

  // the carriage: a block on the rail, a gib screw on its side and a thumb knob on top
  const car = solid(g), gib = mk("path", { class: "nf lo" }, car.g), knob = solid(car.g), kcap = solid(car.g);
  // the stop: a clamp block astride the rail with a screw in its top
  const stop = solid(g), sScrew = solid(stop.g), sSlot = mk("path", { class: "nf lo" }, stop.g);
  // painted last: they lie on the plate in front of both blocks
  const dots = [];
  for (let v = 0; v <= 14; v++) { const el = flatDot(g, C, v % 5 ? 0.6 : 0.9, "dot off"); place(el, P(pos(v), Y1 - 9, PZ)); dots.push(el); }

  const sp = spring(REST, { eps: 0.002 });
  let drawnV = NaN, drawnCap = NaN, over = false;

  function drawCar(v) {
    const c = pos(v), [r, i] = rings(c - CW, RY0 - 5, c + CW, RY1 + 5, 3, 1.2);
    put(car, prism(P, front, r, i, RZ - 2, RZ + 12));
    gib.setAttribute("d", seg(P(c - CW + 5, RY1 + 5, RZ + 4), P(c + CW - 5, RY1 + 5, RZ + 4)));
    const [kr, ki] = rings(c - 5, 15, c + 5, 25, 5, 1.4);
    put(knob, prism(P, front, kr, ki, RZ + 12, RZ + 18));
    const [cr, ci] = rings(c - 2.5, 17.5, c + 2.5, 22.5, 2.5, 0.8);
    put(kcap, prism(P, front, cr, ci, RZ + 18, RZ + 20));
  }
  function drawStop(k) {
    const s = pos(k) + CW, [r, i] = rings(s, RY0 - 7, s + 11, RY1 + 7, 2.4, 1);
    put(stop, prism(P, front, r, i, PZ, RZ + 15));
    const [cr, ci] = rings(s + 2.5, 17, s + 8.5, 23, 3, 1);
    put(sScrew, prism(P, front, cr, ci, RZ + 15, RZ + 17));
    sSlot.setAttribute("d", seg(P(s + 3.5, 20, RZ + 17), P(s + 7.5, 20, RZ + 17)));
  }

  const light = (v, live) => {
    const at = live && v >= cap - 0.05;
    car.sil.classList.toggle("hi", live && !at);
    stop.sil.classList.toggle("hi", !live || at);
    dots.forEach((el, k) => { el.setAttribute("class", "dot " + (k > cap ? "off" : k <= v + 0.01 ? "m" : "off")); });
  };

  const B = register(stage, (dt) => {
    const m = stepS(sp, dt);
    if (cap !== drawnCap) { drawnCap = cap; drawStop(cap); }
    if (sp.x !== drawnV) { drawnV = sp.x; drawCar(sp.x); light(sp.x, over); }
    return m;
  });
  bag.add(B.unregister);

  function to(v, live) {
    over = live;
    sp.t = clamp(v, 0, cap);
    read.textContent = !live ? "rest" : sp.t >= cap ? `cap ${cap}%` : `slip ${Math.round(sp.t)}%`;
    light(sp.x, live);
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => to((unproj(C, p[0], p[1], RZ)[0] - U0) / DU, true),
    leave: () => to(REST, false),
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { cap = v; if (sp.t > cap) sp.t = cap; B.wake(); }, destroy: bag.dispose };
}

hairline({
  name: "cap",
  means: "A carriage you push along a rail stops dead at the clamp, however far the hand goes: slippage has a ceiling.",
  rules: [3, 4, 5, 8],
  range: [4, 7, 10],
  tour: [[150, 190], [240, 150], [340, 110], null],
  mount,
});
