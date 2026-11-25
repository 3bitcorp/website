/* ── Mobile nav toggle ──────────────────────────── */
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const iconOpen   = document.getElementById('menu-icon-open');
const iconClose  = document.getElementById('menu-icon-close');

menuToggle?.addEventListener('click', () => {
  const isHidden = mobileMenu.classList.toggle('hidden');
  iconOpen.classList.toggle('hidden', !isHidden);
  iconClose.classList.toggle('hidden', isHidden);
});

// Close mobile menu on nav link click
mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    iconOpen.classList.remove('hidden');
    iconClose.classList.add('hidden');
  });
});

/* ── Service tab filter (pure JS, HTMX handles swap signal) ── */
const allCards = () => document.querySelectorAll('.service-card');

function setActiveTab(btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active-tab'));
  btn.classList.add('active-tab');
}

// Intercept HTMX tab calls and do client-side filter instead (static site)
document.addEventListener('htmx:configRequest', function (evt) {
  const elt = evt.detail.elt;
  if (!elt.dataset.filter) return;

  evt.preventDefault(); // stop actual network request

  const filter = elt.dataset.filter;
  const cards  = allCards();

  cards.forEach(card => {
    const show = filter === 'all' || card.dataset.category === filter;
    card.style.display = show ? '' : 'none';
  });

  setActiveTab(elt);
});

/* ── Contact form: static-site success state ─────────── */
document.addEventListener('htmx:configRequest', function (evt) {
  if (evt.detail.elt.id !== 'contact-form') return;

  evt.preventDefault();

  const form    = document.getElementById('contact-form');
  const wrapper = document.getElementById('contact-form-wrapper');
  const tpl     = document.getElementById('contact-success-template');

  if (!form || !wrapper || !tpl) return;

  // Brief validation
  const name    = form.querySelector('#name')?.value.trim();
  const email   = form.querySelector('#email')?.value.trim();
  const message = form.querySelector('#message')?.value.trim();

  if (!name || !email || !message) return;

  // Show success
  wrapper.innerHTML = tpl.innerHTML;
}, { capture: true });

/* ── Navbar shadow on scroll ─────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.classList.add('shadow-xl', 'shadow-black/40');
  } else {
    navbar.classList.remove('shadow-xl', 'shadow-black/40');
  }
}, { passive: true });
