/**
 * Keybox: a small lockbox on your desk with a key lying inside. The pointer's
 * x swings the hinged lid, on a spring: to the left it shuts and the box is
 * locked, to the right it opens as far as its hinge allows. The key never
 * leaves the box. Open, the key is the bright edge; shut, the keyhole takes it.
 * The slider is how far the lid stands open at rest, in degrees.
 */
const {
  Cam, clamp, facing, fillet, fit, hull, lerp, open, poly, proj, rad, ringAt, rings, rrect, run, seg,
  spring, stepS, disposer, mk, pointer, put, prism, register, solid,
} = HL;

const X0 = -40, X1 = 40, Y0 = -30, Y1 = 30, H = 15, W = 2.6, R = 5, LT = 4, MAX = 108;
const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());
const circle = (cx, cy, r, n = 14) => rrect(cx - r, cy - r, cx + r, cy + r, r, n);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let restA = value;
  const C = Cam(45, 0.5, 1.95);
  const reach = [X0, Y0 + 60 * Math.cos(rad(MAX)), H + 60 * Math.sin(rad(MAX)) + LT];
  fit(C, [[X0, Y0, -4], [X1, Y1, -4], [X1, Y0, 0], [X0, Y1, 0], reach, [X1, reach[1], reach[2]]], 200, 170);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const outer = rrect(X0, Y0, X1, Y1, R, 6), inner = rrect(X0 + W, Y0 + W, X1 - W, Y1 - W, R - W, 6);

  for (const [x, y] of [[X0 + 9, Y0 + 9], [X1 - 9, Y0 + 9], [X0 + 9, Y1 - 9], [X1 - 9, Y1 - 9]]) { const [r, i] = rings(x - 5, y - 5, x + 5, y + 5, 5, 1); put(solid(g), prism(P, front, r, i, -4, 0)); }
  // the box's far half: body, the rim's inner edge, the floor seam along the far walls
  mk("path", { class: "sil", d: poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, H)))) }, g);
  mk("path", { class: "nf", d: poly(ringAt(P, inner, H)) }, g);
  mk("path", { class: "nf lo", d: open(ringAt(P, run(inner, (q) => !front(q)), 2)) }, g);

  // the key on the floor: a bow with its hole, then the blade and its bit, each a thin plate
  const key = mk("g", {}, g), KZ = 2.4;
  const KY = -12, bow = circle(-17, KY + 2, 9.5), hole = circle(-20, KY + 2, 3.4, 8);
  const blade = fillet([[-9, -0.5], [26, -0.5], [26, 5], [22.5, 5], [22.5, 10.5], [19, 10.5], [19, 7.5], [15.5, 7.5], [15.5, 10.5], [11, 10.5], [11, 5], [-9, 5]].map(([x, y]) => [x, y + KY - 0.5]), [0.6, 1, 1, 0.6, 0.8, 0.6, 0.6, 0.6, 0.8, 0.6, 0.6, 0.6]);
  const flat = (pts, z) => poly(pts.map((p) => P(p[0], p[1], z)));
  const ring2 = (ring) => ring.map((q) => [q.u, q.v]);
  mk("path", { class: "lo", d: flat(ring2(bow), KZ - 1.2) + flat(blade, KZ - 1.2) }, key);
  const keyBow = mk("path", { class: "sil", d: flat(ring2(bow), KZ) }, key);
  const keyBlade = mk("path", { class: "sil", d: flat(blade, KZ) }, key);
  mk("path", { class: "nf lo", d: flat(ring2(hole), KZ) }, key);

  // the near half: one opaque piece from the rim's inner edge to the floor, then the keyhole on the front
  const iF = LR(ringAt(P, run(inner, front), H)), oT = LR(ringAt(P, run(outer, front), H)), oB = LR(ringAt(P, run(outer, front), 0));
  mk("path", { class: "fo", d: poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]) }, g);
  mk("path", { class: "nf lo", d: open(oT) }, g);
  mk("path", { class: "nf", d: open(iF) }, g);
  mk("path", { class: "nf sil", d: open([oT[0], ...oB, oT[oT.length - 1]]) }, g);
  const onFront = (ring) => ring.map((q) => P(q.u, Y1, q.v));
  mk("path", { class: "nf lo", d: poly(onFront(rrect(-8, 3, 8, 12, 3, 5))) }, g);
  const keyhole = mk("path", { class: "nf", d: poly(onFront(circle(0, 8.8, 1.6, 6))) + seg(P(0, Y1, 7.4), P(0, Y1, 5)) }, g);

  // three hinge knuckles along the back edge, each a short round bar
  const knuckle = (x0, x1) => poly(hull([x0, x1].flatMap((x) => circle(Y0 - 1.6, H, 2.4, 8).map((q) => P(x, q.u, q.v)))));
  for (const [a, b] of [[-30, -18], [-6, 6], [18, 30]]) mk("path", { class: "sil", d: knuckle(a, b) }, g);

  // the lid, hinged on the back edge: its underside with a felt liner, its top with a recessed panel
  const lid = mk("g", {}, g);
  const under = mk("path", { class: "lo" }, lid), liner = mk("path", { class: "nf lo" }, lid);
  const top = mk("path", { class: "sil" }, lid), panel = mk("path", { class: "nf lo" }, lid);
  const shape = rrect(X0, 0, X1, Y1 - Y0, R, 6), pad = rrect(X0 + 6, 6, X1 - 6, Y1 - Y0 - 6, 2.5, 5);
  let flipped = null;
  function drawLid(th) {
    const s = Math.sin(rad(th)), c = Math.cos(rad(th));
    const w = (u, v, t) => P(u, Y0 + v * c - t * s, H + v * s + t * c);
    under.setAttribute("d", poly(shape.map((q) => w(q.u, q.v, 0))));
    liner.setAttribute("d", poly(pad.map((q) => w(q.u, q.v, 0))));
    top.setAttribute("d", poly(shape.map((q) => w(q.u, q.v, LT))));
    panel.setAttribute("d", poly(pad.map((q) => w(q.u, q.v, LT))));
    // past about 40°, the underside is the face toward the viewer
    const flip = th > 40;
    if (flip !== flipped) { flipped = flip; if (flip) lid.append(top, panel, under, liner); else lid.append(under, liner, top, panel); }
  }

  const sp = spring(restA, { eps: 0.05 });
  let drawn = NaN;
  function light(th) {
    const shut = th < 6;
    keyBow.classList.toggle("hi", !shut); keyBlade.classList.toggle("hi", !shut);
    keyhole.classList.toggle("hi", shut);
  }
  const B = register(stage, (dt) => {
    const m = stepS(sp, dt);
    if (sp.x !== drawn) { drawn = sp.x; drawLid(clamp(sp.x, 0, MAX)); light(sp.x); }
    return m;
  });
  bag.add(B.unregister);

  function to(th, live) {
    sp.t = th;
    read.textContent = !live ? "rest" : th < 6 ? "locked" : `lid ${Math.round(th)}°`;
    B.wake();
  }
  bag.add(pointer(stage, {
    move: (p) => to(lerp(0, MAX, clamp((p[0] - 110) / 200, 0, 1)), true),
    leave: () => to(restA, false),
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { restA = v; to(v, false); }, destroy: bag.dispose };
}

hairline({
  name: "keybox",
  means: "A lockbox on your desk with the key inside: swing the lid open or shut. The key never leaves the box.",
  rules: [3, 4, 5, 6],
  range: [40, 64, 90],
  tour: [[100, 160], [200, 160], [320, 160], null],
  mount,
});
