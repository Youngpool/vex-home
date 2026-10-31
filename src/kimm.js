/* Kimm: Vex's face. She stands between the claim and the chat, watches the pointer,
   and acts out what the agent is doing: thinking, pointing at the order, handing you the call,
   crossing her arms when the runtime refuses, a V when it is done. Loaded after the page, desktop only. */
(() => {
  const host = document.getElementById('kimm'); if (!host) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = matchMedia('(max-width: 900px)');
  const saveData = navigator.connection && navigator.connection.saveData;
  const LIBS = window.KIMM_LIBS || [
    'https://cdn.jsdelivr.net/npm/@hazart-pkg/live2d-core@1.0.1/live2dcubismcore.min.js',
    'https://cdn.jsdelivr.net/npm/pixi.js@6.5.10/dist/browser/pixi.min.js',
    'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js',
  ];
  const MODEL = host.dataset.model || 'kimm/kimm.model3.json';
  const load = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  /* room above her head for the risk arc */
  const TOP = () => small.matches ? 0.1 : 0.2;

  /* what each moment looks like: hand toggles, marks, face */
  const HANDS = ['T4', 'T5', 'T6', 'T7', 'T8'];
  const MARKS = ['E1', 'E4', 'E6', 'E7', 'T1', 'FeceAngry'];
  const MOODS = {
    rest:    {},
    think:   { T5: 1, form: 0.1 },
    point:   { T6: 1, form: 0.5, smile: 0.3 },
    offer:   { T7: 1, form: 0.7, smile: 0.5 },
    v:       { T8: 1, form: 1, smile: 0.8, E7: 1 },
    sign:    { T1: 1, form: 0.4 },
    no:      { T4: 1, E1: 1, FeceAngry: 0.5, form: -0.8 },
    oops:    { E4: 1, form: -0.3 },
    hi:      { T8: 1, E7: 1, form: 1, smile: 0.9 },
  };
  let model = null, app = null, core = null, ids = {}, ready = false;
  const cur = {}, tgt = {}, vel = {};
  const HS = { want: null, t0: -1e9, dur: 300, hold: 0, from: {} };
  /* spring stiffness per part: eyes quick, head calm, body slow */
  const SPR = { ParamEyeBallX: 16, ParamEyeBallY: 16, ParamAngleX: 6.5, ParamAngleY: 6.5, ParamAngleZ: 5.5, ParamBodyAngleX: 4, ParamBodyAngleY: 4, ParamBodyAngleZ: 3.6 };
  const set = (id, v) => { tgt[id] = v; };
  let mood = 'rest', moodUntil = 0, talkUntil = 0, focus = null, focusUntil = 0;
  /* idle: when the agent is not working she keeps busy on her own; one small act every few seconds */
  let active = false, nextIdle = performance.now() + 5000, act = null, lastAct = '';
  const ACTS = {
    /* scans the market: eyes light up, head sweeps left and right */
    scan: { ms: 2600, mood: 'sign', pose: (u) => ({ ax: Math.sin(u * Math.PI * 3) * 26, ay: 4 }) },
    /* thinks something over, hand to her mouth, eyes up and away */
    ponder: { ms: 2600, mood: 'think', pose: () => ({ ax: -14, ay: 14, az: 8 }) },
    /* looks round the page: the talk, the key, then back to you */
    survey: { ms: 3000, pose: (u) => ({ to: u < 0.35 ? '#thread' : u < 0.7 ? '#vxPad' : null }) },
    /* a quick V at you */
    hello: { ms: 1600, mood: 'hi', hop: 1 },
    /* points at your key, inviting */
    invite: { ms: 2000, mood: 'point', pose: () => ({ to: '#vxPad' }) },
    /* arms crossed, a patient tilt */
    wait: { ms: 2600, mood: 'no', clean: true, pose: () => ({ az: -9, ax: 6 }) },
    /* a stretch: leans, eyes shut, a small yawn */
    stretch: { ms: 1800, pose: (u) => ({ bz: Math.sin(u * Math.PI) * 9, az: Math.sin(u * Math.PI) * 12, ay: 10 * Math.sin(u * Math.PI), shut: u > 0.15 && u < 0.85, mouth: Math.sin(u * Math.PI) * 0.45 }) },
    /* holds the order out to you */
    present: { ms: 2200, mood: 'offer' },
  };
  const startAct = () => {
    const names = Object.keys(ACTS).filter(n => n !== lastAct), n = names[(Math.random() * names.length) | 0], A = ACTS[n];
    lastAct = n; act = { A, t0: performance.now() };
    if (A.mood) { setMood(A.mood, A.ms); if (A.clean) { set('E1', 0); set('FeceAngry', 0); set('ParamMouthForm', 0.3); } }
    if (A.hop) hop = A.hop;
  };
  let px = -1, py = -1, lastMove = -1e9, hover = false, hop = 0, jy = 0, hv = 0, shut = 0;
  const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  const setMood = (m, ms = 0) => {
    mood = m; moodUntil = ms ? performance.now() + ms : 0;
    for (const k of HANDS.concat(MARKS)) set(k, 0);
    const M = MOODS[m] || {};
    for (const k in M) if (k !== 'form' && k !== 'smile') set(k, M[k]);
    set('ParamMouthForm', M.form || 0); set('ParamEyeRSmile', M.smile || 0);
  };
  const talk = ms => { talkUntil = Math.max(talkUntil, performance.now() + ms); };
  const look = (el, ms = 2400) => { focus = el; focusUntil = performance.now() + ms; };

  /* the page tells her what the agent is doing; she speaks to you, and glances at her work */
  const thread = () => document.getElementById('thread');
  const key = () => document.getElementById('vxPad');
  const queued = [];
  window.kimm = {
    on(ev, data) {
      if (!ready) { if (ev !== 'say') queued.push(ev); return; }
      if (ev === 'request' || ev === 'propose' || ev === 'wait' || ev === 'approve') { active = true; act = null; }
      if (ev === 'idle' || ev === 'refused' || ev === 'reset') { active = false; nextIdle = performance.now() + 4000; }
      if (ev === 'press') nextIdle = performance.now() + 6000;
      if (ev === 'request') { setMood('think'); look(thread(), 3000); }
      else if (ev === 'say') talk(clamp(String(data || '').length * 26, 500, 3200));
      else if (ev === 'propose') { setMood('rest'); set('ParamMouthForm', 0.6); look(thread(), 1800); }
      else if (ev === 'wait') { setMood('offer'); look(key(), 1800); }          /* she holds the order out, and glances at your key */
      else if (ev === 'approve') setMood('sign');
      else if (ev === 'done') { setMood('v', 2800); hop = 1; }
      else if (ev === 'refused') setMood('no', 3400);
      else if (ev === 'hi') { setMood('hi', 1800); hop = 1; }
      else if (ev === 'idle') { if (!moodUntil) setMood('rest'); }
      else if (ev === 'spam') { setMood('oops', 1600); hop = 1; talk(600); }
      else if (ev === 'nudge') { setMood('offer', 2200); look(key(), 1600); }
      else if (ev === 'eyekey') { look(key(), 1200); if (mood === 'rest') { set('ParamMouthForm', 0.9); set('ParamEyeRSmile', 0.6); } }
      else if (ev === 'press') { look(key(), 700); if (mood === 'rest') hop = 0.6; }
    },
  };

  const start = async () => {
    const tell = (p, s) => dispatchEvent(new CustomEvent('vex:load', { detail: { p, s } }));
    if (saveData) { tell(0.9, 'vex'); return; }
    try { for (let i = 0; i < LIBS.length; i++) { await load(LIBS[i]); tell(0.35 + 0.2 * (i + 1) / LIBS.length, 'vex'); } } catch (e) { tell(0.9, 'vex'); return; }
    const PIXI = window.PIXI; if (!PIXI || !PIXI.live2d) { tell(0.9, 'vex'); return; }
    const canvas = host.querySelector('canvas');
    const dpr = Math.min(2, devicePixelRatio || 1);
    app = new PIXI.Application({ view: canvas, backgroundAlpha: 0, antialias: true, resolution: dpr, autoDensity: true, resizeTo: host });
    try { model = await PIXI.live2d.Live2DModel.from(MODEL, { autoInteract: false, motionPreload: 'IDLE' }); } catch (e) { app.destroy(); tell(0.9, 'vex'); return; }
    tell(0.9, 'vex');
    app.stage.addChild(model);
    const im = model.internalModel; core = im.coreModel; im.breath = undefined;
    const pid = core.getModel().parameters.ids; for (let i = 0; i < pid.length; i++) ids[pid[i]] = i;
    const fit = () => {
      const W = host.clientWidth, H = host.clientHeight, mw = im.width, mh = im.height;
      const crop = +(host.dataset.crop || (small.matches ? 0.42 : 0.6));              /* show the head down to the waist */
      const s = H / (mh * crop); model.scale.set(s);
      model.x = (W - mw * s) / 2 + W * +(host.dataset.shift || 0); model.y = H * TOP() + hop;
      fit.s = s; fit.mw = mw; fit.mh = mh;
    };
    fit(); new ResizeObserver(fit).observe(host);
    /* every frame: ease each driven parameter toward its target, after the motions and physics inputs */
    const put = (id, v) => { const i = ids[id]; if (i !== undefined) core.setParameterValueByIndex(i, v); };
    im.on('beforeModelUpdate', () => {
      const now = performance.now(), t = now / 1000;
      if (moodUntil && now > moodUntil) setMood('rest');
      /* her own small acts, only while nothing else is going on */
      if (!active && !act && mood === 'rest' && now > nextIdle && !(window.vexVoice && window.vexVoice.speaking())) startAct();
      let P = {};
      let env = 0;
      if (act) { const u = (now - act.t0) / act.A.ms; if (u >= 1) { act = null; nextIdle = now + 3500 + Math.random() * 3500; } else { env = sstep(0, 0.2, u) * (1 - sstep(0.8, 1, u)); if (act.A.pose) P = act.A.pose(u) || {}; } }
      /* every act fades in and out: its offsets ride an envelope, so nothing starts or stops on a frame */
      for (const k of ['ax', 'ay', 'az', 'bz', 'mouth']) if (typeof P[k] === 'number') P[k] *= env;
      const pf = P.to ? document.querySelector(P.to) : null;
      if (focus && now > focusUntil) focus = null;
      /* where to look: the chat while it works, else the pointer, else drift */
      const r = host.getBoundingClientRect();
      const hx = r.left + r.width * 0.5, hy = r.top + r.height * 0.18;
      /* by default she looks at you: the pointer if it moved lately, else straight out of the page */
      let tx = hx + Math.sin(t * 0.35) * 60, ty = hy + 40 + Math.sin(t * 0.23) * 24;
      if (now - lastMove < 5000 && px >= 0) { tx = px; ty = py; }
      const fo = focus || pf;
      if (fo) { const b = fo.getBoundingClientRect(); tx = b.left + b.width * 0.5; ty = b.top + b.height * 0.6; }
      const dx = clamp((tx - hx) / 520, -1, 1), dy = clamp((ty - hy) / 420, -1, 1);
      const sw = RM ? 0 : 1, swx = sw * (2.2 * Math.sin(t * 0.47) + 1.3 * Math.sin(t * 0.83 + 2)), swz = sw * (1.8 * Math.sin(t * 0.31 + 1) + 0.9 * Math.sin(t * 0.71)), swb = sw * 1.3 * Math.sin(t * 0.29 + 0.5);
      set('ParamAngleX', clamp(dx * 28 + (P.ax || 0) + swx, -30, 30)); set('ParamAngleY', -dy * 22 + (mood === 'think' ? -6 : 0) + (P.ay || 0) + sw * Math.sin(t * 0.37) * 1.5); set('ParamAngleZ', -dx * 6 + (mood === 'think' ? 7 : 0) + (P.az || 0) + swz);
      set('ParamBodyAngleX', dx * 9 + swb * 1.4); set('ParamBodyAngleY', -dy * 4); set('ParamBodyAngleZ', -dx * 3 + (P.bz || 0) + swb);
      set('ParamEyeBallX', dx * 0.9); set('ParamEyeBallY', -dy * 0.8);
      if (hover && mood === 'rest') { set('ParamMouthForm', 0.8); set('ParamEyeRSmile', 0.5); }
      else if (!hover && mood === 'rest') { set('ParamMouthForm', 0.15); set('ParamEyeRSmile', 0); }
      const talking = now < talkUntil;
      /* with sound, the mouth follows her voice; without, a soft flap while the words type */
      const V = window.vexVoice;
      if (V && V.speaking()) set('ParamMouthOpenY', clamp(V.level() * 1.3, 0, 1));
      else set('ParamMouthOpenY', talking ? 0.25 + 0.55 * Math.abs(Math.sin(t * 13) * Math.sin(t * 7.3 + 1)) : (P.mouth || 0));
      /* time-based easing, so a slow frame never leaves two hands half-drawn */
      const dt = Math.min(0.1, (now - (put.last || now)) / 1000); put.last = now;
      /* hands, as the model was rigged: each pose is a dissolve from the arm at rest (checked in the moc: opacity is linear in T4..T8,
         and the rest arm only stays hidden while the hand values on its side add up to 1). So every swap is one crossfade with a single
         clock for all five toggles: the old hand goes 1 to 0 while the new one goes 0 to 1, and the rest arm never flashes in between.
         A short smootherstep, close to the rig's own 0.18s, and a hold so poses cannot flicker */
      const want = HANDS.find(h => (tgt[h] || 0) > 0.5) || null;
      if (want !== HS.want && now - HS.t0 > HS.hold) {
        HS.from = {}; for (const h of HANDS) HS.from[h] = cur[h] || 0;
        HS.want = want; HS.t0 = now; HS.hold = want ? 650 : 350;
        if (!RM) { const side = want === 'T7' || want === 'T8' ? 1 : want === 'T5' || want === 'T6' ? -1 : 0; vel.ParamBodyAngleY = (vel.ParamBodyAngleY || 0) - 26; vel.ParamAngleY = (vel.ParamAngleY || 0) - 30; vel.ParamBodyAngleZ = (vel.ParamBodyAngleZ || 0) + side * 22; vel.ParamAngleZ = (vel.ParamAngleZ || 0) + side * 30; hv -= 40; }
        HS.dur = RM ? 1 : (want === 'T4' || HANDS.some(h => h !== want && HS.from[h] > 0.5 && h === 'T4')) ? 260 : 340;
      }
      { const u = Math.min(1, (now - HS.t0) / HS.dur), e = u * u * u * (u * (u * 6 - 15) + 10);
        for (const h of HANDS) { const f = HS.from[h] || 0, g = h === HS.want ? 1 : 0; cur[h] = f + (g - f) * e; put(h, cur[h]); } }
      /* head, body and eyes move on critically damped springs: they ease in and out, never snap */
      for (const id in tgt) {
        if (HANDS.includes(id)) continue;
        const goal = tgt[id], w = SPR[id] || (id === 'ParamMouthOpenY' ? 0 : id[0] === 'E' || id === 'FeceAngry' || id === 'T1' ? 11 : 9);
        if (w && !RM) {
          const x = cur[id] === undefined ? goal : cur[id], v = vel[id] || 0;
          const acc = -2 * w * v - w * w * (x - goal);
          vel[id] = v + acc * dt; cur[id] = x + vel[id] * dt;
        } else {
          const a = cur[id] === undefined ? goal : cur[id];
          const tau = RM ? 0.001 : id[0] === 'T' || id[0] === 'E' || id === 'FeceAngry' ? 0.16 : id === 'ParamMouthOpenY' ? 0.045 : 0.28;
          cur[id] = a + (goal - a) * (1 - Math.exp(-dt / tau));
        }
        put(id, cur[id]);
      }
      put('ParamBreath', 0.5 + 0.5 * Math.sin(t * 2 * Math.PI / 3.4));
      shut += ((P.shut ? 1 : 0) - shut) * (1 - Math.exp(-dt / 0.07));
      if (shut > 0.01) for (const e of ['ParamEyeLOpen', 'ParamEyeROpen']) { const i = ids[e]; if (i !== undefined) core.setParameterValueByIndex(i, core.getParameterValueByIndex(i) * (1 - shut)); }
      if (hop > 0) { hv -= 150 * hop; hop = 0; }
      { const w = 13, z = 0.45, a = -2 * z * w * hv - w * w * jy; hv += a * dt; jy += hv * dt; }
      model.y = host.clientHeight * TOP() + (RM ? 0 : jy);
    });
    try { model.motion('Idle', 0, 1); } catch (e) {}
    setMood('rest'); ready = true;
    host.classList.add('on');
    queued.splice(0).forEach(e => window.kimm.on(e));
    addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; lastMove = performance.now(); }, { passive: true });
    /* touch her: a hello */
    canvas.addEventListener('pointerenter', () => { hover = true; });
    canvas.addEventListener('pointerleave', () => { hover = false; });
    canvas.addEventListener('click', () => { setMood('hi', 1600); hop = 1; talk(500); if (window.vexVoice && !window.vexVoice.speaking()) window.vexVoice.play(window.vexVoice.pick('poke')); });
    /* sleep when out of view */
    new IntersectionObserver(([e]) => { if (e.isIntersecting) app.ticker.start(); else app.ticker.stop(); }).observe(host);
  };
  start();
})();
