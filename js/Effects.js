// Visual effects: particles, screen shake, flash
import { rand } from './Utils.js';

export class Particle {
  constructor(x, y, vx, vy, life, color, size = 2, gravity = 0, fade = true) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
    this.gravity = gravity;
    this.fade = fade;
    this.dead = false;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) { this.dead = true; return; }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
  }

  draw(ctx) {
    const a = this.fade ? Math.max(0, this.life / this.maxLife) : 1;
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.round(this.x), Math.round(this.y), this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

export class Effects {
  constructor() {
    this.particles = [];
    this.shake = 0;
    this.shakeTime = 0;
    this.flash = 0;
    this.flashColor = '#ffffff';
  }

  burst(x, y, count, colors, speedRange = [80, 280], lifeRange = [0.25, 0.7], size = 4, gravity = 0) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(speedRange[0], speedRange[1]);
      this.particles.push(new Particle(
        x, y,
        Math.cos(a) * s,
        Math.sin(a) * s,
        rand(lifeRange[0], lifeRange[1]),
        colors[Math.floor(Math.random() * colors.length)],
        size,
        gravity,
      ));
    }
  }

  explosion(x, y) {
    this.burst(x, y, 20, ['#ffd54a', '#ff8a3d', '#ff4d4d', '#ffffff'], [120, 360], [0.3, 0.7], 4, 160);
    this.triggerShake(16, 0.18);
  }

  hit(x, y, color = '#ffffff') {
    this.burst(x, y, 6, [color, '#ffffff'], [60, 160], [0.1, 0.25], 2, 0);
  }

  spark(x, y) {
    this.burst(x, y, 5, ['#a4ffff', '#ffffff'], [80, 200], [0.1, 0.2], 2, 0);
  }

  triggerShake(amplitude, time) {
    this.shake = Math.max(this.shake, amplitude);
    this.shakeTime = Math.max(this.shakeTime, time);
  }

  triggerFlash(intensity, color = '#ffffff') {
    this.flash = Math.max(this.flash, intensity);
    this.flashColor = color;
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].dead) this.particles.splice(i, 1);
    }
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      if (this.shakeTime <= 0) this.shake = 0;
    }
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 3);
  }

  applyShake(ctx) {
    if (this.shake <= 0) return { x: 0, y: 0 };
    const dx = (Math.random() * 2 - 1) * this.shake;
    const dy = (Math.random() * 2 - 1) * this.shake;
    ctx.save();
    ctx.translate(Math.round(dx), Math.round(dy));
    return { x: dx, y: dy };
  }

  releaseShake(ctx) {
    if (this.shake > 0) ctx.restore();
  }

  drawFlash(ctx, w, h) {
    if (this.flash <= 0) return;
    ctx.globalAlpha = Math.min(0.7, this.flash);
    ctx.fillStyle = this.flashColor;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  drawParticles(ctx) {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(ctx);
    }
  }
}
