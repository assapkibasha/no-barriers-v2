import type { HandKey, SignDef } from "../types";
import { ARM_BAR, BASE_SIDE, NUM_SHAPE, repeat, signer } from "./kit.ts";

/** Time, days of the week and months, REB manual p.27–33. */
const { one, two, seq } = signer("REB RSL manual p.27–33");

/** Weekdays: fingertips touch the chin, then the hand moves out into the day's number. */
const weekday = (id: string, gloss: string, hs: string): SignDef => one(`time.${id}`, gloss, [
  { t: 0, hs: "flat", at: "chin", site: "fingers", off: [0.01, -0.012, 0.025], dir: "up", palm: "back" },
  { t: 0.1, hold: 0.04 },
  { t: 0.5, hs, at: "neutral", site: "palm", off: [0.08, 0.14, -0.06], dir: "up", palm: "back", arc: [0.02, 0.02, 0.02] },
  { t: 0.72, off: [0.08, 0.135, -0.055] },
], { tip: `Touch your chin with your fingertips, then move the hand forward into the number ${gloss === "Sunday" ? "shape with an open hand" : "for the day"}.` });

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthNumber = (n: number) => (n <= 10 ? [`num.${n}`] : ["num.10", `num.${n - 10}`]);

/** Index finger lies on the other wrist, where a watch is worn. */
const WRIST: HandKey = { t: 0, hs: "point", at: "other.wrist", site: "index", off: [0.01, -0.035, 0], dir: "in+down", palm: "down" };

