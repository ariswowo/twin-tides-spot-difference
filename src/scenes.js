// The three scenes, drawn entirely in code (Canvas 2D, no image files).
// Each scene is drawn twice: the left panel with no variant, the right panel
// with the variant set applied. A difference is a small, fair change —
// a missing object, a colour swap, a different count — at a fixed spot.
//
// Coordinates are panel-local: 600 wide, 540 high. The renderer places the
// same drawing on both panels, so a difference sits at the same spot in each.

function circle(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, w, h);
}

function ellipse(ctx, x, y, rx, ry, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, colour, width) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// ---------------------------------------------------------------- bakery
const BAKERY_DIFFS = [
  { id: 'bird', label: 'bird in the window', x: 92, y: 108, r: 22 },
  { id: 'clock-hand', label: 'clock hand', x: 300, y: 96, r: 30 },
  { id: 'jar', label: 'jam jar colour', x: 128, y: 158, r: 26 },
  { id: 'lamp', label: 'hanging lamp', x: 430, y: 62, r: 30 },
  { id: 'mitt', label: 'oven mitt colour', x: 522, y: 214, r: 26 },
  { id: 'cat-tail', label: "the cat's tail", x: 478, y: 372, r: 34 },
  { id: 'loaves', label: 'bread loaves', x: 152, y: 392, r: 32 },
];

function drawBakery(ctx, variant) {
  // Wall and floor.
  rect(ctx, 0, 0, 600, 420, '#f6e3bd');
  rect(ctx, 0, 420, 600, 120, '#b07a45');
  for (let y = 436; y < 540; y += 26) line(ctx, 0, y, 600, y, '#96622f', 2);
  // Window with morning sky.
  rect(ctx, 48, 52, 150, 150, '#8a5a2b');
  rect(ctx, 58, 62, 130, 130, '#aee3f5');
  circle(ctx, 150, 96, 22, '#ffd94a'); // sun
  line(ctx, 58, 127, 188, 127, '#8a5a2b', 6);
  line(ctx, 123, 62, 123, 192, '#8a5a2b', 6);
  if (!variant.has('bird')) {
    // A small bird on the sill, outside the glass.
    ellipse(ctx, 92, 108, 14, 9, '#4a6fa5');
    circle(ctx, 104, 102, 6, '#4a6fa5');
    line(ctx, 110, 103, 116, 101, '#e8a93d', 2);
    line(ctx, 82, 116, 74, 122, '#4a6fa5', 3);
  }
  // Wall clock.
  circle(ctx, 300, 96, 34, '#fff8e6');
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(300, 96, 34, 0, Math.PI * 2); ctx.stroke();
  line(ctx, 300, 96, 300, 74, '#333', 4);
  if (variant.has('clock-hand')) line(ctx, 300, 96, 322, 108, '#333', 4);
  else line(ctx, 300, 96, 282, 108, '#333', 4);
  circle(ctx, 300, 96, 4, '#c0392b');
  // Shelves with jam jars.
  rect(ctx, 400, 140, 170, 12, '#8a5a2b');
  rect(ctx, 400, 210, 170, 12, '#8a5a2b');
  const jars = [
    { x: 428, c: '#d95f4b' }, { x: 472, c: '#e8a93d' }, { x: 516, c: '#7fb069' },
    { x: 428, y: 182, c: '#e8a93d' }, { x: 472, y: 182, c: '#7fb069' }, { x: 516, y: 182, c: '#d95f4b' },
  ];
  for (const jar of jars) {
    const y = jar.y ?? 112;
    rect(ctx, jar.x - 14, y, 28, 28, jar.c);
    rect(ctx, jar.x - 14, y, 28, 8, '#fff8e6');
  }
  // The first jar changes colour on the right.
  rect(ctx, 114, 130, 28, 28, variant.has('jar') ? '#7fb069' : '#d95f4b');
  rect(ctx, 114, 130, 28, 8, '#fff8e6');
  rect(ctx, 90, 152, 170, 12, '#8a5a2b');
  // Hanging lamp, over the shelves.
  line(ctx, 430, 0, 430, 40, '#5a4632', 4);
  if (variant.has('lamp')) {
    ellipse(ctx, 430, 62, 26, 14, '#6b5a44'); // unlit shade
    circle(ctx, 430, 74, 8, '#8a7a5a');
  } else {
    ctx.fillStyle = 'rgba(255, 217, 74, 0.35)';
    ctx.beginPath(); ctx.arc(430, 70, 52, 0, Math.PI * 2); ctx.fill();
    ellipse(ctx, 430, 62, 26, 14, '#e8a93d');
    circle(ctx, 430, 74, 9, '#fff3b0');
  }
  // Oven on the right, with dials and a warm door.
  rect(ctx, 470, 250, 110, 170, '#5d6b7a');
  rect(ctx, 482, 262, 86, 46, '#2f3844');
  circle(ctx, 496, 330, 7, '#ffd94a');
  circle(ctx, 524, 330, 7, '#ff6b5e');
  circle(ctx, 552, 330, 7, '#7ddb8a');
  rect(ctx, 482, 352, 86, 52, '#8a5a2b');
  // Oven mitt hanging beside the oven.
  ctx.fillStyle = variant.has('mitt') ? '#4a90a5' : '#d95f4b';
  ctx.beginPath();
  ctx.moveTo(522, 190); ctx.lineTo(542, 190); ctx.lineTo(542, 232);
  ctx.quadraticCurveTo(542, 246, 532, 246); ctx.quadraticCurveTo(522, 246, 522, 232);
  ctx.closePath(); ctx.fill();
  circle(ctx, 532, 200, 6, '#fff8e6');
  // Counter with bread.
  rect(ctx, 20, 400, 560, 22, '#8a5a2b');
  rect(ctx, 20, 422, 560, 18, '#6b4423');
  const loafXs = variant.has('loaves') ? [128, 172] : [118, 158, 198];
  for (const x of loafXs) {
    ellipse(ctx, x, 392, 26, 16, '#d9a05b');
    line(ctx, x - 14, 386, x + 14, 386, '#a06a2c', 3);
    line(ctx, x - 10, 396, x + 10, 396, '#a06a2c', 3);
  }
  // Basket of rolls.
  ellipse(ctx, 250, 398, 34, 14, '#a06a2c');
  circle(ctx, 238, 388, 10, '#e8c07a');
  circle(ctx, 254, 384, 10, '#e8c07a');
  circle(ctx, 268, 390, 10, '#e8c07a');
  // The cat, asleep on the counter.
  ellipse(ctx, 470, 388, 52, 20, '#e8e0d0');
  circle(ctx, 512, 372, 18, '#e8e0d0');
  line(ctx, 500, 358, 496, 344, '#e8e0d0', 6);
  line(ctx, 512, 356, 516, 342, '#e8e0d0', 6);
  circle(ctx, 518, 370, 2, '#333');
  if (!variant.has('cat-tail')) {
    ctx.strokeStyle = '#e8e0d0'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(424, 388); ctx.quadraticCurveTo(398, 372, 404, 348); ctx.stroke();
  }
  // Potted herb on the counter, and a rug.
  rect(ctx, 340, 380, 30, 20, '#c96f4a');
  circle(ctx, 348, 372, 12, '#5d8a4a');
  circle(ctx, 362, 366, 12, '#6fa055');
  ellipse(ctx, 300, 508, 150, 16, '#c96f4a');
  ellipse(ctx, 300, 508, 100, 10, '#e8a93d');
}

