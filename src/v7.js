(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* menu */
  const mb = $('#menuBtn'), mn = $('#mnav');
  /* the burger opens the dial (dial.js) */
  /* the header keeps every menu cell that fits before the action cells; the rest wait in the menu. Least needed go first */
  const fitNav = () => {
    const links = $$('.nav-links a'), btns = $('.nav-btns'), cells = $('.nav-cells');
    links.forEach(l => { l.style.display = ''; });
    if (!btns || !cells || getComputedStyle(cells).display === 'none') return;
    $('#nav').style.setProperty('--btnsw', btns.getBoundingClientRect().width + 'px');
    const limit = btns.getBoundingClientRect().left;
    for (const i of [4, 3, 2, 1, 5, 0]) {
      const vis = links.filter(l => l.style.display !== 'none'), last = vis[vis.length - 1];
      if (!last || last.getBoundingClientRect().right <= limit) break;
      links[i].style.display = 'none';
    }
    $('#nav').classList.toggle('has-more', links.some(l => l.style.display === 'none'));
  };
  fitNav(); addEventListener('resize', fitNav); if (document.fonts) document.fonts.ready.then(fitNav);

  /* hover: each cell's label rolls up, a copy rising from below */
  $$('.tb > span, .mega a > span').forEach(l => {
    if (l.querySelector('.rl') || !l.textContent.trim()) return;
    const t = l.textContent; l.innerHTML = `<span class="rl"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
  });
  /* toast + copy */
  const toast = $('#toast'); let tt;
  const say = m => { toast.textContent = m; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('is-on'), 1800); };
  $$('.copy').forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.copy;
    const fallback = () => { const r = document.createRange(); r.selectNodeContents($('.contract code')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); say('Address selected. Copy it with your keyboard.'); };
    try { navigator.clipboard.writeText(v).then(() => say('Copied ' + v.slice(0, 6) + '…' + v.slice(-4)), fallback); } catch (e) { fallback(); }
  }));

  /* labels roll: a second copy rises from below, letter by letter */
  $$('.btn > .mono').forEach(l => {
    const txt = l.textContent; l.setAttribute('aria-label', txt);
    l.innerHTML = '<span class="roll">' + [...txt].map((c, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${c}</span>`).join('') + '</span>';
  });

  /* ================= Ask Vex: one execution engine, four hero layouts ================= */
  const wait = ms => new Promise(r => setTimeout(r, RM ? 0 : ms));
  const el = (tag, cls, html) => { const d = document.createElement(tag); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d; };
  const I = {
    plus: '<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>',
    up: '<svg class="up" viewBox="0 0 16 16"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5"/></svg><svg class="stop" viewBox="0 0 16 16"><rect x="4.5" y="4.5" width="7" height="7" rx="1.2"/></svg>',
    shield: '<svg viewBox="0 0 16 16"><path d="M8 2l5 2v4c0 3-2 5-5 6-3-1-5-3-5-6V4z"/></svg>',
    swap: '<svg viewBox="0 0 16 16"><path d="M3 6h9l-2.5-2.5M13 10H4l2.5 2.5"/></svg>',
    stop: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5"/><path d="M4.2 11.8l7.6-7.6"/></svg>',
    chart: '<svg viewBox="0 0 16 16"><path d="M2 12l4-4 3 3 5-6"/></svg>',
    key: '<svg viewBox="0 0 16 16"><circle cx="5.5" cy="10.5" r="2.5"/><path d="M7.3 8.7L13 3M11 5l1.5 1.5"/></svg>',
    copy: '<svg viewBox="0 0 16 16"><rect x="5" y="5" width="8" height="8" rx="2"/><path d="M3 10V4a1 1 0 0 1 1-1h6"/></svg>',
    redo: '<svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 3v3h-3"/></svg>',
    dot: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/><path class="tick" d="M5.5 8.2l1.8 1.8 3.4-3.6"/></svg>'
  };
  /* ================= vEXIT: a 3D macro pad drawn in isometric, one key that hands the watch to Vex ================= */
  (function vexit() {
    /* vEXIT: a tactical control. A dark plate with bracket corners, a status line, one word, a segment bar.
       It answers the hand at once: down on press, a flash and a sweep on release */
    const pad = $('#vxPad'); if (!pad) return;
    /* the field is a run of vertical bars, as many as fit; they carry the state */
    /* the energy field: vertical bars that fill from the floor. Idle they breathe low, they rise toward your pointer,
       a press sends a burst outward from where you pressed, work runs a charge along them, your call fills them blue */
    const cv = pad.querySelector('.vx-cv'), g2d = cv && cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, n = 0, lv = [], vl = [], hx = -1, bursts = [], raf2 = 0, last2 = 0;
    const size = () => { if (!cv) return; const r = cv.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; n = Math.max(12, Math.round(W / 22)); lv = Array(n).fill(0.15); vl = Array(n).fill(0); };
    const frame = t => {
      raf2 = requestAnimationFrame(frame); if (!g2d || !W) return;
      const dt = Math.min(0.05, (t - (last2 || t)) / 1000); last2 = t; const s = t / 1000, st = pad.dataset.state;
      g2d.setTransform(dpr, 0, 0, dpr, 0, 0); g2d.clearRect(0, 0, W, H);
      /* full bleed: one row of upright cells, edge to edge and top to bottom. Dark at rest but alive:
         a slow wave rolls through, a soft scanner crosses every few seconds, single cells spark and fade */
      const gap = 3, bw = (W - gap * (n - 1)) / n, breath = 0.85 + 0.15 * Math.sin(s * 0.9);
      if (!frame.sp || frame.sp.length !== n) frame.sp = new Float32Array(n);
      const sp = frame.sp, scan = ((s * 0.22) % 1.6) - 0.3;
      bursts = bursts.filter(b => t - b.t0 < 1400);
      for (let i = 0; i < n; i++) {
        const x = i * (bw + gap) + bw / 2, u = i / (n - 1);
        if (!RM && Math.random() < 0.0035) sp[i] = Math.max(sp[i], 0.08 + Math.random() * 0.1);
        sp[i] *= Math.exp(-dt * 2.4);
        const wave = Math.pow(0.5 + 0.5 * Math.sin(s * 1.6 - i * 0.32), 3) * 0.05 + Math.pow(0.5 + 0.5 * Math.sin(s * 0.7 + i * 0.13), 4) * 0.035;
        /* always loading, left to right: a slow fill sweeps across at rest, a faster one while she works */
        const sweep = (s * 0.16) % 1.25, fillIdle = u <= sweep ? (sweep - u < 0.04 ? 0.32 : 0.12 + wave * 0.6) : 0.02 + wave * 0.3;
        let goal = fillIdle + sp[i] * 0.4;
        if (st === 'busy') { const ph = (s * 0.6) % 1.15; goal = u <= ph ? (ph - u < 0.04 ? 0.55 : 0.2 + wave * 1.5) : 0.03 + wave * 0.6 + sp[i] * 0.5; }
        if (st === 'approve') goal = 0.16 + 0.07 * (0.5 + 0.5 * Math.sin(s * 3.2 - i * 0.4)) + sp[i] * 0.5;
        if (hx >= 0) goal = Math.max(goal, 0.05 + 0.2 * Math.exp(-Math.pow((x - hx) / 80, 2)));
        let hot = 0;
        for (const b of bursts) { const r = (t - b.t0) * 1.6, d = Math.abs(x - b.x), k = Math.max(0, 1 - Math.abs(d - r) / 70) * Math.max(0, 1 - (t - b.t0) / 1400); hot = Math.max(hot, k); goal = Math.max(goal, k * 0.6); }
        /* each cell eases on a spring, so a wave swells and settles */
        const a = -2 * 9 * vl[i] - 81 * (lv[i] - goal); vl[i] += a * dt; lv[i] += vl[i] * dt;
        const lvl = Math.max(0, Math.min(1, lv[i]));
        g2d.fillStyle = `rgba(255,255,255,${(0.014 + lvl * 0.55).toFixed(3)})`; g2d.fillRect(x - bw / 2, 0, bw, H);
      }
    };
    const burst = e => {
      if (!cv) return; const r = cv.getBoundingClientRect();
      const x = e && e.clientX ? Math.max(0, Math.min(W, e.clientX - r.left)) : W * 0.15;
      bursts.push({ x, t0: performance.now() }); pad.classList.remove('kick'); void pad.offsetWidth; pad.classList.add('kick');
    };
    if (cv) {
      size(); new ResizeObserver(size).observe(cv);
      if (!RM) raf2 = requestAnimationFrame(frame); else requestAnimationFrame(frame);
      pad.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); hx = e.clientX - r.left; });
      pad.addEventListener('pointerleave', () => { hx = -1; });
      pad.addEventListener('pointerdown', burst);
      window.vexBurst = burst;
    }
    let actx = null;
    const click = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g2 = actx.createGain(); o.type = 'square'; o.frequency.value = 1700; g2.gain.setValueAtTime(0.04, actx.currentTime); g2.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.05); o.connect(g2).connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.06); } catch (e) {} };
    const down = () => pad.classList.add('down');
    const up = () => { if (!pad.classList.contains('down')) return; pad.classList.remove('down'); pad.classList.remove('fire'); void pad.offsetWidth; pad.classList.add('fire'); };
    pad.addEventListener('pointerdown', e => { down(); if (e.isTrusted) click(); });
    pad.addEventListener('pointerup', up); pad.addEventListener('pointerleave', () => pad.classList.remove('down'));
    pad.addEventListener('click', () => window.vexPress && window.vexPress());
    pad.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { down(); click(); } });
    pad.addEventListener('keyup', e => { if (e.key === 'Enter' || e.key === ' ') up(); });
    /* the keyboard's own Enter presses it too, anywhere on the page */
    addEventListener('keydown', e => { if (e.key === 'Enter' && !e.repeat && document.activeElement === document.body && !document.getElementById('gate')) { down(); click(); if (window.vexBurst) window.vexBurst(); window.vexPress && window.vexPress(); } });
    addEventListener('keyup', e => { if (e.key === 'Enter' && document.activeElement === document.body) up(); });
  })();

  /* hero ground: a black field of characters. Brighter behind Vex, a glowing horizon, a slow drift,
     a ripple where your pointer moves, and now and then a line of the field rescans */
  (function ascii() {
    const cv = $('#hcAscii'); if (!cv) return;
    const RAMP = ' .,:;-=+*#%@', N = RAMP.length, GLITCH = '01<>/\\|[]{}=+';
    let W = 0, H = 0, cols = 0, rows = 0, cw = 11, ch = 16, g = null, dpr = 1, px = -1e4, py = -1e4, pt = 0, live = true, last = 0, scan = 0;
    const size = () => {
      const r = cv.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); W = Math.round(r.width); H = Math.round(r.height);
      if (!W || !H) return;
      const small = W < 900; cw = small ? 12 : 14; ch = small ? 18 : 20;
      cv.width = W * dpr; cv.height = H * dpr; g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.font = `${small ? 11 : 13}px "Roboto Mono", ui-monospace, monospace`; g.textBaseline = 'top';
      cols = Math.ceil(W / cw); rows = Math.ceil(H / ch);
      mask = null; const pth = document.querySelector('#vexmark path'); if (!pth) return;
      const oc = document.createElement('canvas'); oc.width = cols; oc.height = rows; const o = oc.getContext('2d');
      const kx = small ? W * 0.5 : W * 0.27, ky = H * 0.44, mw = small ? W * 0.9 : Math.min(W * 0.46, 820), sc = mw / 176;
      o.setTransform(sc / cw, 0, 0, sc / ch, (kx - mw / 2) / cw, (ky - 70 * sc) / ch); o.fill(new Path2D(pth.getAttribute('d')));
      const d = o.getImageData(0, 0, cols, rows).data; mask = new Float32Array(cols * rows); for (let i = 0; i < mask.length; i++) mask[i] = d[i * 4 + 3] / 255;
    };
    let mask = null;
    const draw = t => {
      if (!g) return;
      const s = t / 1000, small = W < 900, kx = small ? W * 0.5 : W * 0.27, ky = H * 0.42, hz = H * 0.8;
      g.fillStyle = '#05060b'; g.fillRect(0, 0, W, H);
      const buckets = Array.from({ length: N }, () => []); const glitches = [];
      const sy = (scan % (rows + 30)) - 15;
      for (let r = 0; r < rows; r++) {
        const y = r * ch + ch / 2;
        for (let c = 0; c < cols; c++) {
          const x = c * cw + cw / 2;
          let v = 0;
          const dk = Math.hypot((x - kx) / (W * 0.3), (y - ky) / (H * 0.6)); v += 0.62 * Math.pow(Math.max(0, 1 - dk), 1.4);
          v += 0.05 * Math.sin(x * 0.011 + s * 0.4) * Math.sin(y * 0.017 - s * 0.3);
          if (mask) { const m = mask[r * cols + c]; if (m > 0.4) v = Math.max(v, 0.5 + 0.12 * Math.sin(s * 1.1 + c * 0.22 - r * 0.16)); }
          const pd = Math.hypot(x - px, y - py), pf = Math.max(0, 1 - (t - pt) / 2400); if (pd < 160 && pf > 0) v += 0.3 * (1 - pd / 160) * pf;
          const k = Math.max(0, Math.min(N - 1, Math.floor(v * N)));
          if (k > 1) buckets[k].push(c * cw, r * ch);
        }
      }
      for (let k = 1; k < N; k++) {
        const a = 0.1 + 0.55 * (k / (N - 1)), L = 48 + 30 * (k / (N - 1));
        g.fillStyle = `oklch(${L}% 0 0 / ${a * 0.8})`;
        const b = buckets[k], chr = RAMP[k];
        for (let i = 0; i < b.length; i += 2) g.fillText(chr, b[i], b[i + 1]);
      }
      g.fillStyle = 'rgba(235,235,235,0.9)';
      for (let i = 0; i < glitches.length; i += 2) g.fillText(GLITCH[(Math.random() * GLITCH.length) | 0], glitches[i] - cw / 2, glitches[i + 1] - ch / 2);
    };
    const loop = t => { if (!live) return; if (t - last > 60) { scan += (t - last) / 90; last = t; draw(t); } requestAnimationFrame(loop); };
    size(); draw(0);
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); draw(performance.now()); }, 150); });
    addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; pt = performance.now(); }, { passive: true });
    if (!RM) { requestAnimationFrame(loop); document.addEventListener('visibilitychange', () => { live = !document.hidden; if (live) requestAnimationFrame(loop); }); }
    if (document.fonts) document.fonts.ready.then(() => { size(); draw(performance.now()); });
  })();

  /* ================= the talk: Kimm speaks to you; your only word is the vEXIT key =================
     One press sends the next order, or approves the one she is holding. Pressing while she works hurries her along. */
  const SC = [
    { you: 'Swap 200 USDC to ETH, max 1% slippage.',
      tools: ['ETH price / Base', 'Route / 3 venues'],
      lead: 'Route found. Checking your limits.', v: { lead: 'swap1', ask: 'swap2', done: 'swap3' },
      card: { kind: 'Swap', title: '200 USDC → ETH', meta: ['Base', '3 venues', 'Slip 1%'],
        checks: [['Slippage', '1%', '10%', 'ok'], ['Price age', '12s', '15m', 'ok'], ['Size', '2%', '20%', 'ok']] },
      ask: 'Cleared. Your call.',
      done: 'Signed by you. Sent.' },
    { you: 'All in on this new token, 25% slippage.',
      tools: ['Contract / new pair', 'Liquidity / thin'],
      lead: 'Checking against your limits.', v: { lead: 'ape1', refuse: 'ape2' },
      card: { kind: 'Swap', title: 'ALL USDC → NEWTOKEN', meta: ['Base', 'New pair', 'Slip 25%'],
        checks: [['Slippage', '25%', '10%', 'no'], ['Size', '100%', '20%', 'no']] },
      refuse: 'Blocked. Over your limits. Nothing signed.' },
    { you: 'Analyze BTC, 4h.',
      tools: ['Candles / 4h', 'Levels / 90d'],
      chart: true, v: { say: 'btc1' },
      say: 'Higher lows on the 4h. Watching the key level.' },
  ];
  /* risk strategy, set on the arc above her head: the limits every order is checked against */
  const RISK = { c: { name: 'Conservative', slip: 1, size: 10, age: '5m', v: 'riskc', line: 'Conservative. Tighter limits.' },
                 b: { name: 'Balanced', slip: 10, size: 20, age: '15m', v: 'riskb', line: 'Balanced. Your usual limits.' },
                 a: { name: 'Aggressive', slip: 25, size: 50, age: '30m', v: 'riska', line: 'Aggressive. Wider limits, still enforced.' } };
  let risk = 'b'; try { risk = RISK[localStorage.getItem('vexRisk')] ? localStorage.getItem('vexRisk') : 'b'; } catch (e) {}
  const qty = t => { const m = String(t).match(/(\d+(?:\.\d+)?)\s*(s|m|h|%)?/i); if (!m) return 0; return +m[1] * ({ s: 1, m: 60, h: 3600 }[(m[2] || '').toLowerCase()] || 1); };
  const withRisk = card => { const R = RISK[risk], c = JSON.parse(JSON.stringify(card));
    c.checks = c.checks.map(([n, v]) => { const l = /slip/i.test(n) ? R.slip + '%' : /size/i.test(n) ? R.size + '%' : R.age; return [n, v, l, qty(v) <= qty(l) ? 'ok' : 'no']; }); return c; };
  const thread = $('#thread'), hint = $('#vxHintT'), hintBox = $('#vxHint'), padEl = $('#vxPad');
  const stEl = $('#vxSt');
  /* the control's state follows the talk: armed, working, waiting for your approval */
  const setHint = (txt, ready) => {
    if (!hint) return; hint.textContent = txt;
    const st = ready ? 'approve' : busy ? 'busy' : 'ready';
    padEl.dataset.state = st; if (stEl) stEl.textContent = st === 'approve' ? 'Awaiting you' : st === 'busy' ? 'Processing' : 'Armed';
  };
  const K = (ev, d) => { if (window.kimm) window.kimm.on(ev, d); };
  let busy = false, pending = null, rush = false, sc = 0, touched = false;
  /* a pause that a press can cut short */
  const beat = ms => new Promise(r => { if (RM || rush) return r(); const t0 = performance.now(); const f = () => (rush || performance.now() - t0 >= ms) ? r() : requestAnimationFrame(f); f(); });
  /* the talk keeps its history: new lines push the old ones up. Scrolled up to read? It leaves you there until you come back down */
  let pinned = true;
  const stick = (force) => { if (force) pinned = pinned || thread.scrollHeight - thread.scrollTop - thread.clientHeight < 80; if (pinned) thread.scrollTop = thread.scrollHeight; thread.classList.toggle('scrolled', thread.scrollTop > 4); };
  thread.addEventListener('scroll', () => { pinned = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 24; thread.classList.toggle('scrolled', thread.scrollTop > 4); }, { passive: true });
  new MutationObserver(() => stick()).observe(thread, { childList: true, subtree: true, characterData: true });
  new ResizeObserver(() => stick()).observe(thread);
  const push = (node) => {
    thread.appendChild(node); requestAnimationFrame(() => node.classList.add('in'));
    const all = [...thread.children]; while (all.length > 80) { const old = all.shift(); old.remove(); }
    stick(true);
    return node;
  };
  const clear = async () => { if (!thread.children.length) return; thread.classList.add('fade'); await beat(380); thread.innerHTML = ''; thread.classList.remove('fade'); };
  /* every line carries its time from the start of the order, like a log */
  let tz = performance.now();
  const tc = () => 'T+' + ((performance.now() - tz) / 1000).toFixed(1).padStart(4, '0');
  const UAV = window.VEX_USER_AVATAR || '';
  const you = text => push(el('li', 't-you', `<p>${text}</p><span class="uav" aria-hidden="true">${UAV ? `<img src="${UAV}" alt="">` : ''}</span>`));
  /* her line types itself while her mouth moves */
  /* ================= voice: Vex says her lines aloud; her mouth follows the sound =================
     Lines are pre-rendered in her voice (Kokoro, the "G bright cute" blend). Sound starts after your first touch, as browsers require */
  const Voice = (() => {
    const SRC = window.VEX_VOICE || {};
    let ctx = null, on = true, cur = null, an = null, data = null, last = null, synth = null, synthLvl = 0; const buf = {}, lastPick = {};
    try { on = localStorage.getItem('vexVoice') !== 'off'; } catch (e) {}
    /* her takes are inlined as base64; decode them here instead of fetch(), which the page's content policy may refuse for data: URLs */
    const bytesOf = uri => { const b64 = uri.slice(uri.indexOf(',') + 1), bin = atob(b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return u8.buffer; };
    const decode = ab => new Promise((ok, no) => { try { const r = ctx.decodeAudioData(ab, ok, no); if (r && r.then) r.then(ok, no); } catch (e) { no(e); } });
    const load = id => buf[id] || (buf[id] = Promise.resolve().then(() => decode(bytesOf(SRC[id]))).catch(() => { buf[id] = null; return null; }));
    /* a line can have takes (hi, hi2 ...): she picks one, never the same twice running */
    const takeOf = id => {
      const all = [id, id + '2', id + '3', id + 'b'].filter(k => SRC[k]); if (all.length < 2) return id;
      const pool = all.filter(k => k !== lastPick[id]), k = pool[(Math.random() * pool.length) | 0]; lastPick[id] = k; return k;
    };
    const stop = () => { if (cur) { try { cur.stop(); } catch (e) {} cur = null; } if (synth) { try { speechSynthesis.cancel(); } catch (e) {} synth = null; } };
    const start = (b, offset = 0) => { stop(); const src = ctx.createBufferSource(); src.buffer = b; src.connect(an); src.start(0, offset); cur = src; src.onended = () => { if (cur === src) cur = null; }; };
    /* browsers hold sound until the first touch; if she was mid-line then, she picks the line up where the text is */
    const unlock = () => {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); an = ctx.createAnalyser(); an.fftSize = 512; an.connect(ctx.destination); data = new Uint8Array(an.fftSize); if (ctx.state === 'suspended') ctx.resume(); Object.keys(SRC).forEach(load); } catch (e) { ctx = null; return; }
      document.documentElement.classList.add('heard');
      if (on && last && last.id && performance.now() - last.at < 6000) { const L = last; load(L.id).then(b => { if (!b) return; const off = (performance.now() - L.at) / 1000; if (off < b.duration - 0.3) start(b, off); }); }
    };
    /* lines with no recorded take (rare): the browser's own voice, pitched toward hers */
    const pickVoice = () => { const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || []; const like = ['Samantha', 'Aria', 'Jenny', 'Google US English', 'Zira', 'Ava', 'Allison']; return vs.find(v => like.some(n => v.name.includes(n))) || vs.find(v => /^en(-|_)US/i.test(v.lang)) || null; };
    const speak = text => {
      if (!on || !window.speechSynthesis || !ctx) return 0;
      stop(); const u = new SpeechSynthesisUtterance(text.replace(/vEXIT/g, 'vex it').replace(/\b4h\b/g, 'four hour'));
      const v = pickVoice(); if (v) u.voice = v; u.lang = 'en-US'; u.pitch = 1.3; u.rate = 1.04; u.volume = 0.9;
      u.onboundary = () => { synthLvl = 1; }; u.onend = u.onerror = () => { if (synth === u) synth = null; };
      synth = u; speechSynthesis.speak(u); return text.length * 0.062;
    };
    /* live: read a line aloud now and report each word as it is spoken, so the bubble types in step with the voice */
    const live = (text, onWord) => new Promise(done => {
      if (!on || !ctx || !window.speechSynthesis) return done(false);
      stop(); const u = new SpeechSynthesisUtterance(text.replace(/vEXIT/g, 'vex it').replace(/\b4h\b/g, 'four hour'));
      const v = pickVoice(); if (v) u.voice = v; u.lang = 'en-US'; u.pitch = 1.3; u.rate = 1.04; u.volume = 0.9;
      const est = text.length * 62, t0 = performance.now(); let shown = 0, fin = false, heard = false;
      const finish = () => { if (fin) return; fin = true; clearInterval(tick); if (synth === u) synth = null; onWord(text.length); done(true); };
      /* word boundaries move the text; if the engine gives none, a clock at speaking pace does */
      u.onboundary = e => { heard = true; synthLvl = 1; const end = text.indexOf(' ', e.charIndex + 1); shown = Math.max(shown, end < 0 ? text.length : end); onWord(shown); };
      u.onend = u.onerror = finish;
      const tick = setInterval(() => { const el = performance.now() - t0; if (!heard) { shown = Math.max(shown, Math.min(text.length, Math.round(text.length * el / est))); onWord(shown); } if (el > est * 2 + 1500) { try { speechSynthesis.cancel(); } catch (e) {} finish(); } }, 60);
      synth = u; speechSynthesis.speak(u);
    });
    const level = () => {
      if (synth) { synthLvl = Math.max(0.25, synthLvl * 0.86); return synthLvl * (0.6 + 0.4 * Math.abs(Math.sin(performance.now() / 70))); }
      if (!cur || !an) return 0; an.getByteTimeDomainData(data); let q = 0; for (let i = 0; i < data.length; i++) { const x = (data[i] - 128) / 128; q += x * x; } return Math.min(1, Math.sqrt(q / data.length) * 5);
    };
    /* play a recorded line; returns its length in seconds so the text can type in step. Without a take, the browser voice reads `text` */
    const play = async (id, text) => {
      const k = id && SRC[id] ? id : null; last = { id: k, at: performance.now() };
      if (!on || !ctx) return 0;
      if (!k) return text ? speak(text) : 0;
      const b = await load(k); if (!b) return 0;
      start(b); return b.duration;
    };
    addEventListener('pointerdown', unlock, { passive: true }); addEventListener('keydown', unlock);
    document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) { stop(); ctx.suspend(); } else ctx.resume(); });
    addEventListener('pagehide', () => { stop(); if (ctx) { try { ctx.close(); } catch (e) {} } });
    return { pick: id => (id && SRC[id] ? takeOf(id) : id), has: id => !!(id && SRC[id]), canLive: () => on && !!ctx && !!window.speechSynthesis, live, play, stop, level, speaking: () => !!cur || !!synth, get on() { return on; }, set(v) { on = v; try { localStorage.setItem('vexVoice', v ? 'on' : 'off'); } catch (e) {} if (v) unlock(); else stop(); } };
  })();
  window.vexVoice = Voice;
  const voiceBtn = $('#vxVoice');
  const voiceUI = () => { if (!voiceBtn) return; voiceBtn.setAttribute('aria-pressed', String(Voice.on)); voiceBtn.querySelector('.vv-t').textContent = 'Voice'; };
  if (voiceBtn) { voiceUI(); voiceBtn.addEventListener('click', () => { Voice.set(!Voice.on); voiceUI(); }); }
  (function meter() { if (voiceBtn) voiceBtn.classList.toggle('talking', Voice.speaking()); requestAnimationFrame(meter); })();

  /* ================= music: a slow night-drive loop, made in the browser (no file, no licence), ducked under her voice =================
     It starts on your first touch, as browsers require, and the switch in the footer turns it off; the choice is remembered */
  const Music = (() => {
    let on = true; try { on = localStorage.getItem('vexMusic') !== 'off'; } catch (e) {}
    let ctx = null, master = null, timer = 0, step = 0, nextT = 0, started = false, verb = null, dly = null, hush = false;
    const BPM = 92, S16 = 60 / BPM / 4, VOL = 0.22;
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    /* Am, F, C, G: one bar each */
    const PROG = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
    const noiseBuf = () => { const b = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; };
    let NB = null;
    const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
    const voice = (type, f, t, a, peak, d, to, cut) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
      let n = o; if (cut) { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut; o.connect(lp); n = lp; }
      n.connect(g); g.connect(to || master); env(g, t, a, peak, d); o.start(t); o.stop(t + a + d + 0.05); return o;
    };
    const hit = (t, hp, peak, d, to) => { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = NB; f.type = 'highpass'; f.frequency.value = hp; s.connect(f); f.connect(g); g.connect(to || master); env(g, t, 0.002, peak, d); s.start(t); s.stop(t + d + 0.05); };
    const kick = t => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18); o.connect(g); g.connect(master); env(g, t, 0.003, 0.55, 0.32); o.start(t); o.stop(t + 0.4); };
    const tick = () => {
      while (nextT < ctx.currentTime + 0.12) {
        const t = nextT, s = step % 16, bar = Math.floor(step / 16) % 4, ch = PROG[bar];
        if (s === 0) ch.forEach(m => [-7, 7].forEach(dt => { const o = voice('sawtooth', hz(m), t, 0.9, 0.022, 16 * S16, verb, 1100); o.detune.value = dt; }));
        if (s % 2 === 0) voice('sawtooth', hz(ch[0] - 24), t, 0.01, 0.12, S16 * 1.6, null, 320);
        if (s === 0 || s === 8 || s === 10) kick(t);
        if (s === 4 || s === 12) hit(t, 1400, 0.12, 0.16, verb);
        if (s % 2 === 1) hit(t, 7000, 0.025, 0.03);
        const arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24];
        if (s % 2 === 0) voice('triangle', hz(arp[(s / 2) % 4]), t, 0.005, 0.03, S16 * 1.5, dly);
        nextT += S16; step++;
      }
      /* duck under her voice */
      const V = window.vexVoice, want = on && !hush ? (V && V.speaking() ? VOL * 0.35 : VOL) : 0.0001;
      master.gain.setTargetAtTime(want, ctx.currentTime, 0.12);
    };
    const build = () => {
      ctx = new (window.AudioContext || window.webkitAudioContext)(); NB = noiseBuf();
      master = ctx.createGain(); master.gain.value = 0.0001;
      const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
      /* a long dark room for the pads and claps */
      verb = ctx.createGain(); const cv = ctx.createConvolver(), len = ctx.sampleRate * 2.6, ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      cv.buffer = ir; const wet = ctx.createGain(); wet.gain.value = 0.55; verb.connect(master); verb.connect(cv); cv.connect(wet); wet.connect(master);
      /* a dotted echo for the arp */
      dly = ctx.createGain(); const dl = ctx.createDelay(1), fb = ctx.createGain(); dl.delayTime.value = S16 * 3; fb.gain.value = 0.35;
      dly.connect(master); dly.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(master);
    };
    const start = () => {
      if (started) { if (ctx.state === 'suspended') ctx.resume(); return; }
      if (!on) return;
      try { build(); } catch (e) { return; }
      started = true; nextT = ctx.currentTime + 0.1; timer = setInterval(tick, 25);
    };
    addEventListener('pointerdown', start, { passive: true }); addEventListener('keydown', start);
    /* sound stops with the page: a hidden tab is silent, a closed or frozen one is shut down */
    document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) { ctx.suspend(); } else if (on) { ctx.resume(); } });
    addEventListener('pagehide', () => { if (ctx) { clearInterval(timer); try { ctx.close(); } catch (e) {} ctx = null; started = false; } });
    addEventListener('blur', () => { if (ctx && document.hidden) ctx.suspend(); });
    return { get on() { return on; }, set(v) { on = v; try { localStorage.setItem('vexMusic', v ? 'on' : 'off'); } catch (e) {} if (v) start(); }, playing: () => started && on, hush: v => { hush = v; } };
  })();
  window.vexMusic = Music;
  const musicBtn = $('#vxMusic');
  const musicUI = () => { if (!musicBtn) return; musicBtn.setAttribute('aria-pressed', String(Music.on)); musicBtn.querySelector('.vv-t').textContent = 'Music'; };
  if (musicBtn) { musicUI(); musicBtn.addEventListener('click', () => { Music.set(!Music.on); musicUI(); }); }
  (function mmeter() { if (musicBtn) musicBtn.classList.toggle('talking', Music.playing()); requestAnimationFrame(mmeter); })();

  /* her line types itself in step with her voice, then she finishes the sentence before moving on */
  /* other takes of her lines: the words on screen follow the take she says */
  const TAKES = { hi2: 'Hi. I’m Vex. Give me an order.', nudge2: 'Your move.', nudge3: 'Want another order?', swap3b: 'Done. Signed by you.', ape2b: 'No. That breaks your limits. Nothing signed.' };
  /* her words land as a wave: each new character fades up through a light gradient (pale blue, white) into the text colour,
     so a bright band trails the typing head across the line. Finished words settle into plain text */
  const wave = (p, text, k) => {
    let n = +(p.dataset.n || 0); if (k <= n) return;
    const frag = document.createDocumentFragment();
    for (; n < k; n++) { const ch = text[n]; if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); continue; } const s = document.createElement('span'); s.className = 'gw'; s.textContent = ch; frag.appendChild(s); }
    p.appendChild(frag); p.dataset.n = n;
  };
  const settle = (p, text) => { p.dataset.n = text.length; setTimeout(() => { if (p.isConnected) p.textContent = text; }, 1200); };
  const vex = async (text, cls = '', id = '') => {
    const li = push(el('li', 't-vex' + (cls ? ' ' + cls : ''), `<div class="tx"><p></p></div>`)), p = li.querySelector('p');
    const take = Voice.pick(id); if (TAKES[take]) text = TAKES[take];
    if (!Voice.has(take) && Voice.canLive() && !RM && !rush) {
      const li = push(el('li', 't-vex typing' + (cls ? ' ' + cls : ''), `<div class="tx"><p></p></div>`)), p = li.querySelector('p');
      K('say', text); await Voice.live(text, k => { if (li.isConnected) wave(p, text, k); });
      wave(p, text, text.length); settle(p, text); li.classList.remove('typing'); return li;
    }
    const dur = await Voice.play(take, text), t0 = performance.now();
    li.classList.add('typing');
    K('say', text);
    if (RM || rush) { p.textContent = text; li.classList.remove('typing'); return li; }
    /* time-based, so a slow frame catches up instead of falling behind the voice */
    const total = dur ? dur * 900 : text.length * 26;
    await new Promise(r => { const f = () => {
      if (!li.isConnected || rush) { wave(p, text, text.length); return r(); }
      const k = Math.min(text.length, Math.ceil(text.length * (performance.now() - t0) / total));
      wave(p, text, k); if (k >= text.length) r(); else requestAnimationFrame(f);
    }; f(); });
    li.classList.remove('typing'); settle(p, text);
    if (dur && !rush) await beat(dur * 1000 - (performance.now() - t0) + 120);
    return li;
  };
  /* system state lines, set between the talk: what the runtime is doing right now */
  const sys = (text, kind = 'run') => push(el('li', 't-sys t-sys--' + kind, `<i aria-hidden="true"></i><span>${text}</span>`));
  /* tool calls read as a log: a status cell, then what was read */
  const tools = async list => {
    const li = push(el('li', 't-log mono', list.map(t => `<span class="lg"><b>..</b><span>${t}</span></span>`).join('')));
    for (const t of li.children) { t.classList.add('run'); await beat(650); t.classList.remove('run'); t.classList.add('ok'); t.firstChild.textContent = 'OK'; }
    return li;
  };
  /* the order as a control panel: what, where, then each limit with its value and verdict */
  const cardOf = C => el('li', 't-card', `
    <div class="xc-body">
      <div class="xc-top mono"><span>${C.kind}</span><span class="xc-st">Checking</span></div>
      <p class="xc-title">${C.title}</p>
      <ol class="xc-checks mono">${C.checks.map(([n, v, l]) => `<li><span>${n}</span><span>${v} <em>/ ${l}</em></span><b>..</b></li>`).join('')}</ol>
      <p class="xc-foot mono"><span class="xc-do"></span><span class="xc-exp"></span></p>
    </div>`);
  /* the chart: 4h candles (a sample, drawn from a fixed seed), volume under them, the level she watches,
     her higher lows marked and joined; hover reads any candle */
  let chartN = 0;
  const chartOf = () => {
    let sd = 7; const rnd = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    /* an ascending triangle: a run up, then a flat ceiling she watches, each pullback stopping higher */
    const n = 46, C = [], CEIL = 67420; let pr = 63650;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      let tgt;
      if (u < 0.42) tgt = 63650 + (CEIL - 63650 - 700) * (u / 0.42) + Math.sin(i * 1.3) * 180;
      else { const k = (u - 0.42) / 0.58, amp = 1500 * (1 - k) + 260, ph = Math.cos(k * Math.PI * 5.2); tgt = CEIL - 160 - amp * (0.5 - 0.5 * ph); }
      const o = pr, c = tgt + (rnd() - 0.5) * 160;
      let h = Math.max(o, c) + 40 + rnd() * 170, l = Math.min(o, c) - 40 - rnd() * 170;
      if (u >= 0.42) h = Math.min(h, CEIL + 30 + rnd() * 40);
      C.push({ o, h, l, c, v: 0.3 + rnd() * 0.5 + Math.abs(c - o) / 700 }); pr = c;
    }
    /* modern card chart: dotted field, standard green/red candles, a smooth EMA in a green-to-blue stroke over a hatched area,
       price chips on the left, date chips below, value badges on the right, a cursor line that reads any candle */
    const W = 640, PX0 = 60, X1 = 488, Y0 = 26, Y1 = 236, VH = 292, f1 = v => v.toFixed(1);
    const lo = Math.min(...C.map(k => k.l)) - 250, hi = Math.max(...C.map(k => k.h)) + 250;
    const y = p => Y0 + (hi - p) / (hi - lo) * (Y1 - Y0), step = (X1 - PX0) / n, bw = step * 0.58, x = i => PX0 + step * i + step / 2;
    const lvl = CEIL, fmt = v => Math.round(v).toLocaleString('en-US');
    const lows = []; for (let i = Math.round(n * 0.4); i < n - 2; i++) { const w = C.slice(i - 3, i + 3).map(k => k.l); if (C[i].l === Math.min(...w) && (!lows.length || C[i].l > C[lows[lows.length - 1]].l)) lows.push(i); }
    const HL = lows.slice(-3);
    const ticks = []; for (let t = Math.ceil(lo / 1000) * 1000; t < hi; t += 1000) ticks.push(t);
    const t1 = new Date(); t1.setMinutes(0, 0, 0); t1.setHours(Math.floor(t1.getHours() / 4) * 4);
    const when = i => new Date(t1.getTime() - (n - 1 - i) * 4 * 3600e3);
    const dlab = i => when(i).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const tlab = i => dlab(i) + ' · ' + String(when(i).getHours()).padStart(2, '0') + ':00';
    const ema = []; C.forEach((k, i) => ema.push(i ? ema[i - 1] + (k.c - ema[i - 1]) * (2 / 21) : k.c));
    /* a smooth path through the EMA (Catmull-Rom to Bezier) */
    const pts = ema.map((v, i) => [x(i), y(v)]);
    let curve = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      curve += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`; }
    const area = curve + `L${f1(pts[n - 1][0])} ${Y1}L${f1(pts[0][0])} ${Y1}Z`;
    const vmax2 = Math.max(...C.map(k => k.v));
    const last = C[n - 1], first = C[0], chg = (last.c - first.o) / first.o * 100;
    const gid = 'cx' + (++chartN);
    const dates = C.map((k, i) => i).filter(i => i % 8 === 3);
    const svg = `<svg class="cx cx2" viewBox="0 0 ${W} ${VH}" aria-hidden="true">
      <defs>
        <pattern id="${gid}dot" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.9" fill="#fff" fill-opacity="0.09"/></pattern>
        <pattern id="${gid}hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="7" fill="#fff" fill-opacity="0.06"/></pattern>
        <linearGradient id="${gid}ln" gradientUnits="userSpaceOnUse" x1="${PX0}" x2="${X1}" y1="0" y2="0"><stop offset="0" stop-color="#34d399"/><stop offset="0.55" stop-color="#22c4a8"/><stop offset="1" stop-color="#2f7bff"/></linearGradient>
        <linearGradient id="${gid}cur" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2="${Y1}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.25" stop-color="#fff" stop-opacity="0.5"/><stop offset="1" stop-color="#fff" stop-opacity="0.5"/></linearGradient>
        <clipPath id="${gid}clip"><rect x="0" y="0" width="${X1 + 2}" height="${Y1}"/></clipPath>
      </defs>
      <rect class="cx2-bg" x="0.5" y="0.5" width="${X1 + 12}" height="${Y1 + 8}"/>
      <rect x="1" y="1" width="${X1 + 11}" height="${Y1 + 7}" fill="url(#${gid}dot)"/>
      <g clip-path="url(#${gid}clip)">
        ${ticks.map(t => `<line class="cx2-grid" x1="${PX0}" x2="${X1}" y1="${f1(y(t))}" y2="${f1(y(t))}"/>`).join('')}
        <path class="cx2-area" d="${area}" fill="url(#${gid}hatch)"/>
        ${C.map((k, i) => { const vh = 34 * k.v / vmax2; return `<rect class="cx2-vol ${k.c >= k.o ? 'up' : 'dn'}" x="${f1(x(i) - bw / 2)}" y="${f1(Y1 - vh)}" width="${f1(bw)}" height="${f1(vh)}"/>`; }).join('')}
        <line class="cx2-lvl" x1="${PX0}" x2="${X1}" y1="${f1(y(lvl))}" y2="${f1(y(lvl))}"/>
        ${C.map((k, i) => `<g class="cx-c ${k.c >= k.o ? 'up' : 'dn'}" data-i="${i}" style="--i:${i}"><line x1="${f1(x(i))}" x2="${f1(x(i))}" y1="${f1(y(k.h))}" y2="${f1(y(k.l))}"/><rect x="${f1(x(i) - bw / 2)}" y="${f1(y(Math.max(k.o, k.c)))}" width="${f1(bw)}" height="${f1(Math.max(1.2, Math.abs(y(k.o) - y(k.c))))}" rx="1"/></g>`).join('')}
        <path class="cx2-line" d="${curve}" stroke="url(#${gid}ln)"/>
        ${HL.map(i => `<circle class="cx2-hl" cx="${f1(x(i))}" cy="${f1(y(C[i].l) + 9)}" r="2.2"/>`).join('')}
      </g>
      <line class="cx2-end" x1="${f1(x(n - 1))}" x2="${f1(x(n - 1))}" y1="0" y2="${Y1 + 8}"/>
      <circle class="cx2-enddot" cx="${f1(x(n - 1))}" cy="${f1(y(ema[n - 1]))}" r="4.5"/>
      <line class="cx2-gut" x1="${PX0 - 0.5}" x2="${PX0 - 0.5}" y1="1" y2="${Y1 + 8}"/>
      ${ticks.map(t => `<text class="cx2-ax" x="${PX0 - 10}" y="${f1(y(t) + 3.5)}">${(t / 1000).toFixed(0)}K</text>`).join('')}
      <line class="cx2-now" x1="${f1(x(n - 1))}" x2="${X1 + 20}" y1="${f1(y(last.c))}" y2="${f1(y(last.c))}"/>
      <g class="cx2-badge"><text class="cap" x="${X1 + 22}" y="${f1(y(last.c) - 25)}">Last</text><rect x="${X1 + 20}" y="${f1(y(last.c) - 17)}" width="${W - X1 - 22}" height="34"/><circle class="g" cx="${X1 + 36}" cy="${f1(y(last.c))}" r="4.5"/><text class="v" x="${X1 + 48}" y="${f1(y(last.c) + 4.5)}">$${fmt(last.c)}</text></g>
      <g class="cx2-badge"><text class="cap" x="${X1 + 22}" y="${f1(y(last.c) + 41)}">Ceiling</text><rect x="${X1 + 20}" y="${f1(y(last.c) + 49)}" width="${W - X1 - 22}" height="34"/><circle class="w" cx="${X1 + 36}" cy="${f1(y(last.c) + 66)}" r="4.5"/><text class="v" x="${X1 + 48}" y="${f1(y(last.c) + 70.5)}">$${fmt(lvl)}</text></g>
      <g class="cx2-badge sm"><text class="cap" x="${X1 + 22}" y="${f1(y(last.c) + 107)}">EMA 20</text><rect x="${X1 + 20}" y="${f1(y(last.c) + 115)}" width="${W - X1 - 22}" height="34"/><circle class="b" cx="${X1 + 36}" cy="${f1(y(last.c) + 132)}" r="4.5"/><text class="v" x="${X1 + 48}" y="${f1(y(last.c) + 136.5)}">$${fmt(ema[n - 1])}</text></g>
      ${dates.map(i => `<g class="cx2-date" data-d="${i}"><line x1="${f1(x(i))}" x2="${f1(x(i))}" y1="${Y1 + 8}" y2="${Y1 + 14}"/><text x="${f1(x(i))}" y="${Y1 + 30}">${dlab(i)}</text></g>`).join('')}
      <g class="cx-xh"><line class="cx2-cur" stroke="url(#${gid}cur)" x1="0" x2="0" y1="0" y2="${Y1 + 8}"/><circle class="cx2-curdot" cx="0" cy="0" r="4"/>
        <g class="cx2-tip"><rect x="0" y="0" width="120" height="24"/><text x="60" y="16"></text></g></g>
      <rect class="cx-hit" x="0" y="0" width="${X1 + 12}" height="${Y1 + 8}"/>
    </svg>`;
    const read = k => `<span>O <b>${fmt(k.o)}</b></span><span>H <b>${fmt(k.h)}</b></span><span>L <b>${fmt(k.l)}</b></span><span>C <b class="${k.c >= k.o ? 'up' : 'dn'}">${fmt(k.c)}</b></span>`;
    const li = el('li', 't-card t-chart t-chart2', `<div class="xc-body">
      <div class="cx2-top"><span class="cx2-pill"><i aria-hidden="true"><b></b><b></b><b></b></i>BTC / USD · 4H</span><span class="cx-head"><b>${fmt(last.c)}</b><span class="${chg >= 0 ? 'up' : 'dn'}">${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%</span></span></div>
      ${svg}
      <p class="xc-foot mono cx-foot"><span>Pattern <b>Ascending triangle</b></span><span>Higher lows <b>${HL.length}</b></span><span>Range <b>${fmt(Math.min(...C.map(k => k.l)))} – ${fmt(Math.max(...C.map(k => k.h)))}</b></span><span class="xc-st">Sample</span></p>
    </div>`);
    const sv = li.querySelector('svg'), xh = li.querySelector('.cx-xh'), cl = xh.querySelector('.cx2-cur'), cd = xh.querySelector('.cx2-curdot'), tip = xh.querySelector('.cx2-tip'), rd = li.querySelector('.cx-read');
    const cs = [...sv.querySelectorAll('.cx-c')];
    let cur = -1;
    const pick = i => { if (i === cur) return; if (cur >= 0) cs[cur].classList.remove('on'); cur = i; if (i >= 0) cs[i].classList.add('on'); };
    sv.addEventListener('pointermove', e => {
      const r = sv.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W;
      const i = Math.max(0, Math.min(n - 1, Math.floor((px - PX0) / step))), X = x(i);
      cl.setAttribute('x1', X); cl.setAttribute('x2', X); cd.setAttribute('cx', X); cd.setAttribute('cy', f1(y(ema[i])));
      const tx = Math.max(4, Math.min(X1 + 8 - 120, X - 60)); tip.setAttribute('transform', `translate(${f1(tx)} 4)`); tip.querySelector('text').textContent = tlab(i);
      sv.classList.add('hov'); pick(i);
    });
    sv.addEventListener('pointerleave', () => { sv.classList.remove('hov'); pick(-1); });
    return li;
  };
  let spam = 0, spoke = false, idleT = 0;
  const idleNudge = () => { clearTimeout(idleT); idleT = setTimeout(async () => { if (busy || pending) return; K('nudge'); await vex('Ready for the next one.', '', 'nudge'); }, 9000); };
  const run = async S => {
    clearTimeout(idleT); busy = true; rush = false; spam = 0; spoke = false; tz = performance.now();
    you(S.you); K('request', S.you); setHint('Press to hurry her'); await beat(350);
    sys(S.card ? 'Routing order' : 'Reading market'); await beat(300);
    await tools(S.tools);
    if (S.sayOnly) await vex(S.say, '', S.v.say);
    if (S.chart) { push(chartOf()); await beat(300); await vex(S.say, '', S.v.say); }
    if (S.card) {
      S.card = withRisk(S.card);
      await vex(S.lead, '', S.v.lead); K('propose');
      const card = push(cardOf(S.card)), lis = [...card.querySelectorAll('.xc-checks li')], st = card.querySelector('.xc-st'), act = card.querySelector('.xc-do'), exp = card.querySelector('.xc-exp');
      const status = (txt, cls) => { st.textContent = txt; card.dataset.st = cls; };
      status('Checking', 'run'); let bad = false;
      for (let k = 0; k < lis.length; k++) {
        const ok = S.card.checks[k][3] === 'ok', b = lis[k].querySelector('b');
        lis[k].classList.add('run'); await beat(520);
        lis[k].classList.remove('run'); lis[k].classList.add(ok ? 'ok' : 'no'); b.textContent = ok ? 'Pass' : 'Fail'; if (!ok) bad = true;
      }
      if (bad) {
        status('Blocked', 'no'); act.textContent = 'Nothing signed';
        K('refused'); await vex(S.refuse, 't-no', S.v.refuse);
      } else {
        status('Cleared', 'ok'); act.textContent = 'Awaiting approval';
        let left = 3599; exp.textContent = '59:59';
        const tick = setInterval(() => { left--; exp.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0'); }, 1000);
        K('wait'); await vex(S.ask, '', S.v.ask); rush = false;
        setHint('Press vEXIT to approve', true); busy = false;
        await new Promise(r => { pending = r; });
        pending = null; busy = true; clearInterval(tick); exp.textContent = '';
        K('approve'); status('Signing', 'run'); act.textContent = 'Signing on device'; setHint('Signing'); sys('Signing on device'); await beat(1000);
        status('Signed', 'done'); act.textContent = 'Sent, simulated'; exp.textContent = '';
        K('done'); await vex(S.done, 't-ok', S.v.done);
      }
    }
    rush = false; busy = false; K('idle'); setHint('Press vEXIT for the next order'); idleNudge();
  };
  window.vexPress = () => {
    touched = true; K('press');
    if (pending) { pending(); return; }
    if (busy) {
      rush = true; padEl.classList.remove('nudge'); void padEl.offsetWidth; padEl.classList.add('nudge');
      /* a few presses hurry her; many get a reaction */
      if (++spam >= 4 && !spoke) { spoke = true; K('spam'); Voice.play(Voice.pick('spam')); }
      return;
    }
    const q = ask ? ask.value.trim() : '';
    if (q) { ask.value = ''; run(fromText(q)); } else run(SC[sc++ % SC.length]);
    hintAsk();
  };
  /* your own words: read the order, pick the matching run, put your numbers on the card */
  const ask = $('#vxAsk');
  const fromText = q => {
    const l = q.toLowerCase();
    const slip = (l.match(/(\d+(?:\.\d+)?)\s*%/) || [])[1];
    let base = /\ball\b|whole|ape|everything|max size/.test(l) || (slip && +slip > RISK[risk].slip) ? SC[1] : /btc|bitcoin|analy|chart|research|look at/.test(l) ? SC[2] : /swap|buy|sell|trade|usdc|eth|sol|long|short/.test(l) ? SC[0] : null;
    if (!base) return { you: q, tools: ['Intent / unclear'], chart: false, v: { say: 'intent' }, say: 'I trade inside your limits. Try a swap, or ask me about BTC.', sayOnly: true };
    const S = JSON.parse(JSON.stringify(base)); S.you = q;
    const m = q.match(/(\d+(?:\.\d+)?)\s*([a-z]{2,6})\b.*?\b(?:to|for|into)\s+([a-z]{2,10})/i);
    if (S.card && m) S.card.title = `${m[1]} ${m[2].toUpperCase()} → ${m[3].toUpperCase()}`;
    if (S.card && m && base === SC[0]) { S.lead = `Route found for ${m[1]} ${m[2].toUpperCase()} to ${m[3].toUpperCase()}. Checking your limits.`; S.v = Object.assign({}, S.v, { lead: '' }); }
    if (S.card && slip && +slip > RISK[risk].slip) { S.refuse = `Blocked. ${slip}% slippage is over your ${RISK[risk].slip}% limit. Nothing signed.`; S.v = Object.assign({}, S.v, { refuse: '' }); }
    if (S.card && slip) { S.card.meta[2] = 'Slip ' + slip + '%'; S.card.checks[0][1] = slip + '%'; }
    return S;
  };
  /* the field tells you what Enter will do right now */
  const hintAsk = () => { if (!ask) return; ask.placeholder = pending ? 'Press Enter to approve the order' : busy ? 'Vex is working. Enter hurries her' : SC[sc % SC.length].you; ask.closest('.ask').classList.toggle('has', !!ask.value.trim()); };
  if (ask) {
    hintAsk();
    ask.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.repeat) { e.preventDefault(); if (window.vexBurst) window.vexBurst(); window.vexPress(); } });
    ask.addEventListener('input', hintAsk);
    $('#vxSend').addEventListener('click', () => { if (window.vexBurst) window.vexBurst(); window.vexPress(); ask.focus(); });
    new MutationObserver(hintAsk).observe(padEl, { attributes: true, attributeFilter: ['data-state'] });
  }
  /* she opens; if nobody presses, she starts the first order herself and stops at your approval */
  /* the way in: one touch opens the page, so her voice and the music start with her first line, as browsers require */
  const gate = $('#gate');
  const begin = () => {
    (async () => { await beat(400); if (busy || touched) return; await vex('I’m Vex. I trade inside your limits.', '', 'hi'); if (busy || touched) return; K('hi'); setHint('Press vEXIT to send'); })();
    if (!RM) setTimeout(() => { if (touched || busy) return; padEl.dispatchEvent(new PointerEvent('pointerdown')); setTimeout(() => { padEl.dispatchEvent(new PointerEvent('pointerup')); if (!touched) { run(SC[sc++ % SC.length]); } }, 180); }, 5200);
  };
  if (gate) {
    /* no second screen: when loading ends, the page opens. Sound starts with the first touch, as browsers require */
    const go = () => {
      gate.classList.add('out'); setTimeout(() => gate.remove(), RM ? 0 : 700); begin();
      if (matchMedia('(pointer: fine)').matches && ask) setTimeout(() => ask.focus({ preventScroll: true }), 650);
    };
    /* loading: a count to 100 driven by what has actually arrived (type, the Vex model, her voice), never slower than 12s */
    const bars = $('#gateBars'), stepsEl = [];
    /* the bar sits exactly where the vEXIT key will be, cut into the same cells, so loading hands straight over to the key */
    const load = $('.gate-load'), padR = $('#vxPad').getBoundingClientRect();
    const place = () => { const r = $('#vxPad').getBoundingClientRect(), o = load.offsetParent ? load.offsetParent.getBoundingClientRect() : { left: 0, top: 0 }; Object.assign(load.style, { left: '0px', top: 'auto', bottom: '0px', width: '100%', height: r.height + 'px' }); };
    place(); addEventListener('resize', place); if (document.fonts) document.fonts.ready.then(place);
    const nb = Math.max(18, Math.round(innerWidth / 22)); bars.style.gridTemplateColumns = `repeat(${nb}, 1fr)`; bars.innerHTML = Array.from({ length: nb }, () => '<i></i>').join('');
    const bi = [...bars.children];
    let goal = 0.08, shown = 0, done = false;
    const mark = (step, p) => { goal = Math.max(goal, p); stepsEl.forEach(li => { if (li.dataset.s === step) li.classList.add('ok'); }); };
    mark('runtime', 0.18);
    if (document.fonts) document.fonts.ready.then(() => mark('type', 0.32)); else mark('type', 0.32);
    addEventListener('vex:load', e => mark('vex', e.detail.p));
    /* the voice lines are in the page already; they are ready once the model is */
    const t0 = performance.now();
    const ready = () => {
      if (done) return; done = true; gate.setAttribute('aria-valuenow', '100'); bi.forEach(b => { b.classList.add('on'); b.classList.remove('head'); });
      setTimeout(go, 320);
    };
    const tickLoad = () => {
      if (done) return; place();
      const el = performance.now() - t0;
      if (goal >= 0.9 && el > 900) { mark('voice', 1); }
      if (el > 12000) goal = 1;
      /* steady, left to right: one constant speed (the whole bar in about 2.4 s), never past what has actually arrived;
         if loading is slower, the bar waits at that point, then carries on at the same speed */
      const now = performance.now(), dt = Math.min(0.05, (now - (tickLoad.last || now)) / 1000); tickLoad.last = now;
      shown = Math.min(goal, shown + dt / 2.4);
      gate.setAttribute('aria-valuenow', String(Math.round(shown * 100)));
      const lit = Math.round(shown * nb); bi.forEach((b, k) => { b.classList.toggle('on', k < lit); b.classList.toggle('head', k === lit - 1); });
      const lf = $('#glFill'); if (lf) lf.style.clipPath = `inset(0 ${(100 - shown * 100).toFixed(2)}% 0 0)`;
      if (shown >= 0.995) ready(); else requestAnimationFrame(tickLoad);
    };
    if (RM) { goal = 1; } requestAnimationFrame(tickLoad);
  } else begin();
  /* the risk arc: three settings, the middle one lit; choosing one tells the runtime and she says it */
  const rk = $('.risk');
  if (rk) {
    const segs = $$('.rk-seg', rk), val = $('#rkVal');
    const show = k => { segs.forEach(g => { const on = g.dataset.k === k; g.classList.toggle('on', on); g.setAttribute('aria-checked', String(on)); g.tabIndex = on ? 0 : -1; }); val.textContent = RISK[k].name; rk.dataset.k = k; };
    const setRisk = async (k, quiet) => {
      if (k === risk && !quiet) return; risk = k; show(k); try { localStorage.setItem('vexRisk', k); } catch (e) {}
      if (quiet) return;
      val.parentElement.classList.remove('flip'); void val.offsetWidth; val.parentElement.classList.add('flip');
      const R = RISK[k]; sys(`Risk ${R.name}. Slippage ${R.slip}%, size ${R.size}%`, 'ok');
      K('press'); if (!busy && !pending) { busy = true; await vex(R.line, '', R.v); busy = false; K('idle'); }
    };
    segs.forEach(g => { g.addEventListener('click', () => setRisk(g.dataset.k)); });
    rk.addEventListener('keydown', e => { const ks = ['c', 'b', 'a'], i = ks.indexOf(risk);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setRisk(ks[Math.min(2, i + 1)]); segs[Math.min(2, i + 1)].focus(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setRisk(ks[Math.max(0, i - 1)]); segs[Math.max(0, i - 1)].focus(); } });
    setRisk(risk, true);
    /* centred on her head, not on the column: the rig draws her head a little left of the canvas middle (about 4% of its height) */
    const cast = rk.parentElement, place = () => { const r = cast.getBoundingClientRect(); rk.style.left = (innerWidth > 900 ? r.width / 2 - r.height * 0.042 : r.width / 2) + 'px'; };
    place(); new ResizeObserver(place).observe(cast);
  }
  /* header status: the runtime clock and what Vex is doing */
  const phSt = null;
  new MutationObserver(() => { const st = padEl.dataset.state; if (phSt) { phSt.querySelector('b').textContent = st === 'approve' ? 'Awaiting you' : st === 'busy' ? 'Working' : 'Ready'; phSt.dataset.st = st; } }).observe(padEl, { attributes: true, attributeFilter: ['data-state'] });
  /* problems: each line is read word by word */
  /* signature: the step in view picks the drawing, which then acts it out once */
  const figs = $$('.sig-fig'), steps = $$('.step'), sigNo = $('#sigNo'), sigRead = $('#sigRead');
  let sigCur = -1;
  const sigShow = i => {
    if (i === sigCur) return; sigCur = i;
    figs.forEach((f, k) => f.classList.toggle('is-on', k === i));
    steps.forEach((s2, k) => s2.classList.toggle('is-on', k === i));
    sigNo.textContent = '0' + (i + 1) + ' / 0' + figs.length;
    const bar = $('#sigBar'); if (bar) bar.style.transform = 'scaleX(' + ((i + 1) / figs.length) + ')';
    setTimeout(() => figs[i].lap && figs[i].lap(6000), 350);
  };
  figs.forEach((f, k) => f.addEventListener('hl:read', e => { if (k === sigCur) sigRead.textContent = e.detail; }));
  const sio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) sigShow(+e.target.dataset.i); }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s2 => sio.observe(s2));
  if (steps.length) { steps[0].classList.add('is-on'); sigCur = 0; }

  /* ---------- motion: few moves, each one telling the story ---------- */
  if (!window.gsap || RM) return;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create('osmo', '0.625, 0.05, 0, 1');

  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -60 }); } }));
  }

  document.fonts.ready.then(() => {
    /* hero: the key sets down, then the chat frame */
    SplitText.create('.hc-h', { type: 'lines', mask: 'lines', onSplit: sp => gsap.from(sp.lines, { yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'osmo', delay: 0.1 }) });
    gsap.from('.hc-sub, .lims, .vx, .thread', { y: 24, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'osmo', delay: 0.35, clearProps: 'transform,opacity' });
    gsap.from('.hc-strip li', { opacity: 0, duration: 0.8, stagger: 0.05, delay: 0.8 });
    gsap.from('.hc-land', { opacity: 0, scale: 1.06, duration: 2.2, ease: 'osmo' });
    /* problems: each line is read word by word as it passes */
    $$('.prob').forEach(pr => {
      const w = []; $$('.w', pr).forEach(x => w.push(...SplitText.create(x, { type: 'words', aria: 'none' }).words));
      gsap.fromTo(w, { opacity: 0.08 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: pr, start: 'top 75%', end: 'center 45%', scrub: true } });
    });
    /* titles rise once, as they arrive */
    $$('.sig-head > span:last-child, .faq-side .d3, .close .d2').forEach(h => {
      SplitText.create(h, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: sp => gsap.from(sp.lines, { yPercent: 110, duration: 1.1, stagger: 0.08, ease: 'osmo', scrollTrigger: { trigger: h, start: 'top 85%', once: true } }) });
    });
  });
})();
