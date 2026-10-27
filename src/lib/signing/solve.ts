import { Matrix4, Object3D, Quaternion, Vector3 } from "three";
import type { ArmRig } from "./rig";
import { applyShape } from "./rig";
import { bodyPush, type BodyProxy } from "./physics";

const DEG = Math.PI / 180;
const _v = [...Array(16)].map(() => new Vector3());
const _q = [...Array(8)].map(() => new Quaternion());
const mA = new Matrix4(), mB = new Matrix4();

/**
 * Human joint ranges, in degrees. Forearm rotation is measured from the thumb-up (handshake)
 * position: supination turns the palm up (about 90°), pronation turns it down (about 90°, a little
 * more with the shoulder's help). Wrist: flexion toward the palm / extension, and radial (thumb
 * side) / ulnar deviation. Elbow: maximum flexion.
 */
export const LIMITS = {
  supinate: 95, pronate: 100,
  wristFlex: 75, wristExtend: 65, wristRadial: 22, wristUlnar: 35,
  elbowMaxFlex: 148,
};

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const basis = (a: Vector3, b: Vector3, m: Matrix4) => m.makeBasis(a, b, _v[15].copy(a).cross(b));
/** Rotation taking the rest frame (a0, b0) to (a, b), applied on top of the rest world rotation q0. */
function frameRotation(a: Vector3, b: Vector3, a0: Vector3, b0: Vector3, q0: Quaternion, out: Quaternion) {
  basis(a, b, mA); basis(a0, b0, mB);
  return out.setFromRotationMatrix(mA.multiply(mB.transpose())).multiply(q0).normalize();
}

/** Set a bone's local rotation so that its world rotation equals `world`. */
function setWorldQuat(bone: Object3D, world: Quaternion) {
  bone.parent!.getWorldQuaternion(_q[7]);
  bone.quaternion.copy(_q[7].invert().multiply(world));
  bone.updateMatrixWorld(true);
}

/** Supination turns the right forearm counter-clockwise seen from the elbow; the left mirrors it. */
const supSign = (arm: ArmRig) => -arm.sign;

/** Keep forearm rotation and wrist bend inside human ranges (the wrist's range is an ellipse). */
/** How far (degrees) joint angles lie outside human ranges; 0 when reachable. */
export function wristViolation(w: Vector3) {
  const over = Math.max(0, w.x - LIMITS.supinate) + Math.max(0, -LIMITS.pronate - w.x);
  const fx = w.y / (w.y >= 0 ? LIMITS.wristFlex : LIMITS.wristExtend);
  const dv = w.z / (w.z >= 0 ? LIMITS.wristRadial : LIMITS.wristUlnar);
  return over + Math.max(0, Math.hypot(fx, dv) - 1) * 60;
}

export function clampWrist(w: Vector3) {
  w.x = clamp(w.x, -LIMITS.pronate, LIMITS.supinate);
  const fx = w.y / (w.y >= 0 ? LIMITS.wristFlex : LIMITS.wristExtend);
  const dv = w.z / (w.z >= 0 ? LIMITS.wristRadial : LIMITS.wristUlnar);
  const r = Math.hypot(fx, dv);
  if (r > 1) { w.y /= r; w.z /= r; }
  return w;
}

export type ArmPlan = {
  S: Vector3; E: Vector3; W: Vector3; dF: Vector3;
  /** Elbow swivel used: degrees around the shoulder–wrist line, away from the natural elbow. */
  swivel: number;
  /** Degrees beyond joint limits before clamping, and depth of any body contact (m). */
  violation: number; contact: number;
  /** Elbow swing (degrees) that would clear the body, when requested. */
  clearance: number;
  armQ: Quaternion; foreQ0: Quaternion; handQ: Quaternion;
  /** Joint angles actually used, after limits: [supination, flexion, deviation] in degrees. */
  wrist: Vector3;
};
export const makePlan = (): ArmPlan => ({ S: new Vector3(), E: new Vector3(), W: new Vector3(), dF: new Vector3(), swivel: 0, violation: 0, contact: 0, clearance: 0, armQ: new Quaternion(), foreQ0: new Quaternion(), handQ: new Quaternion(), wrist: new Vector3() });

