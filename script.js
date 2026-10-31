const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
const button = document.getElementById('wishButton');
const hint = document.getElementById('hint');

let width = 0, height = 0, dpr = 1;
let rockets = [];
let particles = [];
let lastLaunch = 0;
const colors = ['#65eaff', '#ff4d7d', '#a66bff', '#ffe45c', '#69ff8d', '#ff9d42'];

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

class Rocket {
  constructor(x = Math.random() * width, targetY = height * (.18 + Math.random() * .38), color) {
    this.x = x;
    this.y = height + 8;
    this.targetY = targetY;
    this.vx = (Math.random() - .5) * 1.5;
    this.vy = -(7 + Math.random() * 3);
    this.color = color || colors[Math.floor(Math.random() * colors.length)];
    this.trail = [];
  }
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 7) this.trail.shift();
    this.x += this.vx;
    this.y += this.vy;
    this.vy += .055;
    if (this.y <= this.targetY || this.vy >= -1) {
      explode(this.x, this.y, this.color);
      return false;
    }
    return true;
  }
  draw() {
    ctx.beginPath();
    this.trail.forEach((p, i) => {
      if (!i) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = .5;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
}

class Particle {
  constructor(x, y, color, angle, speed) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.decay = .008 + Math.random() * .012;
    this.gravity = .035;
    this.size = 1 + Math.random() * 1.7;
    this.drag = .985;
  }
  update() {
    this.vx *= this.drag;
    this.vy = this.vy * this.drag + this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    return this.alpha > 0;
  }
  draw() {
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

function explode(x, y, color) {
  const count = 75 + Math.floor(Math.random() * 45);
  const offset = Math.random() * Math.PI * 2;
  for (let i = 0; i < count; i++) {
    const angle = offset + (Math.PI * 2 * i / count);
    const speed = 1.2 + Math.random() * 4.2;
    particles.push(new Particle(x, y, color, angle, speed));
  }
  for (let i = 0; i < 18; i++) {
    particles.push(new Particle(x, y, '#fff', Math.random() * Math.PI * 2, Math.random() * 2.8));
  }
}

function launch(x, y) {
  const launchX = x ?? Math.random() * width;
  const targetY = y ?? height * (.18 + Math.random() * .38);
  rockets.push(new Rocket(launchX, targetY));
}

function frame(time) {
  ctx.fillStyle = 'rgba(2,2,7,.19)';
  ctx.fillRect(0, 0, width, height);
  if (time - lastLaunch > 720 + Math.random() * 650) {
    launch();
    lastLaunch = time;
  }
  rockets = rockets.filter(rocket => {
    const alive = rocket.update();
    rocket.draw();
    return alive;
  });
  particles = particles.filter(particle => {
    const alive = particle.update();
    if (alive) particle.draw();
    return alive;
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

button.addEventListener('click', () => {
  for (let i = 0; i < 5; i++) {
    launch(width * (.18 + Math.random() * .64), height * (.15 + Math.random() * .38));
  }
  hint.textContent = 'A little extra sparkle, just for you ✨';
});

canvas.addEventListener('pointerdown', event => {
  launch(event.clientX, Math.max(80, event.clientY - height * .25));
});