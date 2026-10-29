// Shared behaviour for the homepage and project pages.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  const btn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('open', open);
    });
    menu.addEventListener('click', e => {
      if (e.target.tagName === 'A') {
        btn.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
      }
    });
  }

  // Scroll reveal (shown immediately when reduced motion is requested)
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries, obs) => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); }
    }), { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  // Active navigation state (homepage anchors only)
  const links = [...document.querySelectorAll('#menu a[href^="#"]')];
  if ('IntersectionObserver' in window && links.length) {
    const spy = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      }
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(a => {
      const section = document.querySelector(a.getAttribute('href'));
      if (section) spy.observe(section);
    });
  }

  // Back to top
  const toTop = document.getElementById('to-top');
  if (toTop) {
    const update = () => toTop.classList.toggle('show', window.scrollY > 500);
    window.addEventListener('scroll', update, { passive: true });
    update();
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Contact form: local validation only, no message is sent
  const form = document.getElementById('contact-form');
  if (form) {
    const checks = {
      name: v => v.trim().length >= 2 || 'Please enter your name (at least 2 characters).',
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email address.',
      subject: v => v.trim().length >= 3 || 'Please enter a subject (at least 3 characters).',
      message: v => v.trim().length >= 10 || 'Please write a message (at least 10 characters).'
    };
    const out = document.getElementById('form-status');
    form.addEventListener('submit', e => {
      e.preventDefault();
      let firstBad = null;
      for (const [id, check] of Object.entries(checks)) {
        const input = form.elements[id];
        const result = check(input.value);
        const ok = result === true;
        input.setAttribute('aria-invalid', String(!ok));
        document.getElementById(id + '-err').textContent = ok ? '' : result;
        if (!ok && !firstBad) firstBad = input;
      }
      if (firstBad) {
        out.className = 'form-status error';
        out.textContent = 'Please fix the highlighted fields.';
        firstBad.focus();
        return;
      }
      out.className = 'form-status success';
      out.textContent = 'Your message passes validation. This demo has no email backend, so it was NOT sent. Connect a form service (for example Formspree) to receive messages.';
    });
  }
})();
