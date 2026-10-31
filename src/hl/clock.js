/**
 * Clock: a fifteen-minute sand glass in a four-post frame. The pointer's x is
 * how old a price is: as it moves right the sand runs from the upper bulb to
 * the pile below, on a spring. Past the glass's span the upper bulb is empty
 * and the price is stale. The sand that is left is the bright edge; once it is
 * gone the empty bulb takes it. The slider is the span, in minutes.
 */
const {
  Cam, clamp, facing, fit, hull, lerp, open, poly, prism, proj, ringAt, rings, rrect, run, seg,
  spring, stepS, disposer, mk, pointer, put, register, solid,
} = HL;

const H = 30, PZ = 6, TZ = 96, NECK = 51;
const LOW = [[15, PZ + 2], [19, PZ + 10], [17, PZ + 26], [7, NECK - 7], [2.6, NECK]];
const UP = LOW.map(([R, z]) => [R, 2 * NECK - z]).reverse();
const circle = (R) => rrect(-R, -R, R, R, R, 14);
const at = (prof, z) => { for (let k = 1; k < prof.length; k++) { const [r0, z0] = prof[k - 1], [r1, z1] = prof[k]; if (z <= z1) return lerp(r0, r1, (z - z0) / (z1 - z0)); } return prof[prof.length - 1][0]; };

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let span = value;
  const C = Cam(45, 0.5, 2.06);
  fit(C, [[-H, -H, -4], [H, H, -4], [H, -H, 0], [-H, H, 0], [-H, -H, TZ + 10], [H, H, TZ + 6]], 200, 162);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const taper = (secs) => poly(hull(secs.flatMap(([R, z]) => ringAt(P, circle(R), z))));
  const plate = (z0, z1) => put(solid(g), prism(P, front, circle(H), circle(H - 2), z0, z1));
  const PA = [120, -30].map((d) => [26 * Math.cos(d * Math.PI / 180), 26 * Math.sin(d * Math.PI / 180)]);
  const post = (x, y) => { const [r, i] = rings(x - 3.2, y - 3.2, x + 3.2, y + 3.2, 3.2, 1); put(solid(g), prism(P, front, r, i, PZ, TZ)); };

  // feet and the bottom plate
  for (const [x, y] of PA.map(([x, y]) => [x * 0.9, y * 0.9])) { const [r, i] = rings(x - 4, y - 4, x + 4, y + 4, 4, 1); put(solid(g), prism(P, front, r, i, -4, 0)); }
  plate(0, PZ);

  // the sand: the pile below, what is left above, and the thread between them
  const pile = mk("path", {}, g), top = mk("path", {}, g), topCr = mk("path", { class: "nf lo" }, g);
  const thread = mk("path", { class: "nf" }, g);
  // the glass: two bulbs and a waist collar, seen through, so drawn unfilled over the sand
  const glassLow = mk("path", { class: "nf sil", d: taper(LOW) }, g), glassUp = mk("path", { class: "nf sil", d: taper(UP) }, g);
  mk("path", { class: "nf lo", d: open(ringAt(P, run(circle(15.6), front), PZ + 2.4)) + open(ringAt(P, run(circle(15.6), front), TZ - 2.4)) }, g);
  mk("path", { class: "nf lo", d: seg(P(-12, 7, PZ + 14), P(-9, 6, PZ + 26)) + seg(P(-12, 7, TZ - 14), P(-9, 6, TZ - 26)) }, g);
  const [wr, wi] = rings(-4.4, -4.4, 4.4, 4.4, 4.4, 1);
  put(solid(g), prism(P, front, wr, wi, NECK - 2, NECK + 2));

  // the two posts and the top plate with its finial go over everything
  post(...PA[0]); post(...PA[1]);
  plate(TZ, TZ + PZ);
  const [fr, fi] = rings(-5, -5, 5, 5, 5, 1.2);
  put(solid(g), prism(P, front, fr, fi, TZ + PZ, TZ + PZ + 4));

  const sp = spring(6, { eps: 0.01 });
  let drawn = NaN, over = false;
  function draw(m) {
    const f = clamp(1 - m / span, 0, 1), left = f > 0.002;
    const zt = lerp(NECK + 3, TZ - 16, Math.sqrt(f)), hb = lerp(1.2, 24, Math.pow(1 - f, 0.7));
    pile.setAttribute("d", taper([[at(LOW, PZ + 2.5) - 1.2, PZ + 2.5], [16, PZ + 6], [1.2, PZ + 2.5 + hb]]));
    const secs = [[2, NECK + 1]];
    for (const z of [NECK + 6, NECK + 14, zt]) if (z <= zt) secs.push([at(UP, z) - 1.4, z]);
    top.setAttribute("d", left ? taper(secs) : "");
    topCr.setAttribute("d", left ? open(ringAt(P, run(circle(at(UP, zt) - 2.4), front), zt)) : "");
    thread.setAttribute("d", left ? seg(P(0, 0, NECK), P(0, 0, PZ + 2.5 + hb)) : "");
    top.classList.toggle("sil", left); top.classList.toggle("hi", left);
    glassUp.classList.toggle("hi", !left);
  }

  const B = register(stage, (dt) => {
    const mv = stepS(sp, dt);
    if (sp.x !== drawn) { drawn = sp.x; draw(sp.x); }
    return mv;
  });
  bag.add(B.unregister);

  function to(m, live) {
    over = live;
    sp.t = m;
    read.textContent = !live ? "rest" : m >= span ? "stale" : `age ${Math.round(m)} min`;
    B.wake();
  }
  bag.add(pointer(stage, {
    move: (p) => to(clamp((p[0] - 80) / 240, 0, 1) * span * 1.25, true),
    leave: () => to(6, false),
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { span = v; drawn = NaN; if (over) to(sp.t, true); B.wake(); }, destroy: bag.dispose };
}

hairline({
  name: "clock",
  means: "A fifteen-minute sand glass: move right and the price ages; once the upper bulb runs dry, the price is stale.",
  rules: [3, 4, 5, 9],
  range: [10, 15, 20],
  tour: [[150, 160], [250, 160], [330, 160], null],
  mount,
});
