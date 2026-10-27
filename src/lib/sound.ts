/**
 * Learning sounds and haptics, synthesised with the Web Audio API: no audio files to download.
 * Timbres: marimba and FM bells for good news, a muted double thud for mistakes. Finishing a
 * lesson gets the full treatment: a brass "ta-da", a cartoon bouncing-ball "boing", a magical
 * ascending sparkle run, and the room erupting in cheers, claps and a whistle — all through a
 * small room reverb, and paired with a matching phone vibration that builds to one big buzz.
 * The audio context starts on the first user gesture (browsers require that). Learners can mute
 * sound; the choice is remembered in this browser.
 */
export type Cue = "tap" | "correct" | "wrong" | "streak" | "complete" | "transition" | "heartsOut" | "refill";

const KEY = "nb-sound";
const VIBRATE_KEY = "nb-vibrate";
let ctx: AudioContext | null = null;
let out: AudioNode | null = null;
let wet: GainNode | null = null;

export function soundEnabled() {
  try { return localStorage.getItem(KEY) !== "off"; } catch { return true; }
}
const listeners = new Set<() => void>();
let muted = typeof window !== "undefined" ? !soundEnabled() : true;
export function setSoundEnabled(on: boolean) {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* storage unavailable: still applies this session */ }
  muted = !on;
  listeners.forEach(l => l());
}
export function vibrationEnabled() {
  try { return localStorage.getItem(VIBRATE_KEY) !== "off"; } catch { return true; }
}
export function setVibrationEnabled(on: boolean) {
  try { localStorage.setItem(VIBRATE_KEY, on ? "on" : "off"); } catch { /* storage unavailable */ }
  listeners.forEach(l => l());
}
/** For React's useSyncExternalStore: re-render when sound or vibration is switched on or off. */
export function subscribeSound(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    // Master chain: gentle compression so stacked notes never clip, plus a short room reverb.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = 0.003; comp.release.value = 0.15;
    const master = ctx.createGain();
    master.gain.value = 0.8;
    comp.connect(master).connect(ctx.destination);
    const reverb = ctx.createConvolver();
    reverb.buffer = roomImpulse(ctx, 1.1);
    wet = ctx.createGain();
    wet.gain.value = 0.22;
    wet.connect(reverb).connect(comp);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** A decaying stereo noise burst: a small, soft room. */
function roomImpulse(c: AudioContext, seconds: number) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  return buf;
}

/** Route a voice to the dry output and the reverb send. */
function voice(c: AudioContext, at: number, vol: number, attack: number, decay: number) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  g.connect(out!);
  g.connect(wet!);
  return g;
}

/** Marimba: a sine with a quick, woody 4th-harmonic strike. Bright but round. */
function marimba(c: AudioContext, freq: number, at: number, vol = 0.5, decay = 0.45) {
  const g = voice(c, at, vol, 0.004, decay);
  for (const [mult, level, dec] of [[1, 1, decay], [4, 0.35, 0.06], [10, 0.08, 0.02]] as const) {
    const o = c.createOscillator();
    const og = c.createGain();
    o.frequency.setValueAtTime(freq * mult, at);
    og.gain.setValueAtTime(level, at);
    og.gain.exponentialRampToValueAtTime(0.0001, at + dec);
    o.connect(og).connect(g);
    o.start(at); o.stop(at + decay + 0.1);
  }
}

/** FM bell: shimmering, glassy. */
function bell(c: AudioContext, freq: number, at: number, vol = 0.3, decay = 0.9) {
  const g = voice(c, at, vol, 0.003, decay);
  const carrier = c.createOscillator();
  const mod = c.createOscillator();
  const modGain = c.createGain();
  carrier.frequency.setValueAtTime(freq, at);
  mod.frequency.setValueAtTime(freq * 3.5, at);
  modGain.gain.setValueAtTime(freq * 2.2, at);
  modGain.gain.exponentialRampToValueAtTime(1, at + decay);
  mod.connect(modGain).connect(carrier.frequency);
  carrier.connect(g);
  carrier.start(at); mod.start(at);
  carrier.stop(at + decay + 0.1); mod.stop(at + decay + 0.1);
}

