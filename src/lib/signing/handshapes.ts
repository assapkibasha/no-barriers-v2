import type { FingerPose, HandshapeDef, ThumbPose } from "./types";

/** Finger joint presets in degrees: [knuckle, middle joint, tip joint]. */
const E: FingerPose = [0, 0, 0]; // extended
const X: FingerPose = [92, 100, 64]; // closed into the palm
const B: FingerPose = [84, 4, 4]; // bent at the knuckle, straight finger
const H: FingerPose = [18, 92, 68]; // hooked
const C: FingerPose = [34, 42, 28]; // curved (C)
const O: FingerPose = [48, 58, 42]; // rounded to meet the thumb
const R: FingerPose = [8, 12, 8]; // relaxed
const P: FingerPose = [45, 8, 6]; // part-bent at the knuckle

/** Thumb presets: [opposition across the palm, abduction away from the index, base flex, tip flex]. */
const T = {
  along: [-30, -20, 0, 0] as ThumbPose, // beside the index (A)
  across: [62, -6, 30, 42] as ThumbPose, // folded across the palm (B, 4)
  out: [6, 48, 0, 0] as ThumbPose, // stretched out (L, 5, Y)
  fist: [60, 0, 30, 40] as ThumbPose, // wrapped over curled fingers (S)
  touch: [48, 20, 18, 22] as ThumbPose, // tip meets the fingertips (O, F, D)
  c: [26, 34, 8, 14] as ThumbPose, // C curve
  tuck: [40, -15, 30, 60] as ThumbPose, // under the fingers (M, N, T, E)
  relaxed: [18, 14, 8, 12] as ThumbPose,
  up: [-34, -24, 0, 0] as ThumbPose, // raised (thumbs-up)
};

const shape = (i: FingerPose, m: FingerPose, r: FingerPose, p: FingerPose, t: ThumbPose, spread = 0, spreads?: HandshapeDef["spreads"], thumbTo?: HandshapeDef["thumbTo"]): HandshapeDef => ({ i, m, r, p, t, spread, spreads, thumbTo });
/** Fingers folded down over a tucked thumb (M, N). */
const FOLD: FingerPose = [80, 98, 52];
/** Index folded over the top of the thumb (T). */
const OVER: FingerPose = [58, 92, 40];

