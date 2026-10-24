import type { HandKey, SignDef } from "../types";
import { ARM_BAR, repeat, signer } from "./kit.ts";

/** Clothing and colours, REB manual p.52–56. */
const { one, two } = signer("REB RSL manual p.52–56");

const both = (keys: HandKey[]) => keys.map(k => ({ ...k }));
const BASE_HAND_UP: HandKey = { t: 0, hs: "flatSpread", at: "neutral", off: [-0.04, 0.02, -0.06], dir: "up", palm: "back" };

const signs: SignDef[] = [
  two("clothes.clothes", "Clothes",
    both([{ t: 0, hs: "flatSpread", at: "chestSide", site: "palm", off: [0.02, 0.06, 0.025], dir: "in+down", palm: "back" }, { t: 0.4, off: [0.04, -0.14, 0.03] }, { t: 0.5 }]),
    both([{ t: 0, hs: "flatSpread", at: "chestSide", site: "palm", off: [0.02, 0.06, 0.025], dir: "in+down", palm: "back" }, { t: 0.4, off: [0.04, -0.14, 0.03] }, { t: 0.5 }]),
    { tip: "Open hands brush down the front of the body." }),
  two("clothes.wear", "To wear",
    both([{ t: 0, hs: "A", at: "chestSide", site: "thumb", off: [0.0, 0.08, 0.06], dir: "in+up", palm: "back+in" }, { t: 0.4, off: [0.0, -0.02, 0.05] }, { t: 0.52 }]),
    both([{ t: 0, hs: "A", at: "chestSide", site: "thumb", off: [0.0, 0.08, 0.06], dir: "in+up", palm: "back+in" }, { t: 0.4, off: [0.0, -0.02, 0.05] }, { t: 0.52 }]),
    { tip: "Fists at the top of the chest pull down, as if pulling on a shirt." }),
  one("clothes.uniform", "Uniform", [
    { t: 0, hs: "flat", at: "chestOpp", site: "palm", off: [-0.06, 0.04, 0.02], dir: "in+down", palm: "back+in" },
    { t: 0.45, at: "stomach", off: [-0.15, -0.02, 0.0] }, { t: 0.56 },
  ], { tip: "Flat hand brushes down the side of the body.", review: true }),
  two("clothes.tshirt", "T-shirt",
    both([{ t: 0, hs: "pinch", at: "shoulderOpp", site: "thumb", off: [-0.02, -0.03, 0.15], dir: "in+down", palm: "back" }, ...repeat({ off: [-0.02, -0.03, 0.18] }, { off: [-0.02, -0.03, 0.15] }, 1, 0.1, 0.13)]),
    both([{ t: 0, hs: "pinch", at: "shoulderOpp", site: "thumb", off: [-0.02, -0.16, 0.04], dir: "in+down", palm: "back" }, ...repeat({ off: [-0.02, -0.16, 0.07] }, { off: [-0.02, -0.16, 0.04] }, 1, 0.1, 0.13)]),
    { tip: "Arms crossed, pinch and tug at the short sleeves." }),
  two("clothes.shoe", "Shoe",
    both([{ t: 0, hs: "claw", at: "waist", off: [0.1, 0.06, 0.18], dir: "fwd", palm: "down" }, ...repeat({ off: [0.03, 0.06, 0.18] }, { off: [0.1, 0.06, 0.18] }, 2, 0.1, 0.13)]),
    both([{ t: 0, hs: "claw", at: "waist", off: [0.1, 0.06, 0.18], dir: "fwd", palm: "down" }, ...repeat({ off: [0.03, 0.06, 0.18] }, { off: [0.1, 0.06, 0.18] }, 2, 0.1, 0.13)]),
    { tip: "Both hands, palms down, knock together twice." }),
  two("clothes.trouser", "Trouser",
    both([{ t: 0, hs: "flat", at: "waist", off: [0.12, 0.04, 0.06], dir: "down+fwd", palm: "in" }, { t: 0.42, off: [0.13, -0.06, 0.12] }, { t: 0.55 }]),
    both([{ t: 0, hs: "flat", at: "waist", off: [0.12, 0.04, 0.06], dir: "down+fwd", palm: "in" }, { t: 0.42, off: [0.13, -0.06, 0.12] }, { t: 0.55 }]),
    { tip: "Flat hands at the hips move down along the legs." }),
  two("clothes.vest", "Vest",
    both([{ t: 0, hs: "A", at: "shoulder", site: "thumb", off: [-0.06, 0.0, 0.04], dir: "up+in", palm: "back+in" }, ...repeat({ off: [-0.06, -0.04, 0.05] }, { off: [-0.06, 0.0, 0.04] }, 1, 0.1, 0.14)]),
    both([{ t: 0, hs: "A", at: "shoulder", site: "thumb", off: [-0.06, 0.0, 0.04], dir: "up+in", palm: "back+in" }, ...repeat({ off: [-0.06, -0.04, 0.05] }, { off: [-0.06, 0.0, 0.04] }, 1, 0.1, 0.14)]),
    { tip: "Thumbs at the shoulders pull down on the straps." }),
  two("clothes.socks", "Socks",
    [{ t: 0, hs: "curved", at: "other.fingers", site: "palm", off: [0.0, -0.04, 0], dir: "in+fwd", palm: "down+in" }, { t: 0.5, at: "other.wrist", off: [-0.06, -0.04, 0] }, { t: 0.62 }],
    [ARM_BAR, { t: 0.62 }],
    { tip: "Pull the hand along the other forearm, as if pulling up a sock." }),
  one("clothes.hat", "Hat", [
    { t: 0, hs: "pinch", at: "temple", site: "thumb", off: [0.12, 0.06, 0.04], dir: "up+in", palm: "in" },
    { t: 0.35, at: "top", off: [0.04, -0.02, 0.04], arc: [0, 0.04, 0] }, { t: 0.42, off: [0.04, -0.035, 0.04] }, { t: 0.55 },
  ], { tip: "Bring the hand onto the top of the head, like putting on a hat." }),
  two("clothes.belt", "Belt",
    both([{ t: 0, hs: "curved", at: "waist", site: "fingers", off: [0.15, 0.06, 0.06], dir: "in+fwd", palm: "back" }, { t: 0.45, off: [-0.01, 0.06, 0.04], arc: [0, 0, 0.05] }, { t: 0.56 }]),
    both([{ t: 0, hs: "curved", at: "waist", site: "fingers", off: [0.15, 0.04, 0.06], dir: "in+fwd", palm: "back" }, { t: 0.45, off: [-0.01, 0.04, 0.04], arc: [0, 0, 0.05] }, { t: 0.56 }]),
    { tip: "Both hands move around the waist to meet in front, like fastening a belt." }),
  two("clothes.bra", "Bra",
    both([{ t: 0, hs: "curved", at: "chestSide", site: "fingers", off: [-0.04, 0.0, 0.04], dir: "in", palm: "back" }, { t: 0.42, off: [0.12, 0.02, 0.0] }, { t: 0.55 }]),
    both([{ t: 0, hs: "curved", at: "chestSide", site: "fingers", off: [-0.04, 0.0, 0.04], dir: "in", palm: "back" }, { t: 0.42, off: [0.12, 0.02, 0.0] }, { t: 0.55 }]),
    { tip: "Curved hands at the chest move apart to the sides." }),
  two("clothes.glove", "Glove",
    [{ t: 0, hs: "flatSpread", at: "other.fingers", site: "palm", off: [0.03, -0.035, 0], dir: "up", palm: "fwd" }, { t: 0.5, at: "other.knuckles", off: [-0.01, -0.035, 0] }, { t: 0.62 }],
    [BASE_HAND_UP, { t: 0.62 }],
    { tip: "Slide the open hand over the back of the other hand, as if pulling on a glove." }),
  two("clothes.scarf", "Scarf",
    both([{ t: 0, hs: "flat", at: "neck", off: [0.1, -0.03, 0.06], dir: "up+out", palm: "back+in" }, { t: 0.45, off: [-0.07, -0.05, 0.16], dir: "up+out", palm: "back", arc: [0, 0, 0.04] }, { t: 0.6 }]),
    both([{ t: 0, hs: "flat", at: "neck", off: [0.1, -0.07, 0.03], dir: "up+out", palm: "back+in" }, { t: 0.45, off: [-0.07, -0.11, 0.07], dir: "up+out", palm: "back", arc: [0, 0, 0.03] }, { t: 0.6 }]),
    { tip: "Hands cross in front of the neck, wrapping a scarf around." }),
  two("clothes.sweater", "Sweater",
    both([{ t: 0, hs: "flatSpread", at: "chestOpp", off: [-0.04, -0.03, 0.12], dir: "in+up", palm: "back" }, { t: 0.35 }, { t: 0.6, hs: "S", at: "shoulder", site: "thumb", off: [-0.04, 0.0, 0.06], dir: "up", palm: "back+in" }, { t: 0.82, off: [-0.04, -0.06, 0.07] }, { t: 0.92 }]),
    both([{ t: 0, hs: "flatSpread", at: "chestOpp", off: [-0.04, -0.17, 0.04], dir: "in+up", palm: "back" }, { t: 0.35 }, { t: 0.6, hs: "S", at: "shoulder", site: "thumb", off: [-0.04, 0.0, 0.06], dir: "up", palm: "back+in" }, { t: 0.82, off: [-0.04, -0.06, 0.07] }, { t: 0.92 }]),
    { tip: "Arms crossed as if cold, then fists at the shoulders pull a sweater down." }),

  two("color.blue", "Blue",
    [{ t: 0, hs: "pinch", at: "chin", site: "thumb", off: [0.02, -0.01, 0.03], dir: "up+in", palm: "in" }, ...repeat({ palm: "back+in" }, { palm: "in" }, 1, 0.1, 0.15)],
    [{ t: 0, hs: "flat", at: "chest", off: [0.02, 0.06, 0.16], dir: "in+up", palm: "up+back" }, { t: 0.42 }],
    { tip: "Pinched fingers at the chin give a small twist.", review: true }),
  one("color.green", "Green", [
    { t: 0, hs: "flat", at: "shoulder", off: [0.0, 0.1, 0.16], dir: "up", palm: "fwd+in" },
    ...repeat({ off: [0.05, 0.1, 0.16], dir: "up+out" }, { off: [-0.03, 0.1, 0.16], dir: "up+in" }, 2, 0.08, 0.13),
  ], { tip: "Flat hand raised by the shoulder sways from side to side, like leaves." }),
  one("color.red", "Red", [
    { t: 0, hs: "point", at: "mouth", site: "index", off: [0.0, 0.0, 0.01], dir: "up+in", palm: "back" },
    ...repeat({ off: [0.0, -0.035, 0.02] }, { off: [0.0, 0.0, 0.01] }, 1, 0.1, 0.14), { t: 0.48, off: [0.0, -0.035, 0.02] },
  ], { tip: "Index finger brushes down the lips." }),
  one("color.yellow", "Yellow", [
    { t: 0, hs: "claw", at: "chest", site: "fingers", off: [0.02, 0.0, 0.02], dir: "in", palm: "back" },
    { t: 0.4, hs: "flatSpread", off: [0.08, 0.0, 0.08], dir: "in+up", palm: "back+in", arc: [0, 0.02, 0.02] }, { t: 0.52 },
  ], { tip: "Fingers on the chest open outward, like rays of light.", review: true }),
  one("color.black", "Black", [
    { t: 0, hs: "point", at: "temple", site: "index", off: [-0.04, 0.02, 0.03], dir: "in", palm: "down+back" },
    { t: 0.4, off: [0.04, 0.03, 0.0], arc: [0, 0.01, 0.01] }, { t: 0.52 },
  ], { tip: "Index finger draws across the forehead toward the side." }),
  one("color.pink", "Pink", [
    { t: 0, hs: "pinch", at: "nose", site: "index", off: [0.02, -0.01, 0.02], dir: "in+up", palm: "back" },
    { t: 0.35, at: "mouth", off: [0.0, -0.01, 0.02] }, { t: 0.48 },
  ], { tip: "Fingertips brush down from the nose to the lips.", review: true }),
  one("color.gray", "Gray", [
    { t: 0, hs: "pinch", at: "chin", site: "thumb", off: [0.0, 0.0, 0.015], dir: "up+in", palm: "back+in" },
    { t: 0.35, off: [0.0, -0.04, 0.03] }, { t: 0.48 },
  ], { tip: "Pinch the chin and pull down, like stroking a grey beard." }),
];

export default signs;
