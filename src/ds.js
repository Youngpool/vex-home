/* The design system, opened from the dial: one full-screen panel in the house style, an index of chapters on the left,
   every token, face, cell, component, glyph, curve and mood of Kimm on the right. The components are the real ones,
   frozen from the running page with their computed styles (ds-data.js), so what you see here is what ships. */
(() => {
  const D = window.VEX_DS_DATA || {};
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const gl = (d, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const I = () => window.VEX_ICONS || {};

  const CH = [
    ['principles', 'Principles', 'shield'], ['colour', 'Colour', 'palette'], ['type', 'Type', 'type'], ['layout', 'Layout', 'layout'],
    ['components', 'Components', 'cube'], ['icons', 'Icons', 'star'], ['motion', 'Motion', 'curve'], ['character', 'Character', 'person'], ['voice', 'Voice', 'bubble'],
  ];

  /* ---------- the tokens, as the page computes them ---------- */
  const COL = [
    ['Ground', 'Every surface is a near-black with a trace of VEX blue in it. Depth comes from one step of lightness, never from shadow.', [
      ['Page', 'oklch(9% 0.012 264)', 'Body, behind everything'],
      ['Header', 'oklch(7% 0.01 264 / 0.82)', 'Top bar, over a 16px blur'],
      ['Panel', 'oklch(8.5% 0.008 264)', 'Chat column, composer'],
      ['Rail', 'oklch(6% 0.006 264)', 'History rail'],
      ['Dial', 'oklch(5.5% 0.006 264)', 'Menu overlay'],
      ['Card', 'oklch(10.5% 0.006 264)', 'Order card'],
      ['Cell', 'oklch(11% 0.006 264)', 'New chat, quiet keys'],
      ['Cell raised', 'oklch(13% 0.004 264)', 'Whitelist, dial links'],
    ]],
    ['Ink', 'Four steps of one cool white. Primary for words that must be read, the rest step back in order.', [
      ['Ink', 'oklch(97% 0.005 264)', 'Text, filled glyphs'],
      ['Ink 2', 'oklch(80% 0.012 264)', 'Quiet keys, labels at rest'],
      ['Muted', 'oklch(62% 0.02 264)', 'Field names, metadata'],
      ['Faint', 'oklch(100% 0 0 / 0.55)', 'Limits beside a value'],
    ]],
    ['Lines and fills', 'One hairline, 1px, everywhere. Brighter only when something is chosen.', [
      ['Rule', 'oklch(100% 0 0 / 0.07)', 'Every cell edge'],
      ['Rule chosen', 'oklch(100% 0 0 / 0.24)', 'The selected cell'],
      ['Bubble', 'oklch(100% 0 0 / 0.06)', 'Vex speaking'],
      ['Bubble you', 'oklch(100% 0 0 / 0.13)', 'You speaking'],
      ['Chosen', 'linear-gradient(90deg, oklch(20% 0.004 264), transparent)', 'Selected row, no border'],
    ]],
    ['Blue', 'VEX blue is an action, not a decoration. It appears on four things only: Send, Download, the Tutorial tag and the chosen risk mode.', [
      ['Blue', 'oklch(45.2% 0.313 264.1)', 'The one accent'],
      ['Blue hover', 'oklch(52% 0.3 264)', 'Pointer over a blue key'],
      ['Blue edge', 'oklch(70% 0.2 264)', 'Chosen risk cell edge'],
      ['Blue light', 'oklch(80% 0.12 264)', 'Chosen risk arc'],
    ]],
    ['Status', 'The runtime speaks in three colours, each with a 16% tint for its ground.', [
      ['Live', 'oklch(52% 0.13 150)', 'Signed, cleared, OK'],
      ['Live text', 'oklch(78% 0.13 150)', 'Status words on dark'],
      ['Error', 'oklch(54% 0.2 27)', 'Blocked, refused'],
      ['Error text', 'oklch(74% 0.17 27)', 'Failed check, refusal'],
      ['Dev', 'oklch(52% 0.11 75)', 'Simulated, in development'],
    ]],
  ];
  const TYPE = [
    ['Display', 'Be Vietnam Pro 600 · clamp(3.1rem, 8.6vw, 9.6rem) · -0.045em', '<span style="font:600 clamp(52px,6vw,96px)/0.95 var(--font);letter-spacing:-0.045em">Inside your limits</span>'],
    ['Display 3', 'Be Vietnam Pro 600 · clamp(1.9rem, 3vw, 3.2rem) · -0.03em', '<span style="font:600 clamp(30px,3vw,51px)/1.05 var(--font);letter-spacing:-0.03em">Model proposes. Runtime enforces.</span>'],
    ['Headline', 'Be Vietnam Pro 600 · 19.44px · uppercase · 0.01em', '<span style="font:600 19.44px/1.15 var(--font);letter-spacing:0.01em;text-transform:uppercase">An AI trading agent, <span style="color:oklch(62% 0.02 264)">inside your limits.</span></span>'],
    ['Chat', 'Be Vietnam Pro 400 · 16px / 23.2px · -0.005em', '<span style="font:400 16px/23.2px var(--font);letter-spacing:-0.08px">Route found on KyberSwap. Checking your limits.</span>'],
    ['Order title', 'Be Vietnam Pro 500 · 18px · -0.01em', '<span style="font:500 18px/23.4px var(--font);letter-spacing:-0.18px">200 USDC → ETH</span>'],
    ['Key', 'Be Vietnam Pro 500 · 13px · uppercase · 0.08em', '<span style="font:500 13px/1 var(--font);letter-spacing:1.04px;text-transform:uppercase">Download</span>'],
    ['Field', 'Roboto Mono 400 · 12px · uppercase · 0.06em', '<span style="font:400 12px/1 var(--mono);letter-spacing:0.72px;text-transform:uppercase;color:oklch(62% 0.02 264)">Min. received</span>&nbsp;&nbsp;&nbsp;<span style="font:400 12px/1 var(--mono);letter-spacing:0.12px;font-variant-numeric:tabular-nums">99% of quote</span>'],
    ['Tag', 'Roboto Mono 600 · 12px · uppercase · 0.02em', '<span style="display:inline-block;padding:6px 8px;background:oklch(45.2% 0.313 264.1);color:#fff;font:600 12px/1 var(--mono);letter-spacing:0.24px;text-transform:uppercase">Tutorial</span>'],
  ];
  const SPACE = [
    ['Header', '76px', 'Top bar and every cell in it, square'], ['Rail', '76px', 'Collapsed history column, square cells'], ['Composer', '72px', 'New chat, input, Send'],
    ['Edge', '8px', 'Inner offset of the frame'], ['Pad', 'clamp(20px, 2.6vw, 40px)', 'Outer gutter'], ['Pad x', 'clamp(20px, 2.2vw, 40px)', 'Column gutter on wide screens'],
    ['Gap', 'clamp(16px, 1.7vw, 28px)', 'Between blocks'], ['Side', '44%', 'Kimm column in landscape phone layout'], ['Zoom', 'clamp(1, 100vw / 1760, 1.5)', 'Chat and composer scale on large screens'],
  ];
  const MOTION = [
    ['Ease', 'cubic-bezier(0.625, 0.05, 0, 1)', '300ms', 'Every state change: fills, strokes, rows'],
    ['Push', 'cubic-bezier(0.22, 1, 0.36, 1)', '720ms', 'History panel and the stage it pushes'],
    ['Dial', 'cubic-bezier(0.22, 1, 0.36, 1)', '420ms', 'Menu in and out, the ring turning'],
    ['Reel', 'expo.inOut', '900ms', 'Tutorial grows from its corner'],
    ['Caption', 'cubic-bezier(0.22, 1, 0.36, 1)', '620ms', 'Pills and toasts arriving'],
  ];
  const MOODS = [
    ['hi', 'Hi', 'Page opens, or you poke her', 'A V at you, a small hop'],
    ['think', 'Think', 'request', 'Hand to her mouth while the runtime routes'],
    ['offer', 'Offer', 'wait', 'Holds the order out, glances at your key'],
    ['done', 'Signed', 'done', 'A V and a hop once it lands'],
    ['refused', 'Refused', 'refused', 'Arms crossed, nothing signed'],
    ['rest', 'Rest', 'idle', 'Follows the pointer, small acts every few seconds'],
  ];
  const VOICE = [
    ['First person, present tense', 'I’m Vex. I trade inside your limits.', 'Hello! I am your AI-powered trading assistant ready to help!'],
    ['The outcome first, then why', 'Blocked. A bridge only goes to your own wallet. Nothing signed.', 'Unfortunately, due to our security policies, this transaction could not be completed.'],
    ['Exact numbers, no rounding up', 'Route found on KyberSwap. Checking your limits.', 'Found an amazing route with the best possible price!'],
    ['You decide. She never pushes', 'Every field is on the card. Your call.', 'Great trade! Approve now before the price moves!'],
  ];

  /* ---------- markup ---------- */
  const sw = ([n, v, u]) => `<button class="ds-sw" type="button" data-copy="${esc(v)}" aria-label="Copy ${esc(n)}: ${esc(v)}"><span class="ds-chip" style="background:${v}"></span><span class="ds-swt"><b>${esc(n)}</b><code>${esc(v)}</code><span>${esc(u)}</span></span></button>`;
  const head = (id, t, lede) => `<header class="ds-sh"><h2 class="ds-h" id="ds-h-${id}">${t}</h2><p class="ds-lede">${lede}</p></header>`;
  const stage = (label, html, cls = '') => `<figure class="ds-stage ${cls}"><figcaption>${label}</figcaption><div class="ds-ground">${html}</div></figure>`;
  const frozen = k => (D.frozen && D.frozen[k] || '').replace(/data-av="1"/g, `src="${window.VEX_USER_AVATAR || ''}"`).replace(/src=""\s+src=/g, 'src=');
  const keyCell = (t, bg, fg, extra = '') => `<span class="ds-key" style="background:${bg};color:${fg};${extra}">${t}</span>`;
  const dots = '<svg class="ds-dots" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg>';

  const sections = () => {
    const ic = I(), rail = window.VEX_RAIL_ICONS || {};
    const glyphs = Object.entries(ic).map(([k, d]) => [k, d]).concat(Object.entries(rail).map(([k, d]) => ['rail.' + k, `<path fill-rule="evenodd" d="${d}"/>`]));
    const S = {};
    S.principles = head('principles', 'Principles', 'VEX is a trading runtime with a face. The interface is the runtime’s instrument panel: black, square, exact. Kimm is the only soft thing on it.') +
      `<div class="ds-cells ds-cells--4">${[
        ['Black and tactical', 'Near-black grounds, cool white ink. Depth is one step of lightness. No shadows, no glass on the frame, no gradients but the chosen row.'],
        ['Square cells, one hairline', 'Everything sits in square cells cut by 1px rules at 7% white. The chosen cell lifts its rule to 24%. Corners stay square; only chat bubbles round.'],
        ['Blue is an action', 'VEX blue marks what you can do next: Send, Download, the Tutorial tag and the risk mode you chose. Nothing else is blue.'],
        ['Filled glyphs', 'Icons are solid shapes on a 24px grid, never outlines. Labels are uppercase and tracked; what Vex says is sentence case.'],
      ].map(([t, b]) => `<div class="ds-pr"><h3>${t}</h3><p>${b}</p></div>`).join('')}</div>`;
    S.colour = head('colour', 'Colour', 'Every value below is read from the running page. Click a swatch to copy it.') +
      COL.map(([g, l, list]) => `<h3 class="ds-sub">${g}</h3><p class="ds-note">${l}</p><div class="ds-cells ds-cells--sw">${list.map(sw).join('')}</div>`).join('');
    S.type = head('type', 'Type', 'Two families. Be Vietnam Pro carries every word a person reads; Roboto Mono carries every value the runtime checks.') +
      `<div class="ds-cells ds-cells--2 ds-faces"><div><b style="font:300 64px/1 var(--font)">Aa</b><p>Be Vietnam Pro</p><code>300 · 400 · 500 · 600</code></div><div><b style="font:400 64px/1 var(--mono)">Aa</b><p>Roboto Mono</p><code>400 · 600 · tabular figures</code></div></div>` +
      `<div class="ds-rows">${TYPE.map(([n, m, s]) => `<div class="ds-row"><div><b>${n}</b><code>${m}</code></div><div class="ds-spec">${s}</div></div>`).join('')}</div>`;
    S.layout = head('layout', 'Layout', 'A frame of square cells: a header across the top, the history rail on the far left, Kimm’s column, the chat column, the composer under it and one line of copy at the foot.') +
      `<div class="ds-frame" aria-hidden="true">
        <div class="f-hd"><span class="f-c">≡</span><span class="f-g"><em>header · 76</em></span><span class="f-c"></span><span class="f-c"></span><span class="f-w">Whitelist</span><span class="f-b">Download</span></div>
        <div class="f-rl"><span></span><span></span><em>rail · 76</em></div>
        <div class="f-km"><i class="f-arc"></i><em>Kimm · the stage</em></div>
        <div class="f-ch"><i></i><i class="r"></i><i></i><i class="cd"></i><em>chat · thread</em></div>
        <div class="f-as"><span>New chat</span><span class="g"></span><span class="b">Send</span><em>composer · 72</em></div>
        <div class="f-ft"><em>copy line · 76</em></div>
      </div>` +
      `<h3 class="ds-sub">Measures</h3><div class="ds-rows">${SPACE.map(([n, v, u]) => `<div class="ds-row ds-row--3"><b>${n}</b><code>${v}</code><span>${u}</span></div>`).join('')}</div>` +
      `<h3 class="ds-sub">Rules</h3><div class="ds-cells ds-cells--3 ds-rules"><div><i style="border-color:oklch(100% 0 0 / 0.07)"></i><b>1px at 7%</b><span>Every cell edge</span></div><div><i style="border-color:oklch(100% 0 0 / 0.24)"></i><b>1px at 24%</b><span>The chosen cell</span></div><div><i style="border:0;background:linear-gradient(90deg, oklch(20% 0.004 264), transparent)"></i><b>Gradient 100 → 0%</b><span>A chosen row, no border</span></div></div>`;
    S.components = head('components', 'Components', 'The real components, frozen from the page with their computed styles.') +
      `<div class="ds-grid2">` +
      stage('Keys', `<div class="ds-keys">${keyCell('Download', 'oklch(45.2% 0.313 264.1)', '#fff')}${keyCell('Whitelist', 'oklch(13% 0.004 264)', 'oklch(97% 0.005 264)', 'box-shadow:inset 1px 0 oklch(100% 0 0 / 0.07)')}${keyCell(dots + 'Send', 'oklch(45.2% 0.313 264.1)', '#fff')}${keyCell(gl((I().bubble || '')) + 'New chat', 'oklch(11% 0.006 264)', 'oklch(80% 0.012 264)')}</div>`) +
      stage('Tags', `<div class="ds-keys ds-tags"><span class="ds-tag b">Tutorial</span><span class="ds-tag w">Cleared</span><span class="ds-tag r">Blocked</span><span class="ds-tag g">Signed</span></div>`) +
      `</div>` +
      stage('Composer', `<div class="ds-fz">${frozen('ask')}</div>`, 'ds-stage--wide') +
      stage('Chat · an order cleared', `<ol class="ds-fz ds-thread">${frozen('vex')}${frozen('you')}${frozen('sys')}${frozen('log')}${frozen('card')}${frozen('ok')}</ol>`, 'ds-stage--chat') +
      stage('Chat · an order blocked', `<ol class="ds-fz ds-thread">${frozen('blocked')}${frozen('no')}</ol>`, 'ds-stage--chat') +
      `<div class="ds-grid2">` +
      stage('Risk modes', `<div class="ds-risk-slot"></div><div class="ds-risk-k"><button type="button" data-k="c">Conservative</button><button type="button" data-k="b">Balanced</button><button type="button" data-k="a">Aggressive</button></div>`) +
      stage('History', `<div class="ds-fz ds-hist">${frozen('hist')}</div>`) +
      `</div>`;
    S.icons = head('icons', 'Icons', `${glyphs.length} glyphs, filled, on a 24px grid. Opacity steps (.7, .45) stand in for a second colour.`) +
      `<div class="ds-cells ds-cells--ic">${glyphs.map(([k, d]) => `<div class="ds-ic">${gl(d)}<code>${esc(k)}</code></div>`).join('')}</div>`;
    S.motion = head('motion', 'Motion', 'Things arrive slowly and leave fast. Only transform and opacity move. With reduced motion every one of these is instant.') +
      `<div class="ds-rows ds-mo">${MOTION.map(([n, c, ms, u]) => `<button type="button" class="ds-row ds-row--mo" style="--c:${c.startsWith('cubic') ? c : 'cubic-bezier(0.87, 0, 0.13, 1)'};--ms:${ms}"><b>${n}</b><code>${c} · ${ms}</code><span>${u}</span><i class="ds-track"><i></i></i></button>`).join('')}</div><p class="ds-note">Click a row to play its curve.</p>`;
    S.character = head('character', 'Character', 'Kimm is Vex’s face. She reacts to what the runtime does, never to decorate it. Each mood has one trigger.') +
      `<div class="ds-cells ds-cells--km">${MOODS.map(([k, n, ev, l]) => `<div class="ds-km"><img alt="Kimm, ${esc(n.toLowerCase())}" loading="lazy" src="${(D.kimm || {})[k] || ''}"><b>${n}</b><code>on ${esc(ev)}</code><span>${l}</span></div>`).join('')}</div>`;
    S.voice = head('voice', 'Voice', 'Vex speaks like a careful trader at your side: short, in the first person, the outcome before the reason. Keys and fields are uppercase; what she says is sentence case.') +
      `<div class="ds-rows">${VOICE.map(([r, y, n]) => `<div class="ds-row ds-row--vo"><b>${r}</b><div><span class="ds-say">${esc(y)}</span><span class="ds-say ds-say--no">${esc(n)}</span></div></div>`).join('')}</div>`;
    return S;
  };

  /* ---------- the panel ---------- */
  let el = null, open = false, built = false;
  const build = () => {
    el = document.createElement('div'); el.className = 'ds'; el.id = 'vexDS'; el.hidden = true;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'VEX design system');
    el.innerHTML = `<header class="ds-top"><div class="ds-brand"><svg viewBox="0 0 176 140" aria-hidden="true"><use href="#vexmark"/></svg><b>Design system</b><code>v94</code></div><span class="ds-crumb"></span><button class="ds-x" type="button" aria-label="Close design system">${gl('<path d="M6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z"/>')}</button></header>
      <nav class="ds-nav" aria-label="Chapters">${CH.map(([id, t, k]) => `<button type="button" data-id="${id}">${gl(I()[k] || '')}<span>${t}</span></button>`).join('')}</nav>
      <main class="ds-main" tabindex="-1"></main>`;
    document.body.appendChild(el);
    el.querySelector('.ds-x').addEventListener('click', () => setOpen(false));
    el.querySelector('.ds-nav').addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(b.dataset.id); });
    el.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } });
  };
  const fill = () => {
    if (built) return; built = true;
    const S = sections(), main = el.querySelector('.ds-main');
    main.innerHTML = CH.map(([id]) => `<section class="ds-sec" id="ds-${id}" aria-labelledby="ds-h-${id}">${S[id]}</section>`).join('');
    /* the page squares every corner with !important; the frozen bubbles keep theirs the same way */
    main.querySelectorAll('.ds-fz [style*="border-radius"]').forEach(n => n.style.setProperty('border-radius', n.style.borderRadius, 'important'));
    main.querySelectorAll('.ds-fz input, .ds-fz textarea').forEach(n => { n.readOnly = true; n.tabIndex = -1; });
    main.querySelectorAll('.ds-fz button, .ds-fz a').forEach(n => { n.tabIndex = -1; n.setAttribute('aria-hidden', 'true'); });
    /* copy a token */
    main.addEventListener('click', e => {
      const s = e.target.closest('.ds-sw');
      if (s) { try { navigator.clipboard.writeText(s.dataset.copy); } catch (er) {} s.classList.add('cp'); setTimeout(() => s.classList.remove('cp'), 1100); return; }
      const m = e.target.closest('.ds-row--mo');
      if (m) { m.style.setProperty('--tw', m.querySelector('.ds-track').clientWidth + 'px'); m.classList.remove('go'); void m.offsetWidth; m.classList.add('go'); return; }
      const k = e.target.closest('.ds-risk-k button');
      if (k) setRisk(k.dataset.k);
    });
    /* the risk arc itself, cloned from the stage so it carries the page's own styles */
    const src = document.querySelector('.risk'), slot = main.querySelector('.ds-risk-slot');
    if (src && slot) { const c = src.cloneNode(true); c.removeAttribute('style'); c.classList.add('ds-risk'); c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id')); c.querySelectorAll('[tabindex]').forEach(n => n.setAttribute('tabindex', '-1')); slot.appendChild(c); setRisk((src.querySelector('.rk-seg.on') || {}).dataset ? src.querySelector('.rk-seg.on').dataset.k : 'b'); }
    /* the index follows the reading */
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) mark(en.target.id.slice(3)); }), { root: main, rootMargin: '-30% 0px -60% 0px' });
    main.querySelectorAll('.ds-sec').forEach(s => io.observe(s));
  };
  const NAME = { c: 'Conservative', b: 'Balanced', a: 'Aggressive' };
  const setRisk = k => {
    const c = el.querySelector('.ds-risk'); if (!c) return;
    c.querySelectorAll('.rk-seg').forEach(s => { s.classList.toggle('on', s.dataset.k === k); s.setAttribute('aria-checked', String(s.dataset.k === k)); });
    const v = c.querySelector('.rk-val'); if (v) (v.querySelector('b') || v).textContent = NAME[k];
    el.querySelectorAll('.ds-risk-k button').forEach(b => b.classList.toggle('on', b.dataset.k === k));
  };
  const mark = id => { el.querySelectorAll('.ds-nav button').forEach(b => b.classList.toggle('on', b.dataset.id === id)); const c = CH.find(x => x[0] === id); el.querySelector('.ds-crumb').textContent = c ? c[1] : ''; };
  const go = (id, jump) => { const s = el.querySelector('#ds-' + id); if (!s) return; const m = el.querySelector('.ds-main'); m.scrollTo({ top: s.getBoundingClientRect().top - m.getBoundingClientRect().top + m.scrollTop, behavior: jump || RM ? 'auto' : 'smooth' }); mark(id); };
  let back = null;
  const setOpen = (v, id) => {
    if (!el) build();
    if (v) {
      back = document.activeElement; el.hidden = false; fill(); open = true; document.documentElement.classList.add('ds-open');
      requestAnimationFrame(() => { el.classList.add('in'); go(id || 'principles', true); el.querySelector('.ds-main').focus({ preventScroll: true }); });
    } else {
      open = false; el.classList.remove('in'); document.documentElement.classList.remove('ds-open');
      setTimeout(() => { if (!open) el.hidden = true; }, RM ? 0 : 420);
      if (back && back.focus) back.focus({ preventScroll: true });
    }
  };
  window.vexDS = { open: id => setOpen(true, (id || '').replace(/^ds-/, '')), close: () => setOpen(false) };
  if (/^#ds-/.test(location.hash)) addEventListener('load', () => window.vexDS.open(location.hash.slice(1)));
})();
