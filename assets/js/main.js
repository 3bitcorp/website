/* ── Mobile nav toggle ─────────────────────── */
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const iconOpen   = document.getElementById('icon-open');
const iconClose  = document.getElementById('icon-close');

menuToggle?.addEventListener('click', () => {
  const hidden = mobileMenu.classList.toggle('hidden');
  iconOpen.classList.toggle('hidden', !hidden);
  iconClose.classList.toggle('hidden', hidden);
});
mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.add('hidden');
  iconOpen.classList.remove('hidden');
  iconClose.classList.add('hidden');
}));

/* ── Navbar scroll state ───────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── Animated stat counters ────────────────── */
function animateCounter(el, target, suffix) {
  let start = 0;
  const duration = 1800;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    statsObserver.unobserve(entry.target);
    entry.target.querySelectorAll('.stat-number').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.textContent.replace(/\d+/, '');
      animateCounter(el, target, suffix);
    });
  });
}, { threshold: 0.4 });

const statsGrid = document.querySelector('.stat-card')?.closest('.grid');
if (statsGrid) statsObserver.observe(statsGrid);

/* ── Scroll-reveal (fade-up) ───────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.service-card, .why-card, .process-step, .industry-card, .testimonial-card, .about-fact'
).forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.55s ease ${i * 0.06}s, transform 0.55s ease ${i * 0.06}s`;
  revealObserver.observe(el);
});

/* ── Contact form (static-site simulation) ─── */
document.getElementById('contact-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const form    = e.target;
  const wrapper = document.getElementById('contact-form-wrapper');
  const tpl     = document.getElementById('tpl-success');

  const name    = form.querySelector('#cf-name')?.value.trim();
  const email   = form.querySelector('#cf-email')?.value.trim();
  const message = form.querySelector('#cf-message')?.value.trim();
  if (!name || !email || !message) return;

  const btn = form.querySelector('#cf-submit');
  btn.disabled = true;
  btn.innerHTML = `<svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>`;

  setTimeout(() => { wrapper.innerHTML = tpl.innerHTML; }, 900);
});