/** Brass-like note: detuned saws through a filter that opens as the note swells. */
function brass(c: AudioContext, freq: number, at: number, dur: number, vol = 0.22) {
  const g = voice(c, at, vol, 0.04, dur);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 2;
  filter.frequency.setValueAtTime(freq * 1.5, at);
  filter.frequency.exponentialRampToValueAtTime(freq * 6, at + 0.08);
  filter.frequency.exponentialRampToValueAtTime(freq * 2.5, at + dur);
  filter.connect(g);
  for (const detune of [-7, 0, 7]) {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(freq, at);
    o.detune.value = detune;
    o.connect(filter);
    o.start(at); o.stop(at + dur + 0.1);
  }
}

/** Soft low thud with a slight pitch drop: "not quite". */
function thud(c: AudioContext, freq: number, at: number, vol = 0.45) {
  const g = voice(c, at, vol, 0.006, 0.28);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.connect(g);
  const o = c.createOscillator();
  o.type = "square";
  o.frequency.setValueAtTime(freq, at);
  o.frequency.exponentialRampToValueAtTime(freq * 0.82, at + 0.25);
  o.connect(filter);
  o.start(at); o.stop(at + 0.4);
}

/** Filtered noise: wood "tock", whoosh, or cymbal shimmer. */
function noise(c: AudioContext, at: number, dur: number, vol: number, type: BiquadFilterType, from: number, to: number, q = 1) {
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, at);
  filter.frequency.exponentialRampToValueAtTime(to, at + dur);
  const g = voice(c, at, vol, Math.min(0.02, dur / 4), dur);
  src.connect(filter).connect(g);
  src.start(at);
}

/** Bubble pop: a sine that swoops up fast. Fun and light. */
function pop(c: AudioContext, from: number, to: number, at: number, vol = 0.4, dur = 0.09) {
  const g = voice(c, at, vol, 0.004, dur + 0.05);
  const o = c.createOscillator();
  o.frequency.setValueAtTime(from, at);
  o.frequency.exponentialRampToValueAtTime(to, at + dur);
  o.connect(g);
  o.start(at); o.stop(at + dur + 0.1);
}

/** Slide whistle: a pure tone gliding between pitches, with a little vibrato. */
function slide(c: AudioContext, pitches: number[], at: number, dur: number, vol = 0.22, wobble = 6) {
  const g = voice(c, at, vol, 0.02, dur);
  const o = c.createOscillator();
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = wobble;
  lfoGain.gain.value = pitches[0] * 0.012;
  lfo.connect(lfoGain).connect(o.frequency);
  o.type = "triangle";
  pitches.forEach((f, k) => {
    const when = at + (dur * k) / Math.max(1, pitches.length - 1);
    if (k === 0) o.frequency.setValueAtTime(f, when); else o.frequency.exponentialRampToValueAtTime(f, when);
  });
  o.connect(g);
  o.start(at); lfo.start(at);
  o.stop(at + dur + 0.1); lfo.stop(at + dur + 0.1);
}

/** Cartoon "bwoop": a buzzy tone that bends down through a closing filter. */
function bwoop(c: AudioContext, from: number, to: number, at: number, dur = 0.32, vol = 0.32) {
  const g = voice(c, at, vol, 0.01, dur);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 6;
  filter.frequency.setValueAtTime(1400, at);
  filter.frequency.exponentialRampToValueAtTime(260, at + dur);
  filter.connect(g);
  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(from, at);
  o.frequency.exponentialRampToValueAtTime(to, at + dur);
  const lfo = c.createOscillator(), lg = c.createGain();
  lfo.frequency.value = 9; lg.gain.value = from * 0.04;
  lfo.connect(lg).connect(o.frequency);
  o.connect(filter);
  o.start(at); lfo.start(at); o.stop(at + dur + 0.1); lfo.stop(at + dur + 0.1);
}

