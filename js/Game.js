// Main game state machine: ties Player, Enemies, Bullets, UI, Effects
import {
  W, H, PLAY_TOP, PLAY_BOTTOM, PLAYER, ENERGY, SCORE, STAGES, COLORS,
} from './Config.js';
import { Player } from './Player.js';
import { Wave } from './Enemy.js';
import { Bullet, bulletHits } from './Bullet.js';
import { UI } from './UI.js';
import { Effects } from './Effects.js';
import { Starfield } from './Starfield.js';
import { Audio } from './Audio.js';
import { Input } from './Input.js';
import { aabb, rectsOverlap, rand } from './Utils.js';
import { loadHighScore, saveHighScore } from './Storage.js';

const STATE = {
  MENU: 'menu',
  WAVE_INTRO: 'wave_intro',
  PLAY: 'play',
  WAVE_CLEAR: 'wave_clear',
  GAME_OVER: 'game_over',
  PAUSED: 'paused',
};

export class Game {
  constructor(canvas, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.audio = audio;
    this.input = new Input(canvas);
    this.ui = new UI();
    this.fx = new Effects();
    this.starfield = new Starfield();
    this.bullets = [];
    this.player = new Player();
    this.wave = null;
    this.state = STATE.MENU;
    this.score = 0;
    this.highScore = loadHighScore();
    this.energy = ENERGY.start;
    this.combo = 1;
    this.comboTimer = 0;
    this.comboCount = 0;
    this.waveNo = 1;
    this.cycle = 0;
    this.stage = STAGES[0];
    this.stageIndex = 0;
    this.waveClearTimer = 0;
    this.gameOverTimer = 0;
    this.introTimer = 0;
    this.lastShotAt = 0;
    this.overlayEl = document.getElementById('overlay');
    this.touchEl = document.getElementById('touch');
    this.startBtn = document.getElementById('start');
    this._wireUI();
  }

