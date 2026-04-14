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

  // --- Text scramble ---
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%><|/\\';

  function scramble(el) {
    const savedHTML = el.innerHTML;
    const text = el.textContent;
    if (!text.trim()) return;
    if (el._scrambling) return;
    el._scrambling = true;
    let frame = 0;
    const frames = 22;
    const id = setInterval(() => {
      if (frame >= frames) {
        el.innerHTML = savedHTML;
        el._scrambling = false;
        clearInterval(id);
        return;
      }
      const progress = frame / frames;
      el.textContent = text.split('').map((ch, i) => {
        if (ch === ' ' || ch === '\n') return ch;
        if (i / text.length < progress) return ch;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }).join('');
      frame++;
    }, 28);
  }

  // Nav links
  navLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => scramble(link));
  });

  // Headings and short labels throughout the page
  document.querySelectorAll(
    '.section-title, .subsection-title, .job-title, .edu-name, .skill-label, .hero-tags, .job-meta'
  ).forEach((el) => {
    el.addEventListener('mouseenter', () => scramble(el));
  });

  // First-load: scramble name, hero section, and nav links in sequence
  window.addEventListener('load', () => {
    const name = document.querySelector('.sidebar-name');
    if (name) setTimeout(() => scramble(name), 100);
    navLinks.forEach((link, i) => {
      setTimeout(() => scramble(link), 150 + i * 100);
    });
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) setTimeout(() => scramble(heroTitle), 300);
    const heroTags = document.querySelector('.hero-tags');
    if (heroTags) setTimeout(() => scramble(heroTags), 550);
    document.querySelectorAll('.hero-summary').forEach((el, i) => {
      setTimeout(() => scramble(el), 700 + i * 250);
    });
    document.querySelectorAll('.link-btn').forEach((el, i) => {
      setTimeout(() => scramble(el), 1000 + i * 120);
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
  const particles = [];
  const ripples = [];
  const PULSE_COLORS = ['255, 50, 150', '0, 180, 255', '255, 0, 200'];
  let mouseX = -9999, mouseY = -9999;

  document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

  document.addEventListener('click', (e) => {
    ripples.push({
      x: e.clientX, y: e.clientY,
      r: 0,
      maxR: 180 + Math.random() * 120,
      alpha: 0.9,
      color: PULSE_COLORS[Math.floor(Math.random() * PULSE_COLORS.length)],
    });
  });

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

    // Constellation — connect particles near cursor
    const CONST_RADIUS = 130;
    const LINK_RADIUS  = 90;
    const near = particles.filter((p) => Math.hypot(p.x - mouseX, p.y - mouseY) < CONST_RADIUS);
    gridCtx.lineWidth = 0.6;
    for (const p of near) {
      const d = Math.hypot(p.x - mouseX, p.y - mouseY);
      gridCtx.beginPath();
      gridCtx.moveTo(mouseX, mouseY);
      gridCtx.lineTo(p.x, p.y);
      gridCtx.strokeStyle = `rgba(${p.color}, ${(1 - d / CONST_RADIUS) * 0.45})`;
      gridCtx.stroke();
    }
    for (let i = 0; i < near.length; i++) {
      for (let j = i + 1; j < near.length; j++) {
        const d = Math.hypot(near[i].x - near[j].x, near[i].y - near[j].y);
        if (d < LINK_RADIUS) {
          gridCtx.beginPath();
          gridCtx.moveTo(near[i].x, near[i].y);
          gridCtx.lineTo(near[j].x, near[j].y);
          gridCtx.strokeStyle = `rgba(${near[i].color}, ${(1 - d / LINK_RADIUS) * 0.25})`;
          gridCtx.stroke();
        }
      }
    }

    // Click ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      gridCtx.beginPath();
      gridCtx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      gridCtx.strokeStyle = `rgba(${rip.color}, ${rip.alpha})`;
      gridCtx.lineWidth = 1.5;
      gridCtx.stroke();
      // Second inner ring
      if (rip.r > 20) {
        gridCtx.beginPath();
        gridCtx.arc(rip.x, rip.y, rip.r * 0.6, 0, Math.PI * 2);
        gridCtx.strokeStyle = `rgba(${rip.color}, ${rip.alpha * 0.4})`;
        gridCtx.lineWidth = 0.8;
        gridCtx.stroke();
      }
      rip.r += 4;
      rip.alpha *= 0.92;
      if (rip.alpha < 0.01) ripples.splice(i, 1);
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
    const w = glitchCanvas.width;
    const h = glitchCanvas.height;
    const hueShift = 25 + Math.random() * 55;

    function drawStrips(count, maxOffset, alpha, noise) {
      for (let i = 0; i < count; i++) {
        const sy  = Math.random() * h;
        const sh  = 2 + Math.random() * 22;
        const off = (Math.random() - 0.5) * maxOffset;
        // Pink/red channel left
        glitchCtx.fillStyle = `rgba(255, 20, 100, ${alpha})`;
        glitchCtx.fillRect(off - 10, sy, w, sh);
        // Cyan channel right
        glitchCtx.fillStyle = `rgba(0, 220, 255, ${alpha})`;
        glitchCtx.fillRect(off + 10, sy, w, sh);
        // Bright tear
        glitchCtx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.35})`;
        glitchCtx.fillRect(off, sy, w, sh * 0.25);
        // Random noise line
        if (noise && Math.random() > 0.45) {
          glitchCtx.fillStyle = `rgba(${Math.random() > 0.5 ? '255, 50, 150' : '0, 230, 255'}, ${alpha * 0.7})`;
          glitchCtx.fillRect(0, Math.random() * h, w, 1);
        }
      }
      // Occasional large displaced block
      if (Math.random() > 0.5) {
        const by  = Math.random() * h;
        const bh  = 10 + Math.random() * 32;
        const bx  = (Math.random() - 0.5) * 70;
        glitchCtx.fillStyle = 'rgba(255, 40, 160, 0.07)';
        glitchCtx.fillRect(bx, by, w * 0.65, bh);
      }
    }

    // Phase 1: pre-flash
    glitchCtx.fillStyle = 'rgba(200, 0, 120, 0.04)';
    glitchCtx.fillRect(0, 0, w, h);
    document.body.style.filter = `hue-rotate(${hueShift}deg) saturate(1.3) brightness(1.03)`;

    setTimeout(() => {
      glitchCtx.clearRect(0, 0, w, h);
      // Phase 2: main burst
      drawStrips(8 + Math.floor(Math.random() * 6), 55, 0.07, true);

      setTimeout(() => {
        glitchCtx.clearRect(0, 0, w, h);
        document.body.style.filter = '';

        // Phase 3: aftershock
        if (Math.random() > 0.2) {
          setTimeout(() => {
            document.body.style.filter = `hue-rotate(${-hueShift * 0.5}deg) brightness(0.94)`;
            drawStrips(4 + Math.floor(Math.random() * 4), 30, 0.05, false);

            setTimeout(() => {
              glitchCtx.clearRect(0, 0, w, h);
              document.body.style.filter = '';

              // Phase 4: final twitch
              if (Math.random() > 0.4) {
                setTimeout(() => {
                  drawStrips(2 + Math.floor(Math.random() * 3), 18, 0.04, false);
                  setTimeout(() => glitchCtx.clearRect(0, 0, w, h), 35 + Math.random() * 40);
                }, 50 + Math.random() * 70);
              }
            }, 60 + Math.random() * 90);
          }, 90 + Math.random() * 110);
        }
      }, 80 + Math.random() * 110);
    }, 20 + Math.random() * 30);
  }

  (function scheduleGlitch() {
    setTimeout(() => { runGlitch(); scheduleGlitch(); }, 15000 + Math.random() * 25000);
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