/** Tuba-like bass bounce for the fanfare. */
function tuba(c: AudioContext, freq: number, at: number, dur = 0.16, vol = 0.3) {
  const g = voice(c, at, vol, 0.015, dur);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass"; filter.frequency.value = freq * 4;
  filter.connect(g);
  const o = c.createOscillator();
  o.type = "square";
  o.frequency.setValueAtTime(freq * 0.94, at);
  o.frequency.exponentialRampToValueAtTime(freq, at + 0.04);
  o.connect(filter);
  o.start(at); o.stop(at + dur + 0.1);
}

/** A burst of random high tinkles, like confetti. */
function confetti(c: AudioContext, at: number, count: number, spread: number, vol = 0.06) {
  for (let k = 0; k < count; k++) bell(c, pick(SPARKLE) * (1 + (Math.random() - 0.5) * 0.01), at + Math.random() * spread, vol, 0.5 + Math.random() * 0.5);
}

/** A magical ascending glissando through the sparkle scale: a quick shimmering "ta-daa" run. */
function sparkleRun(c: AudioContext, at: number, vol = 0.1, dur = 0.5) {
  SPARKLE.forEach((f, i) => bell(c, f, at + (i * dur) / SPARKLE.length, vol, 0.4 + i * 0.05));
}

/** A cartoon bouncing-ball "boing": a few quick pitched pops with a shrinking, speeding-up gap. Pure fun. */
function bounce(c: AudioContext, at: number, freq = 520, vol = 0.3) {
  const gaps = [0, 0.1, 0.18, 0.24, 0.28, 0.3], decay = [1, 0.72, 0.5, 0.33, 0.2, 0.1];
  gaps.forEach((dt, i) => pop(c, freq * 0.75, freq * 1.35, at + dt, vol * decay[i], 0.05));
}

/**
 * A crowd clapping: many people, each clapping at their own pace with their own hand sound,
 * rendered once into a buffer (a few hundred claps as audio nodes would be far too heavy).
 * Density swells in, holds, then thins out as people stop one by one.
 */
let applauseBuf: AudioBuffer | null = null;
function applauseBuffer(c: AudioContext) {
  if (applauseBuf && applauseBuf.sampleRate === c.sampleRate) return applauseBuf;
  const sr = c.sampleRate, seconds = 3.6, len = Math.floor(sr * seconds);
  const buf = c.createBuffer(2, len, sr);
  const L = buf.getChannelData(0), R = buf.getChannelData(1);
  for (let person = 0; person < 26; person++) {
    const rate = 3.6 + Math.random() * 2.4;        // claps per second
    const start = Math.random() * 0.35;             // people join in quickly
    const stop = 1.9 + Math.random() * 1.5;         // and stop one by one
    const ring = 900 + Math.random() * 1600;        // cupped vs flat hands
    const pan = Math.random();
    const loud = 0.35 + Math.random() * 0.65;
    for (let at = start; at < stop; at += (1 / rate) * (0.88 + Math.random() * 0.24)) {
      const i0 = Math.floor(at * sr), n = Math.floor(sr * (0.018 + Math.random() * 0.014));
      const fade = Math.min(1, (stop - at) / 0.5);  // quieter as each person stops
      const w = 2 * Math.PI * ring / sr;
      for (let i = 0; i < n && i0 + i < len; i++) {
        const env = Math.exp(-i / (n * 0.22));
        const v = ((Math.random() * 2 - 1) * 0.8 + Math.sin(w * i) * 0.5) * env * loud * fade * 0.16;
        L[i0 + i] += v * (1 - pan * 0.6);
        R[i0 + i] += v * (0.4 + pan * 0.6);
      }
    }
  }
  return (applauseBuf = buf);
}

function applause(c: AudioContext, at: number, vol = 0.7) {
  const src = c.createBufferSource();
  src.buffer = applauseBuffer(c);
  src.playbackRate.value = 0.94 + Math.random() * 0.12; // a slightly different crowd every time
  const hp = c.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 380;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(hp).connect(g);
  g.connect(out!); g.connect(wet!);
  src.start(at);
}