// ---------------------------------------------------------------- garden
const GARDEN_DIFFS = [
  { id: 'gear', label: 'small gear', x: 372, y: 118, r: 26 },
  { id: 'butterfly', label: 'butterfly', x: 428, y: 148, r: 24 },
  { id: 'birdhouse', label: 'birdhouse roof', x: 508, y: 176, r: 28 },
  { id: 'flower', label: 'tulip colour', x: 142, y: 384, r: 26 },
  { id: 'snail', label: 'snail', x: 208, y: 462, r: 24 },
  { id: 'stone', label: 'stepping stone', x: 356, y: 472, r: 24 },
  { id: 'can', label: 'watering can', x: 96, y: 436, r: 28 },
];

function drawGear(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    ctx.moveTo(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55);
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(a + 0.35) * r, y + Math.sin(a + 0.35) * r);
  }
  ctx.fill();
  circle(ctx, x, y, r * 0.55, colour);
  circle(ctx, x, y, r * 0.22, '#f4efe4');
}

function drawGarden(ctx, variant) {
  // Sky, glasshouse and lawn.
  rect(ctx, 0, 0, 600, 300, '#bfe3c8');
  rect(ctx, 0, 300, 600, 240, '#7fb069');
  circle(ctx, 90, 80, 30, '#fff3b0');
  // Clock tower behind the glass.
  rect(ctx, 250, 40, 90, 180, '#c9b18a');
  rect(ctx, 236, 26, 118, 18, '#8a5a2b');
  circle(ctx, 295, 96, 30, '#fff8e6');
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(295, 96, 30, 0, Math.PI * 2); ctx.stroke();
  line(ctx, 295, 96, 295, 76, '#333', 3);
  line(ctx, 295, 96, 312, 104, '#333', 3);
  // Gears turning on the tower wall.
  drawGear(ctx, 295, 170, 26, '#8a7a5a');
  if (!variant.has('gear')) drawGear(ctx, 372, 118, 20, '#a08a5a');
  // Glasshouse frame.
  ctx.strokeStyle = '#5d6b7a'; ctx.lineWidth = 6;
  ctx.strokeRect(20, 220, 560, 180);
  line(ctx, 160, 220, 160, 400, '#5d6b7a', 4);
  line(ctx, 300, 220, 300, 400, '#5d6b7a', 4);
  line(ctx, 440, 220, 440, 400, '#5d6b7a', 4);
  // Flower beds.
  for (let x = 60; x < 580; x += 52) {
    line(ctx, x, 420, x, 384, '#3f6b2f', 4);
    circle(ctx, x, 374, 13, x % 104 === 60 ? '#d95f6b' : '#e8a93d');
  }
  // The one tulip that changes colour.
  line(ctx, 142, 420, 142, 396, '#3f6b2f', 4);
  circle(ctx, 142, 384, 14, variant.has('flower') ? '#8a6fd9' : '#d95f4b');
  // Butterfly over the beds.
  if (!variant.has('butterfly')) {
    ellipse(ctx, 416, 148, 14, 9, '#e8a93d');
    ellipse(ctx, 440, 148, 14, 9, '#e8a93d');
    ellipse(ctx, 416, 160, 10, 7, '#d95f6b');
    ellipse(ctx, 440, 160, 10, 7, '#d95f6b');
    circle(ctx, 428, 152, 4, '#333');
  }
  // Birdhouse on a post.
  line(ctx, 508, 210, 508, 330, '#8a5a2b', 8);
  rect(ctx, 478, 150, 60, 52, '#d9a05b');
  ctx.fillStyle = variant.has('birdhouse') ? '#5d8a4a' : '#c0392b';
  ctx.beginPath(); ctx.moveTo(470, 152); ctx.lineTo(508, 122); ctx.lineTo(546, 152); ctx.closePath(); ctx.fill();
  circle(ctx, 508, 176, 9, '#2f3844');
  // Path of stepping stones.
  const stones = variant.has('stone')
    ? [[180, 472], [268, 472], [444, 472], [520, 472]]
    : [[180, 472], [268, 472], [356, 472], [444, 472], [520, 472]];
  for (const [x, y] of stones) ellipse(ctx, x, y, 34, 12, '#d9d2c0');
  // Snail on the lawn.
  if (!variant.has('snail')) {
    ellipse(ctx, 208, 466, 20, 12, '#8a7a5a');
    circle(ctx, 196, 452, 12, '#c96f4a');
    ctx.strokeStyle = '#c96f4a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(196, 452, 6, 0, Math.PI * 2); ctx.stroke();
    line(ctx, 224, 460, 232, 450, '#8a7a5a', 3);
  }
  // Watering can by the beds.
  if (variant.has('can')) {
    rect(ctx, 74, 420, 44, 34, '#7fb069');
  } else {
    rect(ctx, 74, 420, 44, 34, '#4a90a5');
    line(ctx, 118, 428, 142, 410, '#4a90a5', 6);
    circle(ctx, 146, 408, 4, '#aee3f5');
    circle(ctx, 152, 416, 3, '#aee3f5');
  }
  rect(ctx, 84, 408, 24, 12, '#4a90a5');
  // Bushes and a fence.
  ellipse(ctx, 40, 330, 46, 30, '#5d8a4a');
  ellipse(ctx, 566, 330, 46, 30, '#5d8a4a');
  line(ctx, 0, 510, 600, 510, '#8a5a2b', 6);
}

