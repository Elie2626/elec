/* FULGUR Élec — interactions */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Menu mobile ---- */
const burger = document.getElementById('burger');
const links = document.getElementById('navlinks');
burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

/* ---- Apparition au scroll ---- */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.card, .work').forEach(el => observer.observe(el));

/* ---- Compteurs animés ---- */
const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    countObs.unobserve(e.target);
    const target = +e.target.dataset.count;
    if (reducedMotion) { e.target.textContent = target; return; }
    const start = performance.now(), dur = 1400;
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      e.target.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat__num').forEach(el => countObs.observe(el));

/* ---- Étincelles canvas ---- */
const canvas = document.getElementById('sparks');
if (!reducedMotion && canvas) {
  const ctx = canvas.getContext('2d');
  let W, H;
  const resize = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
  resize();
  addEventListener('resize', resize);

  const sparks = Array.from({ length: 45 }, () => spawn());
  function spawn() {
    return {
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - .5) * .35,
      vy: -(.2 + Math.random() * .6),
      r: .6 + Math.random() * 1.6,
      life: Math.random(),
      hue: Math.random() < .75 ? 52 : 185 // jaune ou cyan
    };
  }
  (function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const s of sparks) {
      s.x += s.vx; s.y += s.vy; s.life -= .004;
      if (s.life <= 0 || s.y < -10) Object.assign(s, spawn(), { y: H + 10, life: 1 });
      const a = Math.max(0, Math.min(1, s.life)) * .8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 100%, 65%, ${a})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `hsla(${s.hue}, 100%, 60%, ${a})`;
      ctx.fill();
    }
    requestAnimationFrame(loop);
  })();
}

/* ---- Formulaire (validation au blur + submit) ---- */
const form = document.getElementById('quoteForm');
const fields = [
  { input: document.getElementById('f-name'), err: document.getElementById('err-name'), check: v => v.trim().length >= 2 },
  { input: document.getElementById('f-tel'), err: document.getElementById('err-tel'), check: v => /^[+\d][\d\s.-]{8,}$/.test(v.trim()) },
  { input: document.getElementById('f-msg'), err: document.getElementById('err-msg'), check: v => v.trim().length >= 5 },
];
const validate = f => {
  const ok = f.check(f.input.value);
  f.err.hidden = ok;
  f.input.closest('.field').classList.toggle('invalid', !ok);
  return ok;
};
fields.forEach(f => f.input.addEventListener('blur', () => { if (f.input.value) validate(f); }));

form.addEventListener('submit', e => {
  e.preventDefault();
  const allOk = fields.map(validate).every(Boolean);
  if (!allOk) { fields.find(f => !f.check(f.input.value)).input.focus(); return; }
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours…';
  // Pas de backend : simulation d'envoi — brancher ici un service (Formspree, API…)
  setTimeout(() => {
    form.reset();
    btn.hidden = true;
    document.getElementById('formSuccess').hidden = false;
  }, 900);
});
