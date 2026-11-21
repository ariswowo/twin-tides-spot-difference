// Keyboard and mouse input, in logical (1280x720) coordinates.
// Mouse: click a panel. Keyboard: arrow keys move the crosshair, Enter/Space
// clicks where it points, H hints, R restarts, M mutes, P pauses, 1-3 jump
// to a level, Esc goes back to the title.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_RESTART = 8;
export const ACTION_MUTE = 16;
export const ACTION_TITLE = 32;

export function createInput(canvas, toLogical) {
  let actions = 0;
  let click = null;
  let mouse = null;
  const keys = new Set();
  const cursor = { x: 640, y: 360 };
  const CURSOR_SPEED = 520; // logical pixels per second

  function logicalFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return toLogical(event.clientX - rect.left, event.clientY - rect.top);
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    click = logicalFromEvent(event);
    mouse = click;
    cursor.x = click.x;
    cursor.y = click.y;
  });
  canvas.addEventListener('pointermove', (event) => {
    mouse = logicalFromEvent(event);
    cursor.x = mouse.x;
    cursor.y = mouse.y;
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    keys.add(event.key);
    if (event.key === 'Enter' || event.key === ' ') { actions |= ACTION_CONFIRM; event.preventDefault(); }
    else if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') actions |= ACTION_PAUSE;
    else if (event.key === 'h' || event.key === 'H') actions |= ACTION_HINT;
    else if (event.key === 'r' || event.key === 'R') actions |= ACTION_RESTART;
    else if (event.key === 'm' || event.key === 'M') actions |= ACTION_MUTE;
    else if (event.key === 't' || event.key === 'T') actions |= ACTION_TITLE;
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key));
  window.addEventListener('blur', () => keys.clear());

  return {
    cursor,
    get mouse() { return mouse; },
    takeClick() { const c = click; click = null; return c; },
    takeActions() { const a = actions; actions = 0; return a; },
    /** Move the crosshair with the arrow keys; dt is seconds since last frame. */
    moveCursor(dt) {
      let dx = 0;
      let dy = 0;
      if (keys.has('ArrowLeft')) dx -= 1;
      if (keys.has('ArrowRight')) dx += 1;
      if (keys.has('ArrowUp')) dy -= 1;
      if (keys.has('ArrowDown')) dy += 1;
      if (dx === 0 && dy === 0) return;
      const len = Math.hypot(dx, dy);
      cursor.x = Math.max(0, Math.min(1280, cursor.x + (dx / len) * CURSOR_SPEED * dt));
      cursor.y = Math.max(0, Math.min(720, cursor.y + (dy / len) * CURSOR_SPEED * dt));
    },
    /** Number keys 1-3, read once per frame. */
    levelKey() {
      for (const [key, index] of [['1', 0], ['2', 1], ['3', 2]]) {
        if (keys.has(key)) { keys.delete(key); return index; }
      }
      return -1;
    },
  };
}
