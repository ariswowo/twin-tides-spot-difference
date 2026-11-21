// The game state and its rules: levels, finds, misses, hints, timer, score.
// Knows nothing about drawing or the DOM — the renderer paints this state,
// main.js feeds it input and time.

import { CLICK_SLACK, FIND_POINTS, HINTS_PER_LEVEL, HINT_COST, LEVEL_TIME, LEVELS, MISS_COST, STREAK_BONUS } from './config.js';
import { LEVELS as SCENE_LEVELS } from './scenes.js';

export const EVENT_FOUND = 1;
export const EVENT_MISS = 2;
export const EVENT_LEVEL_WIN = 4;
export const EVENT_TIMEOUT = 8;

export function createWorld(random) {
  const state = {
    levelIndex: 0,
    found: new Set(), // difference ids found in this level
    foundOrder: [], // ids in the order they were found (for the found list)
    misses: 0,
    clicks: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintId: null, // id currently pulsing after a hint
    hintUntil: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    elapsed: 0, // seconds in this level
    totalElapsed: 0,
    totalFound: 0,
    totalClicks: 0,
    totalMisses: 0,
    accuracy: 100,
    levelScores: [0, 0, 0],
    lastGain: 0, // points of the most recent find, shown as floating text
    lastGainAt: 0,
    lastGainPos: { x: 0, y: 0 },
    shakeUntil: 0,
    particles: [],
    levelComplete: false,
    gameComplete: false,
    timedOut: false,
    now: 0, // seconds since boot, for animations
  };

  function level() { return SCENE_LEVELS[state.levelIndex]; }
  function remaining() { return Math.max(0, LEVEL_TIME - state.elapsed); }

  function spawnParticles(x, y, colour) {
    for (let i = 0; i < 22; i += 1) {
      const angle = random() * Math.PI * 2;
      const speed = 60 + random() * 180;
      state.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        life: 0.7 + random() * 0.5,
        age: 0,
        colour,
        size: 3 + random() * 5,
      });
    }
  }

  function resetLevel(index) {
    state.levelIndex = index;
    state.found = new Set();
    state.foundOrder = [];
    state.misses = 0;
    state.clicks = 0;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.hintId = null;
    state.elapsed = 0;
    state.streak = 0;
    state.lastGain = 0;
    state.particles = [];
    state.levelComplete = false;
    state.timedOut = false;
  }

  return {
    state,
    level,
    remaining,
    levelName() { return LEVELS[state.levelIndex].name; },
    levelSubtitle() { return LEVELS[state.levelIndex].subtitle; },
    totalDifferences() { return SCENE_LEVELS.reduce((n, l) => n + l.differences.length, 0); },

    resetAll() {
      state.score = 0;
      state.totalElapsed = 0;
      state.totalFound = 0;
      state.totalClicks = 0;
      state.totalMisses = 0;
      state.accuracy = 100;
      state.levelScores = [0, 0, 0];
      state.bestStreak = 0;
      state.gameComplete = false;
      resetLevel(0);
    },

    startLevel(index) { resetLevel(index); },

    /** Advance the clock and particles; returns EVENT_TIMEOUT when time runs out. */
    step(dt, playing) {
      state.now += dt;
      if (playing && !state.levelComplete && !state.timedOut) {
        state.elapsed += dt;
        state.totalElapsed += dt;
        if (state.elapsed >= LEVEL_TIME) {
          state.timedOut = true;
          state.streak = 0;
          return EVENT_TIMEOUT;
        }
      }
      for (const p of state.particles) {
        p.age += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 260 * dt;
      }
      state.particles = state.particles.filter((p) => p.age < p.life);
      if (state.hintId !== null && state.now > state.hintUntil) state.hintId = null;
      return 0;
    },

    /** A click in logical coordinates; returns an event bitmask. */
    clickAt(point) {
      if (state.levelComplete || state.timedOut) return 0;
      state.clicks += 1;
      state.totalClicks += 1;
      const diff = level().differences.find((d) => {
        if (state.found.has(d.id)) return false;
        const dx = point.x - d.x;
        const dy = point.y - d.y;
        return dx * dx + dy * dy <= (d.r + CLICK_SLACK) * (d.r + CLICK_SLACK);
      });
      if (!diff) {
        state.misses += 1;
        state.totalMisses += 1;
        state.accuracy = Math.round((state.totalFound / Math.max(1, state.totalClicks)) * 100);
        state.streak = 0;
        state.score = Math.max(0, state.score - MISS_COST);
        state.shakeUntil = state.now + 0.25;
        return EVENT_MISS;
      }
      state.found.add(diff.id);
      state.foundOrder.push(diff.id);
      state.totalFound += 1;
      state.accuracy = Math.round((state.totalFound / Math.max(1, state.totalClicks)) * 100);
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      const gain = FIND_POINTS + (state.streak - 1) * STREAK_BONUS;
      state.score += gain;
      state.levelScores[state.levelIndex] += gain;
      state.lastGain = gain;
      state.lastGainAt = state.now;
      state.lastGainPos = { x: diff.x, y: diff.y };
      spawnParticles(diff.x, diff.y, '#ffd94a');
      if (state.found.size === level().differences.length) {
        const bonus = Math.round(remaining()) * 5;
        state.score += bonus;
        state.levelScores[state.levelIndex] += bonus;
        state.levelComplete = true;
        if (state.levelIndex === SCENE_LEVELS.length - 1) state.gameComplete = true;
        return EVENT_FOUND | EVENT_LEVEL_WIN;
      }
      return EVENT_FOUND;
    },

    /** Reveal one unfound difference for a few seconds. Returns its id or null. */
    useHint() {
      if (state.levelComplete || state.timedOut || state.hintsLeft <= 0) return null;
      const remainingDiffs = level().differences.filter((d) => !state.found.has(d.id));
      if (remainingDiffs.length === 0) return null;
      const diff = remainingDiffs[Math.floor(random() * remainingDiffs.length)];
      state.hintsLeft -= 1;
      state.score = Math.max(0, state.score - HINT_COST);
      state.hintId = diff.id;
      state.hintUntil = state.now + 2.5;
      return diff.id;
    },

    nextLevel() {
      if (state.levelIndex < SCENE_LEVELS.length - 1) {
        resetLevel(state.levelIndex + 1);
        return true;
      }
      return false;
    },
  };
}
