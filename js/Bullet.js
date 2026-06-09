// Bullet entity for player and enemy
import { aabb, rectsOverlap } from './Utils.js';
import { BULLET, COLORS, W } from './Config.js';
import { SPRITES, drawSprite } from './Sprites.js';

export class Bullet {
  constructor(x, y, vx, vy, fromPlayer) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.fromPlayer = fromPlayer;
    this.dead = false;
    const w = fromPlayer ? BULLET.w : BULLET.enemyW;
    const h = fromPlayer ? BULLET.h : BULLET.enemyH;
    this.w = w; this.h = h;
    this.trail = fromPlayer;
    this.trailX = x; this.trailY = y;
  }

  get bounds() { return aabb(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h); }

  update(dt, playTop, playBottom) {
    if (this.trail) {
      this.trailX = this.x - this.vx * 0.04;
      this.trailY = this.y - this.vy * 0.04;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.y + this.h / 2 < playTop - 8 || this.y - this.h / 2 > playBottom + 8) this.dead = true;
    if (this.x < -16 || this.x > W + 16) this.dead = true;
  }

  draw(ctx) {
    if (this.fromPlayer) {
      if (this.trail) {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = COLORS.bulletGlow;
        ctx.fillRect(Math.round(this.trailX) - 2, Math.round(this.trailY) - 4, 4, 8);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = COLORS.bullet;
      ctx.fillRect(Math.round(this.x) - 2, Math.round(this.y) - 8, 4, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(this.x), Math.round(this.y) - 4, 2, 8);
    } else {
      ctx.fillStyle = COLORS.enemyBullet;
      ctx.fillRect(Math.round(this.x) - 2, Math.round(this.y) - 6, 6, 14);
      ctx.fillStyle = COLORS.enemyBulletGlow;
      ctx.fillRect(Math.round(this.x), Math.round(this.y) - 2, 2, 6);
    }
  }
}

export function bulletHits(bullets, targets) {
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i];
    if (b.dead) continue;
    const bb = b.bounds;
    for (let j = 0; j < targets.length; j++) {
      const t = targets[j];
      if (t.dead) continue;
      if (rectsOverlap(bb, t.bounds)) {
        b.dead = true;
        t.hp -= 1;
        if (t.hp <= 0) t.dead = true;
        return { bullet: i, target: j, killed: t.dead };
      }
    }
  }
  return null;
}
