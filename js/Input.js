// Input system: keyboard + touch with normalized state
import { isTouchDevice } from './Device.js';

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.state = {
      left: false,
      right: false,
      fire: false,
      start: false,
      pause: false,
      mute: false,
    };
    this.justPressed = new Set();
    this._kd = (e) => this._onKeyDown(e);
    this._ku = (e) => this._onKeyUp(e);
    window.addEventListener('keydown', this._kd);
    window.addEventListener('keyup', this._ku);

    this.touch = { left: false, right: false, fire: false };
    this._touchHandlers = [];
    if (isTouchDevice()) {
      this._wireTouch();
    }
  }

  _onKeyDown(e) {
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') this._set('left', true);
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') this._set('right', true);
    else if (k === ' ' || k === 'Spacebar' || k === 'z' || k === 'Z' || k === 'x' || k === 'X' || k === 'j' || k === 'J' || k === 'k' || k === 'K') this._set('fire', true);
    else if (k === 'p' || k === 'P' || k === 'Escape') this._set('pause', true);
    else if (k === 'm' || k === 'M') this._set('mute', true);
    else if (k === 'Enter') this._set('start', true);

    if (['ArrowLeft', 'ArrowRight', ' ', 'Spacebar'].includes(k)) e.preventDefault();
  }

  _onKeyUp(e) {
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') this._set('left', false);
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') this._set('right', false);
    else if (k === ' ' || k === 'Spacebar' || k === 'z' || k === 'Z' || k === 'x' || k === 'X' || k === 'j' || k === 'J' || k === 'k' || k === 'K') this._set('fire', false);
  }

  _set(name, value) {
    if (this.state[name] !== value) {
      if (value) this.justPressed.add(name);
      this.state[name] = value;
    }
  }

  _wireTouch() {
    const map = { left: 'left', right: 'right', fire: 'fire' };
    const btns = document.querySelectorAll('#touch .tbtn');
    btns.forEach((b) => {
      const act = b.dataset.act;
      if (!act || !map[act]) return;
      const key = map[act];
      const onDown = (e) => {
        e.preventDefault();
        this.touch[key] = true;
        this._set(key, true);
        b.classList.add('active');
      };
      const onUp = (e) => {
        e.preventDefault();
        this.touch[key] = false;
        this._set(key, false);
        b.classList.remove('active');
      };
      b.addEventListener('pointerdown', onDown);
      b.addEventListener('pointerup', onUp);
      b.addEventListener('pointercancel', onUp);
      b.addEventListener('pointerleave', onUp);
      this._touchHandlers.push({ b, onDown, onUp });
    });

    // Swipe area on the canvas itself as a fallback
    let lastX = null;
    let dragging = false;
    const onPointerDown = (e) => {
      if (e.target.closest('#touch')) return;
      dragging = true;
      lastX = e.clientX;
      this.touch.fire = true;
      this._set('fire', true);
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      if (Math.abs(dx) > 8) {
        if (dx < 0) { this.touch.left = true; this.touch.right = false; this._set('left', true); this._set('right', false); }
        else { this.touch.right = true; this.touch.left = false; this._set('right', true); this._set('left', false); }
        lastX = e.clientX;
      }
    };
    const onPointerUp = () => {
      dragging = false;
      this.touch.left = false;
      this.touch.right = false;
      this.touch.fire = false;
      this._set('left', false);
      this._set('right', false);
      this._set('fire', false);
    };
    this.canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  axisX() {
    return (this.state.right ? 1 : 0) - (this.state.left ? 1 : 0);
  }

  consumeJustPressed(name) {
    if (this.justPressed.has(name)) {
      this.justPressed.delete(name);
      return true;
    }
    return false;
  }

  endFrame() {
    this.justPressed.clear();
  }

  destroy() {
    window.removeEventListener('keydown', this._kd);
    window.removeEventListener('keyup', this._ku);
  }
}
