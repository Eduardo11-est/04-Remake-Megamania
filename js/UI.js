// HUD: score, lives, stage, energy bar
import { W, H, HUD_TOP, HUD_BOTTOM, ENERGY, SCORE, COLORS, STAGES } from './Config.js';
import { formatScore, easeOutQuad } from './Utils.js';

export class UI {
  constructor() {
    this.displayedScore = 0;
    this.comboPulse = 0;
    this.stageAnnounce = 0;
    this.stageAnnounceText = '';
  }

  update(dt, game) {
    const target = game.score;
    this.displayedScore += (target - this.displayedScore) * Math.min(1, dt * 8);
    if (this.comboPulse > 0) this.comboPulse = Math.max(0, this.comboPulse - dt);
    if (this.stageAnnounce > 0) this.stageAnnounce = Math.max(0, this.stageAnnounce - dt);
  }

  announceStage(text) {
    this.stageAnnounce = 2.2;
    this.stageAnnounceText = text;
  }

  drawTop(ctx, game) {
    ctx.fillStyle = '#0b0420';
    ctx.fillRect(0, 0, W, HUD_TOP);
    ctx.fillStyle = '#1d0e3a';
    ctx.fillRect(0, HUD_TOP - 2, W, 2);
    ctx.fillStyle = COLORS.text;
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textBaseline = 'middle';

    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText('SCORE', 12, 16);
    ctx.fillStyle = COLORS.text;
    ctx.fillText(formatScore(Math.round(this.displayedScore)), 12, 36);

    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.uiAccent;
    ctx.fillText(game.stage ? game.stage.name : '', W / 2, 16);
    ctx.fillStyle = COLORS.textDim;
    const cycleTxt = game.wave ? `WAVE ${game.waveNo}  ·  CYCLE ${game.cycle + 1}` : '';
    ctx.fillText(cycleTxt, W / 2, 36);

    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText('LIVES', W - 12, 16);
    this.drawLives(ctx, W - 12, 36, game.player ? Math.max(0, game.player.lives) : 0);
  }

  drawLives(ctx, x, y, n) {
    let i = 0;
    for (; i < n; i++) {
      ctx.fillStyle = COLORS.player;
      ctx.fillRect(x - 8 - i * 20, y - 6, 12, 12);
      ctx.fillStyle = COLORS.playerEdge;
      ctx.fillRect(x - 8 - i * 20 + 2, y - 4, 2, 8);
    }
  }

  drawBottom(ctx, game) {
    const y = H - HUD_BOTTOM;
    ctx.fillStyle = '#0b0420';
    ctx.fillRect(0, y, W, HUD_BOTTOM);
    ctx.fillStyle = '#1d0e3a';
    ctx.fillRect(0, y, W, 2);

    const e = game.energy;
    const barX = 16, barY = y + 12, barW = W - 32, barH = 16;
    ctx.fillStyle = '#000000';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#1d0e3a';
    ctx.fillRect(barX, barY, barW, 2);
    ctx.fillRect(barX, barY + barH - 2, barW, 2);

    const ratio = Math.max(0, Math.min(1, e / ENERGY.start));
    const fillW = Math.round((barW - 4) * ratio);
    if (fillW > 0) {
      let color = COLORS.energyHigh;
      if (ratio < 0.3) color = COLORS.energyLow;
      else if (ratio < 0.6) color = COLORS.energyMid;
      ctx.fillStyle = color;
      ctx.fillRect(barX + 2, barY + 2, fillW, barH - 4);
      if (ratio < 0.3 && Math.floor(performance.now() / 200) % 2 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(barX + 2, barY + 2, fillW, 2);
      }
    }

    ctx.strokeStyle = COLORS.ui;
    ctx.lineWidth = 2;
    ctx.strokeRect(barX + 1, barY + 1, barW - 2, barH - 2);

    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = COLORS.textDim;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('FUEL', barX, y + barH + 16);
    ctx.textAlign = 'right';
    if (game.combo > 1) {
      const scale = 1 + easeOutQuad(this.comboPulse) * 0.4;
      ctx.save();
      ctx.translate(W - barX, y + barH + 16);
      ctx.scale(scale, scale);
      ctx.textAlign = 'right';
      ctx.fillStyle = COLORS.uiAccent;
      ctx.fillText(`x${game.combo}`, 0, 0);
      ctx.restore();
    } else {
      ctx.fillStyle = COLORS.textDim;
      ctx.fillText(`${Math.round(e)}%`, W - barX, y + barH + 16);
    }
  }

  drawStageAnnounce(ctx) {
    if (this.stageAnnounce <= 0) return;
    const t = this.stageAnnounce;
    const total = 2.2;
    const fadeIn = 0.25, fadeOut = 0.5;
    let alpha = 1;
    if (t > total - fadeIn) alpha = (total - t) / fadeIn;
    else if (t < fadeOut) alpha = t / fadeOut;
    alpha = Math.max(0, Math.min(1, alpha));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, H / 2 - 56, W, 112);
    ctx.fillStyle = COLORS.uiAccent;
    ctx.fillRect(0, H / 2 - 56, W, 4);
    ctx.fillRect(0, H / 2 + 52, W, 4);
    ctx.font = '28px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORS.text;
    ctx.fillText(this.stageAnnounceText, W / 2, H / 2 - 12);
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText('STAGE INCOMING', W / 2, H / 2 + 24);
    ctx.restore();
  }
}
