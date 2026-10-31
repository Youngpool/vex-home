/**
 * Gate: a belt of order crates runs to a gauge gate whose bar is your limit.
 * The pointer's height sets the bar, on a spring. Any crate taller than it is
 * pushed off the belt into the reject tray beside it, staggered out from the
 * gate; lower the bar and more are refused, raise it and they come back. The
 * bar is the one bright edge. The slider is the stagger, in ms.
 */
const {
  Cam, clamp, facing, fit, hull, lerp, open, poly, prism, proj, ringAt, rings, rrect, run, seg,
  spring, stepS, tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const HS = [16, 34, 12, 26, 20, 38, 14], N = HS.length, CW = 18, STEP = 26, X0 = 4;
const BX0 = -8, BX1 = 240, BY0 = 0, BY1 = 30, BZ = 8, CY = 6;
const TX0 = -6, TX1 = 184, TY0 = 37, TY1 = 69, TH = 7, TW = 2.2, OUT = 44;
const GX = 200, LMIN = 10, LMAX = 42, LREST = 24;

const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

/** The reject tray, which never moves: `far` goes under the crates, `near` over them. */
function tray(P, front) {
  const outer = rrect(TX0, TY0, TX1, TY1, 6, 6), inner = rrect(TX0 + TW, TY0 + TW, TX1 - TW, TY1 - TW, 6 - TW, 6);
  const far = [
    [poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, TH)))), "sil"],
    [poly(ringAt(P, inner, TH)), "nf"],
    [open(ringAt(P, run(inner, (q) => !front(q)), 1.5)), "nf lo"],
  ];
  const iF = LR(ringAt(P, run(inner, front), TH)), oT = LR(ringAt(P, run(outer, front), TH)), oB = LR(ringAt(P, run(outer, front), 0));
  const near = [
    [poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), "fo"],
    [open(oT), "nf lo"], [open(iF), "nf"], [open([oT[0], ...oB, oT[oT.length - 1]]), "nf sil"],
  ];
  return { far, near };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 1.42);
  fit(C, [[BX0, BY0, 0], [BX1, BY1, 0], [BX0, TY1, 0], [TX1, TY1, 0], [GX, -14, LMAX + 14], [BX0, BY0, BZ + 40]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the far post, behind the belt
  const post = (y0, y1) => { const [r, i] = rings(GX - 5, y0, GX + 5, y1, 2.4, 1); return prism(P, front, r, i, 0, LMAX + 10); };
  put(solid(g), post(-16, -8));
  const [cr, ci] = rings(GX - 3, -16, GX + 3, -8, 1.4, 0.6);
  put(solid(g), prism(P, front, cr, ci, LMAX + 10, LMAX + 13));

  // the belt on its frame, rollers across its top, and an end stop where it runs out
  const [br, bi] = rings(BX0, BY0, BX1, BY1, 5, 1.6);
  put(solid(g), prism(P, front, br, bi, 0, BZ));
  let rol = "";
  for (let x = BX0 + 10; x < BX1 - 4; x += 11) rol += seg(P(x, BY0 + 2.5, BZ), P(x, BY1 - 2.5, BZ));
  mk("path", { d: rol, class: "nf lo" }, g);
  const [er, ei] = rings(BX1 - 7, BY0 + 3, BX1 - 3, BY1 - 3, 1.2, 0.6);
  put(solid(g), prism(P, front, er, ei, BZ, BZ + 9));

  const T = tray(P, front);
  for (const [d, cls] of T.far) mk("path", { d, class: cls }, g);

  // the crates: a lid crease, a card holder on the near face, a hand slot on the right one
  const cg = mk("g", {}, g);
  const crates = HS.map((h, i) => {
    const el = solid(cg), card = mk("path", { class: "nf lo" }, el.g), slot = mk("path", { class: "nf lo" }, el.g);
    return { i, h, x0: X0 + i * STEP, el, card, slot, t: tween(h > LREST ? 1 : 0), drawn: NaN };
  });

  for (const [d, cls] of T.near) mk("path", { d, class: cls }, g);

  // the bar, the near post and its cap: the gauge itself
  const bar = solid(g);
  put(solid(g), post(36, 44));
  const [nr, ni] = rings(GX - 3, 36, GX + 3, 44, 1.4, 0.6);
  put(solid(g), prism(P, front, nr, ni, LMAX + 10, LMAX + 13));
  bar.sil.classList.add("hi");
  const [gr, gi] = rings(GX - 3.5, -12, GX + 3.5, 40, 1.6, 0.8);
  const lim = spring(LREST, { eps: 0.03 });
  let drawnBar = NaN;

  /** Where crate c stands at t: 0 on the belt, 1 in the tray. It slides across first, then drops. */
  const at = (t) => [lerp(CY, OUT, Math.min(1, t * 1.25)), BZ * (1 - clamp((t - 0.55) / 0.45, 0, 1)) + 0.4];
  function drawCrate(c, t) {
    if (t === c.drawn) return;
    c.drawn = t;
    const [y, z] = at(t), x0 = c.x0, x1 = x0 + CW, y1 = y + CW;
    const [r, inn] = rings(x0, y, x1, y1, 2.6, 1);
    put(c.el, prism(P, front, r, inn, z, z + c.h));
    c.card.setAttribute("d", poly(rrect(x0 + 4, z + c.h * 0.42, x1 - 4, z + c.h * 0.42 + 5, 1.2, 4).map((q) => P(q.u, y1, q.v))));
    c.slot.setAttribute("d", poly(rrect(y + 5, z + c.h - 6, y1 - 5, z + c.h - 3.4, 1.2, 4).map((q) => P(x1, q.u, q.v))));
  }
  /** Crates in depth order, far to near, so one sliding forward passes over the ones behind it. */
  function sort() {
    const by = crates.slice().sort((a, b) => a.x0 + at(a.drawn)[0] - (b.x0 + at(b.drawn)[0]));
    by.forEach((c, k) => { if (cg.children[k] !== c.el.g) cg.appendChild(c.el.g); });
  }

  const B = register(stage, (dt, now) => {
    let m = stepS(lim, dt);
    if (lim.x !== drawnBar) { drawnBar = lim.x; put(bar, prism(P, front, gr, gi, lim.x, lim.x + 4)); }
    for (const c of crates) { drawCrate(c, tval(c.t, now)); if (!tdone(c.t, now)) m = true; }
    sort();
    return m;
  });
  bag.add(B.unregister);

  // the pointer's height maps onto the bar's travel, widened so the whole stage is the handle
  const yHi = P(GX, 15, LMAX)[1] - 70, yLo = P(GX, 15, LMIN)[1] + 40;
  function setLimit(L, live) {
    lim.t = L;
    const now = performance.now();
    let out = 0;
    crates.forEach((c) => { const o = c.h > L; if (o) out++; tset(c.t, o ? 1 : 0, now, (N - 1 - c.i) * stag); });
    read.textContent = live ? `limit ${Math.round(L)} · ${out} out` : "rest";
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => setLimit(lerp(LMAX, LMIN, clamp((p[1] - yHi) / (yLo - yHi), 0, 1)), true),
    leave: () => setLimit(LREST, false),
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { stag = v; }, destroy: bag.dispose };
}

hairline({
  name: "gate",
  means: "Orders ride a belt to a gate set at your limit; any order taller than the bar is pushed off into the reject tray.",
  rules: [2, 3, 4, 5],
  range: [0, 45, 90],
  tour: [[300, 110], [300, 262], [300, 196], null],
  mount,
});
