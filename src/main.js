// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between title, play, paused, level-clear, game-over and time-up screens.
//
// ?shot=start|play|garden|win|over stages that scene instead of running the
// loop, paints it twice and sets window.__shotReady for a screenshot.
// A click lands in a panel only when it is inside one; clicks on the HUD or
// the gap between panels are ignored.

import { BEST_KEY, PANEL, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_FOUND, EVENT_LEVEL_WIN, EVENT_MISS, EVENT_TIMEOUT } from './world.js';
import {
  ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_PAUSE, ACTION_RESTART, ACTION_TITLE,
  createInput,
} from './input.js';
import {
  SCREEN_GAME_OVER, SCREEN_LEVEL_WIN, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TIMEOUT, SCREEN_TITLE,
  createRenderer,
} from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 20261121;

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = await import('./audio.js').then((m) => m.createAudio()).catch(() => null);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

/** Convert a logical point to panel-local coordinates, or null if outside both panels. */
function toPanelLocal(point) {
  if (point.y >= PANEL.top && point.y < PANEL.top + PANEL.height) {
    if (point.x >= PANEL.leftX && point.x < PANEL.leftX + PANEL.width) {
      return { x: point.x - PANEL.leftX, y: point.y - PANEL.top };
    }
    if (point.x >= PANEL.rightX && point.x < PANEL.rightX + PANEL.width) {
      return { x: point.x - PANEL.rightX, y: point.y - PANEL.top };
    }
  }
  return null;
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, readBest(), scene.cursor, false);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, (x, y) => renderer.toLogical(x, y));
  let screen = SCREEN_TITLE;
  let best = readBest();
  let muted = false;
  let accumulator = 0;
  let last = performance.now();
  let lastTickSecond = -1;

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.resetAll();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce(`Playing. ${world.levelName()}. Find 7 differences.`);
  }

  function endLevel() {
    screen = SCREEN_LEVEL_WIN;
    if (audio) audio.levelWin();
    if (world.state.gameComplete) {
      screen = SCREEN_GAME_OVER;
      if (audio) audio.gameWin();
      if (world.state.score > best) {
        best = world.state.score;
        saveBest(best);
      }
    }
    announce(`Level clear. Score ${world.state.score}.`);
  }

  function handleClick(point) {
    const local = toPanelLocal(point);
    if (!local) return;
    if (audio) audio.unlock();
    const events = world.clickAt(local);
    if (events & EVENT_FOUND) {
      if (audio) audio.found();
      const foundId = world.state.foundOrder[world.state.foundOrder.length - 1];
      const diff = world.level().differences.find((d) => d.id === foundId);
      announce(`Found: ${diff ? diff.label : 'a difference'}. ${world.level().differences.length - world.state.found.size} remain.`);
      if (events & EVENT_LEVEL_WIN) endLevel();
    } else if (events & EVENT_MISS) {
      if (audio) audio.miss();
      announce('Not a difference. Try again.');
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE && audio) {
      muted = audio.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    }
    if (actions & ACTION_TITLE) {
      screen = SCREEN_TITLE;
      announce('Twin Tides. Press Enter to start.');
      return;
    }
    if (actions & ACTION_RESTART) {
      if (screen === SCREEN_TIMEOUT) world.startLevel(world.state.levelIndex);
      else world.resetAll();
      screen = SCREEN_PLAY;
      announce('Restarted.');
      return;
    }
    if (actions & ACTION_CONFIRM) {
      if (screen === SCREEN_TITLE) startGame();
      else if (screen === SCREEN_LEVEL_WIN && !world.state.gameComplete) {
        world.nextLevel();
        screen = SCREEN_PLAY;
        announce(`Playing. ${world.levelName()}.`);
      } else if (screen === SCREEN_GAME_OVER) startGame();
      else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
      else if (screen === SCREEN_PLAY) handleClick(input.cursor);
      return;
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) { screen = SCREEN_PAUSED; announce('Paused.'); }
      else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
      return;
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      const id = world.useHint();
      if (id !== null) {
        if (audio) audio.hint();
        const diff = world.level().differences.find((d) => d.id === id);
        announce(`Hint: look near the ${diff.label}.`);
      }
    }
  }

  function step() {
    const events = world.step(STEP, screen === SCREEN_PLAY);
    if (events & EVENT_TIMEOUT) {
      screen = SCREEN_TIMEOUT;
      if (audio) audio.timeout();
      announce("Time's up. Press R to retry this level.");
    }
    const second = Math.floor(world.remaining());
    if (screen === SCREEN_PLAY && second <= 10 && second !== lastTickSecond) {
      lastTickSecond = second;
      if (audio) audio.tick();
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    input.moveCursor(dt);
    handleActions();
    const levelKey = input.levelKey();
    if (levelKey >= 0 && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
      world.startLevel(levelKey);
      screen = SCREEN_PLAY;
      announce(`Playing. ${world.levelName()}.`);
    }
    if (screen === SCREEN_PLAY || screen === SCREEN_TITLE) {
      accumulator += dt;
      while (accumulator >= STEP && (screen === SCREEN_PLAY || screen === SCREEN_TITLE)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
      world.step(dt, false);
    }
    const click = input.takeClick();
    if (click) {
      if (screen === SCREEN_TITLE || screen === SCREEN_GAME_OVER) startGame();
      else if (screen === SCREEN_PLAY) handleClick(click);
      else if (screen === SCREEN_LEVEL_WIN && !world.state.gameComplete) {
        world.nextLevel();
        screen = SCREEN_PLAY;
      }
    }
    const cursor = screen === SCREEN_PLAY ? input.cursor : input.mouse;
    renderer.draw(world.state, screen, best, cursor, muted);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Twin Tides. Press Enter or click to start.');
  // Test hook for the screenshot/play-test script (and for anyone checking
  // the game in a browser console): the live world and screen.
  window.__twinTides = { world, get screen() { return screen; } };
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
