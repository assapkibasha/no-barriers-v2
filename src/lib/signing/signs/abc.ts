import type { HandKey, SignDef, Vec3 } from "../types";

/** RSL fingerspelling alphabet, REB manual p.23. Letters are formed in front of the dominant shoulder. */
const SRC = "REB RSL manual p.23";
const BASE: Vec3 = [0.1, 0.13, -0.02];
const at = (dx = 0, dy = 0, dz = 0): Pick<HandKey, "at" | "off"> => ({ at: "neutral", off: [BASE[0] + dx, BASE[1] + dy, BASE[2] + dz] });

/** A held letter: a short settle so the shape reads clearly. */
const held = (c: string, hs: string, dir: string, palm: string, tip: string): SignDef => ({
  id: `abc.${c}`, gloss: c.toUpperCase(), src: SRC, tip,
  r: [{ t: 0, hs, ...at(), dir, palm }, { t: 0.32, ...at(0, -0.006, 0.004) }],
});

const signs: SignDef[] = [
  held("a", "A", "up", "fwd", "Closed fist, thumb resting straight against the side of the index finger."),
  held("b", "B", "up", "fwd", "Flat hand, fingers together and up, thumb folded across the palm."),
  held("c", "C", "up", "in", "Curve the fingers and thumb into a C, opening toward your other side."),
  held("d", "D", "up", "fwd", "Index finger up; the other fingertips touch the thumb."),
  held("e", "E", "up", "fwd", "Fingertips bent down over the thumb, which is tucked under them."),
  held("f", "F", "up", "fwd+in", "Index finger and thumb touch in a circle; the other three fingers stand up."),
  held("g", "G", "in", "back", "Index finger points across your body; thumb lies along it."),
  held("h", "H", "in", "back", "Index and middle fingers together point across your body."),
  held("i", "I", "up", "fwd", "Little finger up from a fist."),
  {
    id: "abc.j", gloss: "J", src: SRC, tip: "Start with I, then draw a J with the little finger: down and curving toward you.",
    r: [
      { t: 0, hs: "J", ...at(0, 0.02), dir: "up", palm: "fwd" },
      { t: 0.22, ...at(-0.005, -0.025, 0.005), dir: "up+in", palm: "fwd+in" },
      { t: 0.42, ...at(-0.03, -0.035, 0), dir: "up+in", palm: "back+in", arc: [0, -0.015, 0] },
    ],
  },
  held("k", "K", "up", "fwd", "Index up, middle finger angled forward, thumb touching the middle finger."),
  held("l", "L", "up", "fwd", "Index finger up and thumb out to form an L."),
  held("m", "M", "up", "fwd", "Three fingers folded over the thumb."),
  held("n", "N", "up", "fwd", "Two fingers folded over the thumb."),
  held("o", "O", "up", "in", "All fingertips meet the thumb to form an O."),
  {
    id: "abc.p", gloss: "P", src: SRC, tip: "K handshape pointing up, then swing it down so it points forward and down.",
    r: [
      { t: 0, hs: "P", ...at(0, 0.02), dir: "up+in", palm: "fwd" },
      { t: 0.4, ...at(0.01, -0.04, 0.02), dir: "fwd+down", palm: "down+in", arc: [0.02, 0.01, 0.02] },
    ],
  },
  {
    id: "abc.q", gloss: "Q", src: SRC, tip: "Index finger and thumb point down, the thumb just below the index.",
    r: [{ t: 0, hs: "Q", ...at(0.02, -0.1, 0.06), dir: "down+fwd", palm: "back+in" }, { t: 0.32, ...at(0.02, -0.106, 0.064) }],
  },
  held("r", "R", "up", "fwd", "Index and middle fingers crossed."),
  held("s", "S", "up", "fwd", "Fist with the thumb across the front of the fingers."),
  held("t", "T", "up", "fwd", "Thumb tucked between the index and middle fingers."),
  held("u", "U", "up", "fwd", "Index and middle fingers up, together."),
  held("v", "V", "up", "fwd", "Index and middle fingers up, apart."),
  held("w", "W", "up", "fwd", "Index, middle and ring fingers up, spread."),
  held("x", "X", "up", "in+fwd", "Index finger hooked."),
  held("y", "Y", "up", "fwd", "Thumb and little finger out."),
  {
    id: "abc.z", gloss: "Z", src: SRC, tip: "Draw a Z in the air with the index finger, as you would write it yourself.",
    r: [
      { t: 0, hs: "Z", ...at(-0.03, 0.03), dir: "up", palm: "fwd" },
      { t: 0.18, ...at(0.03, 0.03), flow: 0.3 },
      { t: 0.38, ...at(-0.03, -0.03), flow: 0.3 },
      { t: 0.56, ...at(0.03, -0.03) },
    ],
  },
];

export default signs;
