// Procedural pixel-art sprites. Each sprite is a 2D grid of characters;
// '.' = transparent, anything else is looked up in a per-sprite palette.
// Rendering is done with filled rectangles aligned to integer pixels.

function parseSprite(lines, palette) {
  const w = lines[0].length;
  const h = lines.length;
  const pixels = [];
  for (let y = 0; y < h; y++) {
    const row = lines[y] || '';
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch === undefined || ch === '.' || ch === ' ') continue;
      const c = palette[ch];
      if (!c) continue;
      pixels.push([x, y, c]);
    }
  }
  return { w, h, pixels };
}

// ─── PLAYER SHIP ───────────────────────────────────────────────
// A bold, wide spaceship: golden body, orange wings, cyan cockpit, red engines
const playerPalette = {
  a: '#ffd54a', // gold body
  b: '#ff8a3d', // orange wings
  c: '#4dd0ff', // cyan cockpit
  d: '#b07010', // dark outline
  e: '#ffffff', // white highlight
  f: '#ff4d4d', // red engine glow
  g: '#cc3a3a', // dark engine
};

// ─── BURGER ────────────────────────────────────────────────────
const burgerPalette = {
  B: '#8a2a10', // bun dark
  T: '#c08040', // bun top
  C: '#ffd54a', // cheese
  L: '#5ec84a', // lettuce
  M: '#c54a2a', // meat/tomato
  S: '#fff2c0', // sesame seed
};

// ─── COOKIE ────────────────────────────────────────────────────
const cookiePalette = {
  D: '#7a4828', // dough
  K: '#c08850', // light dough
  C: '#3a1808', // chocolate chip
};

// ─── IRON ──────────────────────────────────────────────────────
const ironPalette = {
  M: '#9aa8b8', // metal body
  D: '#5a6878', // dark metal
  H: '#2a2a30', // handle
  R: '#d94030', // red indicator
  W: '#c8d0d8', // white highlight
};

// ─── BOW TIE ───────────────────────────────────────────────────
const bowtiePalette = {
  P: '#c84ad0', // purple fabric
  D: '#5a1854', // dark fabric
  G: '#ffd54a', // gold center knot
  L: '#e070e8', // light purple
};

// ─── DIAMOND ───────────────────────────────────────────────────
const diamondPalette = {
  C: '#4dffff', // cyan facet
  D: '#1a78a8', // dark facet
  W: '#ffffff', // white sparkle
  B: '#0a3a58', // deep blue base
};

