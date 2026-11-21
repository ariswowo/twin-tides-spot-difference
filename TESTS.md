# Twin Tides — local test results

Bounty: `best-spot-the-difference-game-20261121-0451` — "Make the best spot the difference game"
Deadline verified: 2026-11-21T16:51:00.000Z. Tests run 2026-11-21 ~11:00 UTC on this
machine (Node v24.22.1; the grader runs Node 22.23.4 — `main.ts` uses only the
Node standard library and type-strippable TypeScript, as the kit requires).

## 1. Logic tests — `node test-game.mjs` — PASS (110 checks)

Headless, no browser: the world rules in `game/src/world.js` against
`game/src/scenes.js`.

- 3 levels × 7 differences; every id unique per level; every difference inside
  its 600×540 panel; every pair of differences far enough apart that a click
  cannot be ambiguous (caught a real bug during development: the bakery lamp
  and clock click-zones overlapped, so the lamp was moved).
- Click on a difference finds it (+100, +25 per streak step); re-clicking a
  found difference is a miss; clicks just outside a radius are misses.
- Miss costs 10 points and resets the streak; hint reveals one unfound
  difference, costs 25 points and one of 3 hints.
- Finding all 7 wins the level with a time bonus; advancing starts the next level.
- Timeout at exactly 180 s; clicks ignored after timeout.
- Same seed → same score and same found order (deterministic).

## 2. Syntax — `node --check` on every `game/src/*.js` — PASS

All 9 game modules parse. `main.ts` runs under Node's type stripping
(`node main.ts` in §4).

## 3. Browser play test — `tools/render-shots.mjs` (headless Chromium) — PASS

- 4 screenshots rendered from the game's own code via `?shot=` scenes,
  each 1280×720 JPEG, all under the 256 KiB gate cap:
  `1-play.jpg` 81,638 B · `2-start.jpg` 72,944 B · `3-garden.jpg` 78,552 B ·
  `4-win.jpg` 63,139 B. No page errors, no console errors.
- Interactive play: Enter starts the game; clicking the bird in the bakery's
  right panel finds it (found 0 → 1, `bird`); a click on plain wall counts as
  a miss (misses = 1); `H` spends a hint (hints 3 → 2).
- Full playthrough (separate script, `/tmp/full-play.mjs`): clicking all 7
  bakery differences clears the level (found 7/7, score 2120, screen
  `level-win`, no page errors); Enter starts level 2, The Clockmaker's Garden.
- Screenshots were visually inspected: two panels side by side, green rings
  + ticks on found differences, several still unfound, and the counter
  ("Found 3 / 7 — 4 remain") on the cover shot.

## 4. Hand-in program — `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` — PASS

- Ran twice to two output directories; `diff -r out out2` reports no
  difference — the grader's two runs will write the same bytes.
- `out/dossier.json`: 447,159 bytes (< 1.5 MiB cap), schema
  `makefun/dossier/v1`, cover 0, built by the kit's `buildDossier` from
  `vendor/makefun-game.ts` (kit copy, unchanged — sha256 matches the kit).
- `game/` is 49,398 bytes, 11 files — far under the 993-file / 48 MiB caps.
- No external references: `grep` over `game/` finds no `http(s)://` URL and
  no `fetch`; the only dynamic import is the relative `./audio.js`; all
  sounds are synthesised WebAudio and all art is drawn in code.
- `node serve.ts` serves `game/` on localhost and returns 200 for
  `index.html` and the game modules.

## 5. What was NOT run locally (and why)

- **No `grade-local`**: this is a `program/v1` bounty and the kit's RULES.txt
  says "There is no local grade of this competition: the server grades every
  entry." The kit's `grade-local` command refuses it.
- **No kit `check`**: `node cli/makefun.mjs check --kit . --repo <repo>
  --transcripts transcripts.tar.gz` needs a GitHub repository and a transcript
  bundle, neither of which exists yet (repo creation and the API-key connect
  approval are still to come from the user). Run it before submitting.