/** Where an elbow naturally hangs for this reach: down, slightly out and back, following the fingers. */
export function naturalElbow(arm: ArmRig, S: Vector3, wristPos: Vector3, fdir: Vector3, out: Vector3) {
  const u = _v[13].subVectors(wristPos, S).normalize();
  // Out, back and down in balance, so the direction never lines up with the arm itself.
  out.set(0.55 * arm.sign, -0.7, -0.55).add(_v[14].set(-fdir.x * 0.45, -Math.max(0, fdir.y) * 0.4, -Math.max(0, fdir.z) * 0.2));
  // With the hand raised, "down" stops meaning anything: the elbow comes forward, as when signing at the face.
  out.z += Math.max(0, u.y) * 1.3;
  out.x += arm.sign * Math.max(0, wristPos.y - S.y) * 0.35;
  out.addScaledVector(u, -out.dot(u));
  if (out.lengthSq() < 1e-6) out.set(arm.sign, 0, 0).addScaledVector(u, -u.x * arm.sign);
  return out.normalize();
}

/** The hand's neutral rotation: rigidly following the (untwisted) forearm. */
function neutralHand(arm: ArmRig, foreQ0: Quaternion, out: Quaternion) {
  return out.copy(foreQ0).multiply(_q[6].copy(arm.foreW0).invert()).multiply(arm.handW0);
}

/** Hand rotation from joint angles: forearm twist about its own axis, then the wrist's swing. */
function handFromAngles(arm: ArmRig, foreQ0: Quaternion, dF: Vector3, w: Vector3, out: Quaternion) {
  const h0 = neutralHand(arm, foreQ0, _q[0]);
  const hs = _q[1].setFromAxisAngle(dF, w.x * supSign(arm) * DEG).multiply(h0);
  const nT = _v[0].copy(arm.nL).applyQuaternion(hs), tT = _v[1].copy(arm.tL).applyQuaternion(hs);
  const swing = _v[2].copy(dF).cross(nT).normalize().multiplyScalar(w.y * DEG)
    .add(_v[3].copy(dF).cross(tT).normalize().multiplyScalar(w.z * DEG));
  const angle = swing.length();
  if (angle > 1e-6) out.setFromAxisAngle(swing.divideScalar(angle), angle).multiply(hs);
  else out.copy(hs);
  return out;
}

/** Joint angles for a desired hand rotation: swing–twist decomposition about the forearm. */
function anglesFromHand(arm: ArmRig, foreQ0: Quaternion, dF: Vector3, handQ: Quaternion, ref: number, out: Vector3) {
  const h0 = neutralHand(arm, foreQ0, _q[0]);
  const rel = _q[1].copy(handQ).multiply(_q[2].copy(h0).invert());
  if (rel.w < 0) rel.set(-rel.x, -rel.y, -rel.z, -rel.w);
  const proj = rel.x * dF.x + rel.y * dF.y + rel.z * dF.z;
  const twist = _q[2].set(dF.x * proj, dF.y * proj, dF.z * proj, rel.w).normalize();
  let sup = (2 * Math.atan2(proj, rel.w) / DEG) * supSign(arm);
  // Choose the turn (±360°) that is anatomically possible, or the one closest to the previous pose.
  const candidates = [sup - 360, sup, sup + 360];
  const fits = candidates.filter(c => c >= -LIMITS.pronate && c <= LIMITS.supinate);
  sup = (fits.length ? fits : candidates).reduce((best, c) => (Math.abs(c - ref) < Math.abs(best - ref) ? c : best));
  const swing = _q[3].copy(rel).multiply(twist.invert());
  if (swing.w < 0) swing.set(-swing.x, -swing.y, -swing.z, -swing.w);
  const s = Math.sqrt(Math.max(0, 1 - swing.w * swing.w));
  const angle = 2 * Math.acos(Math.min(1, swing.w));
  const v = s > 1e-6 ? _v[4].set(swing.x / s, swing.y / s, swing.z / s).multiplyScalar(angle) : _v[4].set(0, 0, 0);
  // Express the swing in the twisted hand's own axes: toward the palm (flexion), toward the thumb (deviation).
  const hs = _q[4].setFromAxisAngle(dF, sup * supSign(arm) * DEG).multiply(h0);
  const nT = _v[0].copy(arm.nL).applyQuaternion(hs), tT = _v[1].copy(arm.tL).applyQuaternion(hs);
  return out.set(sup, v.dot(_v[2].copy(dF).cross(nT).normalize()) / DEG, v.dot(_v[3].copy(dF).cross(tT).normalize()) / DEG);
}

