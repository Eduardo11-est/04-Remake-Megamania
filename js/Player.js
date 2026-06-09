// Player ship: movement, shooting, lives, invulnerability frames
import { aabb, clamp } from './Utils.js';
import { PLAYER, BULLET, W, PLAY_BOTTOM, PLAY_TOP, COLORS } from './Config.js';
import { SPRITES, drawSprite } from './Sprites.js';
import { Bullet } from './Bullet.js';

export class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = W / 2;
    this.y = PLAYER.y;
    this.w = PLAYER.w;
    this.h = PLAYER.h;
    this.cooldown = 0;
    this.fireHeld = false;
    this.lives = PLAYER.lives;
    this.invuln = 0;
    this.dead = false;
    this.engine = 0;
  }

  get bounds() {
    const sprW = SPRITES.player.w * 2;
    const sprH = SPRITES.player.h * 2;
    const inset = 6;
    return aabb(this.x - sprW / 2 + inset, this.y - sprH / 2 + 4, sprW - inset * 2, sprH - 8);
  }

  update(dt, input) {
    if (this.dead) return;
    if (this.invuln > 0) this.invuln = Math.max(0, this.invuln - dt);
    this.engine = (this.engine + dt * 12) % 2;

    const ax = input.axisX();
    this.x = clamp(this.x + ax * PLAYER.speed * dt, this.w / 2 + 8, W - this.w / 2 - 8);

    if (this.cooldown > 0) this.cooldown = Math.max(0, this.cooldown - dt);

    const wantsFire = input.state.fire;
    this.fireHeld = wantsFire;
  }

  tryFire(bullets) {
    if (this.dead) return null;
    if (this.cooldown > 0) return null;
    this.cooldown = PLAYER.fireCooldown;
    const sprH = SPRITES.player.h * 2;
    const b = new Bullet(this.x, this.y - sprH / 2 - 4, 0, -PLAYER.bulletSpeed, true);
    bullets.push(b);
    return b;
  }

  takeHit() {
    if (this.invuln > 0 || this.dead) return false;
    this.lives -= 1;
    this.invuln = PLAYER.invuln;
    if (this.lives < 0) this.dead = true;
    return true;
  }

  outOfEnergy() {
    if (this.invuln > 0 || this.dead) return false;
    this.lives -= 1;
    this.invuln = PLAYER.invuln;
    if (this.lives < 0) this.dead = true;
    return true;
  }

  draw(ctx) {
    if (this.dead) return;
    if (this.invuln > 0 && Math.floor(this.invuln * 24) % 2 === 0) return;
    const sprW = SPRITES.player.w * 2;
    const sprH = SPRITES.player.h * 2;
    drawSprite(ctx, SPRITES.player, Math.round(this.x - sprW / 2), Math.round(this.y - sprH / 2), 2);

    // Animated engine flame
    const flicker = Math.random() > 0.3;
    if (flicker) {
      const ex = Math.round(this.x);
      const ey = Math.round(this.y + sprH / 2);
      // Left engine
      ctx.fillStyle = '#ff4d4d';
      ctx.fillRect(ex - 14, ey, 4, 4 + Math.floor(Math.random() * 4));
      ctx.fillStyle = '#ffd54a';
      ctx.fillRect(ex - 13, ey + 1, 2, 2 + Math.floor(Math.random() * 3));
      // Right engine
      ctx.fillStyle = '#ff4d4d';
      ctx.fillRect(ex + 10, ey, 4, 4 + Math.floor(Math.random() * 4));
      ctx.fillStyle = '#ffd54a';
      ctx.fillRect(ex + 11, ey + 1, 2, 2 + Math.floor(Math.random() * 3));
    }
  }
}
