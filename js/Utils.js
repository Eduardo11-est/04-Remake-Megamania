// Generic math / utility helpers

export const TAU = Math.PI * 2;

export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

export const lerp = (a, b, t) => a + (b - a) * t;

export const rand = (a, b) => a + Math.random() * (b - a);

export const randInt = (a, b) => Math.floor(rand(a, b + 1));

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const sign = (v) => v < 0 ? -1 : v > 0 ? 1 : 0;

export const rectsOverlap = (a, b) =>
  a.x < b.x + b.w &&
  a.x + a.w > b.x &&
  a.y < b.y + b.h &&
  a.y + a.h > b.y;

export const aabb = (x, y, w, h) => ({ x, y, w, h });

export const dist2 = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
};

export const formatScore = (n) => n.toString().padStart(6, '0');

export const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);

export const easeInQuad = (t) => t * t;

export const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