/** Lift and protract the clavicle for the target, and return the shoulder joint position. */
export function placeClavicle(arm: ArmRig, wrist: Vector3, outS: Vector3) {
  arm.clavicle.quaternion.copy(arm.rest.clavicle);
  arm.clavicle.updateMatrixWorld(true);
  const shoulder0 = arm.arm.getWorldPosition(outS);
  const lift = clamp((wrist.y - shoulder0.y + 0.12) / 0.4, 0, 1);
  const across = clamp(-(wrist.x - shoulder0.x) * arm.sign / 0.4, 0, 1);
  const up = _v[0].set(0, 1, 0);
  const qLift = _q[0].setFromAxisAngle(_v[1].set(arm.sign, 0, 0).cross(up).normalize(), 14 * DEG * lift * lift);
  const qFwd = _q[1].setFromAxisAngle(up, -arm.sign * 9 * DEG * across);
  arm.clavicle.getWorldQuaternion(_q[2]);
  setWorldQuat(arm.clavicle, _q[2].premultiply(qLift).premultiply(qFwd));
  return arm.arm.getWorldPosition(outS);
}

/**
 * Plan an arm without changing any bone: elbow by two-bone IK with a natural swivel that keeps the
 * elbow and forearm out of the body, then the hand from joint angles within human limits.
 * Pass `wrist` angles to drive the hand, or `desired` to convert a hand rotation into angles.
 */
export function planArm(arm: ArmRig, S: Vector3, wristPos: Vector3, fdir: Vector3, out: ArmPlan, opts: { wrist?: Vector3; desired?: Quaternion; ref?: number; body?: BodyProxy; swivel?: number; offset?: number; findClearance?: boolean }) {
  out.S.copy(S);
  const a = arm.upperLen, b = arm.foreLen;
  const toW = _v[5].subVectors(wristPos, S);
  const minReach = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos((180 - LIMITS.elbowMaxFlex) * DEG));
  const d = clamp(toW.length(), minReach, a + b - 1e-4);
  const u = toW.normalize();
  out.W.copy(S).addScaledVector(u, d);
  const hint = naturalElbow(arm, S, wristPos, fdir, _v[6]);
  out.swivel = opts.swivel ?? 0;
  if (out.swivel) hint.applyAxisAngle(u, out.swivel * DEG);
  const cosA = (a * a + d * d - b * b) / (2 * a * d);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  hint.addScaledVector(u, -hint.dot(u));
  if (hint.lengthSq() < 1e-6) hint.set(0, -1, 0).addScaledVector(u, -u.y);
  hint.normalize();
  const elbowAt = (offsetDeg: number, E: Vector3) => {
    const h = _v[14].copy(hint).applyAxisAngle(u, offsetDeg * DEG);
    return E.copy(S).addScaledVector(u, a * cosA).addScaledVector(h, a * sinA);
  };
  const depthAt = (E: Vector3) => {
    const mid = _v[8].copy(E).lerp(out.W, 0.45);
    return bodyPush(opts.body!, E, 0.045, _v[9]) + bodyPush(opts.body!, mid, 0.04, _v[10]);
  };
  // Body contact for the elbow and forearm at the requested elbow position. Optionally search the
  // nearest elbow swing (around the arm) that clears the body; the caller smooths it over time.
  const offset = opts.offset ?? 0;
  out.contact = opts.body ? depthAt(elbowAt(offset, out.E)) : 0;
  out.clearance = offset;
  // Search whenever the elbow is in contact or still swung away, so it returns to its natural place
  // as soon as nothing is in the way (otherwise a swing from an earlier sign would linger at rest).
  if (opts.body && opts.findClearance && (out.contact > 0 || Math.abs(offset) > 0.5)) {
    let best = Infinity;
    for (let o = -70; o <= 70; o += 7) {
      // Pull toward the natural elbow; switching sides is a big movement, so it costs extra.
      const cost = depthAt(elbowAt(o, _v[13])) * 600 + Math.abs(o - offset) * 0.01 + Math.abs(o) * 0.03 + (o * offset < 0 ? 0.6 : 0);
      if (cost < best) { best = cost; out.clearance = o; }
    }
  }
  elbowAt(offset, out.E);
  const dA = _v[11].subVectors(out.E, S).normalize();
  out.dF.subVectors(out.W, out.E).normalize();
  const n = _v[12].copy(dA).cross(out.dF);
  if (n.lengthSq() < 1e-8) n.copy(u).cross(hint).negate();
  n.normalize();
  frameRotation(dA, n, arm.upperDir0, arm.bendNormal0, arm.armW0, out.armQ);
  frameRotation(out.dF, n, arm.foreDir0, arm.bendNormal0, arm.foreW0, out.foreQ0);
  if (opts.desired) anglesFromHand(arm, out.foreQ0, out.dF, opts.desired, opts.ref ?? 0, out.wrist);
  else out.wrist.copy(opts.wrist!);
  out.violation = wristViolation(out.wrist);
  clampWrist(out.wrist);
  handFromAngles(arm, out.foreQ0, out.dF, out.wrist, out.handQ);
  return out;
}

