import type { HandKey, SignDef, Vec3 } from "../types";
import { repeat, signer } from "./kit.ts";

/** The signer's own reactions in lessons (greetings and celebrations), not course vocabulary. */
const { one, two } = signer("No Barriers");

const raised = (t: number, off: Vec3, hs = "flatSpread"): HandKey => ({ t, hs, at: "neutralHigh", off, dir: "up", palm: "fwd" });
const both = (keys: HandKey[]) => keys.map(k => ({ ...k }));

const signs: SignDef[] = [
  // Deaf applause: both open hands raised and shaken (twisted) at the wrist.
  two("react.applause", "Well done!",
    [raised(0, [0.12, 0.06, -0.04]), ...repeat({ palm: "fwd+out" }, { palm: "fwd+in" }, 3, 0.12, 0.13)],
    [raised(0, [0.12, 0.06, -0.04]), ...repeat({ palm: "fwd+out" }, { palm: "fwd+in" }, 3, 0.12, 0.13)],
    { nm: "smile", tip: "Visual applause, as the Deaf community applauds: raise both open hands and shake them." }),
  // Bigger, higher applause.
  two("react.applause-big", "Excellent!",
    [raised(0, [0.18, 0.14, -0.06]), ...repeat({ palm: "fwd+out", off: [0.19, 0.16, -0.06] }, { palm: "fwd+in", off: [0.17, 0.14, -0.06] }, 4, 0.1, 0.11)],
    [raised(0, [0.18, 0.14, -0.06]), ...repeat({ palm: "fwd+out", off: [0.19, 0.16, -0.06] }, { palm: "fwd+in", off: [0.17, 0.14, -0.06] }, 4, 0.1, 0.11)],
    { nm: "smile" }),
  // Fingers flutter with the hands raised.
  two("react.applause-flutter", "Great job!",
    [raised(0, [0.13, 0.08, -0.03]), ...repeat({ hs: "relaxed" }, { hs: "flatSpread" }, 4, 0.1, 0.1)],
    [raised(0, [0.13, 0.08, -0.03]), ...repeat({ hs: "relaxed" }, { hs: "flatSpread" }, 4, 0.1, 0.1)],
    { nm: "smile" }),
  // Two thumbs up, pushed forward.
  two("react.thumbs", "Great!",
    both([{ t: 0, hs: "thumbUp", at: "chest", off: [0.1, 0.02, 0.14], dir: "up", palm: "in" }, { t: 0.35, off: [0.12, 0.06, 0.26], arc: [0, 0.03, 0] }, { t: 0.6 }]),
    both([{ t: 0, hs: "thumbUp", at: "chest", off: [0.1, 0.02, 0.14], dir: "up", palm: "in" }, { t: 0.35, off: [0.12, 0.06, 0.26], arc: [0, 0.03, 0] }, { t: 0.6 }]),
    { nm: "nod" }),
  // A friendly wave: open hand raised, swaying side to side.
  one("react.wave", "Hi!", [
    { t: 0, hs: "flatSpread", at: "shoulder", off: [0.02, 0.18, 0.14], dir: "up", palm: "fwd" },
    ...repeat({ off: [0.07, 0.18, 0.14], dir: "up+out" }, { off: [-0.02, 0.18, 0.14], dir: "up+in" }, 2, 0.1, 0.16),
  ], { nm: "smile" }),
];

export default signs;
