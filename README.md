# twin-tides-spot-difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/ariswowo/twin-tides-spot-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/ariswowo/twin-tides-spot-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Twin Tides is an original spot-the-difference game: two near-identical pictures side by side in three hand-drawn scenes — a morning bakery, a clockmaker's garden and a night tidepool — with seven differences hidden in each, markers on the ones you find, a counter of how many remain, a 3-minute clock, hints, streaks and WebAudio sounds. Everything is drawn in code; there are no image or audio files and no network requests.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser and click the differences — or move with the arrow keys and press Enter. `H` hints, `R` restarts, `P` pauses, `M` mutes, `1`–`3` jump to a level.

## The game

- **3 levels × 7 differences** (21 in all): The Baker's Morning, The Clockmaker's Garden, The Tidepool Observatory. Difficulty rises: the bakery's differences are bold, the garden's are smaller, the tidepool's hide in the dark.
- **Fair differences**: a missing bird, a clock hand that moved, a jar that changed colour, a lamp gone dark, a cat without a tail, loaves that went missing — each one at a fixed, clickable spot, each checked by the test suite to sit clear of the others.
- **Feel**: a chime and a burst of particles on every find, a shake and a buzz on a miss, a pulsing gold ring for a hint, a ticking clock under 30 seconds, and a time bonus for clearing a level fast.
- **Screenshots**: `?shot=play` (3 of 7 found, 4 remain), `?shot=start`, `?shot=garden` and `?shot=win` stage real game states deterministically for the four screenshots in `screenshots/`.

## Handing it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-game.ts` (the kit's copy, unchanged).

## The modules

- `game/index.html` — the page and the canvas
- `game/src/config.js` — tuning, layout, palette, level names
- `game/src/scenes.js` — the three scenes, drawn in code, and their differences
- `game/src/world.js` — the rules: finds, misses, hints, timer, score
- `game/src/render.js` — HUD, panels, markers, overlays
- `game/src/input.js` — mouse and keyboard, in logical coordinates
- `game/src/audio.js` — synthesised WebAudio sounds, no files
- `game/src/shots.js` — the staged screenshot scenes
- `game/src/main.js` — boot, the fixed-step loop, screen flow
- `game/src/random.js` — seeded RNG for particles
- `test-game.mjs` — headless logic tests (`node test-game.mjs`)
- `main.ts` — the hand-in program; `serve.ts` — the local static server

## Screenshots

All four are real renders of the game's own code in headless Chromium, driven by the `?shot=` scenes in `shots.json`:

- `screenshots/1-play.jpg` — the bakery, 3 of 7 found, 4 remain (the cover)
- `screenshots/2-start.jpg` — the title screen over the bakery
- `screenshots/3-garden.jpg` — the garden, 2 of 7 found, 5 remain
- `screenshots/4-win.jpg` — the tidepool, all 7 found, level clear

## Tests

See `TESTS.md` for the local test results.

---

Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards
