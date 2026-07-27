/* ==========================================================================
   AI Neural Network Sketch Portrait Particle System
   - Coordinates extracted DIRECTLY from user reference particle image
   - Matches reference image styling with dense glowing cyan/electric blue nodes
   - Colors: Cyan (#00f0ff), Electric Blue (#3b82f6), Sky Blue (#60a5fa), Soft White (#ffffff)
   - Performance: 60FPS Canvas 2D rendering with spatial distance optimization
   ========================================================================== */

(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let portraitPoints = window.PORTRAIT_POINTS || [];

  // Animation States: 0 = FLOAT_BG, 1 = MORPH_IN, 2 = PORTRAIT_HOLD, 3 = MORPH_OUT
  const STATE_FLOAT = 0;
  const STATE_MORPH_IN = 1;
  const STATE_HOLD = 2;
  const STATE_MORPH_OUT = 3;

  let animState = STATE_FLOAT;
  let stateTime = 0;
  let lastTime = performance.now();
  let morphProgress = 0;

  // Timings (in milliseconds)
  let floatDuration = 1200;             // 1.2s initial float
  const DURATION_MORPH_IN = 2200;       // 2.2s morph assembly
  const DURATION_HOLD = 6000;           // 6.0s portrait display
  const DURATION_MORPH_OUT = 2000;      // 2.0s dissolve
  const DURATION_FLOAT_PAUSE = 12000;   // 12s float pause between triggers

  let mouse = { x: null, y: null, targetX: null, targetY: null, radius: 140 };
  let scrollY = 0;
  let heroInView = true;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    updateParticleTargets();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('scroll', function () {
    scrollY = window.scrollY || window.pageYOffset;
    heroInView = scrollY < height * 0.88;
  });

  window.addEventListener('mousemove', function (e) {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  });

  window.addEventListener('mouseleave', function () {
    mouse.targetX = null;
    mouse.targetY = null;
  });

  // Center exact reference portrait in hero background
  function getPortraitBounds() {
    let centerX, centerY, scale;

    if (width > 992) {
      centerX = width * 0.5;
      centerY = height * 0.48;
      scale = Math.min(width * 0.62, height * 0.86);
    } else {
      centerX = width * 0.5;
      centerY = height * 0.45;
      scale = Math.min(width * 0.85, height * 0.68);
    }
    return { centerX, centerY, scale };
  }

  class Particle {
    constructor(id, ptData) {
      this.id = id;
      this.normX = ptData ? ptData[0] : (Math.random() - 0.5);
      this.normY = ptData ? ptData[1] : (Math.random() - 0.5);
      this.isBright = ptData && ptData[2] === 1;

      this.randomX = Math.random() * width;
      this.randomY = Math.random() * height;

      this.x = this.randomX;
      this.y = this.randomY;

      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;

      this.targetX = this.randomX;
      this.targetY = this.randomY;

      if (this.isBright) {
        const colors = ['#00f0ff', '#38bdf8', '#60a5fa', '#ffffff', '#00f0ff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.radius = Math.random() * 1.2 + 1.4; // 1.4 to 2.6px
        this.baseAlpha = Math.random() * 0.25 + 0.75;
      } else {
        const colors = ['#3b82f6', '#1d4ed8', '#0284c7', '#38bdf8'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.radius = Math.random() * 1.0 + 1.0;
        this.baseAlpha = Math.random() * 0.25 + 0.45;
      }

      this.pulseOffset = Math.random() * Math.PI * 2;
    }

    setTarget(centerX, centerY, scale) {
      this.targetX = centerX + this.normX * scale;
      this.targetY = centerY + this.normY * scale;
    }

    update(dt, now) {
      if (mouse.targetX !== null) {
        if (mouse.x === null) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.15;
          mouse.y += (mouse.targetY - mouse.y) * 0.15;
        }
      } else {
        mouse.x = null;
        mouse.y = null;
      }

      this.randomX += this.vx;
      this.randomY += this.vy;

      if (this.randomX < 0 || this.randomX > width) this.vx *= -1;
      if (this.randomY < 0 || this.randomY > height) this.vy *= -1;

      let destX, destY;

      if (animState === STATE_FLOAT) {
        destX = this.randomX;
        destY = this.randomY;
      } else if (animState === STATE_MORPH_IN) {
        let easeT = easeInOutCubic(morphProgress);
        destX = this.randomX + (this.targetX - this.randomX) * easeT;
        destY = this.randomY + (this.targetY - this.randomY) * easeT;
      } else if (animState === STATE_HOLD) {
        let vibX = Math.sin(now * 0.003 + this.id) * 1.0;
        let vibY = Math.cos(now * 0.0025 + this.id * 1.5) * 1.0;
        destX = this.targetX + vibX;
        destY = this.targetY + vibY;
      } else if (animState === STATE_MORPH_OUT) {
        let easeT = easeInOutCubic(1 - morphProgress);
        destX = this.randomX + (this.targetX - this.randomX) * easeT;
        destY = this.randomY + (this.targetY - this.randomY) * easeT;
      }

      this.x += (destX - this.x) * 0.14;
      this.y += (destY - this.y) * 0.14;

      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null && heroInView) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distSq = dx * dx + dy * dy;
        let maxDistSq = mouse.radius * mouse.radius;

        if (distSq < maxDistSq) {
          let dist = Math.sqrt(distSq);
          let force = (1 - dist / mouse.radius);
          let push = force * 24;
          this.x += (dx / (dist || 1)) * push;
          this.y += (dy / (dist || 1)) * push;
        }
      }
    }

    draw(now) {
      let pulse = Math.sin(now * 0.0025 + this.pulseOffset) * 0.15;
      let alpha = Math.max(0.2, Math.min(1.0, this.baseAlpha + pulse));

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha;

      if (this.isBright) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00f0ff';
      } else {
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#3b82f6';
      }

      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  function updateParticleTargets() {
    const { centerX, centerY, scale } = getPortraitBounds();
    particles.forEach(p => p.setTarget(centerX, centerY, scale));
  }

  function init() {
    resize();
    particles = [];

    let count = Math.min(portraitPoints.length, 1600);
    if (count === 0 && portraitPoints.length > 0) count = portraitPoints.length;

    for (let i = 0; i < count; i++) {
      let pt = portraitPoints[i % portraitPoints.length];
      particles.push(new Particle(i, pt));
    }

    updateParticleTargets();
  }

  function drawConnections(now) {
    const maxDist = animState === STATE_HOLD ? 48 : (animState === STATE_FLOAT ? 92 : 65);
    const maxDistSq = maxDist * maxDist;

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      const step = animState === STATE_HOLD ? (p1.isBright ? 1 : 2) : 2;

      for (let j = i + 1; j < particles.length; j += step) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          let alpha = (1 - dist / maxDist) * 0.32;

          if (animState === STATE_HOLD) {
            alpha *= (0.8 + 0.2 * Math.sin(now * 0.003 + p1.id));
          }

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          
          if (p1.isBright || p2.isBright) {
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
            ctx.lineWidth = 0.95;
          } else {
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.24)';
            ctx.lineWidth = 0.75;
          }

          ctx.globalAlpha = Math.max(0.02, Math.min(0.45, alpha));
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }
    }
  }

  function updateStateMachine(delta, now) {
    stateTime += delta;

    switch (animState) {
      case STATE_FLOAT:
        if (stateTime >= floatDuration) {
          animState = STATE_MORPH_IN;
          stateTime = 0;
          morphProgress = 0;
          updateParticleTargets();
        }
        break;

      case STATE_MORPH_IN:
        morphProgress = Math.min(1.0, stateTime / DURATION_MORPH_IN);
        if (stateTime >= DURATION_MORPH_IN) {
          animState = STATE_HOLD;
          stateTime = 0;
          morphProgress = 1.0;
        }
        break;

      case STATE_HOLD:
        if (stateTime >= DURATION_HOLD) {
          animState = STATE_MORPH_OUT;
          stateTime = 0;
          morphProgress = 1.0;
        }
        break;

      case STATE_MORPH_OUT:
        morphProgress = Math.max(0.0, 1.0 - stateTime / DURATION_MORPH_OUT);
        if (stateTime >= DURATION_MORPH_OUT) {
          animState = STATE_FLOAT;
          stateTime = 0;
          morphProgress = 0;
          floatDuration = DURATION_FLOAT_PAUSE;
        }
        break;
    }
  }

  function render(now) {
    const delta = Math.min(60, now - lastTime);
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    if (heroInView) {
      updateStateMachine(delta, now);
    }

    for (let i = 0; i < particles.length; i++) {
      particles[i].update(delta, now);
      particles[i].draw(now);
    }

    drawConnections(now);

    requestAnimationFrame(render);
  }

  function startEngine() {
    portraitPoints = window.PORTRAIT_POINTS || [];
    init();
    requestAnimationFrame(render);
  }

  if (window.PORTRAIT_POINTS && window.PORTRAIT_POINTS.length > 0) {
    startEngine();
  } else {
    window.addEventListener('load', startEngine);
  }
})();
