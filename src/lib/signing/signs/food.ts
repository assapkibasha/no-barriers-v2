import type { HandKey, SignDef } from "../types";
import { repeat, signer } from "./kit.ts";

/** Foods and beverages, REB manual p.47–51. */
const { one, two, seq } = signer("REB RSL manual p.47–51");

const BASE_INDEX_UP: HandKey = { t: 0, hs: "point", at: "neutral", off: [-0.04, 0.0, -0.06], dir: "up", palm: "back+in" };
const CUP: HandKey = { t: 0, hs: "C", at: "neutral", off: [-0.03, -0.04, -0.06], dir: "fwd+in", palm: "in" };
const FIST_BASE: HandKey = { t: 0, hs: "S", at: "neutral", off: [-0.03, -0.04, -0.06], dir: "fwd+in", palm: "in" };

const signs: SignDef[] = [
  one("food.beans", "Beans", [
    { t: 0, hs: "pinch", at: "ear", site: "thumb", off: [0.045, 0, 0.07], dir: "up+fwd", palm: "in" },
    ...repeat({ off: [0.03, 0.015, 0.06], palm: "in+fwd" }, { off: [0.03, -0.01, 0.06], palm: "in+back" }, 3, 0.1, 0.1),
  ], { tip: "Hold the fingers by the ear and shake, as if rattling dry beans.", review: true }),
  two("food.milk", "Milk",
    [{ t: 0, hs: "C", at: "chest", off: [0.07, 0.02, 0.18], dir: "up+fwd", palm: "in" }, ...repeat({ hs: "S", off: [0.07, -0.04, 0.18] }, { hs: "C", off: [0.07, 0.02, 0.18] }, 2, 0.12, 0.16)],
    [{ t: 0, hs: "S", at: "chest", off: [0.07, -0.04, 0.18], dir: "up+fwd", palm: "in" }, ...repeat({ hs: "C", off: [0.07, 0.02, 0.18] }, { hs: "S", off: [0.07, -0.04, 0.18] }, 2, 0.12, 0.16)],
    { tip: "Both hands squeeze and pull down in turn, like milking a cow." }),
  one("food.orange", "Oranges", [
    { t: 0, hs: "C", at: "cheek", site: "palm", off: [0.02, 0.0, 0.05], dir: "up+fwd", palm: "in" },
    { t: 0.4, at: "chin", off: [0.03, -0.02, 0.07], dir: "fwd+in", palm: "in+up", arc: [0.03, -0.02, 0.02] }, { t: 0.52 },
  ], { tip: "Curved hand by the cheek turns down toward the chin, as if squeezing an orange." }),
  two("food.cabbage", "Cabbages",
    [{ t: 0, hs: "claw", at: "neutralLow", off: [0.0, 0.08, -0.02], dir: "fwd+in", palm: "up" }, { t: 0.35, palm: "down+in", flow: 0.6 }, { t: 0.75, hs: "flat", at: "other.back", site: "pinkySide", off: [0, -0.04, 0], dir: "fwd+in", palm: "in" }, { t: 0.95, off: [0, -0.09, 0] }],
    [{ t: 0, hs: "claw", at: "neutralLow", off: [0.0, 0.08, -0.02], dir: "fwd+in", palm: "up" }, { t: 0.35, palm: "down+in", flow: 0.6 }, { t: 0.75, hs: "S" }, { t: 0.95 }],
    { tip: "Turn both clawed hands over, as if holding a round head, then slice down beside the fist.", review: true }),
  one("food.mango", "Mangoes", [
    { t: 0, hs: "claw", at: "mouth", site: "fingers", off: [0.0, -0.01, 0.03], dir: "up+in", palm: "back+in" },
    ...repeat({ palm: "back" }, { palm: "back+in+in" }, 2, 0.1, 0.13),
  ], { tip: "Clawed hand at the mouth twists back and forth, like biting into a mango.", review: true }),
  two("food.apple", "Apple",
    [{ t: 0, hs: "claw", at: "other.palm", site: "fingers", off: [0.0, 0.03, 0], dir: "down", palm: "down+back" }, { t: 0.45, at: "mouth", off: [0.0, -0.01, 0.03], dir: "up+in", palm: "back", arc: [0.02, 0.0, 0.05] }, { t: 0.6 }],
    [{ t: 0, hs: "claw", at: "neutralLow", off: [-0.02, 0.08, -0.03], dir: "fwd+in", palm: "up" }, { t: 0.6 }],
    { tip: "Clawed hand lifts from the other hand up to the mouth, as if biting an apple." }),
  two("food.banana", "Banana",
    [{ t: 0, hs: "pinch", at: "other.index", site: "thumb", off: [0.0, 0.0, 0.0], dir: "down+in", palm: "back" }, { t: 0.35, off: [-0.06, 0.03, 0.03], arc: [0, 0.01, 0.02] }, { t: 0.45, off: [0.0, -0.01, -0.01] }, { t: 0.8, off: [-0.06, 0.0, -0.04], palm: "fwd" }],
    [BASE_INDEX_UP, { t: 0.8 }],
    { tip: "Peel down the upright index finger of the other hand, once on each side." }),
  one("food.tomato", "Tomato", [
    { t: 0, hs: "point", at: "nose", site: "index", off: [0.02, -0.02, 0.02], dir: "up+in", palm: "back" },
    { t: 0.4, at: "chin", off: [-0.06, -0.02, 0.06], dir: "up+in", arc: [0, 0, 0.03] }, { t: 0.52 },
  ], { tip: "Index finger brushes down from the nose across the lips.", review: true }),
  two("food.carrot", "Carrot",
    [{ t: 0, hs: "S", at: "other.thumb", site: "pinkySide", off: [0.0, 0.02, 0.0], dir: "fwd+in", palm: "in" }, ...repeat({ palm: "down" }, { palm: "in" }, 2, 0.1, 0.14)],
    [FIST_BASE, { t: 0.7 }],
    { tip: "One fist twists against the other, like scraping a carrot.", review: true }),
  two("food.maize", "Maize",
    [{ t: 0, hs: "S", at: "mouth", site: "knuckles", off: [0.05, -0.01, 0.07], dir: "up+in", palm: "back" }, ...repeat({ off: [0.0, -0.01, 0.07] }, { off: [0.05, -0.01, 0.07] }, 2, 0.1, 0.15)],
    [{ t: 0, hs: "S", at: "mouth", site: "knuckles", off: [0.05, -0.01, 0.07], dir: "up+in", palm: "back" }, ...repeat({ off: [0.1, -0.01, 0.07] }, { off: [0.05, -0.01, 0.07] }, 2, 0.1, 0.15)],
    { tip: "Hold an imaginary cob at the mouth with both hands and move it side to side." }),
  one("food.sugar", "Sugar", [
    { t: 0, hs: "U", at: "chin", site: "fingers", off: [0.0, 0.0, 0.02], dir: "up+in", palm: "back" },
    ...repeat({ off: [0.0, -0.03, 0.03] }, { off: [0.0, 0.0, 0.02] }, 2, 0.1, 0.14),
  ], { tip: "Two fingers brush down the chin twice: something sweet." }),
  one("food.oil", "Oil", [
    { t: 0, hs: "O", at: "chin", site: "palm", off: [0.03, 0.0, 0.06], dir: "up+in", palm: "back+in" },
    { t: 0.2, off: [0.05, 0.03, 0.06], flow: 1 }, { t: 0.4, off: [0.02, 0.05, 0.06], flow: 1 }, { t: 0.6, off: [0.0, 0.02, 0.06], flow: 1 }, { t: 0.8, off: [0.03, 0.0, 0.06] },
  ], { tip: "An O hand makes a small circle in front of the chin.", review: true }),
  one("food.salt", "Salt", [
    { t: 0, hs: "pinch", at: "neutral", off: [0.14, 0.0, 0.0], dir: "down+fwd", palm: "down+in" },
    ...repeat({ hs: "flatO", off: [0.14, 0.02, 0.0] }, { hs: "pinch", off: [0.14, 0.0, 0.0] }, 2, 0.1, 0.13),
  ], { tip: "Rub the fingertips together, as if sprinkling salt." }),
  two("food.cook", "Cook",
    [{ t: 0, hs: "point", at: "chest", off: [0.08, 0.0, 0.2], dir: "up", palm: "fwd+in" }, ...repeat({ off: [0.08, 0.07, 0.2] }, { off: [0.08, -0.03, 0.2] }, 2, 0.08, 0.16)],
    [{ t: 0, hs: "point", at: "chest", off: [0.08, 0.04, 0.2], dir: "up", palm: "fwd+in" }, ...repeat({ off: [0.08, -0.04, 0.2] }, { off: [0.08, 0.06, 0.2] }, 2, 0.08, 0.16)],
    { tip: "Both index fingers up, moving up and down in turn." }),
  two("food.wheat", "Wheat",
    [{ t: 0, hs: "pinch", at: "other.wrist", site: "thumb", off: [0.02, -0.02, 0.02], dir: "up+in", palm: "in" }, { t: 0.45, at: "other.index", off: [0.02, -0.01, 0.01] }, { t: 0.58 }],
    [BASE_INDEX_UP, { t: 0.58 }],
    { tip: "Pinched fingers slide up the other upright index finger, like stripping grain from a stalk.", review: true }),
  one("food.groundnuts", "Groundnuts", [
    { t: 0, hs: "A", at: "chin", site: "thumb", off: [0.04, -0.03, 0.06], dir: "up", palm: "in" },
    { t: 0.12, hs: "S" }, { t: 0.42, hs: "pinch", off: [0.08, 0.04, 0.14], dir: "up+fwd", arc: [0, 0.04, 0] }, { t: 0.55 },
  ], { tip: "A quick flick forward from under the chin, like cracking a nut.", review: true }),
  one("food.fanta", "Fanta", [
    { t: 0, hs: "flat", at: "cheek", site: "palm", off: [0.04, 0.0, 0.03], dir: "up", palm: "in" },
    ...repeat({ off: [0.025, 0.0, 0.02] }, { off: [0.04, 0.0, 0.03] }, 2, 0.1, 0.12),
  ], { tip: "Flat palm pats the cheek." }),
  one("food.water", "Water", [
    { t: 0, hs: "W", at: "chin", site: "index", off: [0.0, -0.01, 0.03], dir: "up", palm: "in" },
    ...repeat({ off: [0.0, -0.01, 0.01] }, { off: [0.0, -0.01, 0.03] }, 2, 0.08, 0.12),
  ], { tip: "W hand taps the chin." }),
  two("food.tea", "Tea",
    [{ t: 0, hs: "pinch", at: "other.palm", site: "index", off: [0.0, 0.05, 0.0], dir: "down", palm: "in" }, { t: 0.2, off: [0.02, 0.05, 0.02], flow: 1 }, { t: 0.4, off: [0.0, 0.05, 0.04], flow: 1 }, { t: 0.6, off: [-0.02, 0.05, 0.02], flow: 1 }, { t: 0.8, off: [0.0, 0.05, 0.0] }],
    [{ ...CUP, palm: "in+up" }, { t: 0.8 }],
    { tip: "Pinched fingers stir in circles above the cupped other hand, like a teabag." }),
  one("food.beer", "Beer", [
    { t: 0, hs: "C", at: "mouth", site: "thumb", off: [0.02, -0.05, 0.05], dir: "up", palm: "in" },
    { t: 0.4, off: [0.02, -0.03, 0.05], dir: "up+back", arc: [0, 0.01, 0.02] }, { t: 0.55 },
  ], { nm: "tilt", tip: "A curved hand tips up at the mouth, like drinking from a bottle.", review: true }),
  one("food.porridge", "Porridge", [
    { t: 0, hs: "curved", at: "chest", site: "fingers", off: [0.02, 0.04, 0.03], dir: "in+up", palm: "back" },
    { t: 0.2, off: [0.05, 0.02, 0.03], flow: 1 }, { t: 0.4, off: [0.02, 0.0, 0.03], flow: 1 }, { t: 0.6, off: [-0.01, 0.02, 0.03], flow: 1 }, { t: 0.8, off: [0.02, 0.04, 0.03] },
  ], { tip: "Curved fingers circle on the upper chest, like warm porridge going down.", review: true }),
  one("food.drink", "Drink", [
    { t: 0, hs: "C", at: "chin", site: "thumb", off: [0.0, -0.03, 0.07], dir: "up+fwd", palm: "in" },
    { t: 0.45, at: "mouth", off: [0.0, 0.0, 0.04], dir: "up+back", arc: [0, 0.02, 0.01] }, { t: 0.62 },
  ], { nm: "tilt", tip: "Bring a cupped hand to the mouth and tip it, as if drinking." }),
  seq("food.banana-juice", "Banana juice", ["food.banana", "food.drink"], { review: true, tip: "BANANA, then DRINK." }),
  two("food.coffee", "Coffee",
    [{ t: 0, hs: "S", at: "other.thumb", site: "pinkySide", off: [0.0, 0.0, 0.0], dir: "fwd+in", palm: "down" }, { t: 0.2, off: [0.02, 0.0, 0.02], flow: 1 }, { t: 0.4, off: [0.0, 0.0, 0.04], flow: 1 }, { t: 0.6, off: [-0.02, 0.0, 0.02], flow: 1 }, { t: 0.8, off: [0.0, 0.0, 0.0] }],
    [FIST_BASE, { t: 0.8 }],
    { tip: "One fist grinds in circles on top of the other, like a coffee grinder." }),
  one("food.wine", "Wine", [
    { t: 0, hs: "W", at: "cheek", site: "palm", off: [0.02, -0.04, 0.03], dir: "up", palm: "in" },
    { t: 0.2, off: [0.02, -0.07, 0.04], flow: 1 }, { t: 0.4, off: [0.02, -0.09, 0.03] }, { t: 0.55 },
  ], { tip: "W hand moves down the cheek.", review: true }),
];

export default signs;
