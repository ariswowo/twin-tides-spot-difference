// Every tuning number, colour and layout constant in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to
// the window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** Two panels, side by side, each 600x540 in logical pixels. */
export const PANEL = { width: 600, height: 540, gap: 40, top: 92, leftX: 20, rightX: 660 };

/** Seconds allowed per level; the timer is the time pressure. */
export const LEVEL_TIME = 180;

/** Hints per level, and what each one costs. */
export const HINTS_PER_LEVEL = 3;
export const HINT_COST = 25;
export const MISS_COST = 10;

/** Points for a find, plus a streak bonus per consecutive find. */
export const FIND_POINTS = 100;
export const STREAK_BONUS = 25;

/** Click tolerance added to a difference's own radius. */
export const CLICK_SLACK = 14;

export const PALETTE = {
  backdrop: '#141821',
  hud: '#1d2333',
  hudEdge: '#39415c',
  text: '#f4efe4',
  muted: '#aab0c2',
  accent: '#ffcf5c',
  accentDark: '#e8a93d',
  good: '#7ddb8a',
  bad: '#ff6b5e',
  ring: '#ffd94a',
  ringFound: '#7ddb8a',
  panelEdge: '#3a415c',
  panelLabel: '#20263a',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best total score is kept between visits (this browser only). */
export const BEST_KEY = 'twin-tides.best';

export const LEVELS = [
  { id: 'bakery', name: "The Baker's Morning", subtitle: 'Ember & Crumb Bakery — dawn, fresh bread, one sleepy cat' },
  { id: 'garden', name: "The Clockmaker's Garden", subtitle: 'A greenhouse that ticks — gears, blooms and one snail' },
  { id: 'tidepool', name: 'The Tidepool Observatory', subtitle: 'Night on the rocks — lighthouse, telescope and low tide' },
];
