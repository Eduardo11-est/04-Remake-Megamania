// Procedural retro sound effects via Web Audio API (no external assets)
export class Audio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.musicNodes = null;
    this._musicTimer = null;
    this._step = 0;
  }

  _ensure() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.ctx.destination);
  }

  resume() {
    this._ensure();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.5;
    if (m) this.stopMusic();
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  _env(node, attack, decay, sustain, release, peak = 0.4) {
    const t = this.ctx.currentTime;
    const g = node.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(0, t);
    g.linearRampToValueAtTime(peak, t + attack);
    g.exponentialRampToValueAtTime(Math.max(0.0001, peak * sustain), t + attack + decay);
    g.exponentialRampToValueAtTime(0.0001, t + attack + decay + release);
  }

  shoot() {
    this._ensure();
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(880, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.08);
    this._env(g, 0.001, 0.05, 0.0, 0.05, 0.18);
    o.connect(g).connect(this.master);
    o.start();
    o.stop(this.ctx.currentTime + 0.18);
  }

  enemyShoot() {
    this._ensure();
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(160, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.18);
    this._env(g, 0.005, 0.1, 0.0, 0.05, 0.10);
    o.connect(g).connect(this.master);
    o.start();
    o.stop(this.ctx.currentTime + 0.22);
  }

  explode() {
    this._ensure();
    if (!this.ctx) return;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.3, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.7;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(2000, this.ctx.currentTime);
    f.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.3);
    const g = this.ctx.createGain();
    this._env(g, 0.001, 0.1, 0.1, 0.18, 0.45);
    src.connect(f).connect(g).connect(this.master);
    src.start();
    src.stop(this.ctx.currentTime + 0.32);
  }

  hit() {
    this._ensure();
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(220, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.15);
    this._env(g, 0.001, 0.1, 0.0, 0.05, 0.25);
    o.connect(g).connect(this.master);
    o.start();
    o.stop(this.ctx.currentTime + 0.2);
  }

  waveClear() {
    this._ensure();
    if (!this.ctx) return;
    const notes = [392, 523, 659, 784];
    notes.forEach((f, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.08);
      this._env(g, 0.001, 0.08, 0.0, 0.06, 0.18);
      o.connect(g).connect(this.master);
      o.start(this.ctx.currentTime + i * 0.08);
      o.stop(this.ctx.currentTime + i * 0.08 + 0.18);
    });
  }

  powerUp() {
    this._ensure();
    if (!this.ctx) return;
    const notes = [523, 659, 784, 1046, 1318];
    notes.forEach((f, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.05);
      this._env(g, 0.001, 0.06, 0.0, 0.06, 0.22);
      o.connect(g).connect(this.master);
      o.start(this.ctx.currentTime + i * 0.05);
      o.stop(this.ctx.currentTime + i * 0.05 + 0.18);
    });
  }

  gameOver() {
    this._ensure();
    if (!this.ctx) return;
    const notes = [392, 330, 294, 220];
    notes.forEach((f, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.18);
      this._env(g, 0.01, 0.15, 0.0, 0.08, 0.25);
      o.connect(g).connect(this.master);
      o.start(this.ctx.currentTime + i * 0.18);
      o.stop(this.ctx.currentTime + i * 0.18 + 0.28);
    });
  }

  startMusic(stageIndex = 0) {
    this._ensure();
    if (!this.ctx) return;
    this.stopMusic();
    const root = [220, 196, 247, 196, 220][stageIndex % 5];
    const bpm = 132 + stageIndex * 6;
    const stepDur = 60 / bpm / 2;
    const scale = [0, 3, 5, 7, 10];
    let step = 0;
    const tick = () => {
      if (this.muted) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = step % 4 === 0 ? 'square' : 'triangle';
      const deg = scale[step % scale.length];
      const oct = step % 8 < 4 ? 0 : 1;
      o.frequency.value = root * Math.pow(2, deg / 12) * Math.pow(2, oct);
      this._env(g, 0.001, stepDur * 0.4, 0.0, stepDur * 0.4, 0.10);
      o.connect(g).connect(this.master);
      o.start();
      o.stop(this.ctx.currentTime + stepDur * 1.1);

      if (step % 2 === 0) {
        const o2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        o2.type = 'triangle';
        o2.frequency.value = root * 0.5;
        this._env(g2, 0.001, stepDur * 0.5, 0.0, stepDur * 0.4, 0.08);
        o2.connect(g2).connect(this.master);
        o2.start();
        o2.stop(this.ctx.currentTime + stepDur * 1.1);
      }
      step++;
    };
    this._musicTimer = setInterval(tick, stepDur * 1000);
    this.musicNodes = { tick, step };
  }

  stopMusic() {
    if (this._musicTimer) {
      clearInterval(this._musicTimer);
      this._musicTimer = null;
    }
    this.musicNodes = null;
  }
}
