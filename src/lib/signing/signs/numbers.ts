import type { HandKey, SignDef } from "../types";

/** RSL numbers, REB manual p.24–25. When counting, the palm faces the signer. */
const SRC = "REB RSL manual p.25";
const at = (dx = 0, dy = 0, dz = 0): Pick<HandKey, "at" | "off"> => ({ at: "neutral", off: [0.08 + dx, 0.1 + dy, -0.03 + dz] });

const digit = (n: number, hs: string, tip: string): SignDef => ({
  id: `num.${n}`, gloss: String(n), src: SRC, tip,
  r: [{ t: 0, hs, ...at(), dir: "up", palm: "back" }, { t: 0.34, ...at(0, -0.006, 0.004) }],
});

/** 6–9: the other hand is held flat across the body; the counting fingers lie across its fingers. */
const overHand = (n: number, hs: string, count: string): SignDef => ({
  id: `num.${n}`, gloss: String(n), src: SRC,
  tip: `Hold your other hand flat across your body, palm toward you. Lay ${count} across its fingers.`,
  l: [{ t: 0, hs: "flat", at: "neutral", off: [-0.03, 0.07, 0.0], dir: "in+up", palm: "back" }, { t: 0.4 }],
  r: [{ t: 0, hs, at: "other.fingers", site: "index", off: [-0.03, -0.02, 0.02], dir: "in+up+up", palm: "back" }, { t: 0.4, off: [-0.035, -0.018, 0.02] }],
});

const signs: SignDef[] = [
  digit(0, "O", "All fingertips meet the thumb in a round O."),
  digit(1, "point", "Index finger up, palm facing you."),
  digit(2, "V", "Index and middle fingers up and apart."),
  digit(3, "W", "Index, middle and ring fingers up; the thumb holds the little finger."),
  digit(4, "four", "Four fingers up and spread, thumb folded in."),
  digit(5, "S", "A closed fist, palm facing you."),
  overHand(6, "point", "your index finger"),
  overHand(7, "V", "two fingers"),
  overHand(8, "W", "three fingers"),
  overHand(9, "four", "four fingers"),
  {
    id: "num.10", gloss: "10", src: SRC, tip: "Two fists side by side, palms toward you, knuckles touching.",
    r: [{ t: 0, hs: "S", at: "neutral", site: "pinkySide", off: [-0.055, 0.08, -0.03], dir: "up", palm: "back" }, { t: 0.36, off: [-0.055, 0.075, -0.026] }],
    l: [{ t: 0, hs: "S", at: "neutral", site: "pinkySide", off: [-0.055, 0.08, -0.03], dir: "up", palm: "back" }, { t: 0.36, off: [-0.055, 0.075, -0.026] }],
  },
  {
    id: "num.thousand", gloss: "thousand", src: SRC, review: true,
    tip: "After the number, sweep the pointing hand across and up in a short arc.",
    r: [
      { t: 0, hs: "point", at: "neutral", off: [0.12, 0.02, 0], dir: "in", palm: "down" },
      { t: 0.45, off: [-0.02, 0.07, 0.02], arc: [0, -0.03, 0.02] },
    ],
  },
];

export default signs;

/**
 * Sign sequence for a whole number, following the manual's pattern:
 * 0–10 are single signs, 11–19 are 10 + digit, larger numbers are signed digit by digit
 * (20 = 2·0, 100 = 1·0·0), and thousands use the THOUSAND sign (1000 = 1·THOUSAND).
 */
export function numberSigns(n: number): string[] {
  if (!Number.isInteger(n) || n < 0) throw new Error("Only whole numbers can be signed.");
  if (n <= 10) return [`num.${n}`];
  if (n < 20) return ["num.10", `num.${n - 10}`];
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000), rest = n % 1000;
    return [...numberSigns(thousands), "num.thousand", ...(rest ? String(rest).padStart(3, "0").replace(/^0+/, "").split("").map(d => `num.${d}`) : [])];
  }
  return String(n).split("").map(d => `num.${d}`);
}
