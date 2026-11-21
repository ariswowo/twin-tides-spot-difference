// All sound is synthesised with WebAudio — no audio files, no network.
// A find chimes, a miss buzzes, a hint shimmers, a win arpeggiates.

export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();
    } catch {
      context = null;
    }
    return context;
  }

  function tone(freq, start, duration, type, volume) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration + 0.05);
  }

  return {
    get muted() { return muted; },
    toggleMute() { muted = !muted; return muted; },
    unlock() { ensure(); },
    click() { tone(520, 0, 0.06, 'sine', 0.08); },
    found() { tone(660, 0, 0.14, 'triangle', 0.16); tone(880, 0.09, 0.2, 'triangle', 0.16); tone(1320, 0.18, 0.22, 'sine', 0.1); },
    miss() { tone(160, 0, 0.18, 'sawtooth', 0.07); tone(110, 0.05, 0.2, 'sawtooth', 0.06); },
    hint() { tone(980, 0, 0.12, 'sine', 0.1); tone(1240, 0.08, 0.16, 'sine', 0.1); },
    levelWin() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.25, 'triangle', 0.15)); },
    gameWin() { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.15)); },
    tick() { tone(880, 0, 0.05, 'square', 0.04); },
    timeout() { tone(392, 0, 0.25, 'triangle', 0.14); tone(311, 0.22, 0.35, 'triangle', 0.14); },
  };
}
