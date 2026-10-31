/* The menu as a dial (after the Huly Dial): a white knob in the middle, the four groups on a ring around it,
   the links on an arc to the right. Turn it with the wheel, the arrows, a drag on the knob, or point at a group;
   the ring turns so the group you are in sits in the window, and a line runs from the window to the link you are on. */
(() => {
  const mn = document.getElementById('mnav'), mb = document.getElementById('menuBtn'); if (!mn || !mb) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, small = matchMedia('(max-width: 900px)');
  /* filled glyphs */
  const I = {
    cube: '<path d="M12 3l8 4.4-8 4.4-8-4.4z"/><path opacity=".7" d="M4 8.6l7.3 4V21L4 16.8z"/><path opacity=".45" d="M12.7 12.6l7.3-4v8.2L12.7 21z"/>',
    book: '<path d="M3 5.2c2.8-1.2 5.7-1 8.2.8V20c-2.5-1.6-5.4-1.8-8.2-.8z"/><path d="M21 5.2c-2.8-1.2-5.7-1-8.2.8V20c2.5-1.6 5.4-1.8 8.2-.8z"/>',
    chain: '<path d="M3.9 12a3.1 3.1 0 013.1-3.1h4V7H7a5 5 0 000 10h4v-1.9H7A3.1 3.1 0 013.9 12zM8 13h8v-2H8zm9-6h-4v1.9h4a3.1 3.1 0 010 6.2h-4V17h4a5 5 0 000-10z"/>',
    people: '<path d="M9 4a3.5 3.5 0 110 7 3.5 3.5 0 010-7zM2 20c.4-3.9 3.3-6.3 7-6.3s6.6 2.4 7 6.3zM16.5 5.5a3 3 0 110 6 3 3 0 010-6zM17.6 13.8c2.6.4 4.2 2.6 4.4 6.2h-4.3c-.2-2.4-1-4.4-2.4-5.8.7-.3 1.5-.4 2.3-.4z"/>',
    get: '<path d="M11 3h2v9.2l3.3-3.3 1.4 1.4L12 16l-5.7-5.7 1.4-1.4L11 12.2zM4 19h16v2H4z"/>',
    desktop: '<path d="M3 4h18a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zM9 18h6v2H9z"/>',
    cloud: '<path d="M7 19a5 5 0 01-.7-9.95A6.5 6.5 0 0118.6 9.5 4.75 4.75 0 0117.5 19z"/>',
    token: '<path fill-rule="evenodd" d="M12 3a9 9 0 110 18 9 9 0 010-18zm0 4.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"/>',
    paper: '<path fill-rule="evenodd" d="M6 2h8.5L19 6.5V22H6zM9 11h7v1.5H9zm0 3.5h7V16H9z"/>',
    news: '<path fill-rule="evenodd" d="M3 4h18v16H3zM6 8h7v2H6zm0 4h12v1.6H6zm0 3.6h9v1.6H6z"/>',
    hex: '<path fill-rule="evenodd" d="M12 2l8.7 5v10L12 22l-8.7-5V7zM8.5 11.2h7v1.6h-7z"/>',
    vault: '<path fill-rule="evenodd" d="M3 5h18v15H3zM12 9a3.5 3.5 0 100 7 3.5 3.5 0 000-7z"/>',
    code: '<path d="M8.3 6.3l1.4 1.4L5.4 12l4.3 4.3-1.4 1.4L2.6 12zM15.7 6.3l5.7 5.7-5.7 5.7-1.4-1.4 4.3-4.3-4.3-4.3zM13.2 4l1.9.5-4.3 15.5-1.9-.5z"/>',
    x: '<path d="M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.3L5.6 21h-3l7.1-8.1L2.2 3h6.2l4.3 5.7z"/>',
    tg: '<path d="M21.5 3.5L2.5 11l5.6 2 2 6.3 3.2-3.6 4.6 3.6z"/>',
    gh: '<path d="M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 015 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0012 2z"/>',
    list: '<path d="M3 6h12v2H3zm0 5h12v2H3zm0 5h7v2H3zm12.5 1.6l2-2 1.5 1.5 3.5-3.5 1.4 1.4-4.9 4.9z"/>',
  };
  const ic = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg>`;
  const G = [
    { name: 'Product', icon: 'cube', items: [['Desktop', 'desktop', 'https://projectvex.ai/desktop'], ['Cloud', 'cloud', 'https://projectvex.ai/cloud'], ['Token', 'token', 'https://projectvex.ai/token']] },
    { name: 'Learn', icon: 'book', items: [['Whitepaper', 'paper', 'https://projectvex.ai/whitepaper'], ['Docs', 'book', 'https://projectvex.ai/docs/inference'], ['News', 'news', 'https://projectvex.ai/news']] },
    { name: 'On chain', icon: 'chain', items: [['$VEX contract', 'hex', 'https://robinhoodchain.blockscout.com/token/0x8Ff92566f2e81BDd68EDfAa8cde73942A723796b'], ['Fee treasury', 'vault', 'https://robinhoodchain.blockscout.com/address/0xe341f3da256C38356bce4Afd456d7fa36E356E94'], ['Source', 'code', 'https://github.com/Vex-Foundation/Vex']] },
    { name: 'Community', icon: 'people', items: [['X', 'x', 'https://x.com/ProjectVEXai'], ['Telegram', 'tg', 'https://t.me/ProjectVexai'], ['GitHub', 'gh', 'https://github.com/Vex-Foundation']] },
  ];
  /* on a phone the two header actions live in the dial too */
  if (small.matches) G.unshift({ name: 'Get Vex', icon: 'get', items: [['Download', 'get', 'https://projectvex.ai/download/auto'], ['Whitelist', 'list', 'https://t.me/ProjectVexai']] });
  const items = []; G.forEach((g, gi) => g.items.forEach(([t, k, h]) => items.push({ t, k, h, gi })));
  const N = items.length, NG = G.length, STEP = 360 / NG;

  /* the ring: one annular sector per group, the window fixed at the right */
  const R0 = 116, R1 = 198, CX = 240;
  const pt = (r, a) => [CX + r * Math.cos(a * Math.PI / 180), CX + r * Math.sin(a * Math.PI / 180)];
  const sector = (a0, a1, r0, r1) => { const [x0, y0] = pt(r1, a0), [x1, y1] = pt(r1, a1), [x2, y2] = pt(r0, a1), [x3, y3] = pt(r0, a0), big = a1 - a0 > 180 ? 1 : 0;
    return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r1} ${r1} 0 ${big} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}A${r0} ${r0} 0 ${big} 0 ${x3.toFixed(2)} ${y3.toFixed(2)}Z`; };
  const SPAN = STEP - 7;
  const ring = G.map((g, i) => { const a = i * STEP, [ix, iy] = pt((R0 + R1) / 2, a);
    return `<g class="dl-seg" data-g="${i}"><path d="${sector(a - SPAN / 2, a + SPAN / 2, R0, R1)}"/><g class="dl-ic" style="--x:${ix.toFixed(1)}px;--y:${iy.toFixed(1)}px"><svg x="${(ix - 13).toFixed(1)}" y="${(iy - 13).toFixed(1)}" width="26" height="26" viewBox="0 0 24 24">${I[g.icon]}</svg></g></g>`; }).join('');
  const win = sector(-SPAN / 2, SPAN / 2, R0 - 4, R1 + 4);
  const ticks = Array.from({ length: 72 }, (_, i) => { const a = i * 5 * Math.PI / 180, r0 = 84, r1 = i % 6 ? 88 : 91; return `<line x1="${(r0 * Math.cos(a)).toFixed(2)}" y1="${(r0 * Math.sin(a)).toFixed(2)}" x2="${(r1 * Math.cos(a)).toFixed(2)}" y2="${(r1 * Math.sin(a)).toFixed(2)}"/>`; }).join('');

  document.body.appendChild(mn); /* out of the header: its backdrop filter would trap a fixed child */
  mn.className = 'dial'; mn.setAttribute('role', 'dialog'); mn.setAttribute('aria-label', 'Menu');
  mn.innerHTML = `
    <div class="dl-stage">
      <div class="dl-core">
        <svg class="dl-ring" viewBox="0 0 480 480" aria-hidden="true">
          <defs><pattern id="dlHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7"/></pattern></defs>
          <circle class="dl-orbit" cx="240" cy="240" r="226"/>
          <circle class="dl-well" cx="240" cy="240" r="${R0 - 6}"/>
          <g class="dl-rot">${ring}</g>
          <path class="dl-win" d="${win}"/>
        </svg>
        <button class="dl-knob" type="button" aria-label="Open the selected link">
          <svg class="dl-knurl" viewBox="-96 -96 192 192" aria-hidden="true"><circle r="93"/>${ticks}<circle class="in" r="76"/></svg>
          <span class="dl-burg" aria-hidden="true"><i></i><i></i><i></i></span>
        </button>
        <span class="dl-wire" aria-hidden="true"></span>
      </div>
      <ol class="dl-list">${items.map((it, i) => `<li data-i="${i}"><a href="${it.h}" target="_blank" rel="noopener" tabindex="-1">${ic(it.k)}<span>${it.t}</span></a></li>`).join('')}</ol>
      <div class="dl-side">
        <button class="dl-x" type="button" aria-label="Close menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z"/></svg></button>
        <div class="dl-pill">
          <button class="dl-up" type="button" aria-label="Previous"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 20V8.8l-4.6 4.6L5 12l7-7 7 7-1.4 1.4L13 8.8V20z"/></svg></button>
          <button class="dl-ok" type="button" aria-label="Open"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2"/></svg></button>
          <button class="dl-dn" type="button" aria-label="Next"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 4v11.2l4.6-4.6L19 12l-7 7-7-7 1.4-1.4 4.6 4.6V4z"/></svg></button>
        </div>
      </div>
    </div>`;

  const $ = s => mn.querySelector(s), rot = $('.dl-rot'), knurl = $('.dl-knurl'), lis = [...mn.querySelectorAll('.dl-list li')], segs = [...mn.querySelectorAll('.dl-seg')];
  let sel = 0, ringA = 0, open = false;
  /* the ring takes the shortest way round to the group you are in */
  const turnTo = gi => { let want = -gi * STEP; while (want - ringA > 180) want -= 360; while (want - ringA < -180) want += 360; ringA = want; rot.style.transform = `rotate(${ringA}deg)`; segs.forEach((s, i) => { s.classList.toggle('on', i === gi); s.querySelector('.dl-ic').style.transform = `rotate(${-ringA}deg)`; }); };
  const lay = () => {
    const col = small.matches;
    lis.forEach((li, i) => {
      let d = i - sel; if (d > N / 2) d -= N; if (d < -N / 2) d += N;
      const ad = Math.abs(d), op = ad === 0 ? 1 : col && ad > 2 ? 0 : Math.max(0, 0.78 - (ad - 1) * 0.24);
      li.style.transform = col ? `translate(-50%, ${d * 60}px) scale(${1 - Math.min(ad, 4) * 0.05})` : `rotate(${d * 12.5}deg) translateX(var(--R)) translateY(-50%)`;
      li.style.opacity = op; li.style.filter = ad >= 2 ? `blur(${Math.min(2.4, (ad - 1) * 1.1)}px)` : 'none';
      li.classList.toggle('on', ad === 0); li.style.pointerEvents = op > 0.15 ? '' : 'none';
      li.querySelector('a').tabIndex = ad === 0 ? 0 : -1;
    });
    knurl.style.transform = `rotate(${sel * 24}deg)`;
    turnTo(items[sel].gi);
  };
  const go = k => { sel = (sel + k + N) % N; lay(); tick(); };
  const pick = i => { if (i === sel) return; sel = i; lay(); tick(); };
  /* a soft detent under each step */
  let actx = null;
  const tick = () => { if (RM) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g = actx.createGain(); o.type = 'triangle'; o.frequency.value = 2400; g.gain.setValueAtTime(0.025, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.035); o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.04); } catch (e) {} };
  const follow = () => { const a = lis[sel].querySelector('a'); window.open(a.href, '_blank', 'noopener'); setOpen(false); };

  const setOpen = v => {
    open = v; btn.setAttribute('aria-expanded', String(v)); document.body.classList.toggle('menu-open', v);
    if (v) { mn.hidden = false; requestAnimationFrame(() => mn.classList.add('in')); lay(); setTimeout(() => lis[sel].querySelector('a').focus({ preventScroll: true }), 80); }
    else { mn.classList.remove('in'); setTimeout(() => { if (!open) mn.hidden = true; }, RM ? 0 : 420); }
  };
  /* take the burger over from the old menu */
  const btn = mb.cloneNode(true); mb.replaceWith(btn); btn.addEventListener('click', e => { e.stopPropagation(); setOpen(!open); });
  Object.defineProperty(window, 'vexDial', { value: { open: () => setOpen(true), close: () => setOpen(false) } });
  $('.dl-x').addEventListener('click', () => { setOpen(false); btn.focus(); });
  $('.dl-up').addEventListener('click', () => go(-1));
  $('.dl-dn').addEventListener('click', () => go(1));
  $('.dl-ok').addEventListener('click', follow);
  lis.forEach((li, i) => { li.addEventListener('pointerenter', () => { if (!small.matches) pick(i); }); li.querySelector('a').addEventListener('click', e => { if (i !== sel) { e.preventDefault(); pick(i); return; } setTimeout(() => setOpen(false), 50); }); });
  segs.forEach((s, gi) => { s.addEventListener('pointerenter', () => { if (items[sel].gi !== gi) pick(items.findIndex(it => it.gi === gi)); }); s.addEventListener('click', () => pick(items.findIndex(it => it.gi === gi))); });
  /* the wheel turns it a notch at a time */
  let acc = 0, wl = 0;
  mn.addEventListener('wheel', e => { e.preventDefault(); acc += e.deltaY; const now = performance.now(); if (Math.abs(acc) > 30 && now - wl > 70) { go(acc > 0 ? 1 : -1); acc = 0; wl = now; } }, { passive: false });
  addEventListener('keydown', e => {
    if (!open) return;
    if (e.key === 'Escape') { setOpen(false); btn.focus(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'Enter' && document.activeElement && !document.activeElement.closest('.dl-side')) { e.preventDefault(); follow(); }
  });
  /* turn the knob: a drag around its centre steps every 24 degrees; a tap opens the link */
  const knob = $('.dl-knob'); let drag = null;
  const angOf = e => { const r = knob.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
  knob.addEventListener('pointerdown', e => { drag = { a: angOf(e), moved: 0 }; knob.setPointerCapture(e.pointerId); });
  knob.addEventListener('pointermove', e => { if (!drag) return; let d = angOf(e) - drag.a; if (d > 180) d -= 360; if (d < -180) d += 360; if (Math.abs(d) >= 24) { go(d > 0 ? 1 : -1); drag.a = angOf(e); drag.moved++; } });
  knob.addEventListener('pointerup', () => { const m = drag && drag.moved; drag = null; if (!m) follow(); });
  /* a click on the dark around it closes */
  mn.addEventListener('click', e => { if (e.target === mn || e.target.classList.contains('dl-stage')) setOpen(false); });
  small.addEventListener('change', () => open && lay());
  lay();
})();
