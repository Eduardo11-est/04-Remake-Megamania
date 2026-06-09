// Scrolling starfield background with per-stage tint
import { rand } from './Utils.js';
import { STAGES, W, H } from './Config.js';

export class Starfield {
  constructor() {
    this.layers = [];
    for (let i = 0; i < 3; i++) {
      const count = 24 + i * 18;
      const stars = new Array(count).fill(0).map(() => ({
        x: Math.random() * W,
        y: Math.random() * H,
        s: i === 0 ? 2 : (i === 1 ? 2 : 4),
        c: i === 0 ? '#3a2a6a' : (i === 1 ? '#7a5cc8' : '#cdb5ff'),
      }));
      this.layers.push({ stars, speed: 12 + i * 16, tw: Math.random() * Math.PI * 2 });
    }
    this.stageIndex = 0;
    this.cycle = 0;
  }

  setStage(stageIndex, cycle) {
    this.stageIndex = stageIndex;
    this.cycle = cycle;
  }

  update(dt) {
    for (let l = 0; l < this.layers.length; l++) {
      const layer = this.layers[l];
      const s = layer.speed * dt;
      for (let i = 0; i < layer.stars.length; i++) {
        const st = layer.stars[i];
        st.y += s;
        if (st.y > H) { st.y = -4; st.x = Math.random() * W; }
      }
    }
  }

  draw(ctx) {
    const stage = STAGES[this.stageIndex] || STAGES[0];
    ctx.fillStyle = stage.bg;
    ctx.fillRect(0, 0, W, H);
    // Subtle nebula gradient
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, stage.star1);
    g.addColorStop(1, stage.star2);
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    for (let l = 0; l < this.layers.length; l++) {
      const layer = this.layers[l];
      const tw = (Math.sin((this.layers[l].tw += 0.02) * 2 + l) + 1) * 0.5;
      for (let i = 0; i < layer.stars.length; i++) {
        const st = layer.stars[i];
        ctx.fillStyle = st.c;
        if (l === 2) ctx.globalAlpha = 0.5 + tw * 0.5;
        ctx.fillRect(Math.round(st.x), Math.round(st.y), st.s, st.s);
        ctx.globalAlpha = 1;
      }
    }
  }
}
