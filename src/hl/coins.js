/**
 * Coins: a counting tray with four engraved wells, each holding the stack one
 * request's 15-cent share leaves there: six coins burned, three back to you,
 * three to the treasury, three for conversion. The pointer picks a well; its
 * stack lifts and fans, the others settle, staggered out from it. The burn
 * well has a ring of vents and, at rest, its stack is lifted and bright. The
 * slider is the stagger, in ms.
 */
const {
  Cam, clamp, facing, fit, open, prism, proj, ringAt, rings, rrect, run,
  tdone, tset, tval, tween, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const STACKS = [6, 3, 3, 3], NAMES = ["burn 6¢", "cashback 3¢", "treasury 3¢", "fee 3¢"];
const SP = 42, CR = 12.5, T = 2.4, TZ = 8, LIFT = 12, FAN = 1.6, REST = 0;
const X0 = -24, X1 = 3 * SP + 24, Y0 = -24, Y1 = 24;
const circle = (cx, cy, r) => rrect(cx - r, cy - r, cx + r, cy + r, r, 14);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 1.84);
  fit(C, [[X0, Y0, -4], [X1, Y1, -4], [X1, Y0, 0], [X0, Y1, 0], [0, 0, TZ + 6 * T + LIFT + 5 * FAN + 4], [3 * SP, 0, TZ + 3 * T + LIFT + 8]], 200, 172);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the tray on its feet, a thumb groove along the near edge
  for (const [x, y] of [[X0 + 10, Y0 + 8], [X1 - 10, Y0 + 8], [X0 + 10, Y1 - 8], [X1 - 10, Y1 - 8]]) { const [r, i] = rings(x - 5, y - 4, x + 5, y + 4, 2, 0.8); put(solid(g), prism(P, front, r, i, -4, 0)); }
  const [tr, ti] = rings(X0, Y0, X1, Y1, 8, 2.2);
  put(solid(g), prism(P, front, tr, ti, 0, TZ));
  mk("path", { class: "nf lo", d: open(ringAt(P, rrect(X0 + 30, Y1 - 9, X1 - 30, Y1 - 5, 2, 4), TZ)) }, g);

  // the wells, back to front: two engraved rings each; the burn well also a ring of vents
  const wells = STACKS.map((n, w) => {
    const cx = w * SP;
    mk("path", { class: "nf", d: open(ringAt(P, circle(cx, 0, CR + 3.5), TZ)) + "Z" }, g);
    mk("path", { class: "nf lo", d: open(ringAt(P, circle(cx, 0, CR + 1.5), TZ)) + "Z" }, g);
    if (w === 0) for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; place(flatDot(g, C, 0.6, "dot off"), P(cx + Math.cos(a) * (CR + 6.2), Math.sin(a) * (CR + 6.2), TZ)); }
    const coins = [];
    for (let k = 0; k < n; k++) {
      const el = solid(g), rim = mk("path", { class: "nf lo" }, el.g);
      coins.push({ el, rim });
    }
    return { cx, coins, t: tween(w === 0 ? 1 : 0), drawn: NaN };
  });
  const [cr0, ci0] = [circle(0, 0, CR), circle(0, 0, CR - 1.2)];
  const shift = (ring, dx) => ring.map((q) => ({ ...q, u: q.u + dx }));

  function drawWell(w, t) {
    const W = wells[w];
    if (t === W.drawn) return;
    W.drawn = t;
    const ring = shift(cr0, W.cx), inner = shift(ci0, W.cx);
    W.coins.forEach((c, k) => {
      const z = TZ + 0.3 + t * LIFT + k * (T + t * FAN);
      put(c.el, prism(P, front, ring, inner, z, z + T));
      c.rim.setAttribute("d", open(ringAt(P, run(shift(circle(0, 0, CR - 3.4), W.cx), front), z + T)));
    });
  }

  const B = register(stage, (_dt, now) => {
    let m = false;
    wells.forEach((W, w) => { drawWell(w, tval(W.t, now)); if (!tdone(W.t, now)) m = true; });
    return m;
  });
  bag.add(B.unregister);

  let act = null;
  function choose(a) {
    if (a === act) return;
    const now = performance.now(), from = a === -1 ? 0 : a, prev = act;
    act = a;
    wells.forEach((W, w) => {
      const on = a === -1 ? w === 0 : w === a;
      tset(W.t, on ? (a === -1 ? 0.18 : 1) : REST, now, Math.abs(w - from) * stag);
      W.coins.forEach((c) => c.el.sil.classList.toggle("hi", on));
    });
    read.textContent = a === -1 ? "rest" : NAMES[a];
    if (prev !== a) B.wake();
  }

  // a single row: the well whose rest centre is nearest the pointer on screen, while it is over the tray
  const centres = wells.map((W) => P(W.cx, 0, TZ)[0]), half = (centres[1] - centres[0]) / 2;
  const top = P(X0, Y0, TZ + 60)[1] - 40, bottom = P(X1, Y1, 0)[1] + 10;
  function hit([x, y]) {
    if (y < top || y > bottom || x < centres[0] - half * 1.6 || x > centres[3] + half * 1.6) return -1;
    let best = 0;
    centres.forEach((c, w) => { if (Math.abs(x - c) < Math.abs(x - centres[best])) best = w; });
    return best;
  }
  choose(-1);
  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { stag = clamp(v, 0, 200); }, destroy: bag.dispose };
}

hairline({
  name: "coins",
  means: "A counting tray for one request's 15-cent share: six coins burned, three back to you, three to the treasury, three for conversion.",
  rules: [1, 2, 4, 10],
  range: [0, 45, 90],
  tour: [[110, 150], [200, 170], [290, 200], null],
  mount,
});
