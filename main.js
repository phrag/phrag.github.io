(() => {
  'use strict';

  // --- Scroll restoration ---
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

  // --- Corner accents (injected dynamically) ---
  sections.forEach((section) => {
    const corners = document.createElement('div');
    corners.className = 'section-corners';
    section.insertBefore(corners, section.firstChild);
  });

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

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // --- Cursor glow ---
  const cursorGlow = document.querySelector('.cursor-glow');
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });

  // --- Dynamic grid canvas ---
  const gridCanvas = document.getElementById('grid-canvas');
  const gridCtx = gridCanvas.getContext('2d');
  const CELL = 60;
  const pulses = [];
  const particles = [];
  const PULSE_COLORS = ['0, 255, 100', '0, 180, 255', '100, 120, 255'];

  function getSidebarWidth() {
    return window.innerWidth > 960 ? 280 : 0;
  }

  function initParticles() {
    particles.length = 0;
    const count = Math.floor((gridCanvas.width * gridCanvas.height) / 35000);
    const colors = ['0, 255, 100', '0, 180, 255', '140, 80, 255'];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * gridCanvas.width,
        y: Math.random() * gridCanvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: 0.1 + Math.random() * 0.3,
        size: 0.8 + Math.random() * 1.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  function resizeGrid() {
    gridCanvas.width = window.innerWidth;
    gridCanvas.height = window.innerHeight;
    initParticles();
  }

  function spawnPulse() {
    const sidebarW = getSidebarWidth();
    if (sidebarW === 0) return;
    const axis = Math.random() > 0.5 ? 'h' : 'v';
    const color = PULSE_COLORS[Math.floor(Math.random() * PULSE_COLORS.length)];
    if (axis === 'v') {
      const maxCol = Math.floor(sidebarW / CELL);
      if (maxCol === 0) return;
      pulses.push({
        axis, color,
        line: Math.floor(Math.random() * maxCol) * CELL,
        pos: 0,
        speed: 1.2 + Math.random() * 2,
        alpha: 0.55 + Math.random() * 0.35,
        tail: 100 + Math.random() * 100,
        maxPos: gridCanvas.height,
      });
    } else {
      pulses.push({
        axis, color,
        line: Math.floor(Math.random() * Math.floor(gridCanvas.height / CELL)) * CELL,
        pos: 0,
        speed: 1.2 + Math.random() * 2,
        alpha: 0.55 + Math.random() * 0.35,
        tail: 100 + Math.random() * 100,
        maxPos: sidebarW,
      });
    }
  }

  function drawDynamicGrid() {
    const w = gridCanvas.width;
    const h = gridCanvas.height;
    gridCtx.clearRect(0, 0, w, h);

    // Base grid
    gridCtx.lineWidth = 1;
    gridCtx.strokeStyle = 'rgba(140, 80, 255, 0.08)';
    for (let x = 0; x <= w; x += CELL) {
      gridCtx.beginPath(); gridCtx.moveTo(x, 0); gridCtx.lineTo(x, h); gridCtx.stroke();
    }
    for (let y = 0; y <= h; y += CELL) {
      gridCtx.beginPath(); gridCtx.moveTo(0, y); gridCtx.lineTo(w, y); gridCtx.stroke();
    }

    // Pulses (confined to sidebar)
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
      gridCtx.lineWidth = 2;
      gridCtx.beginPath();
      if (p.axis === 'h') {
        const x0 = Math.max(0, p.pos - p.tail);
        const x1 = Math.min(p.pos, p.maxPos);
        if (x0 < p.maxPos) {
          gridCtx.moveTo(x0, p.line);
          gridCtx.lineTo(x1, p.line);
          gridCtx.stroke();
        }
      } else {
        gridCtx.moveTo(p.line, Math.max(0, p.pos - p.tail));
        gridCtx.lineTo(p.line, p.pos);
        gridCtx.stroke();
      }
      p.pos += p.speed;
      if (p.pos - p.tail > p.maxPos) pulses.splice(i, 1);
    }

    // Floating particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      gridCtx.beginPath();
      gridCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      gridCtx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      gridCtx.fill();
    }

    if (pulses.length < 10 && Math.random() < 0.03) spawnPulse();
    requestAnimationFrame(drawDynamicGrid);
  }

  resizeGrid();
  drawDynamicGrid();
  window.addEventListener('resize', resizeGrid);

  // --- Waveform (sidebar) ---
  const waveCanvas = document.getElementById('waveform');
  const waveCtx = waveCanvas.getContext('2d');
  let waveT = 0;

  function resizeWave() {
    waveCanvas.width = waveCanvas.offsetWidth || 240;
    waveCanvas.height = waveCanvas.offsetHeight || 50;
  }
  resizeWave();

  function drawWaveform() {
    const w = waveCanvas.width;
    const h = waveCanvas.height;
    waveCtx.clearRect(0, 0, w, h);
    [
      { r: 0,  g: 255, b: 100, a: 0.5, freq: 2,   phase: 1,   amp: 0.28 },
      { r: 0,  g: 180, b: 255, a: 0.3, freq: 3.5,  phase: 1.6, amp: 0.18 },
      { r: 120, g: 80, b: 255, a: 0.2, freq: 1.2,  phase: 0.8, amp: 0.22 },
    ].forEach(({ r, g, b, a, freq, phase, amp }) => {
      waveCtx.beginPath();
      waveCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      waveCtx.lineWidth = 1;
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin((x / w) * Math.PI * 2 * freq + waveT * phase) * h * amp;
        x === 0 ? waveCtx.moveTo(x, y) : waveCtx.lineTo(x, y);
      }
      waveCtx.stroke();
    });
    waveT += 0.025;
    requestAnimationFrame(drawWaveform);
  }
  drawWaveform();

  // --- Glitch effect ---
  const glitchCanvas = document.getElementById('glitch-canvas');
  const glitchCtx = glitchCanvas.getContext('2d');

  function resizeGlitch() {
    glitchCanvas.width = window.innerWidth;
    glitchCanvas.height = window.innerHeight;
  }
  resizeGlitch();
  window.addEventListener('resize', resizeGlitch);

  function runGlitch() {
    const flashes = 2 + Math.floor(Math.random() * 3);
    let flash = 0;
    const w = glitchCanvas.width;
    const h = glitchCanvas.height;

    function glitchFrame() {
      glitchCtx.clearRect(0, 0, w, h);
      if (flash >= flashes) return;
      flash++;

      const strips = 4 + Math.floor(Math.random() * 6);
      for (let i = 0; i < strips; i++) {
        const sy  = Math.random() * h;
        const sh  = 1 + Math.random() * 14;
        const off = (Math.random() - 0.5) * 24;
        // Chromatic aberration
        glitchCtx.fillStyle = 'rgba(255, 0, 80, 0.1)';
        glitchCtx.fillRect(off - 5, sy, w, sh);
        glitchCtx.fillStyle = 'rgba(0, 200, 255, 0.1)';
        glitchCtx.fillRect(off + 5, sy, w, sh);
        // White tear
        glitchCtx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        glitchCtx.fillRect(off, sy, w, sh * 0.4);
      }

      setTimeout(() => {
        glitchCtx.clearRect(0, 0, w, h);
        if (flash < flashes) setTimeout(glitchFrame, 30 + Math.random() * 60);
      }, 50 + Math.random() * 80);
    }

    glitchFrame();
  }

  (function scheduleGlitch() {
    setTimeout(() => { runGlitch(); scheduleGlitch(); }, 6000 + Math.random() * 12000);
  })();

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
      data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 12;
    }
    ctx.putImageData(imageData, 0, 0);
    grainFrame = requestAnimationFrame(drawGrain);
  }

  resizeGrain();
  drawGrain();
  window.addEventListener('resize', resizeGrain);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(grainFrame);
    else drawGrain();
  });
})();
