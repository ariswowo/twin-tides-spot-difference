// Headless logic test for Twin Tides: runs the world rules in Node with no
// DOM or browser. Run:  node test-game.mjs
// Exits non-zero on the first failed assertion.
import { createRandom } from './game/src/random.js';
import { createWorld, EVENT_FOUND, EVENT_LEVEL_WIN, EVENT_MISS, EVENT_TIMEOUT } from './game/src/world.js';
import { LEVELS } from './game/src/scenes.js';

let checks = 0;
function check(name, cond) {
  checks += 1;
  if (!cond) { console.error(`FAIL: ${name}`); process.exit(1); }
  console.log(`ok: ${name}`);
}

const world = createWorld(createRandom(20261121));
world.resetAll();
const s = world.state;

// 1. Three levels, seven differences each, all ids unique per level.
check('3 levels', LEVELS.length === 3);
for (const level of LEVELS) {
  check(`${level.id} has 7 differences`, level.differences.length === 7);
  check(`${level.id} ids unique`, new Set(level.differences.map((d) => d.id)).size === 7);
  for (const d of level.differences) {
    check(`${level.id}/${d.id} inside panel`, d.x >= 0 && d.x <= 600 && d.y >= 0 && d.y <= 540 && d.r >= 15);
  }
}
// Differences do not overlap each other (clicks must be unambiguous).
for (const level of LEVELS) {
  for (let i = 0; i < level.differences.length; i += 1) {
    for (let j = i + 1; j < level.differences.length; j += 1) {
      const a = level.differences[i];
      const b = level.differences[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      check(`${level.id}: ${a.id} vs ${b.id} separated`, dist > a.r + b.r + 10);
    }
  }
}

// 2. A click on a difference finds it; a click elsewhere is a miss.
let ev = world.clickAt({ x: 0, y: 0 });
check('click at corner is a miss', (ev & EVENT_MISS) !== 0 && s.misses === 1 && s.score === 0);
const first = LEVELS[0].differences[0];
ev = world.clickAt({ x: first.x, y: first.y });
check('click on a difference finds it', (ev & EVENT_FOUND) !== 0 && s.found.has(first.id));
check('first find scores 100', s.score === 100);
check('counter: 1 of 7 found', s.found.size === 1);
// Clicking the same spot again is a miss, not a double find.
ev = world.clickAt({ x: first.x, y: first.y });
check('re-clicking a found difference is a miss', (ev & EVENT_MISS) !== 0 && s.found.size === 1);
// A near miss just outside the radius is a miss; just inside finds it.
const second = LEVELS[0].differences[1];
ev = world.clickAt({ x: second.x + second.r + 30, y: second.y });
check('click 30px outside radius is a miss', (ev & EVENT_MISS) !== 0);
ev = world.clickAt({ x: second.x + second.r - 2, y: second.y });
check('click inside radius finds it', (ev & EVENT_FOUND) !== 0 && s.found.has(second.id));
check('second find scores 100 (streak was reset by the misses)', s.score === 100 - 10 - 10 + 100);

// 3. Hint reveals an unfound difference and costs a hint.
const hintsBefore = s.hintsLeft;
const hintId = world.useHint();
check('hint returns an unfound id', hintId !== null && !s.found.has(hintId));
check('hint decrements hints', s.hintsLeft === hintsBefore - 1);
check('hint sets the pulsing id', s.hintId === hintId);

// 4. Finding the rest wins the level, with a time bonus.
for (const d of LEVELS[0].differences) {
  if (!s.found.has(d.id)) ev = world.clickAt({ x: d.x, y: d.y });
}
check('last find wins the level', (ev & EVENT_LEVEL_WIN) !== 0 && s.levelComplete);
check('level score recorded', s.levelScores[0] > 0);
check('next level advances', world.nextLevel() && s.levelIndex === 1 && s.found.size === 0);

// 5. Timeout: 180 seconds of play without finishing ends the level.
world.step(179, true);
check('no timeout at 179s', (world.step(0.5, true) & EVENT_TIMEOUT) === 0);
check('timeout at 180s', (world.step(1, true) & EVENT_TIMEOUT) !== 0 && s.timedOut);
ev = world.clickAt({ x: LEVELS[1].differences[0].x, y: LEVELS[1].differences[0].y });
check('clicks ignored after timeout', ev === 0);

// 6. Determinism: a fresh world with the same seed plays identically.
const a = createWorld(createRandom(7));
const b = createWorld(createRandom(7));
a.resetAll(); b.resetAll();
for (const d of LEVELS[0].differences) { a.clickAt({ x: d.x, y: d.y }); b.clickAt({ x: d.x, y: d.y }); }
check('same seed, same score', a.state.score === b.state.score);
check('same seed, same found order', JSON.stringify(a.state.foundOrder) === JSON.stringify(b.state.foundOrder));

console.log(`\nAll ${checks} logic checks passed.`);
