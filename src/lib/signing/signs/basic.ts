import type { SignDef } from "../types";
import { repeat, signer } from "./kit.ts";

/** Pointing pronouns (shown in "I am fine" and "How are you?", p.35) and YES / NO (p.93). */
const { one } = signer("REB RSL manual p.35, p.93");

const signs: SignDef[] = [
  one("basic.me", "I / me", [
    { t: 0, hs: "point", at: "chest", site: "index", off: [0.04, 0.02, 0.05], dir: [-1, -0.7, -0.45], palm: "down" },
    { t: 0.14, off: [0.04, 0.02, 0.02] }, { t: 0.32 },
  ], { tip: "Point to the middle of your own chest." }),
  one("basic.you", "You", [
    { t: 0, hs: "point", at: "neutral", off: [0.0, 0.05, -0.02], dir: "fwd", palm: "down+in" },
    { t: 0.18, off: [0.0, 0.05, 0.06] }, { t: 0.32 },
  ], { tip: "Point straight at the person you are talking to." }),
  one("basic.he", "He / she", [
    { t: 0, hs: "point", at: "neutral", off: [0.1, 0.04, -0.02], dir: "fwd+out", palm: "down+in" },
    { t: 0.18, off: [0.15, 0.04, 0.03] }, { t: 0.32 },
  ], { tip: "Point to the side, where the person is (or where you placed them)." }),
  one("basic.we", "We", [
    { t: 0, hs: "point", at: "chest", site: "index", off: [0.1, 0.02, 0.06], dir: "back+in", palm: "in" },
    { t: 0.45, off: [-0.1, 0.02, 0.06], arc: [0, 0, 0.08] }, { t: 0.55 },
  ], { tip: "Index finger sweeps from one shoulder to the other in front of the chest." }),
  one("basic.they", "They", [
    { t: 0, hs: "point", at: "neutral", off: [-0.02, 0.04, 0.0], dir: "fwd+out", palm: "down" },
    { t: 0.45, off: [0.2, 0.04, 0.0], arc: [0, 0, 0.04] }, { t: 0.55 },
  ], { tip: "Point and sweep across the people you mean." }),
  one("basic.yes", "Yes", [
    { t: 0, hs: "S", at: "neutral", off: [0.06, 0.08, -0.02], dir: "up", palm: "fwd" },
    ...repeat({ dir: "fwd+up+up", palm: "fwd+down" }, { dir: "up", palm: "fwd" }, 2, 0.1, 0.15),
  ], { nm: "nod", tip: "A fist nods down at the wrist, like a head nodding yes." }),
  one("basic.no", "No", [
    { t: 0, hs: "two", at: "chin", site: "index", off: [0.06, -0.02, 0.1], dir: "up+fwd", palm: "fwd+in" },
    ...repeat({ hs: "pinch" }, { hs: "two" }, 2, 0.1, 0.14),
  ], { nm: "shake", tip: "Index and middle fingers snap down onto the thumb, with a head shake." }),
];

export default signs;