  _wireUI() {
    this.startBtn.addEventListener('click', () => this._onStartPressed());

    this.canvas.addEventListener('click', () => {
      if (this.state === STATE.GAME_OVER && this.gameOverTimer > 1.2) {
        this._onStartPressed();
      }
    });

    const btnPause = document.getElementById('btn-pause');
    if (btnPause) {
      btnPause.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.state === STATE.PLAY) this.state = STATE.PAUSED;
        else if (this.state === STATE.PAUSED) this.state = STATE.PLAY;
      });
    }

    const btnMute = document.getElementById('btn-mute');
    if (btnMute) {
      btnMute.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const m = this.audio.toggleMute();
        this.fx.triggerFlash(0.05, m ? '#ff4d4d' : '#4dffb0');
        btnMute.textContent = m ? 'UNMUTE' : 'MUTE';
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (this.state === STATE.MENU || this.state === STATE.GAME_OVER) {
          e.preventDefault();
          this._onStartPressed();
        }
      }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (this.state === STATE.PLAY) this.state = STATE.PAUSED;
        else if (this.state === STATE.PAUSED) this.state = STATE.PLAY;
      }
      if (e.key === 'm' || e.key === 'M') {
        const m = this.audio.toggleMute();
        this.fx.triggerFlash(0.05, m ? '#ff4d4d' : '#4dffb0');
        if (btnMute) btnMute.textContent = m ? 'UNMUTE' : 'MUTE';
      }
    });
  }

  _showGameOverOverlay() {
    this.overlayEl.classList.remove('hidden');
    const title = this.overlayEl.querySelector('.title');
    const subtitle = this.overlayEl.querySelector('.subtitle');
    const legend = this.overlayEl.querySelector('.legend');
    const startBtn = this.startBtn;

    title.textContent = 'GAME OVER';
    title.style.color = '#ff8a3d';
    subtitle.innerHTML = `YOUR SCORE: <span style="color:#ffd54a;font-weight:bold">${this.score}</span><br>HIGH SCORE: ${this.highScore}`;
    startBtn.textContent = 'REPLAY';
    legend.style.display = 'none';
  }

  _resetOverlayUI() {
    const title = this.overlayEl.querySelector('.title');
    const subtitle = this.overlayEl.querySelector('.subtitle');
    const legend = this.overlayEl.querySelector('.legend');
    const startBtn = this.startBtn;

    title.textContent = 'COSMIC FEAST';
    title.style.color = '';
    subtitle.innerHTML = 'A pixel-art shmup feast';
    startBtn.textContent = 'START';
    legend.style.display = '';
  }

  _onStartPressed() {
    this.audio.resume();
    this._resetRun();
    this._resetOverlayUI();
    this.overlayEl.classList.add('hidden');
    this.touchEl.classList.remove('hidden');
    this.state = STATE.WAVE_INTRO;
    this.introTimer = 1.6;
    this.audio.startMusic(this.stageIndex);
  }

  _resetRun() {
    this.score = 0;
    this.energy = ENERGY.start;
    this.combo = 1;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.waveNo = 1;
    this.cycle = 0;
    this.stageIndex = 0;
    this.stage = STAGES[0];
    this.starfield.setStage(this.stageIndex, this.cycle);
    this.bullets.length = 0;
    this.player.reset();
    this.wave = new Wave(this.stageIndex, this.cycle);
    this.ui.displayedScore = 0;
    this.ui.announceStage(this.stage.name);
  }

  _nextStage() {
    this.waveNo += 1;
    const next = this.stageIndex + 1;
    if (next >= STAGES.length) {
      this.cycle += 1;
      this.stageIndex = 0;
    } else {
      this.stageIndex = next;
    }
    this.stage = STAGES[this.stageIndex];
    this.starfield.setStage(this.stageIndex, this.cycle);
    this.wave = new Wave(this.stageIndex, this.cycle);
    this.energy = ENERGY.start;
    this.ui.announceStage(this.stage.name);
    this.audio.startMusic(this.stageIndex);
  }

  _spawnWave() {
    this.wave = new Wave(this.stageIndex, this.cycle);
  }

  _onEnemyKilled(e) {
    this.fx.explosion(e.x, e.y);
    this.audio.explode();
    this.fx.triggerShake(3, 0.1);
    const points = SCORE.enemy * this.combo;
    this.score += points;
    this.ui.displayedScore = Math.max(this.ui.displayedScore, this.score - 50);
    this.comboCount += 1;
    this.comboTimer = SCORE.comboWindow;
    if (this.comboCount % 4 === 0 && this.combo < SCORE.comboMax) {
      this.combo += 1;
      this.ui.comboPulse = 1;
      this.audio.powerUp();
    }
  }

  _onPlayerHit(by) {
    const lost = this.player.takeHit();
    if (lost) {
      this.fx.explosion(this.player.x, this.player.y);
      this.fx.triggerFlash(0.7, '#ff4d4d');
      this.fx.triggerShake(20, 0.3);
      this.audio.hit();
      this.combo = 1;
      this.comboCount = 0;
      this.energy = Math.max(this.energy, ENERGY.start * 0.5);
      this.bullets.length = 0;
    }
  }

  _onOutOfEnergy() {
    const lost = this.player.outOfEnergy();
    if (lost) {
      this.fx.explosion(this.player.x, this.player.y);
      this.fx.triggerFlash(0.7, '#ff8a3d');
      this.fx.triggerShake(16, 0.25);
      this.audio.hit();
      this.energy = ENERGY.start;
    }
  }

  _checkCollisions() {
    // Player bullets vs enemies
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (b.dead || !b.fromPlayer) continue;
      const bb = b.bounds;
      for (let j = 0; j < this.wave.enemies.length; j++) {
        const e = this.wave.enemies[j];
        if (e.dead) continue;
        if (rectsOverlap(bb, e.bounds)) {
          b.dead = true;
          e.dead = true;
          this._onEnemyKilled(e);
          break;
        }
      }
    }
    // Enemy bullets vs player
    if (!this.player.dead) {
      const pb = this.player.bounds;
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        if (b.dead || b.fromPlayer) continue;
        if (rectsOverlap(pb, b.bounds)) {
          b.dead = true;
          this._onPlayerHit('bullet');
          break;
        }
      }
    }
    // Enemy contact vs player
    if (!this.player.dead) {
      const pb = this.player.bounds;
      for (let j = 0; j < this.wave.enemies.length; j++) {
        const e = this.wave.enemies[j];
        if (e.dead) continue;
        if (rectsOverlap(pb, e.bounds)) {
          e.dead = true;
          this.fx.explosion(e.x, e.y);
          this.audio.explode();
          this._onPlayerHit('contact');
          break;
        }
      }
    }
    // Enemies reaching bottom
    if (this.wave.reachedBottom()) {
      this.player.lives = -1;
      this.player.dead = true;
    }
  }

  _updateCombo(dt) {
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
        this.comboCount = 0;
      }
    }
  }

  _updatePlay(dt) {
    this.player.update(dt, this.input);
    if (this.player.fireHeld) {
      const fired = this.player.tryFire(this.bullets);
      if (fired) this.audio.shoot();
    }
    this.wave.update(dt);
    const enemyFired = this.wave.tryFire(this.bullets);
    if (enemyFired) this.audio.enemyShoot();
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].update(dt, PLAY_TOP, PLAY_BOTTOM);
      if (this.bullets[i].dead) {
        const b = this.bullets[i];
        if (!b.fromPlayer && b.owner && this.wave) {
          this.wave.usedFireSlots.delete(b.owner);
        }
        this.bullets.splice(i, 1);
      }
    }
    this._checkCollisions();
    this.energy = Math.max(0, this.energy - ENERGY.drain * dt);
    this._updateCombo(dt);

    if (this.energy <= 0 && !this.player.dead) {
      this._onOutOfEnergy();
    }

    if (this.wave.completed && this.wave.aliveCount() === 0) {
      this.energy = Math.min(ENERGY.start, this.energy + ENERGY.refuelOnWave);
      this.state = STATE.WAVE_CLEAR;
      this.waveClearTimer = 1.4;
      this.audio.waveClear();
      this.fx.triggerFlash(0.3, '#4dffff');
    }

    if (this.player.dead && this.player.lives < 0) {
      this.state = STATE.GAME_OVER;
      this.gameOverTimer = 0;
      this.audio.gameOver();
      this.audio.stopMusic();
      if (this.score > this.highScore) {
        this.highScore = this.score;
        saveHighScore(this.highScore);
      }
    }
  }

  _onTouchStart() {
    if (this.state === STATE.MENU || this.state === STATE.GAME_OVER) {
      this._onStartPressed();
    }
  }

  update(dt) {
    this.fx.update(dt);
    this.starfield.update(dt);
    this.ui.update(dt, this);

    switch (this.state) {
      case STATE.MENU:
        // do nothing
        break;
      case STATE.WAVE_INTRO:
        this.introTimer -= dt;
        if (this.introTimer <= 0) this.state = STATE.PLAY;
        break;
      case STATE.PLAY:
        this._updatePlay(dt);
        break;
      case STATE.WAVE_CLEAR:
        this.waveClearTimer -= dt;
        this.bullets.length = 0;
        if (this.waveClearTimer <= 0) {
          this._nextStage();
          this.state = STATE.WAVE_INTRO;
          this.introTimer = 1.6;
        }
        break;
      case STATE.PAUSED:
        break;
      case STATE.GAME_OVER:
        this.gameOverTimer += dt;
        this.bullets.length = 0;
        if (this.gameOverTimer > 1.2 && this.overlayEl.classList.contains('hidden')) {
          this._showGameOverOverlay();
        }
        if (this.gameOverTimer > 1.2) {
          if (this.input.consumeJustPressed('start') || this.input.consumeJustPressed('fire')) {
            this._resetRun();
            this._resetOverlayUI();
            this.overlayEl.classList.add('hidden');
            this.state = STATE.WAVE_INTRO;
            this.introTimer = 1.6;
            this.audio.startMusic(this.stageIndex);
          }
        }
        break;
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);
    this.starfield.draw(ctx);

    if (!this.wave) return;

    const t = this.fx.applyShake(ctx);
    ctx.strokeStyle = 'rgba(77,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, PLAY_TOP + 1, W - 2, PLAY_BOTTOM - PLAY_TOP - 2);

    if (this.state === STATE.PLAY || this.state === STATE.WAVE_INTRO || this.state === STATE.WAVE_CLEAR) {
      this.wave.draw(ctx);
      for (let i = 0; i < this.bullets.length; i++) this.bullets[i].draw(ctx);
      this.player.draw(ctx);
    }
    this.fx.drawParticles(ctx);
    this.fx.releaseShake(ctx);
    this.fx.drawFlash(ctx, W, H);

    this.ui.drawTop(ctx, this);
    this.ui.drawBottom(ctx, this);
    this.ui.drawStageAnnounce(ctx);

    if (this.state === STATE.PAUSED) {
      ctx.fillStyle = 'rgba(5,2,26,0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = COLORS.ui;
      ctx.font = '28px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PAUSED', W / 2, H / 2 - 12);
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillStyle = COLORS.textDim;
      ctx.fillText('PRESS P / ESC TO RESUME', W / 2, H / 2 + 24);
    }

    if (this.state === STATE.GAME_OVER) {
      ctx.fillStyle = 'rgba(5,2,26,0.78)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '32px "Press Start 2P", monospace';
      ctx.fillStyle = COLORS.playerEdge;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GAME OVER', W / 2, H / 2 - 60);
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillStyle = COLORS.text;
      ctx.fillText(`SCORE  ${this.score.toString().padStart(6, '0')}`, W / 2, H / 2);
      ctx.fillStyle = COLORS.uiAccent;
      ctx.fillText(`HIGH  ${this.highScore.toString().padStart(6, '0')}`, W / 2, H / 2 + 28);
      if (this.gameOverTimer > 1.2) {
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = COLORS.textDim;
        const blink = Math.floor(performance.now() / 500) % 2 === 0;
        if (blink) ctx.fillText('PRESS FIRE / ENTER', W / 2, H / 2 + 80);
      }
    }
  }
}