export const SPRITES = {
  // ── Player: 16×14 wide aggressive spaceship ──
  player: parseSprite([
    '......deeed.....',
    '.....dacccd.....',
    '....daaeccad....',
    '...daaaeaaad....',
    '..daaaaaaaaaad..',
    '.dbaaaaaaaaaabd.',
    'dbbaaaaaaaaaabd.',
    'dbbaaaaaaaaabbd.',
    'dbbbaaaaaabbbd..',
    '.dbbbbbbbbbbbd..',
    '..ddddddddddd..',
    '..df..d..d..fd..',
    '..df..d..d..fd..',
    '..dg........gd..',
  ], playerPalette),

  // ── Burger: 16×14 juicy hamburger ──
  burger: parseSprite([
    '....BBBBBBBB....',
    '..BBTSSTTSSTBB..',
    '.BTTTTTTTTTTTTB.',
    'BTTTTTTTTTTTTTTB',
    'BLLLLLLLLLLLLLLB',
    'BLLLLLLLLLLLLLBB',
    'BCCCCCCCCCCCCCCB',
    'BCCCCCCCCCCCCCBB',
    'BMMMMMMMMMMMMMMB',
    'BMMMMMMMMMMMMMMB',
    'BLLLLLLLLLLLLLLB',
    'BTTTTTTTTTTTTTBB',
    '.BTTTTTTTTTTTTB.',
    '..BBBBBBBBBBBB..',
  ], burgerPalette),

  // ── Cookie: 16×12 round cookie with chocolate chips ──
  cookie: parseSprite([
    '....DDDDDDDD....',
    '..DDKKKKKKKKDD..',
    '.DKKKCDKKCDKKKD.',
    'DKKKCCKKCCKKKKKD',
    'DKKCCKKKKKCCKKKD',
    'DKCCKKKKKKCCKKKD',
    'DKKKCKKCCKKKKKD.',
    'DKKKCCKKCCKKKKKD',
    'DKKKKKKKKKKKKKD.',
    '.DKKKCDKKCDKKD..',
    '..DDKKKKKKKKDD..',
    '....DDDDDDDD....',
  ], cookiePalette),

  // ── Iron: 16×14 steam iron ──
  iron: parseSprite([
    '....HHHHHHHH....',
    '...HHHHHHHHHHH..',
    '..HMMMMMMMMMMMH.',
    '..HMWWMMMMWWMMH.',
    '.HMMMMMMMMMMMMMH',
    '.HMMMRRRRRRMMMH.',
    'HMMMMMMMMMMMMMMH',
    'HDDDDDDDDDDDDDH',
    '.HDDMMMMMMMDDH.',
    '..HDMMMMMMMMDH..',
    '...HMMMMMMMMH...',
    '...HMMMMMMMMH...',
    '....HDDDDDDH....',
    '.....HHHHHH.....',
  ], ironPalette),

  // ── Bow Tie: 16×12 colorful bow tie ──
  bowtie: parseSprite([
    'DD............DD',
    'DPD..........DPD',
    'DPPD........DPPD',
    'DPPPD.GGGG.DPPPD',
    'DPPPPGGGGGGPPPLD',
    'DPPPGGGGGGGPPPPD',
    'DPPPGGGGGGGPPPPD',
    'DPPPPGGGGGGPPPLD',
    'DPPPD.GGGG.DPPPD',
    'DPPD........DPPD',
    'DPD..........DPD',
    'DD............DD',
  ], bowtiePalette),

  // ── Diamond: 16×12 shining gem ──
  diamond: parseSprite([
    '......DDDD......',
    '.....DWWWWD.....',
    '....DWCCCWDD....',
    '...DDCCCCCDDD...',
    '..DDCCCCCCCDD...',
    '.DDCCCCCCCCCCDD.',
    '.DBCCCCCCCCCCBD.',
    '..DBCCCCCCCCBD..',
    '...DBCCCCCCBD...',
    '....DBCCCCBD....',
    '.....DBBBD......',
    '......DDD.......',
  ], diamondPalette),
};

export function getEnemySprite(stageId) {
  return SPRITES[stageId] || SPRITES.burger;
}

export const EXPLOSION_FRAMES = [
  [
    '...aa...',
    '..abba..',
    '.abccba.',
    'abcddcba',
    'abcddcba',
    '.abccba.',
    '..abba..',
    '...aa...',
  ],
  [
    '..f.f.f.',
    '.f..f..f',
    '..f.a.f.',
    'f.afaf.f',
    '.f.a.f..',
    '..f.f.f.',
    '.f..f..f',
    '..f.f.f.',
  ],
  [
    '..f..f..',
    '.f.ff.f.',
    '..fff...',
    '.f.ff.f.',
    '..f..f..',
  ],
].map((lines) => parseSprite(lines, {
  a: '#ffd54a', b: '#ff8a3d', c: '#ffffff', d: '#ffeeaa', f: '#ff4d4d',
}));

export function drawSprite(ctx, sprite, x, y, scale = 1, flipX = false) {
  const px = Math.round(x);
  const py = Math.round(y);
  for (let i = 0; i < sprite.pixels.length; i++) {
    const [sx, sy, color] = sprite.pixels[i];
    const dx = flipX ? (sprite.w - 1 - sx) : sx;
    ctx.fillStyle = color;
    ctx.fillRect(px + dx * scale, py + sy * scale, scale, scale);
  }
}

export function drawSpriteCentered(ctx, sprite, cx, cy, scale = 1) {
  const w = sprite.w * scale;
  const h = sprite.h * scale;
  drawSprite(ctx, sprite, cx - w / 2, cy - h / 2, scale);
}
