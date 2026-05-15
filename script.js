const pages = [...document.querySelectorAll(".page")];
const navLinks = [...document.querySelectorAll(".nav-link")];
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const loadingScreen = document.querySelector(".loading-screen");
const loaderCanvas = document.getElementById("loader-canvas");
const loaderCtx = loaderCanvas.getContext("2d");
const loaderSymbols = ["cart", "pay", "$", "sale", "tap", "bag", "%"];
const loaderDuration = 3000;
const loaderPlaceDelay = 700;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let loaderParticles = [];
let loaderWidth = 0;
let loaderHeight = 0;
let loaderRatio = 1;
let loaderFrame = null;
let loaderStartTime = 0;

document.body.classList.add("is-loading");

function resizeLoaderCanvas() {
  loaderRatio = Math.min(window.devicePixelRatio || 1, 2);
  loaderWidth = loaderCanvas.clientWidth;
  loaderHeight = loaderCanvas.clientHeight;
  loaderCanvas.width = Math.floor(loaderWidth * loaderRatio);
  loaderCanvas.height = Math.floor(loaderHeight * loaderRatio);
  loaderCtx.setTransform(loaderRatio, 0, 0, loaderRatio, 0, 0);

  const count = reduceMotion.matches ? 18 : Math.min(72, Math.max(34, Math.floor(loaderWidth / 18)));
  loaderParticles = Array.from({ length: count }, createLoaderParticle);
}

function createLoaderParticle() {
  return {
    x: Math.random() * loaderWidth,
    y: Math.random() * loaderHeight,
    size: 9 + Math.random() * 24,
    speed: 0.5 + Math.random() * 1.8,
    drift: -0.7 + Math.random() * 1.4,
    spin: -0.018 + Math.random() * 0.036,
    angle: Math.random() * Math.PI * 2,
    label: loaderSymbols[Math.floor(Math.random() * loaderSymbols.length)],
    alpha: 0.22 + Math.random() * 0.58,
    hue: Math.random()
  };
}

function drawLoaderParticle(particle, elapsed) {
  const pulse = Math.sin(elapsed * 0.003 + particle.angle) * 0.18;
  const colors = particle.hue > 0.66 ? ["#d96b4b", "#f1c56a"] : particle.hue > 0.33 ? ["#4c8fb6", "#9dd6bd"] : ["#1f7a58", "#8abf68"];

  loaderCtx.save();
  loaderCtx.translate(particle.x, particle.y);
  loaderCtx.rotate(particle.angle);
  loaderCtx.globalAlpha = particle.alpha + pulse;
  loaderCtx.fillStyle = colors[0];
  loaderCtx.fillRect(-particle.size, -particle.size * 0.42, particle.size * 2, particle.size * 0.84);
  loaderCtx.fillStyle = colors[1];
  loaderCtx.fillRect(-particle.size * 0.72, -particle.size * 0.08, particle.size * 1.44, particle.size * 0.16);
  loaderCtx.fillStyle = "#ffffff";
  loaderCtx.font = `800 ${Math.max(10, particle.size * 0.44)}px Inter, Arial, sans-serif`;
  loaderCtx.textAlign = "center";
  loaderCtx.textBaseline = "middle";
  loaderCtx.fillText(particle.label, 0, particle.size * 0.2);
  loaderCtx.restore();
}

function animateLoader(timestamp = 0) {
  if (!loaderStartTime) {
    loaderStartTime = timestamp;
  }

  const elapsed = timestamp - loaderStartTime;
  loaderCtx.clearRect(0, 0, loaderWidth, loaderHeight);

  for (let i = 0; i < 7; i += 1) {
    const y = ((elapsed * 0.04 + i * 120) % (loaderHeight + 140)) - 70;
    loaderCtx.globalAlpha = 0.08;
    loaderCtx.fillStyle = i % 2 ? "#9dd6bd" : "#d96b4b";
    loaderCtx.fillRect(0, y, loaderWidth, 1);
  }

  loaderCtx.globalAlpha = 1;
  loaderParticles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += particle.drift + Math.sin(elapsed * 0.001 + particle.angle) * 0.15;
    particle.angle += particle.spin;

    if (particle.y < -80 || particle.x < -80 || particle.x > loaderWidth + 80) {
      Object.assign(particle, createLoaderParticle(), { y: loaderHeight + 80 });
    }

    drawLoaderParticle(particle, elapsed);
  });

  if (elapsed < loaderDuration && !reduceMotion.matches) {
    loaderFrame = requestAnimationFrame(animateLoader);
  }
}

function completeLoader() {
  if (loaderFrame) {
    cancelAnimationFrame(loaderFrame);
    loaderFrame = null;
  }

  loadingScreen.classList.add("is-complete");
  document.body.classList.remove("is-loading");
  document.body.classList.remove("is-revealing");
}

