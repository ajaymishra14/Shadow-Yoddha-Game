(() => {
  "use strict";

  const weatherTypes = [
    "RAINSTORM",
    "THUNDERSTORM",
    "FOG",
    "SNOWSTORM",
    "DUST STORM",
    "SHADOW STORM"
  ];

  const weather = {
    current: "RAINSTORM",
    elapsed: 0,
    nextChange: 24,
    particles: [],
    lightning: 0,
    lightningTimer: 4,
    wind: 0,
    ctx: null,
    audio: null,
    canvas: null,
    gameCanvas: null,
    width: 0,
    height: 0,
    lastTime: 0
  };

  window.shadowWeather = weather;

  function findGameCanvas() {
    return document.querySelector(
      "#gameCanvas, #game, canvas"
    );
  }

  function setupCanvas() {
    const gameCanvas = findGameCanvas();
    if (!gameCanvas) return false;

    weather.gameCanvas = gameCanvas;

    const parent = gameCanvas.parentElement || document.body;

    if (getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }

    let overlay = document.getElementById("shadowWeatherCanvas");

    if (!overlay) {
      overlay = document.createElement("canvas");
      overlay.id = "shadowWeatherCanvas";
      overlay.style.cssText = `
        position:absolute;
        pointer-events:none;
        z-index:2;
        overflow:hidden;
      `;
      parent.appendChild(overlay);
    }

    weather.canvas = overlay;
    weather.ctx = overlay.getContext("2d");

    resizeCanvas();
    return true;
  }

  function resizeCanvas() {
    if (!weather.canvas || !weather.gameCanvas) return;

    const rect = weather.gameCanvas.getBoundingClientRect();
    const parentRect = weather.canvas.parentElement.getBoundingClientRect();

    weather.canvas.style.left =
      (rect.left - parentRect.left + weather.canvas.parentElement.scrollLeft) + "px";

    weather.canvas.style.top =
      (rect.top - parentRect.top + weather.canvas.parentElement.scrollTop) + "px";

    weather.canvas.style.width = rect.width + "px";
    weather.canvas.style.height = rect.height + "px";

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    weather.width = rect.width;
    weather.height = rect.height;

    weather.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    weather.canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    weather.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function makeParticle() {
    const w = weather.width;
    const h = weather.height;

    switch (weather.current) {
      case "RAINSTORM":
      case "THUNDERSTORM":
        return {
          x: random(0, w),
          y: random(-h, 0),
          vx: random(-5, 2),
          vy: random(500, 900),
          length: random(9, 22)
        };

      case "SNOWSTORM":
        return {
          x: random(0, w),
          y: random(-h, 0),
          vx: random(-35, 35),
          vy: random(35, 115),
          size: random(1, 4),
          drift: random(0, 8)
        };

      case "DUST STORM":
      case "SHADOW STORM":
        return {
          x: random(-w, w),
          y: random(0, h),
          vx: random(80, 250),
          vy: random(-12, 12),
          size: random(1, 4)
        };

      default:
        return {
          x: random(0, w),
          y: random(0, h),
          vx: random(-8, 8),
          vy: random(5, 20),
          size: random(1, 3)
        };
    }
  }

  function resetParticles() {
    const count = Math.min(
      650,
      Math.max(70, Math.floor(weather.width * weather.height / 900))
    );

    weather.particles = [];

    for (let i = 0; i < count; i++) {
      weather.particles.push(makeParticle());
    }
  }

  function changeWeather(type) {
    weather.current = type;
    weather.elapsed = 0;
    weather.nextChange = random(24, 42);
    weather.lightning = 0;
    weather.lightningTimer = random(3, 9);
    weather.wind = random(-1, 1);

    resetParticles();

    console.log("[Shadow Yoddha] Weather:", type);
  }

  function startThunderAudio() {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    try {
      if (!weather.audio) {
        weather.audio = new AudioContext();
      }

      if (weather.audio.state === "suspended") {
        weather.audio.resume();
      }
    } catch (_) {}
  }

  window.addEventListener("pointerdown", startThunderAudio, {
    once: false
  });

  function playThunder() {
    if (!weather.audio || weather.audio.state !== "running") return;

    try {
      const ctx = weather.audio;
      const duration = 1.6;
      const buffer = ctx.createBuffer(
        1,
        Math.floor(ctx.sampleRate * duration),
        ctx.sampleRate
      );

      const data = buffer.getChannelData(0);

      for (let i = 0; i < data.length; i++) {
        const fade = Math.pow(1 - i / data.length, 2);
        data[i] = (Math.random() * 2 - 1) * fade;
      }

      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      source.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.value = 180;
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch (_) {}
  }

  function drawRain(ctx, dt) {
    ctx.strokeStyle = "rgba(170,205,255,0.55)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();

    for (const p of weather.particles) {
      p.x += (p.vx + weather.wind * 90) * dt;
      p.y += p.vy * dt;

      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 4, p.y + p.length);

      if (p.y > weather.height + 25 || p.x < -30) {
        Object.assign(p, makeParticle());
        p.y = random(-100, -10);
      }
    }

    ctx.stroke();

    // Small water splashes near the ground.
    ctx.fillStyle = "rgba(160,205,255,0.45)";

    for (let i = 0; i < 12; i++) {
      const x = random(0, weather.width);
      const y = weather.height - random(2, 12);
      ctx.fillRect(x, y, random(1, 4), 1);
    }
  }

  function drawSnow(ctx, dt) {
    ctx.fillStyle = "rgba(245,250,255,0.85)";

    for (const p of weather.particles) {
      p.x += (p.vx + Math.sin(weather.elapsed * 2 + p.drift) * 15) * dt;
      p.y += p.vy * dt;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (p.y > weather.height + 8) {
        Object.assign(p, makeParticle());
        p.y = -5;
      }
    }
  }

  function drawDust(ctx, dt, shadow = false) {
    ctx.fillStyle = shadow
      ? "rgba(45,15,75,0.38)"
      : "rgba(190,135,75,0.38)";

    for (const p of weather.particles) {
      p.x += (p.vx + weather.wind * 120) * dt;
      p.y += p.vy * dt;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (p.x > weather.width + 20) {
        Object.assign(p, makeParticle());
        p.x = -10;
      }
    }
  }

  function drawFog(ctx) {
    const gradient = ctx.createLinearGradient(
      0, weather.height * 0.35,
      0, weather.height
    );

    gradient.addColorStop(0, "rgba(170,180,190,0)");
    gradient.addColorStop(1, "rgba(150,165,175,0.55)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, weather.width, weather.height);
  }

  function drawLightning(ctx, dt) {
    weather.lightningTimer -= dt;

    if (weather.lightningTimer <= 0) {
      weather.lightning = random(0.35, 0.85);
      weather.lightningTimer = random(4, 11);
      playThunder();
    }

    if (weather.lightning > 0) {
      ctx.fillStyle = `rgba(220,235,255,${weather.lightning * 0.48})`;
      ctx.fillRect(0, 0, weather.width, weather.height);
      weather.lightning = Math.max(0, weather.lightning - dt * 2.8);
    }
  }

  function drawWeatherLabel(ctx) {
    const label = weather.current;

    ctx.font = "bold 11px Arial";
    const width = ctx.measureText(label).width + 20;
    const x = weather.width - width - 10;
    const y = 12;

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(x, y, width, 23);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x + 10, y + 15);
  }

  function update(dt) {
    weather.elapsed += dt;

    if (weather.elapsed >= weather.nextChange) {
      const next = weatherTypes[
        Math.floor(Math.random() * weatherTypes.length)
      ];
      changeWeather(next);
    }

    if (weather.current === "THUNDERSTORM") {
      drawLightning(weather.ctx, dt);
    }
  }

  function render(now) {
    requestAnimationFrame(render);

    if (!weather.ctx || !weather.canvas) return;

    const dt = Math.min(
      0.04,
      weather.lastTime ? (now - weather.lastTime) / 1000 : 0.016
    );

    weather.lastTime = now;

    // Keep overlay aligned with the game canvas.
    if (Math.floor(now / 500) !== Math.floor((now - dt * 1000) / 500)) {
      resizeCanvas();
    }

    const ctx = weather.ctx;
    ctx.clearRect(0, 0, weather.width, weather.height);

    update(dt);

    switch (weather.current) {
      case "RAINSTORM":
        drawRain(ctx, dt);
        break;

      case "THUNDERSTORM":
        drawRain(ctx, dt);
        break;

      case "SNOWSTORM":
        drawSnow(ctx, dt);
        break;

      case "DUST STORM":
        drawDust(ctx, dt);
        break;

      case "SHADOW STORM":
        drawDust(ctx, dt, true);
        break;

      case "FOG":
        drawFog(ctx);
        break;
    }

    drawWeatherLabel(ctx);
  }

  function boot() {
    if (!setupCanvas()) {
      setTimeout(boot, 500);
      return;
    }

    resetParticles();

    window.addEventListener("resize", resizeCanvas);

    if ("ResizeObserver" in window) {
      new ResizeObserver(resizeCanvas).observe(weather.gameCanvas);
    }

    requestAnimationFrame(render);

    console.log("[Shadow Yoddha] Dynamic weather engine loaded.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
