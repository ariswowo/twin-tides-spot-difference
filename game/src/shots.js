// The screenshot scenes behind ?shot=start|play|garden|win.
// Each one is a real state of the real game, reached by playing its rules
// forward with fixed clicks — never a mock-up — so the screenshots are
// renders of the game's own code and the same query always gives the same
// frame. `seed` is accepted for compatibility and ignored: the scenes are
// fully deterministic.
//
//   ?shot=start   title screen over the bakery, nothing found yet
//   ?shot=play    bakery, 3 of 7 found, 4 remain (the cover)
//   ?shot=garden  clockmaker's garden, 2 of 7 found, 5 remain
//   ?shot=win     tidepool, all 7 found, level clear

import { SCREEN_GAME_OVER, SCREEN_LEVEL_WIN, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { PANEL } from './config.js';

function clickDiff(world, index) {
  const diff = world.level().differences[index];
  // Click the centre of the difference in the right panel.
  world.clickAt({ x: diff.x, y: diff.y });
}

export function stageShot(name, world) {
  world.resetAll();
  if (name === 'play') {
    world.state.elapsed = 72; // 01:12 on the clock, 01:48 left
    world.state.totalElapsed = 72;
    clickDiff(world, 0); // bird
    clickDiff(world, 2); // jam jar
    clickDiff(world, 5); // cat's tail
    world.state.elapsed = 72;
    return { screen: SCREEN_PLAY, cursor: { x: PANEL.rightX + 300, y: PANEL.top + 200 } };
  }
  if (name === 'garden') {
    world.startLevel(1);
    world.state.elapsed = 48;
    world.state.totalElapsed = 48;
    clickDiff(world, 1); // butterfly
    clickDiff(world, 4); // snail
    world.state.elapsed = 48;
    return { screen: SCREEN_PLAY, cursor: { x: PANEL.leftX + 200, y: PANEL.top + 300 } };
  }
  if (name === 'win') {
    world.startLevel(2);
    world.state.elapsed = 121;
    world.state.totalElapsed = 121;
    for (let i = 0; i < world.level().differences.length; i += 1) clickDiff(world, i);
    world.state.elapsed = 121;
    return { screen: SCREEN_LEVEL_WIN, cursor: null };
  }
  if (name === 'over') {
    world.startLevel(2);
    for (let i = 0; i < world.level().differences.length; i += 1) clickDiff(world, i);
    world.startLevel(0);
    for (let i = 0; i < world.level().differences.length; i += 1) clickDiff(world, i);
    world.startLevel(1);
    for (let i = 0; i < world.level().differences.length; i += 1) clickDiff(world, i);
    return { screen: SCREEN_GAME_OVER, cursor: null };
  }
  return { screen: SCREEN_TITLE, cursor: null };
}
