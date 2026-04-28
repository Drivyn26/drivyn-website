/* ============================================================
   DRIVYN — MAIN.JS
   Scroll effects, animations, FAQ accordion, mobile nav
   ============================================================ */

(function () {
  'use strict';

  /* ── NAV SCROLL ── */
  const nav = document.querySelector('.nav');
  function handleScroll() {
    nav && nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ── MOBILE NAV ── */
  const toggle    = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.nav-mobile');
  const spans     = toggle ? toggle.querySelectorAll('span') : [];

  toggle && toggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    if (open) {
      spans[0].style.cssText = 'transform:rotate(45deg) translate(5px,5px)';
      spans[1].style.cssText = 'opacity:0;transform:scaleX(0)';
      spans[2].style.cssText = 'transform:rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => s.style.cssText = '');
    }
  });

  document.querySelectorAll('.nav-mobile a').forEach(a =>
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      spans.forEach(s => s.style.cssText = '');
    })
  );

  /* ── SET ACTIVE NAV LINK ── */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html') ||
        (href === 'index.html' && (page === '' || page === 'index.html'))) {
      a.classList.add('active');
    }
  });

  /* ── FADE-UP ON SCROLL ── */
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

  /* ── DASHBOARD BAR ANIMATION ── */
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.dash-fill[data-w]').forEach(bar => {
          bar.style.width = bar.dataset.w;
        });
        barObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.hero-dashboard').forEach(el => barObserver.observe(el));

  /* ── COUNTER ANIMATION ── */
  function animateCount(el) {
    const target   = parseFloat(el.dataset.target || 0);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const duration = 1800;
    const start    = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (ease * target).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCount(e.target);
        countObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-target]').forEach(el => countObserver.observe(el));

  /* ── FAQ ACCORDION ── */
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item   = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = (parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height')) || 80) + 16;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });

  /* ── FORM SUBMIT HANDLER ── */
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    const btn = contactForm.querySelector('button[type="submit"]');
    const orig = btn ? btn.textContent : '';
    const params = new URLSearchParams(window.location.search);

    if (params.get('submitted') === '1' && btn) {
      btn.textContent = '✓ Request Sent!';
      btn.style.background = 'linear-gradient(135deg,#4ADE80,#22C55E)';
    }

    contactForm.addEventListener('submit', () => {
      if (!btn) return;
      btn.textContent = 'Sending...';
      btn.disabled = true;
    });

    contactForm.addEventListener('invalid', () => {
      if (!btn) return;
      btn.textContent = orig;
      btn.disabled = false;
    }, true);
  }

})();
