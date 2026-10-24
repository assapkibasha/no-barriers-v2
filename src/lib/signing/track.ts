import { Quaternion, Vector3 } from "three";
import { SHAPE_SIZE } from "./handshapes";

/**
 * A resolved hand pose in chest space (the Spine2 frame), so the hands ride along with body sway.
 *
 * The hand's orientation is driven in joint space, the way the arm really moves it:
 * `wrist` = [forearm supination, wrist flexion, wrist radial deviation] in degrees, relative to the
 * forearm. Every in-between pose is therefore a real joint position: no impossible turns or flips.
 * `rot` is the resulting chest-space hand rotation at authoring time, used only for contacts.
 */
export type HandPose = { pos: Vector3; rot: Quaternion; wrist: Vector3; fdir: Vector3; /** Elbow swivel in degrees around the shoulder–wrist line. */ swivel: number; shape: Float32Array };
export type Key = HandPose & {
  t: number;
  /** 0 = stop at this key, 1 = flow through. */
  flow: number;
  /** Bulge applied to the movement that arrives at this key (chest space). */
  arc?: Vector3;
};

export const clonePose = (p: HandPose): HandPose => ({ pos: p.pos.clone(), rot: p.rot.clone(), wrist: p.wrist.clone(), fdir: p.fdir.clone(), swivel: p.swivel, shape: p.shape.slice() });
export const cloneKey = (k: Key, t = k.t, flow = k.flow): Key => ({ ...clonePose(k), t, flow, arc: k.arc?.clone() });
export const makePose = (): HandPose => ({ pos: new Vector3(), rot: new Quaternion(), wrist: new Vector3(), fdir: new Vector3(0, 1, 0), swivel: 0, shape: new Float32Array(SHAPE_SIZE) });

/** Cubic Hermite from 0 to 1 with start/end slopes a and b (1 = linear speed, 0 = ease). */
export function ease(u: number, a: number, b: number) {
  const u2 = u * u, u3 = u2 * u;
  return (u3 - 2 * u2 + u) * a + (-2 * u3 + 3 * u2) + (u3 - u2) * b;
}

/**
 * Catmull–Rom slope of one scalar channel at key i, scaled by the key's flow. At a reversal
 * (back-and-forth movement) the neighbours are equal, so the slope is zero and the joint
 * comes to rest before turning back, as a real one does.
 */
function slope(keys: Key[], i: number, get: (k: Key) => number) {
  const k = keys[i];
  if (k.flow <= 0 || i === 0 || i === keys.length - 1) return 0;
  const a = keys[i - 1], b = keys[i + 1];
  const incoming = get(k) - get(a), outgoing = get(b) - get(k);
  if (incoming * outgoing <= 0) return 0; // turning point: settle, never overshoot
  return k.flow * (get(b) - get(a)) / Math.max(1e-3, b.t - a.t);
}

function hermite(keys: Key[], i: number, u: number, dt: number, get: (k: Key) => number) {
  const a = keys[i], b = keys[i + 1];
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * get(a) + (u3 - 2 * u2 + u) * dt * slope(keys, i, get) + (-2 * u3 + 3 * u2) * get(b) + (u3 - u2) * dt * slope(keys, i + 1, get);
}

const AXES = ["x", "y", "z"] as const;
/** Sample a track at time t into `out`. Times before/after the track clamp to its ends. */
export function sampleTrack(keys: Key[], t: number, out: HandPose): HandPose {
  if (t <= keys[0].t || keys.length === 1) return copyInto(out, keys[0]);
  const last = keys[keys.length - 1];
  if (t >= last.t) return copyInto(out, last);
  let i = 0;
  while (i < keys.length - 2 && keys[i + 1].t <= t) i++;
  const a = keys[i], b = keys[i + 1];
  const dt = b.t - a.t, u = (t - a.t) / dt;
  for (const ax of AXES) {
    out.pos[ax] = hermite(keys, i, u, dt, k => k.pos[ax]);
    out.wrist[ax] = hermite(keys, i, u, dt, k => k.wrist[ax]);
    out.fdir[ax] = hermite(keys, i, u, dt, k => k.fdir[ax]);
  }
  if (b.arc) out.pos.addScaledVector(b.arc, Math.sin(Math.PI * u));
  out.fdir.normalize();
  out.swivel = hermite(keys, i, u, dt, k => k.swivel);
  out.rot.slerpQuaternions(a.rot, b.rot, ease(u, a.flow, b.flow));
  // Handshape changes lead the movement slightly, like real signers forming the next shape in transit.
  const us = Math.min(1, u / 0.72);
  for (let s = 0; s < out.shape.length; s++) out.shape[s] = hermite(keys, i, us, dt * 0.72, k => k.shape[s]);
  return out;
}

function copyInto(out: HandPose, k: HandPose) {
  out.pos.copy(k.pos); out.rot.copy(k.rot); out.wrist.copy(k.wrist); out.fdir.copy(k.fdir); out.swivel = k.swivel; out.shape.set(k.shape);
  return out;
}

/**
 * Human movement limits for signing. Average speeds over a whole movement (peaks are about 1.5×,
 * because motion eases in and out): the hand travels at most ~1 m/s, the forearm and wrist turn at
 * most ~400°/s, and the fingers change shape at most ~500°/s per joint.
 */
export const SPEED = { travel: 1.0, turnDeg: 400, reshape: 500, settle: 0.06 };

/** Shortest natural duration for moving between two hand poses. */
export function minSegmentTime(a: HandPose, b: HandPose) {
  let reshape = 0;
  for (let i = 0; i < a.shape.length; i++) reshape = Math.max(reshape, Math.abs(a.shape[i] - b.shape[i]));
  const travel = a.pos.distanceTo(b.pos) / SPEED.travel;
  const turnDeg = Math.max(Math.abs(a.wrist.x - b.wrist.x), Math.abs(a.wrist.y - b.wrist.y), Math.abs(a.wrist.z - b.wrist.z), a.fdir.angleTo(b.fdir) * 57.3);
  const turn = turnDeg / SPEED.turnDeg;
  // The slowest component sets the pace; tiny movements still need a moment to settle.
  return Math.max(travel, turn, reshape / SPEED.reshape) + (travel > 0.005 || turnDeg > 2 || reshape > 2 ? SPEED.settle : 0);
}

export function trackDuration(keys: Key[]) {
  return keys.length ? keys[keys.length - 1].t : 0;
}
