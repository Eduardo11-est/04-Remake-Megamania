// Persistent storage for high score
const KEY = 'cosmic_feast_hi_v1';

export function loadHighScore() {
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(n) {
  try {
    localStorage.setItem(KEY, String(n | 0));
  } catch {
    /* ignore */
  }
}