/** Pose the bones from a plan. The forearm carries 60% of the twist, as the radius and ulna do. */
export function applyArm(arm: ArmRig, plan: ArmPlan, shape: ArrayLike<number>) {
  setWorldQuat(arm.arm, plan.armQ);
  const fore = _q[5].setFromAxisAngle(plan.dF, plan.wrist.x * supSign(arm) * DEG * 0.6).multiply(plan.foreQ0);
  setWorldQuat(arm.forearm, fore);
  setWorldQuat(arm.hand, plan.handQ);
  applyShape(arm, shape);
}

const best = makePlan();
/**
 * Choose how the arm reaches a pose, as a person would: try elbow positions around the
 * shoulder–wrist line and keep the one whose forearm and wrist stay within their ranges and whose
 * arm stays clear of the body, preferring the natural hanging elbow. Writes the winner into `out`.
 */
export function chooseElbow(arm: ArmRig, S: Vector3, wristPos: Vector3, desired: Quaternion, ref: number, body: BodyProxy | undefined, out: ArmPlan, prevSwivel = 0) {
  const fdir = new Vector3().copy(arm.fL).applyQuaternion(desired);
  const axis = new Vector3().subVectors(wristPos, S).normalize();
  void axis;
  let bestCost = Infinity;
  for (let deg = -90; deg <= 90; deg += 10) {
    planArm(arm, S, wristPos, fdir, out, { desired, ref, body, swivel: deg });
    const w = out.wrist;
    // Joint-limit violations dominate; then body contact; then comfort: forearm rotation away from its
    // ends, little wrist bend, elbow near its natural place and near where it just was.
    const cost = out.violation * 10 + out.contact * 4000
      + Math.max(0, w.x - 70) * 0.4 + Math.max(0, -75 - w.x) * 0.4
      + Math.abs(w.y) * 0.05 + Math.abs(w.z) * 0.08
      + Math.abs(deg) * 0.2 + Math.abs(deg - prevSwivel) * 0.35
      // A raised elbow (at or above the shoulder) is tiring; people keep it low and forward if they can.
      + Math.max(0, out.E.y - (S.y - 0.1)) * 500
      + Math.max(0, out.E.x * arm.sign - S.x * arm.sign - 0.12) * 120;
    if (cost < bestCost) { bestCost = cost; copyPlan(out, best); }
  }
  return copyPlan(best, out);
}

function copyPlan(from: ArmPlan, to: ArmPlan) {
  to.S.copy(from.S); to.E.copy(from.E); to.W.copy(from.W); to.dF.copy(from.dF); to.swivel = from.swivel;
  to.violation = from.violation; to.contact = from.contact; to.clearance = from.clearance;
  to.armQ.copy(from.armQ); to.foreQ0.copy(from.foreQ0); to.handQ.copy(from.handQ); to.wrist.copy(from.wrist);
  return to;
}
