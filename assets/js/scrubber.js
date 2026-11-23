(function () {
  "use strict";

  // --- Config: update when Blender frames arrive ---
  const DESKTOP_DIR = "assets/classroom/frames";
  const MOBILE_DIR = "assets/classroom/frames/mobile";
  const FRAME_COUNT = 48;         // Blender-rendered sequence
  const FRAME_EXT = "webp";
  const HERO_URL = "assets/classroom/hero.webp";
  const PAD = 3;

  const container = document.getElementById("scroll-container");
  const canvas = document.getElementById("stage");
  if (!container || !canvas) return;

  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Pick frame dir (mobile if available)
  let frameDir = window.innerWidth < 768 ? MOBILE_DIR : DESKTOP_DIR;
  function frameUrl(i, dir) {
    return dir + "/frame_" + String(i).padStart(PAD, "0") + "." + FRAME_EXT;
  }

  // Verify mobile dir exists by probing first frame; fall back to desktop
  function probe(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  const frames = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let lastDrawn = 0;
  let rafId = null;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function drawCover(img) {
    if (!img || !img.naturalWidth) return;
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = cw / ch;
    let dw, dh, dx, dy;
    if (ir > cr) { dh = ch; dw = ch * ir; dx = (cw - dw) / 2; dy = 0; }
    else { dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2; }
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function draw() {
    const img = frames[lastDrawn];
    if (img && img.complete && img.naturalWidth) {
      drawCover(img);
    }
  }

  function progress() {
    const rect = container.getBoundingClientRect();
    const total = container.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    const scrolled = -rect.top;
    return Math.min(1, Math.max(0, scrolled / total));
  }

  function update() {
    rafId = null;
    if (reducedMotion) return;
    const p = progress();
    const idx = Math.min(FRAME_COUNT - 1, Math.floor(p * (FRAME_COUNT - 1)));
    if (frames[idx] && frames[idx].complete && frames[idx].naturalWidth) {
      lastDrawn = idx;
      drawCover(frames[idx]);
    } else if (frames[lastDrawn] && frames[lastDrawn].complete) {
      drawCover(frames[lastDrawn]);
    }
  }

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(update);
  }

  async function init() {
    // mobile fallback probe
    if (frameDir === MOBILE_DIR) {
      const ok = await probe(frameUrl(0, MOBILE_DIR));
      if (!ok) frameDir = DESKTOP_DIR;
    }

    // preload
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => { loadedCount++; if (i === 0) { lastDrawn = 0; drawCover(img); } };
      img.onerror = () => { /* keep last good frame */ };
      img.src = frameUrl(i, frameDir);
      frames[i] = img;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    if (reducedMotion) {
      const hero = new Image();
      hero.onload = () => drawCover(hero);
      hero.src = HERO_URL;
      return;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  // expose for debugging
  window.Scrubber = { progress, init };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();