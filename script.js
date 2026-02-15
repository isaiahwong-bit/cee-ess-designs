/* ========================================
   Cee Ess Designs — Script
   ======================================== */

(function () {
  'use strict';

  const isProjectPage = document.body.classList.contains('is-project-page');

  // ── Custom Cursor ──────────────────────
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover effect on interactive elements
  const hoverTargets = document.querySelectorAll('a, button, .project, input, textarea, select, .service-card, .showcase-tile, .showcase-deliverable, .project-next-link');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });


  // ── Navigation ─────────────────────────
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  });

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
  });

  document.querySelectorAll('.mobile-menu-link').forEach((link) => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  });


  // ── Scroll Animation Setup ─────────────
  function initScrollAnimations() {
    const animateElements = document.querySelectorAll('[data-animate]:not(.hero [data-animate]):not(.project-hero [data-animate])');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay) || 0;
            setTimeout(() => {
              entry.target.classList.add('animated');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    animateElements.forEach((el) => observer.observe(el));
  }


  // ── Counter Animation Setup ────────────
  function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (counters.length === 0) return;

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.count);
            const duration = 2000;
            const start = performance.now();

            function updateCounter(now) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.round(target * eased);
              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              }
            }

            requestAnimationFrame(updateCounter);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => counterObserver.observe(el));
  }


  // ── Loader ─────────────────────────────
  const loader = document.getElementById('loader');
  document.body.style.overflow = 'hidden';

  const loaderDelay = isProjectPage ? 600 : 2400;
  const heroSelector = isProjectPage ? '.project-hero [data-animate]' : '.hero [data-animate]';

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('done');
      document.body.style.overflow = 'auto';

      // Trigger hero animations after loader
      setTimeout(() => {
        document.querySelectorAll(heroSelector).forEach((el) => {
          const delay = parseInt(el.dataset.delay) || 0;
          setTimeout(() => el.classList.add('animated'), delay);
        });

        // Now init scroll-triggered animations AFTER body overflow is restored
        initScrollAnimations();
        if (!isProjectPage) {
          initCounterAnimations();
        }
      }, 400);
    }, loaderDelay);
  });


  // ── Smooth Scroll ──────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  // ── Parallax on Project Images ─────────
  const projectInners = document.querySelectorAll('.project-image-inner');

  window.addEventListener('scroll', () => {
    projectInners.forEach((inner) => {
      const rect = inner.parentElement.getBoundingClientRect();
      const viewH = window.innerHeight;
      if (rect.top < viewH && rect.bottom > 0) {
        const progress = (viewH - rect.top) / (viewH + rect.height);
        const translate = (progress - 0.5) * 20;
        inner.style.transform = `translateY(${translate}px)`;
      }
    });
  });


  // ── Form Handling (Formspree) ──────────
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-submit span');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          btn.textContent = 'Sent!';
          form.reset();
          setTimeout(() => { btn.textContent = originalText; }, 3000);
        } else {
          btn.textContent = 'Error — try again';
          setTimeout(() => { btn.textContent = originalText; }, 3000);
        }
      } catch (err) {
        btn.textContent = 'Error — try again';
        setTimeout(() => { btn.textContent = originalText; }, 3000);
      }
    });
  }


  // ── Magnetic Effect on Buttons ─────────
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

})();
