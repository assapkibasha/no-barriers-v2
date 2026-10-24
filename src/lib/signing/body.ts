import { Quaternion, Vector3 } from "three";
import type { Rig } from "./rig";
import type { Timeline } from "./timeline";

const DEG = Math.PI / 180;
const X = new Vector3(1, 0, 0), Y = new Vector3(0, 1, 0), Z = new Vector3(0, 0, 1);
const q = new Quaternion(), qy = new Quaternion(), qz = new Quaternion();

/** Smooth pseudo-noise from incommensurate sines, in roughly [-1, 1]. */
const noise = (t: number, seed: number) => (Math.sin(t * 0.61 + seed) * 0.5 + Math.sin(t * 1.37 + seed * 2.1) * 0.3 + Math.sin(t * 0.23 + seed * 4.7) * 0.2);
const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/** Occasional glance: every few seconds the head turns a little, holds, and comes back. */
function glance(t: number) {
  const period = 9.5;
  const cycle = Math.floor(t / period);
  const local = t - cycle * period;
  const dir = Math.sin(cycle * 12.9898) > 0 ? 1 : -1;
  const amount = 6 + 5 * Math.abs(Math.sin(cycle * 78.233));
  const env = smooth((local - 5) / 0.7) * (1 - smooth((local - 7.2) / 0.8));
  return dir * amount * env;
}

function rotate(bone: { quaternion: Quaternion }, pitch: number, yaw: number, roll: number) {
  q.setFromAxisAngle(X, pitch * DEG);
  qy.setFromAxisAngle(Y, yaw * DEG);
  qz.setFromAxisAngle(Z, roll * DEG);
  bone.quaternion.premultiply(qz).premultiply(q).premultiply(qy);
}

export type BodyInput = {
  time: number;
  /** 1 while waiting, lower while signing so the idle motion does not blur the signs. */
  idle: number;
  timeline?: Timeline | null;
  playTime?: number;
  /** Dominant wrist's sideways position in chest space (positive = its own side) and height. */
  reach?: { lateral: number; height: number; forward: number };
  /** +1 when the dominant hand is the right hand. */
  domSign: number;
};

/** Reset the trunk and head to rest, then layer idle motion and non-manual markers. */
export function applyBody(rig: Rig, input: BodyInput) {
  for (const b of [rig.hips, rig.spine, rig.spine1, rig.chest, rig.neck, rig.head]) b.quaternion.copy(rig.restLocal.get(b)!);
  const t = input.time, w = input.idle;
  const breath = Math.sin(t * 2 * Math.PI * 0.21);
  const sway = noise(t * 0.45, 1.3);
  let headPitch = noise(t * 0.5, 7.1) * 1.6 * w;
  let headYaw = (noise(t * 0.4, 3.3) * 2.6 + glance(t)) * w;
  let headRoll = noise(t * 0.35, 5.5) * 1.2 * w;
  let lean = 0;

  // Non-manual markers.
  const tl = input.timeline, pt = input.playTime ?? 0;
  if (tl) for (const m of tl.nm) {
    const env = smooth((pt - m.start) / 0.18) * (1 - smooth((pt - m.end + 0.18) / 0.18));
    if (env <= 0) continue;
    const local = pt - m.start;
    switch (m.kind) {
      case "nod": headPitch += env * 7 * Math.max(0, Math.sin(local * 2 * Math.PI * 2.1)); break;
      case "shake": headYaw += env * 10 * Math.sin(local * 2 * Math.PI * 2.4); break;
      case "yesno": headPitch += env * 7; lean += env * 3; break;
      case "wh": headRoll += env * 6 * input.domSign; headPitch += env * 4; lean += env * 1.5; break;
      case "tilt": headRoll += env * 7 * input.domSign; break;
      case "lean": lean += env * 4; break;
      case "smile": headPitch -= env * 2; break;
    }
  }

  // Trunk follows the dominant hand a little: turn toward it and lean into far reaches.
  let trunkYaw = 0, trunkLean = 0;
  if (input.reach) {
    trunkYaw = Math.max(-5, Math.min(5, input.reach.lateral * 14)) * -input.domSign;
    trunkLean = Math.max(0, Math.min(3, (input.reach.forward - 0.3) * 18));
    headPitch -= Math.max(0, input.reach.height - 0.3) * 6;
  }

  rig.hips.position.x = (rig.hips.userData.restX ??= rig.hips.position.x) + sway * 0.012 * w;
  rotate(rig.hips, 0, sway * 1.2 * w, sway * 1.4 * w);
  rotate(rig.spine, breath * 0.25 * w, -sway * 0.6 * w + trunkYaw * 0.3, -sway * 0.8 * w);
  rotate(rig.spine1, breath * 0.5 + lean * 0.4 + trunkLean * 0.4, trunkYaw * 0.35, -sway * 0.4 * w);
  rotate(rig.chest, -breath * 0.6 + lean * 0.6 + trunkLean * 0.6, trunkYaw * 0.35, 0);
  rotate(rig.neck, headPitch * 0.35, headYaw * 0.4, headRoll * 0.4 - sway * 0.3 * w);
  rotate(rig.head, headPitch * 0.65 - lean * 0.5 - trunkLean, headYaw * 0.6 - trunkYaw * 0.8, headRoll * 0.6);
}