/**
 * One person cheering "woo-hoo!": a buzzy voice whose pitch jumps up and wavers, through two
 * formant filters that slide from "oo" to "ah" like an opening mouth.
 */
function cheer(c: AudioContext, at: number, pitch: number, dur: number, vol = 0.07) {
  const g = voice(c, at, vol, 0.06, dur);
  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(pitch * 0.8, at);
  o.frequency.exponentialRampToValueAtTime(pitch * 1.25, at + 0.12);
  o.frequency.exponentialRampToValueAtTime(pitch * 1.05, at + dur);
  const lfo = c.createOscillator(), lg = c.createGain();
  lfo.frequency.value = 5 + Math.random() * 2; lg.gain.value = pitch * 0.03;
  lfo.connect(lg).connect(o.frequency);
  for (const [oo, ah, q, level] of [[320, 780, 7, 1], [800, 1200, 9, 0.6]] as const) {
    const f = c.createBiquadFilter(), fg = c.createGain();
    f.type = "bandpass"; f.Q.value = q;
    f.frequency.setValueAtTime(oo, at);
    f.frequency.exponentialRampToValueAtTime(ah, at + Math.min(0.25, dur * 0.4));
    fg.gain.value = level;
    o.connect(f).connect(fg).connect(g);
  }
  o.start(at); lfo.start(at); o.stop(at + dur + 0.1); lfo.stop(at + dur + 0.1);
}

/** A two-finger whistle somewhere in the crowd. */
function whistle(c: AudioContext, at: number) {
  const base = 1900 + Math.random() * 500;
  slide(c, [base * 0.8, base * 1.3, base * 1.15], at, 0.35, 0.07, 11);
  slide(c, [base * 0.85, base * 1.35, base * 0.9], at + 0.42, 0.5, 0.07, 11);
}

/** A cheering, clapping crowd: applause, several "woo!" voices, crowd noise and a whistle. */
function crowd(c: AudioContext, at: number) {
  applause(c, at, 1.4);
  noise(c, at + 0.05, 2.6, 0.09, "bandpass", 700, 500, 0.8); // crowd roar under the voices
  const voices = 5 + Math.floor(Math.random() * 3);
  for (let k = 0; k < voices; k++) {
    const pitch = pick([170, 210, 260, 300, 340, 400, 450]) * (1 + (Math.random() - 0.5) * 0.08);
    cheer(c, at + 0.05 + Math.random() * 1.1, pitch, 0.45 + Math.random() * 0.5, 0.08 + Math.random() * 0.04);
  }
  if (Math.random() < 0.8) whistle(c, at + 0.3 + Math.random() * 0.8);
}

// Note frequencies (Hz).
const N = { C3: 130.81, G3: 196, C4: 261.63, E4: 329.63, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760, C7: 2093 };
/** Pentatonic notes that always sound happy together. */
const SPARKLE = [N.C6, N.D6, N.E6, N.G6, N.A6, N.C7];
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
/** Tiny random tuning and timing differences so a sound never repeats exactly. */
const vary = (f: number) => f * (1 + (Math.random() - 0.5) * 0.02);
const semis = (f: number, n: number) => f * Math.pow(2, n / 12);

/** Vibration patterns (ms) for phones that support it (Android; iOS ignores web vibration). */
const HAPTICS: Partial<Record<Cue, number[]>> = {
  tap: [8],
  correct: [18],
  wrong: [35, 50, 35],
  streak: [15, 35, 15, 35, 30],
  complete: [25, 50, 25, 50, 20, 35, 20, 30, 150],
  heartsOut: [60, 80, 120],
  refill: [15, 40, 15],
};

/**
 * Play a cue. `level` is the current run of correct answers: each one plays a little higher,
 * so a streak audibly builds up (up to seven semitones).
 */
