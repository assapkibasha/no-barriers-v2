import type { HandKey, SignDef } from "../types";
import { repeat, signer } from "./kit.ts";

/** Family relations, REB manual p.37–40. */
const { one, two } = signer("REB RSL manual p.37–40");

/** Non-dominant index finger held forward, as a base for BROTHER, SISTER. */
const BASE_POINT: HandKey = { t: 0, hs: "point", at: "neutral", off: [-0.03, -0.04, -0.02], dir: "fwd+in", palm: "down" };
/** Non-dominant hand waiting to be clasped (HUSBAND, WIFE). */
const BASE_CLASP: HandKey = { t: 0, hs: "curved", at: "chest", off: [-0.02, -0.05, 0.18], dir: "fwd+in", palm: "up+in" };
const FOREARM_UP: HandKey = { t: 0, hs: "flat", at: "stomach", off: [-0.08, 0.1, 0.18], dir: "in", palm: "up" };

const signs: SignDef[] = [
  two("family.family", "Family",
    [{ t: 0, hs: "flatSpread", at: "chest", off: [0.03, 0.04, 0.18], dir: "up+in", palm: "fwd" }, { t: 0.3, off: [0.17, -0.02, 0.15], dir: "up", palm: "fwd+in", flow: 1 }, { t: 0.62, off: [0.04, -0.1, 0.16], dir: "up+in", palm: "back" }],
    [{ t: 0, hs: "flatSpread", at: "chest", off: [0.03, 0.04, 0.18], dir: "up+in", palm: "fwd" }, { t: 0.3, off: [0.17, -0.02, 0.15], dir: "up", palm: "fwd+in", flow: 1 }, { t: 0.62, off: [0.04, -0.1, 0.16], dir: "up+in", palm: "back" }],
    { tip: "Open hands start together in front, circle outward and meet again: everyone together." }),
  one("family.parents", "Parents", [
    { t: 0, hs: "flat", at: "temple", site: "palm", off: [0.03, 0.01, 0.04], dir: "up", palm: "in+fwd" },
    { t: 0.45, at: "cheek", off: [0.04, -0.02, 0.04], arc: [0.03, 0, 0.02] }, { t: 0.6 },
  ], { tip: "Flat hand at the forehead (father) moves down to the cheek (mother)." }),
  one("family.father", "Father", [
    { t: 0, hs: "flat", at: "temple", site: "palm", off: [0.025, -0.05, 0.03], dir: "up", palm: "in+fwd" },
    { t: 0.12 }, { t: 0.45, off: [0.08, -0.04, 0.03], palm: "fwd+in", arc: [0, 0.02, 0] }, { t: 0.58 },
  ], { tip: "Flat hand beside the forehead moves out and back." }),
  one("family.mother", "Mother", [
    { t: 0, hs: "flat", at: "cheek", site: "palm", off: [0.12, -0.05, 0.06], dir: "up", palm: "fwd+in" },
    { t: 0.4, off: [0.025, -0.045, 0.02], palm: "in+fwd", arc: [0, 0.02, 0] }, { t: 0.56 },
  ], { tip: "Flat hand comes in to rest beside the cheek." }),
  two("family.child", "Child",
    [{ t: 0, hs: "flat", at: "stomach", off: [0.04, 0.12, 0.2], dir: "fwd+in", palm: "down" }, ...repeat({ off: [0.04, 0.07, 0.2] }, { off: [0.04, 0.11, 0.2] }, 1, 0.15, 0.18)],
    [{ ...FOREARM_UP, off: [-0.06, 0.04, 0.18] }, { t: 0.55 }],
    { tip: "Flat hand, palm down, pats down at a child's height above the other forearm." }),
  two("family.brother", "Brother",
    [{ t: 0, hs: "A", at: "chin", site: "thumb", off: [0.01, -0.01, 0.02], dir: "up", palm: "in" }, { t: 0.1 }, { t: 0.55, hs: "point", at: "other.index", site: "index", off: [0.0, -0.02, 0], dir: "fwd+in", palm: "down", arc: [0.04, 0.0, 0.05] }, { t: 0.7 }],
    [BASE_POINT, { t: 0.7 }],
    { tip: "From the chin, the hand moves down and lays its index finger on top of the other index finger." }),
  two("family.sister", "Sister",
    [{ t: 0, hs: "A", at: "cheek", site: "thumb", off: [-0.01, -0.03, 0.02], dir: "up", palm: "in" }, { t: 0.1 }, { t: 0.55, hs: "point", at: "other.index", site: "index", off: [0.0, -0.02, 0], dir: "fwd+in", palm: "down", arc: [0.04, 0.0, 0.05] }, { t: 0.7 }],
    [BASE_POINT, { t: 0.7 }],
    { tip: "From the cheek, the hand moves forward and lays its index finger on the other index finger.", review: true }),
  one("family.aunt", "Aunt", [
    { t: 0, hs: "thumbUp", at: "chestSide", site: "thumb", off: [-0.03, 0.06, 0.03], dir: "up", palm: "in" },
    { t: 0.4, at: "shoulder", off: [-0.02, 0.0, 0.06], dir: "up+back", arc: [0, 0.02, 0.02] }, { t: 0.52 },
  ], { tip: "Thumbs-up hand on the chest moves up toward the shoulder.", review: true }),
  one("family.cousin", "Cousin", [
    { t: 0, hs: "curved", at: "ear", site: "fingers", off: [0.02, 0.02, 0.05], dir: "up+back", palm: "in" },
    { t: 0.2, off: [0.03, 0.05, 0.02], flow: 1 }, { t: 0.4, off: [0.03, 0.0, -0.01], flow: 1 }, { t: 0.6, off: [0.02, 0.02, 0.05] },
  ], { tip: "Curved hand beside the ear makes a small circle.", review: true }),
  two("family.uncle", "Uncle",
    [{ t: 0, hs: "U", at: "other.middle", site: "middle", off: [-0.04, -0.015, 0.0], dir: "up+in", palm: "fwd+in" }, ...repeat({ off: [-0.04, -0.04, 0.02] }, { off: [-0.04, -0.015, 0] }, 1, 0.12, 0.15)],
    [{ t: 0, hs: "U", at: "chest", off: [-0.02, 0.02, 0.2], dir: "up+in", palm: "fwd+in" }, { t: 0.5 }],
    { tip: "Two raised fingers cross over the other hand's two fingers and tap.", review: true }),
  one("family.grandmother", "Grandmother", [
    { t: 0, hs: "flatSpread", at: "chin", site: "thumb", off: [0.01, 0, 0.02], dir: "up+in", palm: "in" },
    { t: 0.3, at: "neutral", site: "palm", off: [0.04, 0.12, 0.04], arc: [0, 0.03, 0.02], flow: 0.5 },
    { t: 0.6, off: [0.06, 0.02, 0.1], arc: [0, 0.03, 0.02] }, { t: 0.72 },
  ], { tip: "Open hand, thumb on the chin, arcs forward in two hops: MOTHER, one generation further." }),
  one("family.grandfather", "Grandfather", [
    { t: 0, hs: "flatSpread", at: "forehead", site: "thumb", off: [0.02, 0, 0.02], dir: "up+in", palm: "in" },
    { t: 0.3, at: "neutralHigh", site: "palm", off: [0.06, 0.12, 0.04], arc: [0, 0.03, 0.02], flow: 0.5 },
    { t: 0.6, off: [0.08, 0.02, 0.1], arc: [0, 0.03, 0.02] }, { t: 0.72 },
  ], { tip: "Open hand, thumb on the forehead, arcs forward in two hops: FATHER, one generation further." }),
  two("family.husband", "Husband",
    [{ t: 0, hs: "A", at: "chin", site: "thumb", off: [0.01, -0.01, 0.02], dir: "up", palm: "in" }, { t: 0.1 }, { t: 0.55, hs: "curved", at: "other.palm", site: "palm", off: [0.0, 0.02, 0], dir: "fwd+in", palm: "down+in", arc: [0.03, 0, 0.04] }, { t: 0.72 }],
    [BASE_CLASP, { t: 0.72 }],
    { tip: "From the chin, the hand moves down and clasps the other hand." }),
  two("family.wife", "Wife",
    [{ t: 0, hs: "curved", at: "cheek", site: "thumb", off: [0.0, -0.03, 0.02], dir: "up+fwd", palm: "in" }, { t: 0.1 }, { t: 0.55, at: "other.palm", site: "palm", off: [0.0, 0.02, 0], dir: "fwd+in", palm: "down+in", arc: [0.03, 0, 0.04] }, { t: 0.72 }],
    [BASE_CLASP, { t: 0.72 }],
    { tip: "Cupped hand at the cheek moves down and clasps the other hand." }),
  two("family.son", "Son",
    [{ t: 0, hs: "A", at: "chin", site: "thumb", off: [0.01, -0.01, 0.02], dir: "up", palm: "in" }, { t: 0.1 }, { t: 0.6, hs: "flat", at: "other.palm", site: "back", off: [0.02, 0.03, 0], dir: "fwd+in", palm: "up", arc: [0.06, 0, 0.05] }, { t: 0.75 }],
    [{ ...FOREARM_UP }, { t: 0.75 }],
    { tip: "From the chin, the hand swings down to rest on the other forearm, as if holding a baby." }),
  two("family.daughter", "Daughter",
    [{ t: 0, hs: "thumbUp", at: "cheek", site: "thumb", off: [0.0, -0.02, 0.02], dir: "up", palm: "in" }, { t: 0.1 }, { t: 0.6, hs: "flat", at: "other.palm", site: "back", off: [0.02, 0.03, 0], dir: "fwd+in", palm: "up", arc: [0.06, 0, 0.05] }, { t: 0.75 }],
    [{ ...FOREARM_UP }, { t: 0.75 }],
    { tip: "Thumb on the cheek, then the hand curves down onto the other forearm." }),
  two("family.widow", "Widow / widower",
    [{ t: 0, hs: "V", at: "other.index", site: "index", off: [0.0, 0.0, -0.02], dir: "up+in", palm: "fwd" }, { t: 0.1 }, { t: 0.45, off: [0.0, 0.0, -0.12], dir: "up", arc: [0, 0.01, 0.02] }, { t: 0.6 }],
    [{ t: 0, hs: "V", at: "chest", off: [-0.02, 0.0, 0.2], dir: "up+in", palm: "fwd" }, { t: 0.6 }],
    { tip: "Two fingers touching the other hand's two fingers pull apart to the side: one partner gone.", review: true }),
  two("family.marriage", "Marriage",
    [{ t: 0, hs: "U", at: "temple", off: [0.06, 0.04, 0.06], dir: "up", palm: "fwd+in" }, { t: 0.45, at: "chest", off: [-0.03, 0.02, 0.2], dir: "up+in", palm: "fwd", arc: [0.04, 0.0, 0.04] }, { t: 0.62 }],
    [{ t: 0, hs: "U", at: "temple", off: [0.06, 0.04, 0.06], dir: "up", palm: "fwd+in" }, { t: 0.45, at: "chest", off: [-0.0, 0.0, 0.17], dir: "up+in", palm: "back", arc: [0.04, 0.0, 0.04] }, { t: 0.62 }],
    { tip: "Two-finger hands come down from beside the head and cross in front of the chest.", review: true }),
  two("family.divorced", "Divorced",
    [{ t: 0, hs: "point", at: "chest", site: "index", off: [0.02, 0.06, 0.18], dir: "up", palm: "fwd+in" }, { t: 0.45, off: [0.2, 0.04, 0.12], arc: [0, 0.02, 0.02] }, { t: 0.6 }],
    [{ t: 0, hs: "point", at: "chest", site: "index", off: [0.02, 0.06, 0.18], dir: "up", palm: "fwd+in" }, { t: 0.45, off: [0.2, 0.04, 0.12], arc: [0, 0.02, 0.02] }, { t: 0.6 }],
    { tip: "Two index fingers side by side move apart." }),
];

export default signs;
