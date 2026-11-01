/* History rail: the outermost column on the left, under the grid key. Collapsed it is a strip of square cells
   (open, new chat, your last orders as icons, you); open, a panel slides out beside it with every order and how it ended.
   Clicking an order asks Vex again. Desktop only; the history stays in this browser. */
(() => {
  const hc = document.querySelector('.hc'); if (!hc) return;
  const KEY = 'vexHist2', MAX = 24;
  const P = {
    side: 'M13 3a9 9 0 0 0-9 9H1l3.9 3.9.1.1L9 12H6a7 7 0 1 1 2.05 4.95l-1.42 1.42A9 9 0 1 0 13 3zm-1 5v5.2l4.3 2.55.75-1.25-3.55-2.1V8z',
    plus: 'M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9.5L4 22v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM11 6.5v3H8v2h3v3h2v-3h3v-2h-3v-3z',
    swap: 'M7 2.5 1.5 8H5v8h4V8h3.5zM17 21.5l5.5-5.5H19V8h-4v8h-3.5z',
    chart: 'M3 13h4.5v8H3zM9.75 7h4.5v14h-4.5zM16.5 3H21v18h-4.5z',
    ask: 'M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9.5L4 22v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
    no: 'M12 1.8 20.5 5v6.2c0 5.1-3.5 9.6-8.5 11-5-1.4-8.5-5.9-8.5-11V5zM8.8 8.2 7.4 9.6l3.2 3.2-3.2 3.2 1.4 1.4 3.2-3.2 3.2 3.2 1.4-1.4-3.2-3.2 3.2-3.2-1.4-1.4-3.2 3.2z',
  };
  window.VEX_RAIL_ICONS = P;
  const ic = (d, cls = '') => `<svg class="rl-ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="${d}"/></svg>`;
  const iconOf = e => e.result === 'Blocked' ? P.no : P[e.kind] || P.ask;
  /* the demo's own three orders stand in until you have sent some yourself */
  const SEED = [
    { q: 'Swap 200 USDC to ETH on Base, max 1% slippage.', kind: 'swap', result: 'Signed', t: 0 },
    { q: 'Analyze BTC 4h.', kind: 'chart', result: 'Answered', t: 0 },
    { q: 'Bridge 500 USDC to Solana and send it to 7xKq…9fPz.', kind: 'swap', result: 'Blocked', t: 0 },
  ];
  let list; try { list = JSON.parse(localStorage.getItem('vexHist2') || 'null'); } catch (e) {}
  if (!Array.isArray(list)) list = SEED.slice();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(list.filter(e => !e.live).slice(0, MAX))); } catch (e) {} };

  const rail = document.createElement('aside');
  rail.className = 'rail'; rail.setAttribute('aria-label', 'Chat history');
  rail.innerHTML = `
    <div class="rl-col">
      <div class="rl-recent" role="list"></div>
      <button class="rl-cell rl-tog" type="button" aria-expanded="false" aria-controls="rlPanel" data-tip="History">${ic(P.side)}<span class="visually-hidden">Chat history</span></button>
      <div class="rl-cell rl-me" aria-hidden="true"><img alt="" src="${window.VEX_USER_AVATAR || ''}"></div>
    </div>
    <div class="rl-scrim" aria-hidden="true"></div>
    <div class="rl-panel" id="rlPanel" role="region" aria-label="History" inert>
      <div class="rl-head"><span class="rl-h">History</span><span class="rl-n"></span></div>
      <div class="rl-list"></div>
    </div>`;
  hc.insertBefore(rail, hc.firstChild);
  const tog = rail.querySelector('.rl-tog'), panel = rail.querySelector('.rl-panel'), recent = rail.querySelector('.rl-recent'), box = rail.querySelector('.rl-list'), cnt = rail.querySelector('.rl-n');

  const hhmm = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const dayOf = t => { if (!t) return 'Earlier'; const d = new Date(t), n = new Date(); if (d.toDateString() === n.toDateString()) return 'Today'; n.setDate(n.getDate() - 1); return d.toDateString() === n.toDateString() ? 'Yesterday' : 'Earlier'; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const draw = () => {
    cnt.textContent = '';
    recent.innerHTML = list.filter(e => !(list.find(x => x.live) && !e.live && e.q.trim().toLowerCase() === list.find(x => x.live).q.trim().toLowerCase())).slice(0, 5).map((e, i) => `<button class="rl-cell rl-item${e.live ? ' live' : ''}" type="button" role="listitem" data-i="${i}" data-tip="${esc(e.q)}" data-r="${e.result || ''}">${ic(iconOf(e))}<span class="visually-hidden">${esc(e.q)}</span></button>`).join('');
    let html = '', last = '';
    /* an order being asked again shows once, as the live one */
    const now = list.find(e => e.live), same = e => now && e !== now && e.q.trim().toLowerCase() === now.q.trim().toLowerCase();
    list.forEach((e, i) => { if (same(e)) return;
      const g = e.live ? 'Now' : dayOf(e.t);
      if (g !== last) { html += `<div class="rl-g">${g}</div>`; last = g; }
      html += `<button style="--n:${i}" class="rl-row rl-item${e.live ? ' live' : ''}" type="button" data-i="${i}" data-r="${e.result || ''}">${ic(iconOf(e))}<span class="rl-q">${esc(e.q)}</span><span class="rl-r">${e.live ? 'Working' : esc(e.result || '')}</span>${e.t ? `<span class="rl-t">${hhmm(e.t)}</span>` : ''}</button>`;
    });
    box.innerHTML = html || '<p class="rl-empty">Your orders will show here.</p>';
  };
  draw();

  let open = false;
  const setOpen = v => {
    /* the panel pushes in: Kimm's side eases right and dims under it, so the move reads as one push */
    const cp = document.querySelector('.hc-copy'); if (cp) rail.style.setProperty('--col', Math.max(0, cp.getBoundingClientRect().left - rail.getBoundingClientRect().right) + 'px');
    open = v; rail.classList.toggle('open', v); document.documentElement.classList.toggle('rl-open', v); tog.setAttribute('aria-expanded', String(v));
    if (v) panel.removeAttribute('inert'); else panel.setAttribute('inert', '');
  };
  tog.addEventListener('click', () => setOpen(!open));
  addEventListener('keydown', e => { if (e.key === 'Escape' && open) { setOpen(false); tog.focus(); } });
  document.addEventListener('pointerdown', e => { if (open && !rail.contains(e.target)) setOpen(false); });
  const shake = el => { el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope'); };
  const fresh = el => { if (window.vexNew && window.vexNew()) setOpen(false); else shake(el); };
  /* New chat lives in the composer, mirroring Send */
  const nw = document.getElementById('vxNew'); if (nw) nw.addEventListener('click', e => fresh(e.currentTarget));
  rail.addEventListener('click', e => {
    const b = e.target.closest('.rl-item'); if (!b) return;
    const it = list[+b.dataset.i]; if (!it || it.live) return;
    if (window.vexAsk && window.vexAsk(it.q)) setOpen(false); else shake(b);
  });

  /* live: an order shows at the top while she works, then takes its result */
  addEventListener('vex:run', e => { list = list.filter(x => !x.live); list.unshift({ q: e.detail.q, kind: e.detail.kind, result: '', t: Date.now(), live: true }); draw(); });
  addEventListener('vex:end', e => {
    const it = list.find(x => x.live); if (!it) return;
    delete it.live; it.result = e.detail.result || 'Answered';
    /* the same words asked again replace the older entry */
    list = [it, ...list.filter(x => x !== it && x.q.trim().toLowerCase() !== it.q.trim().toLowerCase())].slice(0, MAX);
    save(); draw();
  });
})();
