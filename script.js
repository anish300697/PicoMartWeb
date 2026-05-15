const pages = [...document.querySelectorAll(".page")];
const navLinks = [...document.querySelectorAll(".nav-link")];
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

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
let particles = [];
let width = 0;
let height = 0;
let pixelRatio = 1;

function resizeCanvas() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  particles = Array.from({ length: Math.max(26, Math.floor(width / 34)) }, createParticle);
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

function animate() {
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#142221");
  gradient.addColorStop(0.48, "#203330");
  gradient.addColorStop(1, "#315346");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  particles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += particle.drift;
    particle.pulse += 0.012;

    if (particle.y < -80 || particle.x < -100 || particle.x > width + 100) {
      Object.assign(particle, createParticle(), { y: height + 90 });
    }

    drawCard(particle.x, particle.y, particle.size, particle.hue, particle.label, particle.pulse);
  });

  requestAnimationFrame(animate);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
animate();
