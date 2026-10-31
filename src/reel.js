/* The reel, after Osmo's mini showreel player: a small muted loop in the bottom-left corner of Kimm's column.
   Click it and the same video grows from its corner to fill the screen (FLIP), plays from the start with sound,
   with play, sound, progress and close; Esc, a click outside or the close key puts it back in the corner. */
(() => {
  const host = document.querySelector('.hc-cast'); if (!host || !window.gsap) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SRC = (window.VEX_REEL || 'reel/vex-reel.mp4');
  const ic = { play: '<path d="M8 5.5v13l11-6.5z"/>', pause: '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>', on: '<path d="M4 9h3.5L12 5v14l-4.5-4H4z"/><path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>', off: '<path d="M4 9h3.5L12 5v14l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>', x: '<path d="M6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z"/>' };
  const svg = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${ic[k]}</svg>`;
  const card = document.createElement('button');
  card.className = 'reel'; card.type = 'button'; card.setAttribute('aria-label', 'Play the tutorial');
  card.innerHTML = `<span class="reel-v"><video muted loop playsinline preload="metadata" src="${SRC}"></video></span><span class="reel-l"><b>Tutorial</b></span><span class="reel-t">00:00</span>`;
  host.appendChild(card);
  const slot = card.querySelector('.reel-v'), vid = slot.querySelector('video'), time = card.querySelector('.reel-t');
  const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  card.hidden = true; /* shown once the video can play; a missing reel leaves no empty box */
  vid.addEventListener('loadedmetadata', () => { time.textContent = fmt(vid.duration); card.hidden = false; });
  vid.addEventListener('error', () => card.remove());
  /* the corner loop only plays while it is on screen */
  new IntersectionObserver(([e]) => { if (open) return; if (e.isIntersecting) vid.play().catch(() => {}); else vid.pause(); }).observe(card);

  const full = document.createElement('div'); full.className = 'reel-full'; full.hidden = true; full.setAttribute('role', 'dialog'); full.setAttribute('aria-label', 'Reel');
  full.innerHTML = `<div class="rf-frame"></div><div class="rf-bar"><button class="rf-play" type="button" aria-label="Pause">${svg('pause')}</button><button class="rf-snd" type="button" aria-label="Mute">${svg('on')}</button><span class="rf-cur">00:00</span><span class="rf-prog"><i></i></span><span class="rf-dur">00:00</span><button class="rf-x" type="button" aria-label="Close">${svg('x')}</button></div>`;
  document.body.appendChild(full);
  const frame = full.querySelector('.rf-frame'), bar = full.querySelector('.rf-prog i'), cur = full.querySelector('.rf-cur'), dur = full.querySelector('.rf-dur'), bPlay = full.querySelector('.rf-play'), bSnd = full.querySelector('.rf-snd');
  let open = false;
  const fit = () => { const W = innerWidth * 0.86, H = (innerHeight - 140) * 1; const w = Math.min(W, H * 16 / 9); return { w, h: w * 9 / 16, x: (innerWidth - w) / 2, y: (innerHeight - 64 - w * 9 / 16) / 2 }; };
  const tick = () => { if (!open) return; bar.style.transform = `scaleX(${vid.duration ? vid.currentTime / vid.duration : 0})`; cur.textContent = fmt(vid.currentTime); requestAnimationFrame(tick); };
  const setPlay = () => { bPlay.innerHTML = svg(vid.paused ? 'play' : 'pause'); bPlay.setAttribute('aria-label', vid.paused ? 'Play' : 'Pause'); };
  const setSnd = () => { bSnd.innerHTML = svg(vid.muted ? 'off' : 'on'); bSnd.setAttribute('aria-label', vid.muted ? 'Sound on' : 'Mute'); };
  const show = () => {
    if (open) return; open = true;
    const r = slot.getBoundingClientRect(), f = fit();
    full.hidden = false; frame.appendChild(vid);
    Object.assign(frame.style, { left: f.x + 'px', top: f.y + 'px', width: f.w + 'px', height: f.h + 'px' });
    gsap.fromTo(frame, { x: r.left - f.x, y: r.top - f.y, scaleX: r.width / f.w, scaleY: r.height / f.h, transformOrigin: '0 0' }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: RM ? 0 : 0.9, ease: 'expo.inOut' });
    full.classList.add('in'); window.vexMusic && window.vexMusic.hush(true); window.vexVoice && window.vexVoice.stop();
    vid.loop = false; vid.currentTime = 0; vid.muted = false; vid.play().catch(() => { vid.muted = true; vid.play().catch(() => {}); setSnd(); });
    dur.textContent = fmt(vid.duration || 0); setPlay(); setSnd(); tick();
    setTimeout(() => bPlay.focus({ preventScroll: true }), 50);
  };
  const hide = () => {
    if (!open) return; open = false;
    const r = slot.getBoundingClientRect(), f = fit();
    full.classList.remove('in'); window.vexMusic && window.vexMusic.hush(false);
    gsap.to(frame, { x: r.left - f.x, y: r.top - f.y, scaleX: r.width / f.w, scaleY: r.height / f.h, transformOrigin: '0 0', duration: RM ? 0 : 0.8, ease: 'expo.inOut', onComplete: () => {
      slot.appendChild(vid); gsap.set(frame, { clearProps: 'transform' }); full.hidden = true; vid.muted = true; vid.loop = true; vid.play().catch(() => {}); card.focus({ preventScroll: true }); } });
  };
  card.addEventListener('click', show);
  full.querySelector('.rf-x').addEventListener('click', hide);
  full.addEventListener('click', e => { if (e.target === full) hide(); });
  bPlay.addEventListener('click', () => { vid.paused ? vid.play() : vid.pause(); setPlay(); });
  bSnd.addEventListener('click', () => { vid.muted = !vid.muted; setSnd(); });
  frame.addEventListener('click', () => { vid.paused ? vid.play() : vid.pause(); setPlay(); });
  full.querySelector('.rf-prog').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(); if (vid.duration) vid.currentTime = (e.clientX - r.left) / r.width * vid.duration; });
  vid.addEventListener('ended', () => { if (open) setPlay(); });
  addEventListener('keydown', e => { if (!open) return; if (e.key === 'Escape') hide(); if (e.key === ' ') { e.preventDefault(); bPlay.click(); } });
})();
