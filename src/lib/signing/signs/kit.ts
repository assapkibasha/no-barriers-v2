import type { HandKey, NonManual, SignDef } from "../types";

/** Handshape for each counting number 1–5 (REB manual p.25). */
export const NUM_SHAPE: Record<number, string> = { 1: "point", 2: "V", 3: "W", 4: "four", 5: "S" };

/** Non-dominant forearm held horizontally across the stomach, palm down (time, after, evening). */
export const ARM_BAR: HandKey = { t: 0, hs: "flat", at: "stomach", off: [-0.07, 0.07, 0.16], dir: "in", palm: "down" };
/** Non-dominant flat hand as a base, palm up, in front of the body. */
export const BASE_UP: HandKey = { t: 0, hs: "flat", at: "neutralLow", off: [-0.04, 0.06, -0.04], dir: "fwd+in", palm: "up" };
/** Non-dominant flat hand as a base, palm facing the other side. */
export const BASE_SIDE: HandKey = { t: 0, hs: "flat", at: "neutral", off: [-0.05, 0, -0.04], dir: "up+fwd", palm: "in" };

/** Hold a key: the same pose a little later, so the sign reads clearly. */
export const hold = (t: number, extra: Partial<HandKey> = {}): HandKey => ({ t, ...extra });

type Opts = { nm?: NonManual; tip?: string; review?: boolean };
export const signer = (src: string) => ({
  one: (id: string, gloss: string, r: HandKey[], o: Opts = {}): SignDef => ({ id, gloss, src, r, ...o }),
  two: (id: string, gloss: string, r: HandKey[], l: HandKey[], o: Opts = {}): SignDef => ({ id, gloss, src, r, l, ...o }),
  seq: (id: string, gloss: string, seq: string[], o: Opts = {}): SignDef => ({ id, gloss, src, seq, ...o }),
});

/** Mirror a dominant-hand key list for the other hand (symmetric two-handed signs). */
export const same = (keys: HandKey[]): HandKey[] => keys.map(k => ({ ...k }));

/** Repeat a back-and-forth movement: alternate between keys a and b, n times. */
export function repeat(a: Omit<HandKey, "t">, b: Omit<HandKey, "t">, n: number, start: number, step: number): HandKey[] {
  const out: HandKey[] = [];
  for (let i = 0; i <= n * 2; i++) out.push({ ...(i % 2 ? b : a), t: start + i * step, flow: i === 0 || i === n * 2 ? 0 : 0.6 });
  return out;
}