export function play(cue: Cue, level = 0) {
  const pattern = HAPTICS[cue];
  if (pattern && typeof navigator !== "undefined" && "vibrate" in navigator && vibrationEnabled()) {
    try { navigator.vibrate(pattern); } catch { /* not allowed here */ }
  }
  if (muted) return;
  const c = audio();
  if (!c) return;
  const t = c.currentTime + 0.01;
  const up = Math.min(7, Math.max(0, level - 1));
  switch (cue) {
    case "tap": {
      const f = vary(pick([N.C6, N.D6, N.E6, N.G6]));
      pop(c, f * 0.6, f, t, 0.5, 0.05);
      marimba(c, f, t + 0.01, 0.12, 0.08);
      break;
    }
    case "correct": {
      const variant = Math.floor(Math.random() * 3);
      const a = semis(N.E5, up), b = semis(N.A5, up), top = semis(N.E6, up);
      pop(c, a * 0.7, a * 1.2, t, 0.25, 0.06);
      if (variant === 0) { marimba(c, vary(a * 2), t + 0.03, 0.45, 0.25); marimba(c, vary(b * 2), t + 0.12, 0.55, 0.5); }
      else if (variant === 1) { [a, b, top].forEach((f, k) => marimba(c, vary(f * (k < 2 ? 2 : 1)), t + 0.03 + k * 0.06, 0.42, 0.4)); }
      else { marimba(c, vary(b * 2), t + 0.03, 0.5, 0.25); marimba(c, vary(semis(b, 4) * 2), t + 0.12, 0.55, 0.55); }
      bell(c, top * 2, t + 0.12, 0.07, 0.6);
      confetti(c, t + 0.15, 2 + up, 0.25, 0.035);
      break;
    }
    case "wrong":
      bwoop(c, vary(330), 150, t, 0.34, 0.3);
      thud(c, 110, t + 0.02, 0.25);
      break;
    case "streak":
      slide(c, [semis(N.C5, up), semis(N.C6, up), semis(N.G6, up)], t, 0.38, 0.16, 7);
      [N.C6, N.E6, N.G6, N.C7].forEach((f, k) => marimba(c, semis(f, up), t + 0.3 + k * 0.05, 0.32, 0.4));
      confetti(c, t + 0.4, 8, 0.6, 0.05);
      break;
    case "complete":
      // A bright "ta-da!", a playful bounce, a magical sparkle run, and the room erupting in cheers.
      [N.C5, N.E5, N.G5].forEach((f, k) => brass(c, f, t + k * 0.09, 0.1, 0.1));
      [N.C5, N.E5, N.G5, N.C6].forEach(f => brass(c, f, t + 0.28, 0.5, 0.07));
      tuba(c, N.C3, t + 0.28, 0.45, 0.22);
      bounce(c, t + 0.56, 560, 0.26);
      sparkleRun(c, t + 0.6, 0.11, 0.55);
      confetti(c, t + 0.3, 8, 0.9, 0.04);
      crowd(c, t + 0.3);
      break;
    case "transition":
      noise(c, t, 0.3, 0.14, "bandpass", 400, 3000, 1.4);
      pop(c, vary(N.G5) * 0.6, vary(N.G5) * 1.3, t + 0.22, 0.2, 0.08);
      break;
    case "heartsOut":
      // A playful "sad trombone": wah, wah, wah, waaah.
      [[N.G4, N.G4 * 0.97], [semis(N.G4, -1), semis(N.G4, -1.3)], [semis(N.G4, -2), semis(N.G4, -2.3)]].forEach(([a, b], k) => slide(c, [a, b], t + k * 0.28, 0.24, 0.2, 5));
      slide(c, [semis(N.G4, -3), semis(N.G4, -4.5)], t + 0.86, 0.75, 0.2, 7);
      break;
    case "refill":
      [N.G5, N.B5, N.D6, N.G6].forEach((f, k) => pop(c, vary(f) * 0.7, vary(f), t + k * 0.08, 0.25, 0.07));
      confetti(c, t + 0.3, 5, 0.4, 0.05);
      break;
  }
}