export const HANDSHAPES: Record<string, HandshapeDef> = {
  // General shapes
  rest: shape([14, 22, 12], [18, 26, 14], [22, 30, 16], [26, 34, 18], T.relaxed, 2),
  relaxed: shape(R, R, R, R, T.relaxed, 4),
  flat: shape(E, E, E, E, T.along), // flat B, thumb alongside
  flatSpread: shape(E, E, E, E, T.out, 14), // open 5
  bent: shape(B, B, B, B, T.along), // flat hand bent at knuckles
  claw: shape(H, H, H, H, T.c, 12),
  curved: shape(C, C, C, C, T.c, 2),
  openO: shape(O, O, O, O, T.touch, 0),
  flatO: shape(P, P, P, P, T.touch, 0), // flat O: fingers straight, tips on thumb
  fist: shape(X, X, X, X, T.fist), // S fist
  point: shape(E, X, X, X, T.fist), // index finger
  thumbUp: shape(X, X, X, X, T.up),
  hook: shape(H, X, X, X, T.fist),
  two: shape(E, E, X, X, T.fist, 10),
  twoBent: shape(H, H, X, X, T.fist, 10),
  twoTogether: shape(E, E, X, X, T.fist, 0, [-2, 2, 0, 0]),
  three: shape(E, E, E, X, T.fist, 10),
  four: shape(E, E, E, E, T.across, 9),
  pinch: shape(O, X, X, X, T.touch), // index and thumb pinch, others closed
  okay: shape(O, E, E, E, T.touch, 10), // F: index-thumb circle, others up
  horns: shape(E, X, X, E, T.fist, 8),
  cup: shape([30, 20, 10], [30, 20, 10], [30, 20, 10], [30, 20, 10], T.c, 0),

  // RSL fingerspelling handshapes (REB manual p.23)
  A: shape(X, X, X, X, T.along),
  B: shape(E, E, E, E, T.across),
  C: shape(C, C, C, C, T.c),
  D: shape(E, O, O, O, T.touch),
  E: shape([70, 100, 70], [74, 100, 70], [78, 100, 70], [82, 100, 70], T.tuck),
  F: shape(O, E, E, E, T.touch, 10),
  // Index points; the thumb runs parallel below it on the palm side.
  G: shape(E, X, X, X, [0, 10, 0, 0], 0, undefined, { a: "i", joint: 1, out: 0.028, straight: true }),
  H: shape(E, E, X, X, T.fist, 0, [-2, 2, 0, 0]),
  I: shape(X, X, X, E, T.fist),
  J: shape(X, X, X, E, T.fist),
  // Index up, middle angled forward, thumb close to the palm touching the middle finger.
  K: shape(E, [32, 4, 0], X, X, [25, 5, 15, 10], 0, [6, -10, 0, 0], { a: "m", joint: 1, out: 0.012, along: -0.006 }),
  L: shape(E, X, X, X, T.out),
  // Three fingers folded over the thumb; its tip comes up between the ring and little fingers.
  M: shape(FOLD, FOLD, FOLD, X, T.tuck, 0, undefined, { a: "r", b: "p", joint: 1, out: -0.01, along: -0.004 }),
  // Two fingers folded over the thumb; its tip comes up between the middle and ring fingers.
  N: shape(FOLD, FOLD, X, X, T.tuck, 0, undefined, { a: "m", b: "r", joint: 1, out: -0.01, along: -0.004 }),
  O: shape(O, O, O, O, T.touch),
  P: shape(E, [32, 4, 0], X, X, [25, 5, 15, 10], 0, [6, -10, 0, 0], { a: "m", joint: 1, out: 0.012, along: -0.006 }),
  Q: shape(E, X, X, X, [0, 10, 0, 0], 0, undefined, { a: "i", joint: 1, out: 0.028, straight: true }),
  R: shape([6, 0, 0], [14, 0, 0], X, X, T.fist, 0, [-18, 16, 0, 0]),
  S: shape(X, X, X, X, T.fist),
  // Thumb straight up; the index folds down over its tip.
  T: shape(OVER, X, X, X, [5, -10, 10, 5], 0, undefined, { a: "i", joint: 1, out: 0.016, along: 0.004 }),
  U: shape(E, E, X, X, T.fist, 0, [-2, 2, 0, 0]),
  V: shape(E, E, X, X, T.fist, 12),
  W: shape(E, E, E, X, T.fist, 10),
  X: shape(H, X, X, X, T.fist),
  Y: shape(X, X, X, E, T.out, 0, [0, 0, 0, -14]),
  Z: shape(E, X, X, X, T.fist),
};

export const FINGERS = ["i", "m", "r", "p"] as const;
/** Default spread fan per finger, multiplied by the shape's spread. Positive moves toward the thumb. */
const SPREAD_FAN = [1, 0.1, -0.9, -1.6];
/** The character's rest fingers are splayed; this closes them so spread 0 means fingers together. */
const SPREAD_BASE = [-4, -1, 3, 7];

/** Number of parameters in a shape vector: 4 fingers × (3 flex + spread) + thumb × 4. */
export const SHAPE_SIZE = 20;

export function shapeVector(name: string): Float32Array {
  const def = HANDSHAPES[name];
  if (!def) throw new Error(`Unknown handshape "${name}".`);
  const v = new Float32Array(SHAPE_SIZE);
  FINGERS.forEach((f, k) => {
    v.set(def[f], k * 4);
    v[k * 4 + 3] = SPREAD_BASE[k] + (def.spreads ? def.spreads[k] : (def.spread ?? 0) * SPREAD_FAN[k]);
  });
  v.set(def.t, 16);
  return v;
}

const cache = new Map<string, Float32Array>();
export function getShape(name: string): Float32Array {
  let v = cache.get(name);
  if (!v) cache.set(name, (v = shapeVector(name)));
  return v;
}
