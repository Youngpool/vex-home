/* The cursor, after Osmo's basic custom cursor: one small disc that follows the pointer with gsap.quickTo
   (a short, smooth lag, no spring), white on the dark page.
   Over anything you can press it grows into a soft disc; it shrinks under a press; it fades when the pointer leaves the page.
   Hidden over text fields so the caret takes over. Fine pointers only. */
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || !window.gsap) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const c = document.createElement('div'); c.className = 'cur'; c.setAttribute('aria-hidden', 'true');
  c.innerHTML = '<span class="cur-d"></span>';
  document.body.appendChild(c); document.documentElement.classList.add('cur-on');
  const d = c.firstChild;
  gsap.set(c, { xPercent: -50, yPercent: -50, x: -100, y: -100 });
  const dur = RM ? 0.001 : 0.4;
  const xTo = gsap.quickTo(c, 'x', { duration: dur, ease: 'power3' }), yTo = gsap.quickTo(c, 'y', { duration: dur, ease: 'power3' });
  const PRESS = 'a, button, [role="radio"], [role="option"], .dl-seg, .dl-list li, .rk-seg, label, summary, #kimm, #vxPad, .reel, .cx';
  let first = true;
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    if (first) { gsap.set(c, { x: e.clientX, y: e.clientY }); first = false; }
    xTo(e.clientX); yTo(e.clientY); c.classList.add('in');
    const t = e.target;
    c.classList.toggle('hot', !!(t.closest && t.closest(PRESS)));
    c.classList.toggle('off', !!(t.closest && t.closest('input, textarea, [contenteditable="true"], .reel-full')));
  }, { passive: true });
  addEventListener('pointerdown', () => c.classList.add('down'), { passive: true });
  addEventListener('pointerup', () => c.classList.remove('down'), { passive: true });
  document.documentElement.addEventListener('mouseleave', () => c.classList.remove('in'));
})();
