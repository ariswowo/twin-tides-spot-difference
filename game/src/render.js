// Paints the game: HUD, the two panels side by side, markers, particles and
// the title / pause / win overlays. Everything is drawn from the world state,
// so a screenshot staged through shots.js is a real frame of the game.

import { FIELD, FONT, LEVEL_TIME, LEVELS, PALETTE, PANEL } from './config.js';
import { LEVELS as SCENES, drawScene } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_WIN = 'level-win';
export const SCREEN_GAME_OVER = 'game-over';
export const SCREEN_TIMEOUT = 'timeout';

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth || FIELD.width;
    const h = canvas.clientHeight || FIELD.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
    offsetX = (canvas.width - FIELD.width * scale) / 2;
    offsetY = (canvas.height - FIELD.height * scale) / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  /** Convert a point in CSS pixels (relative to the canvas) to logical coords. */
  function toLogical(cssX, cssY) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    return {
      x: (cssX * dpr - offsetX) / scale,
      y: (cssY * dpr - offsetY) / scale,
    };
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function text(str, x, y, size, colour, align = 'left', weight = 700) {
    ctx.fillStyle = colour;
    ctx.font = `${weight} ${size}px ${FONT}`;
    ctx.textAlign = align;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(str, x, y);
  }

  function drawPanel(state, panelX, variant, label) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(panelX, PANEL.top, PANEL.width, PANEL.height);
    ctx.clip();
    ctx.translate(panelX, PANEL.top);
    drawScene(ctx, state.levelIndex, variant);
    // Found markers and the hint ring, drawn over the scene in panel space.
    const level = SCENES[state.levelIndex];
    for (const diff of level.differences) {
      if (state.found.has(diff.id)) {
        ctx.strokeStyle = PALETTE.ringFound;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(diff.x, diff.y, diff.r + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(diff.x - 10, diff.y);
        ctx.lineTo(diff.x - 2, diff.y + 9);
        ctx.lineTo(diff.x + 12, diff.y - 8);
        ctx.stroke();
      } else if (state.hintId === diff.id) {
        const pulse = 1 + 0.18 * Math.sin(state.now * 8);
        ctx.strokeStyle = PALETTE.ring;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(diff.x, diff.y, (diff.r + 10) * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Particles and the floating "+points" text, in panel space too.
    for (const p of state.particles) {
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctx.fillStyle = p.colour;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (state.lastGain > 0 && state.now - state.lastGainAt < 1.2) {
      ctx.globalAlpha = 1 - (state.now - state.lastGainAt) / 1.2;
      text(`+${state.lastGain}`, state.lastGainPos.x, state.lastGainPos.y - 28, 26, '#ffd94a', 'center');
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // Panel frame and label.
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.lineWidth = 4;
    ctx.strokeRect(panelX, PANEL.top, PANEL.width, PANEL.height);
    ctx.fillStyle = PALETTE.panelLabel;
    roundRect(panelX, PANEL.top - 34, 190, 28, 8);
    ctx.fill();
    text(label, panelX + 12, PANEL.top - 14, 15, PALETTE.text, 'left', 700);
  }

  function drawHud(state, best, muted) {
    ctx.fillStyle = PALETTE.hud;
    ctx.fillRect(0, 0, FIELD.width, 56);
    ctx.fillStyle = PALETTE.hudEdge;
    ctx.fillRect(0, 56, FIELD.width, 2);
    text('TWIN TIDES', 20, 38, 26, PALETTE.accent);
    text('spot the difference', 188, 38, 15, PALETTE.muted, 'left', 500);
    const level = SCENES[state.levelIndex];
    const found = state.found.size;
    const total = level.differences.length;
    const remain = total - found;
    text(`Level ${state.levelIndex + 1}/3 · ${LEVELS[state.levelIndex].name}`, 430, 30, 17, PALETTE.text);
    text(`Found ${found} / ${total}  —  ${remain} remain`, 430, 50, 15, remain === 0 ? PALETTE.good : PALETTE.ring, 'left', 700);
    const timeLeft = LEVEL_TIME - state.elapsed;
    text(`⏱ ${formatTime(timeLeft)}`, 860, 38, 22, timeLeft <= 30 ? PALETTE.bad : PALETTE.text, 'left', 700);
    text(`Score ${state.score}`, 1010, 30, 17, PALETTE.text);
    text(`Best ${best} · Hints ${state.hintsLeft} · Misses ${state.misses}${muted ? ' · Muted' : ''}`, 1010, 50, 13, PALETTE.muted, 'left', 500);
    if (state.streak >= 2) text(`Streak ×${state.streak}`, 760, 50, 14, PALETTE.good, 'left', 700);
  }

  function drawBottomBar(state) {
    ctx.fillStyle = PALETTE.hud;
    ctx.fillRect(0, 648, FIELD.width, 72);
    ctx.fillStyle = PALETTE.hudEdge;
    ctx.fillRect(0, 648, FIELD.width, 2);
    const level = SCENES[state.levelIndex];
    const foundLabels = state.foundOrder.map((id) => level.differences.find((d) => d.id === id).label);
    text(foundLabels.length ? `Found: ${foundLabels.join(' · ')}` : 'Found: — none yet —', 20, 676, 14, PALETTE.muted, 'left', 500);
    text('Click a difference in either picture · Arrows + Enter work too · H hint · R restart · P pause · M sound', 20, 700, 14, PALETTE.muted, 'left', 500);
  }

  function overlay(title, lines, accent) {
    ctx.fillStyle = 'rgba(10, 13, 22, 0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.hud;
    roundRect(290, 170, 700, 380, 18);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    roundRect(290, 170, 700, 380, 18);
    ctx.stroke();
    text(title, 640, 246, 44, accent, 'center');
    let y = 298;
    for (const lineText of lines) {
      text(lineText, 640, y, 19, PALETTE.text, 'center', 500);
      y += 28;
    }
  }

  function draw(state, screen, best, cursor, muted) {
    resize();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    const shaking = state.now < state.shakeUntil;
    const shakeX = shaking ? Math.sin(state.now * 90) * 5 : 0;
    ctx.save();
    ctx.translate(shakeX, 0);
    drawHud(state, best, muted);
    const allIds = new Set(SCENES[state.levelIndex].differences.map((d) => d.id));
    drawPanel(state, PANEL.leftX, new Set(), 'A · ORIGINAL');
    drawPanel(state, PANEL.rightX, allIds, 'B · CHANGED');
    drawBottomBar(state);
    ctx.restore();

    if (screen === SCREEN_PLAY && cursor) {
      ctx.strokeStyle = 'rgba(255, 217, 74, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cursor.x - 20, cursor.y); ctx.lineTo(cursor.x - 8, cursor.y);
      ctx.moveTo(cursor.x + 8, cursor.y); ctx.lineTo(cursor.x + 20, cursor.y);
      ctx.moveTo(cursor.x, cursor.y - 20); ctx.lineTo(cursor.x, cursor.y - 8);
      ctx.moveTo(cursor.x, cursor.y + 8); ctx.lineTo(cursor.x, cursor.y + 20);
      ctx.stroke();
    }

    if (screen === SCREEN_TITLE) {
      overlay('TWIN TIDES', [
        'Two pictures. Seven differences. Find them all.',
        'Click a difference in either picture — or move with',
        'the arrow keys and press Enter. Hints cost points.',
        '',
        '1 · The Baker\'s Morning     2 · The Clockmaker\'s Garden',
        '3 · The Tidepool Observatory',
        '',
        `Best total score: ${best}`,
        'Click or press Enter to start',
      ], PALETTE.accent);
    } else if (screen === SCREEN_PAUSED) {
      overlay('PAUSED', ['Take a breath. The clock is stopped.', 'Press P or Enter to keep hunting.'], PALETTE.accent);
    } else if (screen === SCREEN_LEVEL_WIN) {
      const last = state.levelIndex === SCENES.length - 1;
      overlay(last ? 'ALL LEVELS CLEAR!' : 'LEVEL CLEAR!', [
        `${LEVELS[state.levelIndex].name} — all ${SCENES[state.levelIndex].differences.length} differences found.`,
        `Level score ${state.levelScores[state.levelIndex]} · Time ${formatTime(state.elapsed)} · Misses ${state.misses}`,
        last
          ? `Final total ${state.score} · Best streak ${state.bestStreak} · Press R to play again.`
          : 'Press Enter for the next scene.',
      ], PALETTE.good);
    } else if (screen === SCREEN_GAME_OVER) {
      overlay('YOU FOUND THEM ALL!', [
        `Total score ${state.score} · Best ${Math.max(best, state.score)}`,
        `All ${state.totalFound} differences · Accuracy ${state.accuracy}% · Best streak ${state.bestStreak}`,
        `Total time ${formatTime(state.totalElapsed)}`,
        '',
        'Press R to play again, or T for the title screen.',
      ], PALETTE.good);
    } else if (screen === SCREEN_TIMEOUT) {
      overlay("TIME'S UP", [
        `${LEVELS[state.levelIndex].name} — the clock ran out with ${SCENES[state.levelIndex].differences.length - state.found.size} differences still hidden.`,
        'Press R to retry this level.',
      ], PALETTE.bad);
    }
  }

  return { draw, toLogical };
}
