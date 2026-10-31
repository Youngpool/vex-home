/**
 * Stamp: a rubber stamp held over a ruled sheet on a desk pad. The pointer's
 * height lowers the stamp, on a spring; when the rubber meets the sheet it
 * leaves its seal, a ring of dots, and lifting shows it. Nothing on the sheet
 * moves money until that mark is there, and leaving takes the stamp back up
 * with the sheet unsigned. The slider is how high the stamp waits, in units.
 */
const {
  Cam, clamp, facing, fit, hull, lerp, poly, prism, proj, ringAt, rings, rrect, seg,
  spring, stepS, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const DX = 54, DY = 42, DZ = 5, SZ = DZ + 0.6, SX0 = -40, SX1 = 36, SY0 = -32, SY1 = 32;
const CX = 9, CY = 5, PW = 19, PD = 14, KNOB = [[5.6, 27], [10.6, 31.5], [11.4, 35.5], [8.6, 40.5], [3.4, 43]];
const circle = (R) => rrect(-R, -R, R, R, R, 14);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let wait = value;
  const C = Cam(45, 0.5, 2.15);
  fit(C, [[-DX, -DY, 0], [DX, DY, 0], [DX, -DY, 0], [-DX, DY, 0], [CX, CY, 56 + 44]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the desk pad, and the sheet on it: a thin plate, ruled, with a dashed box where the seal goes
  const [dr, di] = rings(-DX, -DY, DX, DY, 8, 2);
  put(solid(g), prism(P, front, dr, di, 0, DZ));
  mk("path", { d: poly(rrect(SX0, SY0, SX1, SY1, 1.6, 4).map((q) => P(q.u, q.v, SZ))) }, g);
  mk("path", { class: "nf lo", d: poly(rrect(SX0, SY0, SX1, SY1, 1.6, 4).map((q) => P(q.u, q.v, DZ))) }, g);
  let lines = "";
  for (let k = 0; k < 3; k++) lines += seg(P(SX0 + 7, SY0 + 6 + k * 5, SZ), P(k === 2 ? SX1 - 26 : SX1 - 7, SY0 + 6 + k * 5, SZ));
  for (let k = 0; k < 5; k++) lines += seg(P(SX0 + 7, CY - 9 + k * 5, SZ), P(CX - PW - 8 - (k % 2) * 4, CY - 9 + k * 5, SZ));
  mk("path", { class: "nf lo", d: lines }, g);
  mk("path", { class: "nf dash", d: poly(rrect(CX - PW - 3, CY - PD - 3, CX + PW + 3, CY + PD + 3, 2, 4).map((q) => P(q.u, q.v, SZ))) }, g);

  // the seal it leaves: a ring of dots round one in the middle
  const seal = [], sg = mk("g", {}, g);
  for (let k = 0; k <= 16; k++) {
    const a = (k / 16) * Math.PI * 2, el = flatDot(sg, C, k === 16 ? 1.1 : 0.7, "dot off");
    place(el, P(CX + (k === 16 ? 0 : Math.cos(a) * 11), CY + (k === 16 ? 0 : Math.sin(a) * 8), SZ));
    seal.push(el);
  }

  // the stamp: rubber, the block it is glued to, a neck and a turned knob
  const rub = solid(g), blk = solid(g), notch = mk("path", { class: "nf lo" }, blk.g), neck = solid(g), knob = mk("path", { class: "sil" }, g);
  const sp = spring(wait, { eps: 0.02 });
  let drawn = NaN, signed = false, live = false;

  function draw(L) {
    const z = SZ + L;
    const [rr, ri] = rings(CX - PW + 1, CY - PD + 1, CX + PW - 1, CY + PD - 1, 2, 0.8);
    put(rub, prism(P, front, rr, ri, z, z + 2.6));
    const [br, bi] = rings(CX - PW - 1.5, CY - PD - 1.5, CX + PW + 1.5, CY + PD + 1.5, 3.4, 1.4);
    put(blk, prism(P, front, br, bi, z + 2.6, z + 11));
    notch.setAttribute("d", seg(P(CX - 4, CY + PD + 1.5, z + 6.3), P(CX + 4, CY + PD + 1.5, z + 6.3)));
    const [nr, ni] = rings(CX - 5.4, CY - 5.4, CX + 5.4, CY + 5.4, 5.4, 1.2);
    put(neck, prism(P, front, nr, ni, z + 11, z + 28));
    knob.setAttribute("d", poly(hull(KNOB.flatMap(([R, h]) => ringAt(P, circle(R).map((q) => ({ ...q, u: q.u + CX, v: q.v + CY })), z + h)))));
  }
  function light() {
    blk.sil.classList.toggle("hi", !signed);
    // the seal is on the sheet only once it has been pressed
    if (signed) sg.replaceChildren(...seal); else sg.replaceChildren();
    seal.forEach((el, k) => el.setAttribute("class", "dot" + (k === 16 ? "" : " m")));
  }

  const B = register(stage, (dt) => {
    const m = stepS(sp, dt);
    if (sp.x !== drawn) {
      drawn = sp.x; draw(Math.max(0, sp.x));
      if (live && sp.x < 0.8 && !signed) { signed = true; light(); read.textContent = "signed"; }
    }
    return m;
  });
  bag.add(B.unregister);
  light();

  function to(L, on) {
    live = on;
    if (!on) { signed = false; light(); }
    sp.t = L;
    read.textContent = !on ? "rest" : signed ? "signed" : `lift ${Math.round(Math.max(0, L))}`;
    B.wake();
  }
  bag.add(pointer(stage, {
    move: (p) => to(lerp(56, -1, clamp((p[1] - 70) / 150, 0, 1)), true),
    leave: () => to(wait, false),
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { wait = v; if (!live) { sp.t = v; B.wake(); } }, destroy: bag.dispose };
}

hairline({
  name: "stamp",
  means: "A stamp over a sheet: lower it and it leaves its seal. Without that mark the order stays unsigned.",
  rules: [4, 5, 8, 10],
  range: [16, 28, 40],
  tour: [[200, 110], [200, 230], [200, 150], null],
  mount,
});
