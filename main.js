(() => {
  'use strict';

  // Disable browser scroll restoration so refresh always starts at top
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('load', () => {
    document.querySelector('.content').scrollTop = 0;
  });

  // --- Scroll-triggered section visibility ---
  const sections = document.querySelectorAll('.section');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { threshold: 0.12 }
  );
  sections.forEach((s) => observer.observe(s));

  // --- Sidebar nav active state + sliding indicator ---
  const navLinks = document.querySelectorAll('.nav-link');
  const indicator = document.querySelector('.nav-indicator');
  const content = document.querySelector('.content');

  function updateNav() {
    let current = null;
    sections.forEach((s) => {
      const rect = s.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.4) current = s;
    });
    if (!current) current = sections[0];

    const id = current.getAttribute('id');
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('active', isActive);
      if (isActive && indicator) {
        indicator.style.top = link.parentElement.offsetTop + 'px';
      }
    });
  }

  content.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Smooth-scroll nav clicks
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Close mobile sidebar if open
      document.querySelector('.sidebar').classList.remove('open');
      document.querySelector('.hamburger').classList.remove('active');
    });
  });

  // --- Mobile hamburger ---
  const hamburger = document.querySelector('.hamburger');
  const sidebar = document.querySelector('.sidebar');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('open');
  });

  // --- Film grain canvas ---
  const canvas = document.getElementById('grain');
  const ctx = canvas.getContext('2d');
  let grainFrame;

  function resizeGrain() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawGrain() {
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0, len = data.length; i < len; i += 4) {
      const v = (Math.random() * 255) | 0;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 12;
    }

    ctx.putImageData(imageData, 0, 0);
    grainFrame = requestAnimationFrame(drawGrain);
  }

  resizeGrain();
  drawGrain();
  window.addEventListener('resize', resizeGrain);

  // Pause grain when tab is hidden to save resources
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(grainFrame);
    } else {
      drawGrain();
    }
  });
})();