// ---------------------------------------------------------------- tidepool
const TIDEPOOL_DIFFS = [
  { id: 'star', label: 'star', x: 306, y: 66, r: 20 },
  { id: 'moon', label: 'moon', x: 486, y: 92, r: 30 },
  { id: 'beam', label: 'lighthouse beam', x: 176, y: 176, r: 40 },
  { id: 'fish', label: 'fish in the pool', x: 262, y: 402, r: 24 },
  { id: 'crab', label: 'crab', x: 384, y: 432, r: 26 },
  { id: 'bucket', label: 'bucket colour', x: 122, y: 452, r: 26 },
  { id: 'shells', label: 'shells on the rock', x: 486, y: 462, r: 28 },
];

function drawStar(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawTidepool(ctx, variant) {
  // Night sky and sea.
  rect(ctx, 0, 0, 600, 260, '#1c2440');
  rect(ctx, 0, 260, 600, 110, '#2a4a6b');
  for (let x = 0; x < 600; x += 46) line(ctx, x, 296, x + 30, 296, '#4a7a9b', 3);
  rect(ctx, 0, 370, 600, 170, '#5d4a33');
  // Stars; one of them is a difference.
  const stars = [[60, 60], [150, 40], [220, 90], [380, 50], [540, 150], [430, 160]];
  for (const [x, y] of stars) drawStar(ctx, x, y, 9, '#fff3b0');
  if (!variant.has('star')) drawStar(ctx, 306, 66, 11, '#fff3b0');
  // Moon: full on the left, crescent on the right.
  if (variant.has('moon')) {
    circle(ctx, 486, 92, 26, '#f4efe4');
    circle(ctx, 498, 86, 22, '#1c2440');
  } else {
    circle(ctx, 486, 92, 26, '#f4efe4');
    circle(ctx, 478, 86, 4, '#c9c2b0');
    circle(ctx, 494, 98, 3, '#c9c2b0');
  }
  // Lighthouse on the rocks.
  rect(ctx, 96, 120, 56, 160, '#f4efe4');
  rect(ctx, 96, 150, 56, 22, '#c0392b');
  rect(ctx, 96, 210, 56, 22, '#c0392b');
  rect(ctx, 88, 92, 72, 30, '#2f3844');
  circle(ctx, 124, 106, 12, '#ffd94a');
  if (!variant.has('beam')) {
    ctx.fillStyle = 'rgba(255, 217, 74, 0.28)';
    ctx.beginPath();
    ctx.moveTo(140, 106); ctx.lineTo(330, 60); ctx.lineTo(330, 150); ctx.closePath(); ctx.fill();
  }
  // Telescope on a tripod, pointing at the moon.
  line(ctx, 420, 300, 400, 370, '#8a7a5a', 6);
  line(ctx, 420, 300, 440, 370, '#8a7a5a', 6);
  line(ctx, 420, 300, 420, 370, '#8a7a5a', 6);
  ctx.save();
  ctx.translate(420, 290);
  ctx.rotate(-0.35);
  rect(ctx, -10, -46, 20, 62, '#4a6fa5');
  circle(ctx, 0, -48, 10, '#aee3f5');
  ctx.restore();
  // The tidepool.
  ellipse(ctx, 300, 420, 150, 52, '#3f7a9b');
  ellipse(ctx, 300, 420, 120, 38, '#5d9ab5');
  // Fish in the pool.
  if (!variant.has('fish')) {
    ellipse(ctx, 262, 402, 18, 10, '#e8a93d');
    ctx.fillStyle = '#e8a93d';
    ctx.beginPath(); ctx.moveTo(244, 402); ctx.lineTo(232, 392); ctx.lineTo(232, 412); ctx.closePath(); ctx.fill();
    circle(ctx, 274, 400, 2, '#222');
  }
  // Crab on the rocks.
  if (!variant.has('crab')) {
    ellipse(ctx, 384, 432, 20, 12, '#d95f4b');
    circle(ctx, 372, 424, 5, '#d95f4b');
    circle(ctx, 396, 424, 5, '#d95f4b');
    line(ctx, 368, 438, 352, 448, '#d95f4b', 4);
    line(ctx, 400, 438, 416, 448, '#d95f4b', 4);
  }
  // Bucket by the pool.
  ctx.fillStyle = variant.has('bucket') ? '#4a90a5' : '#c0392b';
  ctx.beginPath();
  ctx.moveTo(104, 436); ctx.lineTo(140, 436); ctx.lineTo(134, 472); ctx.lineTo(110, 472);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8a7a5a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(122, 436, 14, Math.PI, 0); ctx.stroke();
  // Shells on the right-hand rock; one fewer on the right.
  const shells = variant.has('shells')
    ? [[470, 462], [506, 466]]
    : [[462, 460], [486, 466], [510, 460]];
  for (const [x, y] of shells) {
    ctx.fillStyle = '#f4efe4';
    ctx.beginPath(); ctx.arc(x, y, 11, Math.PI, 0); ctx.closePath(); ctx.fill();
    line(ctx, x - 6, y - 4, x + 6, y - 4, '#c9a86a', 2);
  }
  // Rocks and seaweed.
  ellipse(ctx, 60, 500, 70, 26, '#4a3a28');
  ellipse(ctx, 540, 505, 80, 28, '#4a3a28');
  line(ctx, 340, 470, 330, 440, '#5d8a4a', 4);
  line(ctx, 352, 470, 358, 438, '#5d8a4a', 4);
  ellipse(ctx, 180, 500, 40, 14, '#3f6b2f');
}

export const LEVELS = [
  { id: 'bakery', draw: drawBakery, differences: BAKERY_DIFFS },
  { id: 'garden', draw: drawGarden, differences: GARDEN_DIFFS },
  { id: 'tidepool', draw: drawTidepool, differences: TIDEPOOL_DIFFS },
];

/** Draw one scene into a panel-local context. `variant` is the set of
 * difference ids applied to that panel (empty for the left panel). */
export function drawScene(ctx, levelIndex, variant) {
  LEVELS[levelIndex].draw(ctx, variant);
}
