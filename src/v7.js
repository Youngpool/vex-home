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
      /* full bleed: one row of upright cells, edge to edge and top to bottom, like the loader; a cell's level is its brightness */
      const gap = 3, bw = (W - gap * (n - 1)) / n;
      bursts = bursts.filter(b => t - b.t0 < 1400);
      for (let i = 0; i < n; i++) {
        const x = i * (bw + gap) + bw / 2, u = i / (n - 1);
        let goal = 0.08 + 0.06 * (0.5 + 0.5 * Math.sin(s * 1.7 + i * 0.55)) * (0.5 + 0.5 * Math.sin(s * 0.9 - i * 0.21));
        if (st === 'busy') { const ph = (s * 0.6) % 1.15; goal = u <= ph ? (ph - u < 0.05 ? 0.85 : 0.5) : 0.08; }
        if (st === 'approve') goal = 0.42 + 0.06 * Math.sin(s * 3.2 + i * 0.35);
        if (hx >= 0) goal = Math.max(goal, 0.1 + 0.4 * Math.exp(-Math.pow((x - hx) / 90, 2)));
        let hot = 0;
        for (const b of bursts) { const r = (t - b.t0) * 1.6, d = Math.abs(x - b.x), k = Math.max(0, 1 - Math.abs(d - r) / 70) * Math.max(0, 1 - (t - b.t0) / 1400); hot = Math.max(hot, k); goal = Math.max(goal, k * 0.8); }
        /* each cell eases on a spring, so a wave swells and settles */
        const a = -2 * 9 * vl[i] - 81 * (lv[i] - goal); vl[i] += a * dt; lv[i] += vl[i] * dt;
        const lvl = Math.max(0, Math.min(1, lv[i]));
        g2d.fillStyle = `rgba(255,255,255,${(0.05 + 0.8 * lvl).toFixed(3)})`; g2d.fillRect(x - bw / 2, 0, bw, H);
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
  const you = text => push(el('li', 't-you', `<p>${text}</p><span class="uav" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 4a4 4 0 110 8 4 4 0 010-8zM4.5 20c.8-4 3.8-6.2 7.5-6.2s6.7 2.2 7.5 6.2z"/></svg></span>`));
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
    let ctx = null, master = null, timer = 0, step = 0, nextT = 0, started = false, verb = null, dly = null;
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
      const V = window.vexVoice, want = on ? (V && V.speaking() ? VOL * 0.35 : VOL) : 0.0001;
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
    return { get on() { return on; }, set(v) { on = v; try { localStorage.setItem('vexMusic', v ? 'on' : 'off'); } catch (e) {} if (v) start(); }, playing: () => started && on };
  })();
  const musicBtn = $('#vxMusic');
  const musicUI = () => { if (!musicBtn) return; musicBtn.setAttribute('aria-pressed', String(Music.on)); musicBtn.querySelector('.vv-t').textContent = 'Music'; };
  if (musicBtn) { musicUI(); musicBtn.addEventListener('click', () => { Music.set(!Music.on); musicUI(); }); }
  (function mmeter() { if (musicBtn) musicBtn.classList.toggle('talking', Music.playing()); requestAnimationFrame(mmeter); })();

  /* her line types itself in step with her voice, then she finishes the sentence before moving on */
  /* other takes of her lines: the words on screen follow the take she says */
  const TAKES = { hi2: 'Hi. I’m Vex. Give me an order.', nudge2: 'Your move.', nudge3: 'Want another order?', swap3b: 'Done. Signed by you.', ape2b: 'No. That breaks your limits. Nothing signed.' };
  const vex = async (text, cls = '', id = '') => {
    const li = push(el('li', 't-vex' + (cls ? ' ' + cls : ''), `<div class="tx"><p></p></div>`)), p = li.querySelector('p');
    const take = Voice.pick(id); if (TAKES[take]) text = TAKES[take];
    if (!Voice.has(take) && Voice.canLive() && !RM && !rush) {
      const li = push(el('li', 't-vex typing' + (cls ? ' ' + cls : ''), `<div class="tx"><p></p></div>`)), p = li.querySelector('p');
      K('say', text); await Voice.live(text, k => { if (li.isConnected) p.textContent = text.slice(0, k); });
      p.textContent = text; li.classList.remove('typing'); return li;
    }
    const dur = await Voice.play(take, text), t0 = performance.now();
    li.classList.add('typing');
    K('say', text);
    if (RM || rush) { p.textContent = text; li.classList.remove('typing'); return li; }
    /* time-based, so a slow frame catches up instead of falling behind the voice */
    const total = dur ? dur * 900 : text.length * 26;
    await new Promise(r => { const f = () => {
      if (!li.isConnected || rush) { p.textContent = text; return r(); }
      const k = Math.min(text.length, Math.ceil(text.length * (performance.now() - t0) / total));
      p.textContent = text.slice(0, k); if (k >= text.length) r(); else requestAnimationFrame(f);
    }; f(); });
    li.classList.remove('typing');
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
    const W = 600, X1 = 532, Y0 = 14, Y1 = 170, V0 = 182, V1 = 222;
    const lo = Math.min(...C.map(k => k.l)) - 150, hi = Math.max(...C.map(k => k.h)) + 150;
    const y = p => Y0 + (hi - p) / (hi - lo) * (Y1 - Y0), step = X1 / n, bw = step * 0.56, x = i => step * i + step / 2;
    const lvl = CEIL;
    /* swing lows: lowest of their neighbours, each above the one before */
    const lows = []; for (let i = Math.round(n * 0.4); i < n - 2; i++) { const w = C.slice(i - 3, i + 3).map(k => k.l); if (C[i].l === Math.min(...w) && (!lows.length || C[i].l > C[lows[lows.length - 1]].l)) lows.push(i); }
    const HL = lows.slice(-3), fmt = v => Math.round(v).toLocaleString('en-US'), vmax = Math.max(...C.map(k => k.v));
    const ticks = [0, 1, 2, 3].map(t => lo + (hi - lo) * (0.12 + t * 0.26));
    const last = C[n - 1], ny = Math.max(y(last.c), y(lvl) + 20);
    const gid = 'cx' + (++chartN);
    const svg = `<svg class="cx" viewBox="0 0 ${W} 230" aria-hidden="true">
      <defs>
        <linearGradient id="${gid}g" gradientUnits="userSpaceOnUse" x1="0" x2="${X1}" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0.1"/></linearGradient>
        <linearGradient id="${gid}l" gradientUnits="userSpaceOnUse" x1="0" x2="${X1}" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.35" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#fff" stop-opacity="0.6"/></linearGradient>
        <linearGradient id="${gid}v" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="${Y0}" y2="${V1}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      </defs>
      ${ticks.map(t => `<line class="cx-grid" stroke="url(#${gid}g)" x1="0" x2="${X1}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/><text class="cx-ax" x="${X1 + 10}" y="${(y(t) + 4).toFixed(1)}">${fmt(t)}</text>`).join('')}
      <line class="cx-sep" stroke="url(#${gid}g)" x1="0" x2="${X1}" y1="${V0 - 6}" y2="${V0 - 6}"/>
      ${C.map((k, i) => `<rect class="cx-vol${k.c >= k.o ? ' up' : ''}" style="--i:${i}" x="${(x(i) - bw / 2).toFixed(1)}" y="${(V1 - (V1 - V0) * k.v / vmax).toFixed(1)}" width="${bw.toFixed(1)}" height="${((V1 - V0) * k.v / vmax).toFixed(1)}"/>`).join('')}
      <line class="cx-lvl" stroke="url(#${gid}l)" x1="0" x2="${X1}" y1="${y(lvl).toFixed(1)}" y2="${y(lvl).toFixed(1)}"/>
      <polyline class="cx-hl" points="${HL.map(i => `${x(i).toFixed(1)},${(y(C[i].l) + 10).toFixed(1)}`).join(' ')}"/>
      ${C.map((k, i) => `<g class="cx-c${k.c >= k.o ? ' up' : ''}" style="--i:${i}"><line x1="${x(i).toFixed(1)}" x2="${x(i).toFixed(1)}" y1="${y(k.h).toFixed(1)}" y2="${y(k.l).toFixed(1)}"/><rect x="${(x(i) - bw / 2).toFixed(1)}" y="${y(Math.max(k.o, k.c)).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, Math.abs(y(k.o) - y(k.c))).toFixed(1)}"/></g>`).join('')}
      ${HL.map(i => `<path class="cx-mk" d="M${x(i).toFixed(1)} ${(y(C[i].l) + 6).toFixed(1)}l4 7h-8z"/>`).join('')}
      <g class="cx-tag lv"><rect x="${X1 + 4}" y="${(y(lvl) - 9).toFixed(1)}" width="62" height="18"/><text x="${X1 + 10}" y="${(y(lvl) + 4).toFixed(1)}">${fmt(lvl)}</text></g>
      <line class="cx-now" x1="${x(n - 1).toFixed(1)}" x2="${X1}" y1="${y(last.c).toFixed(1)}" y2="${y(last.c).toFixed(1)}"/>
      <g class="cx-tag now"><rect x="${X1 + 4}" y="${(ny - 9).toFixed(1)}" width="62" height="18"/><text x="${X1 + 10}" y="${(ny + 4).toFixed(1)}">${fmt(last.c)}</text></g>
      <line class="cx-x" stroke="url(#${gid}v)" x1="0" x2="0" y1="${Y0}" y2="${V1}"/>
      <rect class="cx-hit" x="0" y="0" width="${X1}" height="230"/>
    </svg>`;
    const read = k => `<span>O <b>${fmt(k.o)}</b></span><span>H <b>${fmt(k.h)}</b></span><span>L <b>${fmt(k.l)}</b></span><span>C <b class="${k.c >= k.o ? 'up' : 'dn'}">${fmt(k.c)}</b></span>`;
    const li = el('li', 't-card t-chart', `<div class="xc-body">
      <div class="xc-top mono"><span>BTC / USD · 4H</span><span class="xc-st">Sample</span></div>
      <p class="cx-read mono">${read(last)}</p>
      ${svg}
      <p class="xc-foot mono cx-foot"><span>Level <b>${fmt(lvl)}</b></span><span>Higher lows <b>${HL.length}</b></span><span>Last <b>${fmt(last.c)}</b></span></p>
    </div>`);
    const sv = li.querySelector('svg'), xl = li.querySelector('.cx-x'), rd = li.querySelector('.cx-read');
    const at = e => { const r = sv.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W; return Math.max(0, Math.min(n - 1, Math.floor(px / step))); };
    sv.addEventListener('pointermove', e => { const i = at(e); xl.setAttribute('x1', x(i)); xl.setAttribute('x2', x(i)); sv.classList.add('hov'); rd.innerHTML = read(C[i]); });
    sv.addEventListener('pointerleave', () => { sv.classList.remove('hov'); rd.innerHTML = read(last); });
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
      gate.classList.add('out'); setTimeout(() => gate.remove(), 600); begin();
      if (matchMedia('(pointer: fine)').matches && ask) setTimeout(() => ask.focus({ preventScroll: true }), 650);
    };
    /* loading: a count to 100 driven by what has actually arrived (type, the Vex model, her voice), never slower than 12s */
    const bars = $('#gateBars'), stepsEl = [];
    const nb = Math.max(24, Math.round(innerWidth / 26)); bars.style.gridTemplateColumns = `repeat(${nb}, 1fr)`; bars.innerHTML = Array.from({ length: nb }, () => '<i></i>').join('');
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
      if (done) return;
      const el = performance.now() - t0;
      if (goal >= 0.9 && el > 900) { mark('voice', 1); }
      if (el > 12000) goal = 1;
      shown += (goal - shown) * 0.08 + 0.0015; shown = Math.min(shown, goal);
      gate.setAttribute('aria-valuenow', String(Math.round(shown * 100)));
      const lit = Math.round(shown * nb); bi.forEach((b, k) => { b.classList.toggle('on', k < lit); b.classList.toggle('head', k === lit - 1); });
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
  const phSt = $('#phSt');
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
