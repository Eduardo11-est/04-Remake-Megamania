// Entry point: bootstraps audio, game, and main loop
import { Game } from './Game.js';
import { Audio } from './Audio.js';
import { isTouchDevice } from './Device.js';

const canvas = document.getElementById('game');
const audio = new Audio();
const game = new Game(canvas, audio);

if (isTouchDevice()) {
  document.getElementById('touch').classList.remove('hidden');
}

const FIXED_DT = 1 / 60;
const MAX_FRAME_DT = 1 / 15;
let last = performance.now();
let acc = 0;

function frame(now) {
  let dt = (now - last) / 1000;
  last = now;
  if (dt > MAX_FRAME_DT) dt = MAX_FRAME_DT;
  acc += dt;
  let steps = 0;
  while (acc >= FIXED_DT && steps < 5) {
    game.update(FIXED_DT);
    acc -= FIXED_DT;
    steps += 1;
  }
  game.input.endFrame();
  game.draw();
  requestAnimationFrame(frame);
}

requestAnimationFrame((t) => { last = t; frame(t); });

// Make sure the overlay click restarts on game over
const overlay = document.getElementById('overlay');
overlay.addEventListener('click', (e) => {
  if (e.target.id === 'overlay' || e.target.id === 'start' || e.target.closest('#start')) {
    document.getElementById('start').click();
  }
});

// Prevent default touch behaviors on the canvas
['contextmenu', 'gesturestart'].forEach((ev) => {
  canvas.addEventListener(ev, (e) => e.preventDefault());
});
