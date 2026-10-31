/* The page's host for Hairline figures: the bench's mount, once per [data-hl] slot.
   Each figure is the file the skill checked, unchanged, wrapped so its names stay its own. */
(() => {
  if (!window.HL) return;
  const figs = {};
  window.hairline = (f) => { figs[f.name] = f; };
  /*FIGS*/
  HL.inject(document);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mountOne = (host) => {
    const f = figs[host.dataset.hl]; if (!f) return;
    const stage = document.createElement('div');
    stage.setAttribute('data-hairline', f.name);
    stage.setAttribute('role', 'img');
    stage.setAttribute('aria-label', f.means);
    (host.querySelector('[data-hl-stage]') || host).append(stage);
    const svg = HL.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' }, stage);
    const out = host.querySelector('[data-hl-read]');
    let text = null;
    const read = {
      get textContent() { return text; },
      set textContent(v) {
        text = v == null ? '' : String(v);
        if (out) out.textContent = text;
        host.dispatchEvent(new CustomEvent('hl:read', { detail: text, bubbles: true }));
      },
    };
    const v = host.dataset.hlValue != null ? Number(host.dataset.hlValue) : f.range[1];
    host.hl = f.mount({ stage, svg, read }, v);
    if (text === null) read.textContent = 'rest';
    /* the page can ask for one lap, as the package's play does */
    host.lap = (ms = 6500) => { if (reduce) return; const l = HL.tour(stage, f.tour || HL.LAP); setTimeout(() => l.stop(), ms); };
    /* the page walks each figure's lap while it is in view and no hand is on it, as the package's play does */
    if (reduce || host.dataset.hlTour === 'off') return;
    let lap = null;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !lap) lap = HL.tour(stage, f.tour || HL.LAP);
      else if (!e.isIntersecting && lap) { lap.stop(); lap = null; }
    }, { threshold: 0.35 }).observe(stage);
  };
  const all = () => document.querySelectorAll('[data-hl]').forEach(mountOne);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', all); else all();
})();
