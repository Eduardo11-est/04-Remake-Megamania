// Enemy + Wave system: 5 themed stages, formation movement, fire
import { aabb, rand } from './Utils.js';
import { ENEMY, BULLET, W, PLAY_BOTTOM, PLAY_TOP, STAGES } from './Config.js';
import { SPRITES, getEnemySprite, drawSprite } from './Sprites.js';
import { Bullet } from './Bullet.js';

export class Enemy {
  constructor(col, row, stage, wave) {
    this.stage = stage;
    this.wave = wave;
    this.col = col;
    this.row = row;
    this.sprite = getEnemySprite(stage.id);
    this.baseX = 0; this.baseY = 0;
    this.x = 0; this.y = 0;
    this.w = this.sprite.w * 2 + 12;
    this.h = this.sprite.h * 2 + 8;
    this.hp = 1;
    this.dead = false;
    this.fireCooldown = rand(wave.fireInterval[0], wave.fireInterval[1]);
    this.spin = 0;
    this.color = stage.id;
  }

  get bounds() {
    const inset = 4;
    return aabb(this.x - this.w / 2 + inset, this.y - this.h / 2 + inset, this.w - inset * 2, this.h - inset * 2);
  }

  update(dt, wave) {
    if (this.dead) return;
    this.spin += dt * 1.2;
    this.x = this.baseX + wave.gridX + Math.sin(this.spin + this.col * 0.4 + this.row * 0.3) * 8;
    this.y = this.baseY + wave.gridY;
    this.fireCooldown -= dt;
  }

  tryFire(bullets, wave) {
    if (this.dead) return;
    if (this.fireCooldown > 0) return;
    if (wave.usedFireSlots.has(this)) return;
    if (this.y < PLAY_TOP + 24) return;
    const chance = 0.55;
    if (Math.random() > chance) {
      this.fireCooldown = 0.2;
      return;
    }
    this.fireCooldown = rand(wave.fireInterval[0], wave.fireInterval[1]);
    const b = new Bullet(this.x, this.y + this.h / 2, 0, 180 + wave.difficulty * 12, false);
    bullets.push(b);
    wave.usedFireSlots.add(this);
    b.owner = this;
    return b;
  }

  draw(ctx) {
    if (this.dead) return;
    const sc = 2;
    drawSprite(ctx, this.sprite, Math.round(this.x - this.sprite.w * 2 / 2), Math.round(this.y - this.sprite.h * 2 / 2), sc);
  }
}

export class Wave {
  constructor(stageIndex, cycle) {
    this.stageIndex = stageIndex;
    this.stage = STAGES[stageIndex];
    this.cycle = cycle;
    this.difficulty = 1 + cycle * 0.18;
    this.cols = ENEMY.cols;
    this.rows = ENEMY.rows + Math.floor(stageIndex / 2) + Math.min(2, cycle);
    this.gridX = 0;
    this.gridY = ENEMY.startY;
    this.dir = 1;
    this.speed = ENEMY.baseSpeed + cycle * 20 + stageIndex * 15;
    this.zigzagPhase = Math.random() * Math.PI * 2;
    this.zigzagT = 0;
    this.swayX = 0;
    this.enemies = [];
    this.usedFireSlots = new Set();
    this.completed = false;
    this.descended = false;
    this.fireInterval = [
      Math.max(0.6, ENEMY.fireInterval[0] - cycle * 0.1 - stageIndex * 0.08),
      Math.max(1.2, ENEMY.fireInterval[1] - cycle * 0.15 - stageIndex * 0.1),
    ];
    this.spawn();
  }

  spawn() {
    const cellW = (W - 64) / (this.cols - 1);
    const cellH = 48;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const e = new Enemy(c, r, this.stage, this);
        e.baseX = 32 + c * cellW;
        e.baseY = PLAY_TOP + 56 + r * cellH;
        e.x = e.baseX;
        e.y = e.baseY;
        this.enemies.push(e);
      }
    }
  }

  update(dt) {
    let minX = Infinity, maxX = -Infinity;
    let lowestY = -Infinity;
    let aliveCount = 0;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.dead) continue;
      aliveCount++;
      e.update(dt, this);
      if (e.x < minX) minX = e.x;
      if (e.x > maxX) maxX = e.x;
      if (e.y > lowestY) lowestY = e.y;
    }

    if (aliveCount === 0) {
      if (!this.completed) this.completed = true;
      return;
    }

    this.zigzagT += dt;
    this.gridX = Math.sin(this.zigzagT * ENEMY.zigzagFreq + this.zigzagPhase) * ENEMY.zigzagAmplitude;
    this.gridY += this.speed * dt * 0.15;

    // Lateral drift
    const margin = 20;
    if (maxX > W - margin) this.dir = -1;
    if (minX < margin) this.dir = 1;
    const drift = this.dir * this.speed * dt;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (!e.dead) e.baseX += drift;
    }

    // Periodic descend pulse: every 4 seconds drop a step
    this._descendTimer = (this._descendTimer || 0) + dt;
    if (this._descendTimer > 4) {
      this._descendTimer = 0;
      for (let i = 0; i < this.enemies.length; i++) {
        const e = this.enemies[i];
        if (!e.dead) e.baseY += ENEMY.descendStep;
      }
    }
  }

  tryFire(bullets) {
    if (this.completed) return false;
    let fired = false;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.dead) continue;
      const b = e.tryFire(bullets, this);
      if (b) fired = true;
    }
    return fired;
  }

  draw(ctx) {
    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].draw(ctx);
    }
  }

  aliveCount() {
    let n = 0;
    for (let i = 0; i < this.enemies.length; i++) if (!this.enemies[i].dead) n++;
    return n;
  }

  reachedBottom() {
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.dead) continue;
      if (e.y + e.h / 2 >= PLAY_BOTTOM - 16) return true;
    }
    return false;
  }
}