function startLoader() {
  resizeLoaderCanvas();

  if (!reduceMotion.matches) {
    loaderFrame = requestAnimationFrame(animateLoader);
  } else {
    animateLoader(1);
  }

  if (!reduceMotion.matches) {
    document.body.classList.add("is-revealing");
    window.setTimeout(() => {
      loadingScreen.classList.add("is-placing");
    }, loaderPlaceDelay);
  }

  window.setTimeout(completeLoader, reduceMotion.matches ? 600 : loaderDuration);
}

function showPage(hash) {
  const target = hash && document.querySelector(hash) ? hash : "#home";

  pages.forEach((page) => {
    page.classList.toggle("active", `#${page.id}` === target);
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === target);
  });

  siteNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

window.addEventListener("hashchange", () => showPage(window.location.hash));
navLinks.forEach((link) => {
  link.addEventListener("click", () => showPage(link.getAttribute("href")));
});

menuToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

showPage(window.location.hash);

const canvas = document.getElementById("commerce-canvas");
const ctx = canvas.getContext("2d");
const symbols = ["$", "tap", "pay", "cart", "sale", "receipt"];
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let particles = [];
let width = 0;
let height = 0;
let pixelRatio = 1;
let backgroundGradient;
let animationFrame = null;
let lastFrameTime = 0;
let resizeTimer = null;

function shouldAnimate() {
  const hash = window.location.hash;
  return !motionQuery.matches && !document.hidden && hash !== "#products" && hash !== "#about" && hash !== "#contact";
}

function resizeCanvas() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
  backgroundGradient.addColorStop(0, "#142221");
  backgroundGradient.addColorStop(0.48, "#203330");
  backgroundGradient.addColorStop(1, "#315346");

  const particleCount = Math.min(34, Math.max(16, Math.floor(width / 56)));
  particles = Array.from({ length: particleCount }, createParticle);
  drawBackground();
}

function createParticle() {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: 24 + Math.random() * 54,
    speed: 0.18 + Math.random() * 0.54,
    drift: -0.18 + Math.random() * 0.36,
    label: symbols[Math.floor(Math.random() * symbols.length)],
    hue: Math.random(),
    pulse: Math.random() * Math.PI * 2
  };
}

function drawCard(x, y, size, hue, label, pulse) {
  const colors = hue > 0.66 ? ["#d96b4b", "#c99a2e"] : hue > 0.33 ? ["#4c8fb6", "#6ac6bb"] : ["#1f7a58", "#8abf68"];
  const alpha = 0.2 + Math.sin(pulse) * 0.04;
  const radius = 8;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(pulse) * 0.06);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colors[0];
  roundRect(-size / 2, -size * 0.32, size, size * 0.64, radius);
  ctx.fill();
  ctx.fillStyle = colors[1];
  roundRect(-size * 0.35, -size * 0.06, size * 0.7, size * 0.12, 999);
  ctx.fill();
  ctx.globalAlpha = alpha + 0.18;
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${Math.max(11, size * 0.18)}px Inter, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 0, size * 0.16);
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBackground() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = backgroundGradient;
  ctx.fillRect(0, 0, width, height);
}

function animate(timestamp = 0) {
  if (!shouldAnimate()) {
    stopAnimation();
    drawBackground();
    return;
  }

  animationFrame = requestAnimationFrame(animate);

  if (timestamp - lastFrameTime < 33) {
    return;
  }

  lastFrameTime = timestamp;
  drawBackground();

  particles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += particle.drift;
    particle.pulse += 0.012;

    if (particle.y < -80 || particle.x < -100 || particle.x > width + 100) {
      Object.assign(particle, createParticle(), { y: height + 90 });
    }

    drawCard(particle.x, particle.y, particle.size, particle.hue, particle.label, particle.pulse);
  });
}

function startAnimation() {
  if (animationFrame || !shouldAnimate()) {
    return;
  }

  lastFrameTime = 0;
  animationFrame = requestAnimationFrame(animate);
}

function stopAnimation() {
  if (!animationFrame) {
    return;
  }

  cancelAnimationFrame(animationFrame);
  animationFrame = null;
}

function refreshAnimationState() {
  if (shouldAnimate()) {
    startAnimation();
  } else {
    stopAnimation();
    drawBackground();
  }
}

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeCanvas();
    resizeLoaderCanvas();
    refreshAnimationState();
  }, 120);
});

window.addEventListener("hashchange", refreshAnimationState);
document.addEventListener("visibilitychange", refreshAnimationState);
if (motionQuery.addEventListener) {
  motionQuery.addEventListener("change", refreshAnimationState);
} else {
  motionQuery.addListener(refreshAnimationState);
}
resizeCanvas();
refreshAnimationState();
startLoader();
