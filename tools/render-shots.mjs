// Renders the game's screenshots with headless Chromium (Playwright) and
// play-tests it by clicking a real difference.
//   NODE_PATH=/tmp/pw/node_modules node tools/render-shots.mjs
// (Playwright is a dev-only tool for taking screenshots; the game itself
// has no dependencies.) Serves game/ on a scratch port, opens each shot in
// shots.json at 1280x720, waits for window.__shotReady, saves a JPEG, then
// clicks the bird in the bakery's right panel and checks the counter moves.
// Exits non-zero on any page error, missing __shotReady, or a screenshot
// over the gate's 256 KiB cap.
import { createRequire } from 'node:module';
// Playwright is a dev-only tool, resolved via NODE_PATH (see the header).
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { createServer } from 'node:http';
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const gameRoot = join(root, 'game');
const shots = JSON.parse(readFileSync(join(root, 'shots.json'), 'utf8'));
const outDir = join(root, 'screenshots');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(gameRoot, pathname.replace(/^\/+/, '')));
  try {
    const size = statSync(file).size;
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', 'content-length': size });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

for (const shot of shots) {
  await page.goto(`http://127.0.0.1:${port}/index.html${shot.query}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 10000 });
  const path = join(outDir, shot.name);
  await page.screenshot({ path, type: 'jpeg', quality: 82 });
  const size = statSync(path).size;
  console.log(`${shot.name}: ${size} bytes${size > 262144 ? ' — OVER 256 KiB CAP' : ''}`);
  if (size > 262144) errors.push(`${shot.name} over 256 KiB`);
}

// Play test: start the real game, click the bird (right panel, bakery).
await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'load' });
await page.waitForTimeout(500);
await page.keyboard.press('Enter'); // start
await page.waitForTimeout(300);
const before = await page.evaluate(() => window.__twinTides.world.state.found.size);
await page.mouse.click(660 + 92, 92 + 108); // bird, right panel
await page.waitForTimeout(300);
const after = await page.evaluate(() => window.__twinTides.world.state.found.size);
const foundLabel = await page.evaluate(() => window.__twinTides.world.state.foundOrder);
console.log(`play test: found ${before} -> ${after}, order=${JSON.stringify(foundLabel)}`);
if (after !== before + 1) errors.push('click on the bird did not find a difference');
// A miss: click inside the left panel but on plain wall, not a difference.
await page.mouse.click(20 + 100, 92 + 300);
await page.waitForTimeout(200);
const misses = await page.evaluate(() => window.__twinTides.world.state.misses);
console.log(`play test: misses=${misses}`);
if (misses !== 1) errors.push('click outside the panels was not a miss (or the wrong count)');
// Hint key.
await page.keyboard.press('h');
await page.waitForTimeout(200);
const hints = await page.evaluate(() => window.__twinTides.world.state.hintsLeft);
console.log(`play test: hintsLeft=${hints}`);
if (hints !== 2) errors.push('H did not spend a hint');

await browser.close();
server.close();
if (errors.length) { console.error('ERRORS:\n' + errors.join('\n')); process.exit(1); }
console.log('All screenshot + play tests passed.');
