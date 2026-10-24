import type { NonManual } from "./types";
import type { CompiledSign } from "./compile";
import { Vector3 } from "three";
import { type HandPose, type Key, clonePose, cloneKey, minSegmentTime } from "./track";

export type Timeline = {
  dom: Key[];
  non: Key[];
  /** Non-manual markers with absolute times. */
  nm: { start: number; end: number; kind: NonManual }[];
  /** When each sign is being shown, for captions and "watched" tracking. */
  marks: { index: number; start: number; end: number }[];
  duration: number;
};

export type SequenceItem = { sign: CompiledSign; /** Multiplies this sign's own timing. */ pace?: number; /** Override the transition into this sign. */ lead?: number };

const keyAt = (p: HandPose, t: number, flow: number): Key => ({ ...clonePose(p), t, flow });
const retime = (k: Key, t0: number, pace: number, flow?: number): Key => cloneKey(k, t0 + k.t * pace, flow ?? k.flow);

const pa = new Vector3(), pb = new Vector3();
/**
 * If the two hands would pass through each other while moving between poses (e.g. uncrossing the
 * arms), bow the dominant hand's path forward around the other hand, as a person would.
 */
function avoidHands(domFrom: HandPose, domTo: Key, nonFrom: HandPose, nonTo: HandPose) {
  // Only when the hands swap sides (arms crossing or uncrossing); hands meeting for contact are intended.
  if ((domFrom.pos.x - nonFrom.pos.x) * (domTo.pos.x - nonTo.pos.x) > 0) return;
  let closest = Infinity;
  for (let i = 1; i < 8; i++) {
    const u = i / 8;
    pa.lerpVectors(domFrom.pos, domTo.pos, u);
    pb.lerpVectors(nonFrom.pos, nonTo.pos, u);
    closest = Math.min(closest, pa.distanceTo(pb));
  }
  const CLEAR = 0.14;
  if (closest >= CLEAR) return;
  const bow = (CLEAR - closest) * 1.6 + 0.05;
  domTo.arc = (domTo.arc ?? new Vector3()).clone().add(new Vector3(0, 0, bow));
}

/** Transition time grows with travel distance and rotation, like natural reaching. */
export function transitionTime(a: HandPose, b: HandPose) {
  // Between signs people move a little below their top speed, and never instantly.
  return Math.max(0.2, minSegmentTime(a, b) * 1.15 + 0.06);
}

/**
 * Build one continuous performance: from the current pose, through every sign, back to rest.
 * Sign boundaries flow slightly instead of stopping dead, so sentences read as connected signing.
 */
export function buildTimeline(items: SequenceItem[], from: { dom: HandPose; non: HandPose }, rest: { dom: HandPose; non: HandPose }): Timeline {
  const dom: Key[] = [keyAt(from.dom, 0, 0)];
  const non: Key[] = [keyAt(from.non, 0, 0)];
  const nm: Timeline["nm"] = [];
  const marks: Timeline["marks"] = [];
  let t = 0;
  const BOUNDARY_FLOW = 0.45;

  items.forEach((item, idx) => {
    const { sign } = item;
    const pace = item.pace ?? 1;
    const last = idx === items.length - 1;
    const prevDom = dom[dom.length - 1], prevNon = non[non.length - 1];
    // Non-dominant hand: its own keys, or stay up between two-handed signs, or drop to rest.
    const nextUsesNon = items.slice(idx + 1, idx + 2).some(i => i.sign.non);
    const prevUsedNon = idx > 0 && !!items[idx - 1].sign.non;
    const nonTarget = sign.non ? sign.non[0] : prevUsedNon && nextUsesNon ? prevNon : keyAt(rest.non, 0, 0);
    // A requested lead (fingerspelling rhythm) is honoured only if the hand can physically make it.
    const physical = Math.max(minSegmentTime(prevDom, sign.dom[0]), sign.non ? minSegmentTime(prevNon, sign.non[0]) : 0);
    const lead = item.lead !== undefined ? Math.max(item.lead, physical) : Math.max(transitionTime(prevDom, sign.dom[0]), sign.non ? transitionTime(prevNon, sign.non[0]) : 0) * (idx === 0 ? 1.25 : 1);
    if (idx > 0) { prevDom.flow = BOUNDARY_FLOW; prevNon.flow = Math.min(prevNon.flow, BOUNDARY_FLOW); }
    const start = t + lead;
    sign.dom.forEach((k, i) => dom.push(retime(k, start, pace, i === 0 ? (idx === 0 ? 0 : BOUNDARY_FLOW) : i === sign.dom.length - 1 && last ? 0 : undefined)));
    avoidHands(prevDom, dom[dom.length - sign.dom.length], prevNon, sign.non ? sign.non[0] : nonTarget);
    if (sign.non) sign.non.forEach((k, i) => non.push(retime(k, start, pace, i === 0 ? 0.2 : undefined)));
    else non.push(keyAt(nonTarget, start, 0.2));
    const end = start + sign.duration * pace;
    // Keep the non-dominant track alive until the sign ends.
    const lastNon = non[non.length - 1];
    if (lastNon.t < end) non.push({ ...cloneKey(lastNon, end, 0.3), arc: undefined });
    if (sign.nm) nm.push({ start: start - 0.1, end: end + 0.1, kind: sign.nm });
    marks.push({ index: idx, start: start - lead * 0.5, end });
    t = end;
  });

  // Hold the final sign briefly so it reads clearly, then relax back to rest.
  const hold = items.length ? 0.32 : 0;
  const lastDom = dom[dom.length - 1], lastNon = non[non.length - 1];
  dom.push({ ...cloneKey(lastDom, t + hold, 0), arc: undefined });
  non.push({ ...cloneKey(lastNon, t + hold, 0), arc: undefined });
  const back = Math.max(0.55, Math.max(transitionTime(lastDom, rest.dom), transitionTime(lastNon, rest.non)) * 1.5);
  const endT = t + hold + back;
  dom.push(keyAt(rest.dom, endT, 0));
  non.push(keyAt(rest.non, endT, 0));
  avoidHands(lastDom, dom[dom.length - 1], lastNon, rest.non);
  return { dom, non, nm, marks, duration: endT };
}
