import type { SignDef } from "../types";
import { BASE_UP, repeat, signer } from "./kit.ts";

/** Greetings and everyday conversation, REB manual p.34–36. */
const { one, two, seq } = signer("REB RSL manual p.35–36");

const signs: SignDef[] = [
  one("greet.hello", "Hello", [
    { t: 0, hs: "flat", at: "temple", site: "index", off: [-0.01, 0.02, 0.03], dir: "up+in", palm: "fwd+down" },
    { t: 0.12, hold: 0.05 },
    { t: 0.5, off: [0.13, 0, 0.1], dir: "up", palm: "fwd", arc: [0.02, 0.03, 0.02] },
  ], { nm: "smile", tip: "Flat hand at the side of the forehead, like a salute, then move it out and away." }),
  one("greet.goodbye", "Goodbye", [
    { t: 0, hs: "flat", at: "shoulder", off: [0.02, 0.16, 0.14], dir: "up", palm: "fwd" },
    ...repeat({ hs: "bent" }, { hs: "flat" }, 2, 0.15, 0.17),
  ], { nm: "smile", tip: "Raise a flat hand, palm out, and fold the fingers down and up: a wave." }),
  two("greet.how", "How",
    [{ t: 0, hs: "curved", at: "neutral", off: [-0.02, 0.0, -0.06], dir: "fwd+in", palm: "up+back" }, { t: 0.25, off: [0.06, 0.03, 0.0], palm: "back+in", flow: 1 }, { t: 0.5, off: [0.06, -0.01, -0.02], dir: "fwd", palm: "up" }],
    [{ t: 0, hs: "curved", at: "neutral", off: [-0.02, 0.0, -0.06], dir: "fwd+in", palm: "up+back" }, { t: 0.25, off: [0.06, 0.03, 0.0], palm: "back+in", flow: 1 }, { t: 0.5, off: [0.06, -0.01, -0.02], dir: "fwd", palm: "up" }],
    { nm: "wh", tip: "Curved hands, palms up, roll outward together." }),
  seq("greet.how-are-you", "How are you?", ["greet.how", "basic.you"], { tip: "HOW, then point to the person: HOW YOU?" }),
  one("greet.good", "Good", [
    { t: 0, hs: "thumbUp", at: "chest", off: [0.08, 0.04, 0.14], dir: "up", palm: "in" },
    { t: 0.38, off: [0.12, 0.08, 0.24], arc: [0, 0.04, 0] }, { t: 0.5 },
  ], { nm: "smile", tip: "Thumbs up, moving forward." }),
  one("greet.fine", "Fine", [
    { t: 0, hs: "thumbUp", at: "shoulder", off: [-0.06, -0.02, 0.1], dir: "up", palm: "in" },
    { t: 0.4, off: [0.0, 0.03, 0.2], arc: [0.03, 0.04, 0] }, { t: 0.55 },
  ], { nm: "nod", tip: "Thumbs up near the shoulder, arcing forward." }),
  seq("greet.i-am-fine", "I am fine", ["basic.me", "greet.fine"], { tip: "Point to yourself, then FINE." }),
  two("greet.good-morning", "Good morning",
    [{ t: 0, hs: "flat", at: "other.palm", site: "pinkySide", off: [0.02, 0.03, 0], dir: "in+fwd", palm: "up" }, { t: 0.12 }, { t: 0.6, at: "other.fingers", site: "wrist", off: [-0.03, 0.04, 0], dir: "up", palm: "in", arc: [0.05, 0.03, 0.03] }, { t: 0.78 }],
    [{ ...BASE_UP, off: [-0.06, 0.02, -0.02], dir: "in+fwd" }, { t: 0.78 }],
    { nm: "smile", tip: "The flat hand starts lying across the other palm, then rises upright like the sun coming up." }),
  seq("greet.good-afternoon", "Good afternoon", ["greet.good", "time.afternoon"], { tip: "GOOD, then AFTERNOON." }),
  one("greet.good-chin", "Good (evening greeting)", [
    { t: 0, hs: "flat", at: "chin", site: "fingers", off: [0, -0.01, 0.02], dir: "up", palm: "back" },
    { t: 0.4, at: "chest", site: "palm", off: [0.02, 0.0, 0.17], dir: "fwd+up", palm: "up+back", arc: [0, 0, 0.04] }, { t: 0.5 },
  ], { tip: "Fingertips at the chin move down and forward.", review: true }),
  seq("greet.good-evening", "Good evening", ["greet.good-chin", "time.evening"], { tip: "Fingertips from the chin move down, then EVENING." }),
  two("greet.name", "Name",
    [{ t: 0, hs: "H", at: "other.fingers", site: "middle", off: [-0.03, -0.015, 0], dir: "in+fwd", palm: "in+down" }, ...repeat({ off: [-0.03, -0.05, 0] }, { off: [-0.03, -0.015, 0] }, 2, 0.12, 0.14)],
    [{ t: 0, hs: "H", at: "neutral", off: [-0.04, 0.0, -0.06], dir: "in+fwd", palm: "in+back" }, { t: 0.7 }],
    { tip: "Two fingers tap twice across the two fingers of the other hand.", review: true }),
  seq("greet.your-name", "What is your name?", ["greet.name", "basic.you"], { nm: "wh", tip: "NAME YOU? with a questioning face." }),
];

export default signs;
