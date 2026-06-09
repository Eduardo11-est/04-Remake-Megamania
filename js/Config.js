// Game-wide configuration constants
export const W = 640;
export const H = 960;

export const HUD_TOP = 52;
export const HUD_BOTTOM = 48;
export const PLAY_TOP = HUD_TOP;
export const PLAY_BOTTOM = H - HUD_BOTTOM;
export const PLAY_W = W;
export const PLAY_H = PLAY_BOTTOM - PLAY_TOP;

export const PLAYER = {
  w: 36, h: 32,
  y: PLAY_BOTTOM - 72,
  speed: 260,
  fireCooldown: 0.22,
  bulletSpeed: 720,
  lives: 3,
  invuln: 1.6,
};

export const BULLET = {
  w: 4, h: 16,
  enemyW: 6, enemyH: 14,
};

export const ENEMY = {
  w: 44, h: 44,
  cols: 6,
  rows: 4, // Start with 4 rows to make progression feel smoother
  startY: -40,
  descendStep: 16,
  baseSpeed: 70,
  fireInterval: [1.6, 3.4],
  zigzagAmplitude: 36,
  zigzagFreq: 1.4,
};

export const ENERGY = {
  start: 100,
  drain: 4.0,
  refuelOnWave: 100,
  low: 30,
};

export const STAGES = [
  { id: 'burger',  name: 'BURGERS',   bg: '#0e0220', star1: '#3b1c66', star2: '#1a0a3d' },
  { id: 'cookie',  name: 'COOKIES',   bg: '#0a1410', star1: '#1a4030', star2: '#0a2018' },
  { id: 'iron',    name: 'IRONS',     bg: '#0a0a18', star1: '#1c1c44', star2: '#0a0a20' },
  { id: 'bowtie',  name: 'BOW TIES',  bg: '#18041a', star1: '#5a1854', star2: '#220a30' },
  { id: 'diamond', name: 'DIAMONDS',  bg: '#041a26', star1: '#125576', star2: '#082a40' },
];

export const SCORE = {
  enemy: 50,
  comboWindow: 1.6,
  comboStep: 25,
  comboMax: 8,
};

export const COLORS = {
  bg: '#000000',
  text: '#ffffff',
  textDim: '#bba8ff',
  player: '#ffd54a',
  playerEdge: '#ff8a3d',
  bullet: '#4dffff',
  bulletGlow: '#a4ffff',
  enemyBullet: '#ff4dd2',
  enemyBulletGlow: '#ffb4ec',
  ui: '#ff4dd2',
  uiAccent: '#4dffff',
  energyHigh: '#4dffb0',
  energyMid: '#ffd54a',
  energyLow: '#ff4d4d',
};
