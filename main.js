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

  // --- Dynamic grid canvas ---
  const gridCanvas = document.getElementById('grid-canvas');
  const gridCtx = gridCanvas.getContext('2d');
  const CELL = 60;
  const pulses = [];

  function resizeGrid() {
    gridCanvas.width = window.innerWidth;
    gridCanvas.height = window.innerHeight;
  }

  function spawnPulse() {
    const axis = Math.random() > 0.5 ? 'h' : 'v';
    const cols = Math.floor(gridCanvas.width / CELL);
    const rows = Math.floor(gridCanvas.height / CELL);
    const line = (axis === 'h'
      ? Math.floor(Math.random() * rows)
      : Math.floor(Math.random() * cols)) * CELL;
    const colors = ['0, 255, 100', '0, 180, 255', '80, 140, 255'];
    pulses.push({
      axis,
      line,
      pos: 0,
      speed: 0.8 + Math.random() * 1.4,
      alpha: 0.2 + Math.random() * 0.25,
      tail: 60 + Math.random() * 60,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  function drawDynamicGrid() {
    const w = gridCanvas.width;
    const h = gridCanvas.height;
    gridCtx.clearRect(0, 0, w, h);

    // Static base grid
    gridCtx.lineWidth = 1;
    gridCtx.strokeStyle = 'rgba(140, 80, 255, 0.08)';
    for (let x = 0; x <= w; x += CELL) {
      gridCtx.beginPath(); gridCtx.moveTo(x, 0); gridCtx.lineTo(x, h); gridCtx.stroke();
    }
    for (let y = 0; y <= h; y += CELL) {
      gridCtx.beginPath(); gridCtx.moveTo(0, y); gridCtx.lineTo(w, y); gridCtx.stroke();
    }

    // Travelling pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      let grad;
      if (p.axis === 'h') {
        grad = gridCtx.createLinearGradient(p.pos - p.tail, 0, p.pos, 0);
      } else {
        grad = gridCtx.createLinearGradient(0, p.pos - p.tail, 0, p.pos);
      }
      grad.addColorStop(0, `rgba(${p.color}, 0)`);
      grad.addColorStop(1, `rgba(${p.color}, ${p.alpha})`);
      gridCtx.strokeStyle = grad;
      gridCtx.lineWidth = 1.5;
      gridCtx.beginPath();
      if (p.axis === 'h') {
        gridCtx.moveTo(Math.max(0, p.pos - p.tail), p.line);
        gridCtx.lineTo(p.pos, p.line);
      } else {
        gridCtx.moveTo(p.line, Math.max(0, p.pos - p.tail));
        gridCtx.lineTo(p.line, p.pos);
      }
      gridCtx.stroke();

      p.pos += p.speed;
      const limit = p.axis === 'h' ? w : h;
      if (p.pos - p.tail > limit) pulses.splice(i, 1);
    }

    // Randomly spawn new pulses (max 6 at once)
    if (pulses.length < 6 && Math.random() < 0.015) spawnPulse();

    requestAnimationFrame(drawDynamicGrid);
  }

  resizeGrid();
  drawDynamicGrid();
  window.addEventListener('resize', resizeGrid);

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