const signs: SignDef[] = [
  two("time.time", "Time", [WRIST, ...repeat({ off: [0.01, -0.06, 0] }, { off: [0.01, -0.035, 0] }, 2, 0.12, 0.14)], [ARM_BAR, { t: 0.7 }],
    { tip: "Tap the back of your other wrist, where a watch would be." }),
  two("time.now", "Now",
    [{ t: 0, hs: "bent", at: "neutral", off: [0.02, 0.06, -0.04], dir: "fwd+up", palm: "up" }, { t: 0.32, off: [0.02, -0.03, -0.02] }, { t: 0.42, off: [0.02, -0.025, -0.02] }],
    [{ t: 0, hs: "bent", at: "neutral", off: [0.02, 0.06, -0.04], dir: "fwd+up", palm: "up" }, { t: 0.32, off: [0.02, -0.03, -0.02] }, { t: 0.42, off: [0.02, -0.025, -0.02] }],
    { tip: "Both bent hands, palms up, drop a short distance together." }),
  two("time.morning", "Morning",
    [{ t: 0, hs: "flatSpread", at: "cheek", off: [0.15, 0.0, 0.06], dir: "up+out", palm: "fwd+in" }, { t: 0.42, off: [0.02, 0.01, 0.0], dir: "up", palm: "in+back", arc: [0.02, 0.03, 0.02] }, { t: 0.6 }],
    [{ t: 0, hs: "flatSpread", at: "cheek", off: [0.15, 0.0, 0.06], dir: "up+out", palm: "fwd+in" }, { t: 0.42, off: [0.02, 0.01, 0.0], dir: "up", palm: "in+back", arc: [0.02, 0.03, 0.02] }, { t: 0.6 }],
    { tip: "Open hands come in to rest beside the cheeks, as if waking up.", review: true }),
  two("time.afternoon", "Afternoon",
    [{ t: 0, hs: "flat", at: "other.fingers", site: "wrist", off: [0.0, 0.03, 0], dir: "up", palm: "in" }, { t: 0.2 }, { t: 0.62, off: [0.03, 0.03, 0], dir: "up+out+out", palm: "in+fwd", arc: [0.03, 0.04, 0] }],
    [{ t: 0, hs: "flat", at: "stomach", off: [-0.05, 0.12, 0.2], dir: "in", palm: "down" }, { t: 0.62 }],
    { tip: "Rest your upright forearm on the other hand, then tip it outward like the sun past midday.", review: true }),
  two("time.evening", "Evening",
    [{ t: 0, hs: "flat", at: "chest", off: [0.1, 0.05, 0.16], dir: "in", palm: "down" }, { t: 0.42, off: [0.04, -0.06, 0.15] }, { t: 0.6 }],
    [{ ...ARM_BAR, off: [-0.07, 0.04, 0.16] }, { t: 0.6 }],
    { tip: "Flat hand held across the chest above the forearm, lowering slightly, like the sun setting." }),
  two("time.night", "Night",
    [{ t: 0, hs: "flat", at: "neutralHigh", off: [0.16, 0.06, -0.04], dir: "up", palm: "fwd" }, { t: 0.5, at: "chest", off: [-0.06, 0.04, 0.28], dir: "up+out", palm: "back", arc: [0.04, 0.02, 0.06] }, { t: 0.66 }],
    [{ t: 0, hs: "flat", at: "neutralHigh", off: [0.16, 0.06, -0.08], dir: "up", palm: "fwd" }, { t: 0.5, at: "chest", off: [-0.06, -0.13, 0.1], dir: "up+out", palm: "back", arc: [0.04, 0.02, 0.02] }, { t: 0.66 }],
    { tip: "Both flat hands swing down and cross in front of the chest, closing like the night." }),

  weekday("monday", "Monday", NUM_SHAPE[1]),
  weekday("tuesday", "Tuesday", NUM_SHAPE[2]),
  weekday("wednesday", "Wednesday", NUM_SHAPE[3]),
  weekday("thursday", "Thursday", NUM_SHAPE[4]),
  weekday("friday", "Friday", NUM_SHAPE[5]),
  two("time.saturday", "Saturday",
    [{ t: 0, hs: "thumbUp", at: "cheek", site: "thumb", off: [0.01, 0.02, 0.03], dir: "up", palm: "in" }, { t: 0.4, off: [0.03, -0.09, 0.07] }, { t: 0.55 }],
    [{ t: 0, hs: "thumbUp", at: "cheek", site: "thumb", off: [0.01, 0.02, 0.03], dir: "up", palm: "in" }, { t: 0.4, off: [0.03, -0.09, 0.07] }, { t: 0.55 }],
    { tip: "Both thumbs-up hands beside the cheeks move down together." }),
  weekday("sunday", "Sunday", "flatSpread"),

  one("time.month", "Month", [
    { t: 0, hs: "pinch", at: "cheek", site: "index", off: [0.01, 0, 0.02], dir: "up+fwd", palm: "in" },
    { t: 0.38, off: [0.09, 0.0, 0.07], arc: [0, 0.015, 0.01] }, { t: 0.5 },
  ], { tip: "Pinched fingers start at the cheek and move straight out to the side." }),
  ...MONTHS.map((m, i) => seq(`time.${m.toLowerCase()}`, m, ["time.month", ...monthNumber(i + 1)], { tip: `MONTH, then the number ${i + 1}.` })),

  two("time.seconds", "Seconds", [{ ...WRIST, hs: "pinch" }, { t: 0.15 }, { t: 0.32, off: [0.03, -0.07, 0.01] }, { t: 0.45 }], [ARM_BAR, { t: 0.45 }],
    { tip: "On the back of the other wrist, flick the fingers away quickly.", review: true }),
  two("time.minutes", "Minutes",
    [{ t: 0, hs: "point", at: "other.knuckles", site: "index", off: [-0.02, -0.03, 0], dir: "fwd+in", palm: "down" }, { t: 0.4, off: [-0.02, -0.03, 0.04], dir: "in", arc: [0, 0.01, 0] }, { t: 0.55 }],
    [{ ...ARM_BAR, dir: "in+fwd" }, { t: 0.55 }],
    { tip: "Index finger resting on the other hand swings a little, like the minute hand." }),
  two("time.hours", "Hours",
    [{ t: 0, hs: "point", at: "other.wrist", site: "index", off: [0.02, -0.04, 0.03], dir: "down+in", palm: "down" },
      { t: 0.2, off: [0.05, -0.04, 0], flow: 1 }, { t: 0.4, off: [0.02, -0.04, -0.03], flow: 1 }, { t: 0.6, off: [-0.01, -0.04, 0], flow: 1 }, { t: 0.8, off: [0.02, -0.04, 0.03] }],
    [ARM_BAR, { t: 0.8 }],
    { tip: "Draw a full circle with the index finger on the back of the other wrist." }),
  two("time.days", "Days",
    [{ t: 0, hs: "point", at: "neutralHigh", off: [0.12, 0.12, -0.1], dir: "up", palm: "fwd" }, { t: 0.55, at: "other.wrist", site: "index", off: [-0.05, -0.04, 0], dir: "in", palm: "down", arc: [0.06, 0.06, 0.05] }, { t: 0.7 }],
    [ARM_BAR, { t: 0.7 }],
    { tip: "Index finger arcs from high up down onto the other forearm, like the sun across the sky." }),
  seq("time.months", "Months", ["time.month"]),
  two("time.year", "Year",
    [{ t: 0, hs: "S", at: "chest", off: [0.03, -0.02, 0.2], dir: "fwd+in", palm: "in" }, { t: 0.2, off: [0.0, 0.06, 0.24], flow: 1 }, { t: 0.4, off: [-0.03, 0.0, 0.28], flow: 1 }, { t: 0.6, off: [0.0, -0.07, 0.24], flow: 1 }, { t: 0.8, off: [0.03, -0.02, 0.2] }],
    [{ t: 0, hs: "S", at: "chest", off: [0.03, -0.04, 0.2], dir: "fwd+in", palm: "in" }, { t: 0.8 }],
    { tip: "One fist circles once around the other fist." }),
  two("time.age", "Age",
    [{ t: 0, hs: "flat", at: "stomach", off: [-0.02, 0.17, 0.22], dir: "in+fwd", palm: "down" }, ...repeat({ off: [-0.02, 0.12, 0.22] }, { off: [-0.02, 0.17, 0.22] }, 1, 0.2, 0.18)],
    [{ t: 0, hs: "flat", at: "stomach", off: [-0.02, 0.06, 0.22], dir: "in+fwd", palm: "up" }, { t: 0.56 }],
    { tip: "Flat hands, one above the other; the upper hand moves down toward the lower one.", review: true }),
  two("time.late", "Late",
    [{ t: 0, hs: "flat", at: "other.back", site: "palm", off: [0, -0.02, 0], dir: "in+fwd", palm: "down" }, { t: 0.15 }, { t: 0.55, at: "shoulder", off: [0.06, 0.1, -0.02], dir: "up+back", palm: "back", arc: [0.07, 0.03, 0.02] }, { t: 0.7 }],
    [{ t: 0, hs: "flat", at: "chest", off: [-0.02, 0.0, 0.2], dir: "in", palm: "down" }, { t: 0.7 }],
    { tip: "From the back of the other hand, the flat hand lifts up and back over the shoulder.", review: true }),
  one("time.yesterday", "Yesterday", [
    { t: 0, hs: "thumbUp", at: "shoulder", off: [-0.02, 0.06, 0.1], dir: "up", palm: "in" },
    { t: 0.45, off: [0.01, 0.1, -0.04], dir: "up+back", arc: [0, 0.03, 0] }, { t: 0.6 },
  ], { tip: "Thumb up near the shoulder, moving back over it: the day behind you." }),
  one("time.tomorrow", "Tomorrow", [
    { t: 0, hs: "thumbUp", at: "cheek", site: "thumb", off: [0.02, -0.02, 0.03], dir: "up+back", palm: "in" },
    { t: 0.45, at: "neutral", off: [0.06, 0.15, 0.06], dir: "up+fwd", arc: [0, 0.04, 0.02] }, { t: 0.6 },
  ], { tip: "Thumb starts by the cheek and arcs forward: the day ahead." }),
  two("time.today", "Today",
    [{ t: 0, hs: "bent", at: "neutralLow", off: [0.04, 0.1, -0.04], dir: "fwd+down", palm: "in+up" }, { t: 0.36, off: [0.04, -0.02, -0.04] }, { t: 0.48 }],
    [{ t: 0, hs: "bent", at: "neutralLow", off: [0.04, 0.1, -0.04], dir: "fwd+down", palm: "in+up" }, { t: 0.36, off: [0.04, -0.02, -0.04] }, { t: 0.48 }],
    { tip: "Both hands, palms up, drop down firmly together: this very day." }),
  two("time.date", "Date",
    [{ t: 0, hs: "flat", at: "other.palm", site: "fingers", off: [0.03, 0.02, 0], dir: "up+in", palm: "in" }, ...repeat({ off: [0.03, 0.02, 0.04] }, { off: [0.03, 0.02, -0.03] }, 1, 0.12, 0.16)],
    [BASE_SIDE, { t: 0.5 }],
    { tip: "Fingertips brush side to side against the other palm.", review: true }),
  two("time.schedule", "Schedule",
    [{ t: 0, hs: "flatSpread", at: "neutralHigh", off: [-0.02, 0.06, -0.06], dir: "up+in", palm: "fwd" }, { t: 0.4, off: [-0.02, -0.08, -0.04] }, { t: 0.75, off: [0.12, -0.12, -0.02], dir: "in", palm: "fwd+down" }],
    [{ t: 0, hs: "flatSpread", at: "neutralHigh", off: [-0.02, 0.0, -0.1], dir: "up+in", palm: "fwd" }, { t: 0.75 }],
    { tip: "Open hand moves down in front of the other open hand, then across: rows and columns.", review: true }),
  two("time.start", "Start",
    [{ t: 0, hs: "point", at: "other.knuckles", site: "index", off: [-0.01, 0.0, 0.0], dir: "in+fwd", palm: "down" }, { t: 0.3, palm: "in+back" }, { t: 0.42 }],
    [{ t: 0, hs: "flatSpread", at: "neutral", off: [-0.04, -0.02, -0.06], dir: "up+fwd", palm: "in" }, { t: 0.42 }],
    { tip: "Index finger between the fingers of the other hand gives a short twist, like turning a key." }),
  two("time.before", "Before",
    [{ t: 0, hs: "bent", at: "neutral", off: [0.0, 0.04, 0.04], dir: "up+fwd", palm: "back" }, { t: 0.45, at: "chest", off: [0.08, 0.0, 0.08], arc: [0, 0.06, 0] }, { t: 0.6 }],
    [{ t: 0, hs: "bent", at: "neutral", off: [-0.02, 0.02, 0.06], dir: "up+fwd", palm: "back" }, { t: 0.6 }],
    { tip: "The hand arcs back toward you from in front of the other hand: earlier.", review: true }),
  two("time.after", "After",
    [{ t: 0, hs: "thumbUp", at: "other.wrist", site: "pinkySide", off: [-0.07, -0.045, 0], dir: "fwd+in", palm: "in+down" }, { t: 0.5, off: [0.07, -0.04, 0.02], dir: "fwd+down", palm: "in", arc: [0, 0.07, 0.05] }, { t: 0.64 }],
    [ARM_BAR, { t: 0.64 }],
    { tip: "Thumbs-up hand on the forearm arcs forward and over. NEXT uses the same sign." }),
  seq("time.next", "Next", ["time.after"], { tip: "Same sign as AFTER." }),
];

export default signs;
