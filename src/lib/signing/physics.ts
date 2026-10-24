import { Matrix4, Vector3, type Bone } from "three";
import type { Rig } from "./rig";

/**
 * Collision proxies for the signer's body: capsules attached to bones, slightly inside the skin so
 * deliberate contacts (fingertip on chin, palm on chest) still touch while nothing passes through.
 * Measured from the default character's mesh in metres (model space, rest pose).
 */
type CapsuleDef = { a: [number, number, number]; b: [number, number, number]; r: number; bone: "head" | "chest" | "spine" };
const BODY: CapsuleDef[] = [
  { bone: "head", a: [0, 1.62, 0.02], b: [0, 1.70, 0.015], r: 0.085 }, // cranium and face
  { bone: "head", a: [0, 1.555, 0.035], b: [0, 1.60, 0.04], r: 0.072 }, // jaw and chin
  { bone: "chest", a: [0, 1.44, -0.02], b: [0, 1.53, 0.0], r: 0.055 }, // neck
  { bone: "chest", a: [-0.065, 1.22, 0.0], b: [-0.065, 1.37, -0.005], r: 0.1 }, // chest, one side
  { bone: "chest", a: [0.065, 1.22, 0.0], b: [0.065, 1.37, -0.005], r: 0.1 }, // chest, other side
  { bone: "chest", a: [-0.15, 1.41, -0.02], b: [0.15, 1.41, -0.02], r: 0.06 }, // shoulder girdle
  { bone: "spine", a: [-0.055, 0.98, 0.0], b: [-0.055, 1.2, 0.0], r: 0.1 }, // belly and hips
  { bone: "spine", a: [0.055, 0.98, 0.0], b: [0.055, 1.2, 0.0], r: 0.1 },
];

export type Capsule = { a: Vector3; b: Vector3; r: number };
type Attached = Capsule & { bone: Bone; la: Vector3; lb: Vector3 };
export type BodyProxy = { capsules: Capsule[] };

/** Live capsules that follow the body, plus a frozen rest-pose copy for checking signs when they are built. */
export function buildBody(rig: Rig): { live: BodyProxy & { capsules: Attached[] }; rest: BodyProxy } {
  const bones = { head: rig.head, chest: rig.chest, spine: rig.spine };
  const live = BODY.map(c => {
    const inv = new Matrix4().copy(bones[c.bone].matrixWorld).invert();
    return { bone: bones[c.bone], r: c.r, la: new Vector3(...c.a).applyMatrix4(inv), lb: new Vector3(...c.b).applyMatrix4(inv), a: new Vector3(...c.a), b: new Vector3(...c.b) };
  });
  return { live: { capsules: live }, rest: { capsules: BODY.map(c => ({ a: new Vector3(...c.a), b: new Vector3(...c.b), r: c.r })) } };
}

/** Move the capsules to the body's current pose (call after the trunk and head are posed). */
export function updateBody(body: BodyProxy & { capsules: Attached[] }) {
  for (const c of body.capsules) { c.a.copy(c.la).applyMatrix4(c.bone.matrixWorld); c.b.copy(c.lb).applyMatrix4(c.bone.matrixWorld); }
}

const ab = new Vector3(), ap = new Vector3(), closest = new Vector3(), away = new Vector3();
/**
 * Push a sphere (p, radius) out of one capsule. The correction is merged into `out` so that several
 * overlapping capsules are not double-counted. Returns the penetration depth (0 if clear).
 */
export function capsulePush(c: Capsule, p: Vector3, radius: number, out: Vector3): number {
  ab.subVectors(c.b, c.a);
  const len2 = ab.lengthSq();
  const t = len2 > 1e-9 ? Math.max(0, Math.min(1, ap.subVectors(p, c.a).dot(ab) / len2)) : 0;
  closest.copy(c.a).addScaledVector(ab, t);
  away.subVectors(p, closest);
  const dist = away.length();
  const depth = c.r + radius - dist;
  if (depth <= 0) return 0;
  if (dist < 1e-5) away.set(0, 0, 1); else away.divideScalar(dist);
  out.addScaledVector(away, Math.max(0, depth - Math.max(0, out.dot(away))));
  return depth;
}

/** How far, and which way, a sphere at `p` must move to stop overlapping the body. */
export function bodyPush(body: BodyProxy, p: Vector3, radius: number, out: Vector3): number {
  out.set(0, 0, 0);
  let deepest = 0;
  for (const c of body.capsules) deepest = Math.max(deepest, capsulePush(c, p, radius, out));
  return deepest;
}

const d1 = new Vector3(), d2 = new Vector3(), r = new Vector3();
/** Closest points between segments p1–q1 and p2–q2 (written to c1, c2). Returns their distance. */
export function segmentClosest(p1: Vector3, q1: Vector3, p2: Vector3, q2: Vector3, c1: Vector3, c2: Vector3) {
  d1.subVectors(q1, p1); d2.subVectors(q2, p2); r.subVectors(p1, p2);
  const a = d1.dot(d1), e = d2.dot(d2), f = d2.dot(r);
  let s = 0, t = 0;
  if (a > 1e-9 && e > 1e-9) {
    const c = d1.dot(r), b = d1.dot(d2), denom = a * e - b * b;
    s = denom > 1e-9 ? Math.max(0, Math.min(1, (b * f - c * e) / denom)) : 0;
    t = (b * s + f) / e;
    if (t < 0) { t = 0; s = Math.max(0, Math.min(1, -c / a)); } else if (t > 1) { t = 1; s = Math.max(0, Math.min(1, (b - c) / a)); }
  }
  c1.copy(p1).addScaledVector(d1, s);
  c2.copy(p2).addScaledVector(d2, t);
  return c1.distanceTo(c2);
}
