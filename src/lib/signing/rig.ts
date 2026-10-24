import { Bone, Matrix4, Object3D, Quaternion, Vector3 } from "three";
import type { HandSite } from "./types";
import { FINGERS, HANDSHAPES, shapeVector } from "./handshapes";

export type SideName = "Right" | "Left";
const FINGER_NAMES = { i: "Index", m: "Middle", r: "Ring", p: "Pinky" } as const;
const DEG = Math.PI / 180;

type Joint = { bone: Bone; rest: Quaternion; restPos: Vector3; flexAxis: Vector3; spreadAxis?: Vector3 };

export type ArmRig = {
  side: SideName;
  /** +1 when the character's own side points along +x (left), -1 for the right side. */
  sign: number;
  clavicle: Bone; arm: Bone; forearm: Bone; hand: Bone;
  /** Shoulder joint position in the rest pose. */
  shoulder0: Vector3;
  rest: { clavicle: Quaternion; arm: Quaternion; forearm: Quaternion; hand: Quaternion };
  /** Rest world rotations and directions. */
  armW0: Quaternion; foreW0: Quaternion; handW0: Quaternion; clavW0: Quaternion;
  upperLen: number; foreLen: number;
  upperDir0: Vector3; foreDir0: Vector3; bendNormal0: Vector3;
  /** Hand axes in world rest space: fingers, palm normal (out of the palm), thumb side. */
  f0: Vector3; n0: Vector3; t0: Vector3;
  /** The same axes in hand-local space. */
  fL: Vector3; nL: Vector3; tL: Vector3;
  fingers: Record<(typeof FINGERS)[number], Joint[]>;
  /** Fingertip end-bone local offsets for forward kinematics. */
  tips: Record<(typeof FINGERS)[number] | "t", Vector3>;
  thumb: { j1: Joint; j2: Joint; j3: Joint; oppAxis: Vector3; abdAxis: Vector3 };
};

export type Rig = {
  root: Object3D;
  hips: Bone; spine: Bone; spine1: Bone; chest: Bone; neck: Bone; head: Bone;
  restLocal: Map<Bone, Quaternion>;
  R: ArmRig; L: ArmRig;
  /** Chest (Spine2) world matrix at rest, and its inverse. */
  chestRest: Matrix4; chestRestInv: Matrix4;
};

const v = () => new Vector3();
const worldPos = (o: Object3D) => o.getWorldPosition(v());
const worldQuat = (o: Object3D) => o.getWorldQuaternion(new Quaternion());

/** Convert a world-space axis into the local frame of `parent` (rotation only). */
const toLocalAxis = (axis: Vector3, parentWorld: Quaternion) => axis.clone().applyQuaternion(parentWorld.clone().invert()).normalize();

export function findBone(root: Object3D, name: string): Bone {
  let found: Bone | undefined;
  root.traverse(o => { if (!found && (o as Bone).isBone && o.name.replace(/^.*mixamorig\d*[:_]?/i, "") === name) found = o as Bone; });
  if (!found) throw new Error(`Character is missing the "${name}" bone.`);
  return found;
}

function buildArm(root: Object3D, side: SideName): ArmRig {
  const b = (n: string) => findBone(root, side + n);
  const clavicle = b("Shoulder"), arm = b("Arm"), forearm = b("ForeArm"), hand = b("Hand");
  const sP = worldPos(arm), eP = worldPos(forearm), wP = worldPos(hand);
  const sign = Math.sign(wP.x - sP.x) || 1;
  const upperDir0 = eP.clone().sub(sP).normalize(), foreDir0 = wP.clone().sub(eP).normalize();
  // Flexing the elbow brings the forearm forward (+z): define the rest bend-plane normal accordingly.
  const bendNormal0 = upperDir0.clone().cross(new Vector3(0, 0, 1)).normalize();

  const finger = (f: (typeof FINGERS)[number], k: number) => b(`Hand${FINGER_NAMES[f]}${k}`);
  const middle1 = worldPos(finger("m", 1)), index1 = worldPos(finger("i", 1)), pinky1 = worldPos(finger("p", 1));
  const f0 = middle1.clone().sub(wP).normalize();
  const t0 = index1.clone().sub(pinky1); t0.sub(f0.clone().multiplyScalar(t0.dot(f0))).normalize();
  // Mixamo rest pose has palms facing down; choose the normal that points down.
  const n0 = f0.clone().cross(t0).normalize();
  if (n0.y > 0) n0.negate();
  const handW0 = worldQuat(hand);
  const flexWorld = f0.clone().cross(n0).normalize(); // rotating fingers toward the palm
  const spreadWorld = f0.clone().cross(t0).normalize(); // rotating fingers toward the thumb

  const joint = (bone: Bone, axisWorld: Vector3, spreadAxisWorld?: Vector3): Joint => {
    const parentW = worldQuat(bone.parent!);
    return { bone, rest: bone.quaternion.clone(), restPos: bone.position.clone(), flexAxis: toLocalAxis(axisWorld, parentW), spreadAxis: spreadAxisWorld && toLocalAxis(spreadAxisWorld, parentW) };
  };
  const fingers = {} as ArmRig["fingers"];
  const tips = {} as ArmRig["tips"];
  for (const f of FINGERS) {
    fingers[f] = [1, 2, 3].map(k => joint(finger(f, k), flexWorld, k === 1 ? spreadWorld : undefined));
    tips[f] = finger(f, 4).position.clone();
  }
  const th = [1, 2, 3].map(k => b(`HandThumb${k}`));
  const thumbDir = worldPos(th[2]).sub(worldPos(th[0])).normalize();
  const thumbFlex = thumbDir.clone().cross(n0.clone().sub(t0.clone().multiplyScalar(0.4))).normalize();
  tips.t = b("HandThumb4").position.clone();
  const handInv = handW0.clone().invert();
  return {
    side, sign, clavicle, arm, forearm, hand, shoulder0: sP.clone(),
    rest: { clavicle: clavicle.quaternion.clone(), arm: arm.quaternion.clone(), forearm: forearm.quaternion.clone(), hand: hand.quaternion.clone() },
    armW0: worldQuat(arm), foreW0: worldQuat(forearm), handW0, clavW0: worldQuat(clavicle),
    upperLen: sP.distanceTo(eP), foreLen: eP.distanceTo(wP),
    upperDir0, foreDir0, bendNormal0,
    f0, n0, t0,
    fL: f0.clone().applyQuaternion(handInv), nL: n0.clone().applyQuaternion(handInv), tL: t0.clone().applyQuaternion(handInv),
    fingers, tips,
    thumb: {
      j1: joint(th[0], thumbFlex), j2: joint(th[1], thumbFlex), j3: joint(th[2], thumbFlex),
      oppAxis: toLocalAxis(t0.clone().cross(n0).normalize(), handW0),
      abdAxis: toLocalAxis(f0.clone().cross(t0).normalize(), handW0),
    },
  };
}

export function buildRig(root: Object3D): Rig {
  root.updateMatrixWorld(true);
  const restLocal = new Map<Bone, Quaternion>();
  root.traverse(o => { if ((o as Bone).isBone) restLocal.set(o as Bone, o.quaternion.clone()); });
  const chest = findBone(root, "Spine2");
  const chestRest = chest.matrixWorld.clone();
  return {
    root, restLocal, chest, chestRest, chestRestInv: chestRest.clone().invert(),
    hips: findBone(root, "Hips"), spine: findBone(root, "Spine"), spine1: findBone(root, "Spine1"),
    neck: findBone(root, "Neck"), head: findBone(root, "Head"),
    R: buildArm(root, "Right"), L: buildArm(root, "Left"),
  };
}

const qa = new Quaternion(), qb = new Quaternion(), qc = new Quaternion();
let limitedShape = new Float32Array(20);

/**
 * Anatomical finger ranges in degrees: [min, max] for knuckle, middle joint, tip joint and spread
 * (per finger), then thumb opposition, abduction, base flex and tip flex. Joints never bend backwards
 * beyond a slight natural hyperextension.
 */
const FINGER_LIMITS: [number, number][] = [[-12, 95], [0, 110], [-5, 85], [-22, 28]];
const THUMB_LIMITS: [number, number][] = [[-45, 75], [-30, 60], [-10, 60], [-15, 80]];
const lim = (x: number, [lo, hi]: [number, number]) => (x < lo ? lo : x > hi ? hi : x);

/** Apply a 20-value shape vector (see handshapes.ts) to the finger bones, within joint limits. */
export function applyShape(arm: ArmRig, raw: ArrayLike<number>) {
  const s = limitedShape.length === raw.length ? limitedShape : (limitedShape = new Float32Array(raw.length));
  for (let i = 0; i < raw.length; i++) s[i] = lim(raw[i], i < 16 ? FINGER_LIMITS[i % 4] : THUMB_LIMITS[i - 16]);
  FINGERS.forEach((f, k) => {
    const joints = arm.fingers[f];
    for (let j = 0; j < 3; j++) {
      const jt = joints[j];
      qa.setFromAxisAngle(jt.flexAxis, s[k * 4 + j] * DEG);
      if (j === 0 && jt.spreadAxis) qa.premultiply(qb.setFromAxisAngle(jt.spreadAxis, s[k * 4 + 3] * DEG));
      jt.bone.quaternion.copy(qa).multiply(jt.rest);
    }
  });
  const { j1, j2, j3, oppAxis, abdAxis } = arm.thumb;
  qa.setFromAxisAngle(oppAxis, s[16] * DEG).multiply(qb.setFromAxisAngle(abdAxis, s[17] * DEG)).multiply(qc.setFromAxisAngle(j1.flexAxis, s[18] * 0.35 * DEG));
  j1.bone.quaternion.copy(qa).multiply(j1.rest);
  j2.bone.quaternion.setFromAxisAngle(j2.flexAxis, s[18] * DEG).multiply(j2.rest);
  j3.bone.quaternion.setFromAxisAngle(j3.flexAxis, s[19] * DEG).multiply(j3.rest);
}

const m4 = new Matrix4(), m4b = new Matrix4(), one = new Vector3(1, 1, 1);
/** Hand-local position of a fingertip for the given shape, by forward kinematics. */
function tipLocal(arm: ArmRig, s: ArrayLike<number>, f: (typeof FINGERS)[number] | "t"): Vector3 {
  const joints = f === "t" ? [arm.thumb.j1, arm.thumb.j2, arm.thumb.j3] : arm.fingers[f];
  // Evaluate with the bones' current quaternions after applying the shape, then restore them.
  const saved = joints.map(j => j.bone.quaternion.clone());
  applyShape(arm, s);
  m4.identity();
  for (const j of joints) m4.multiply(m4b.compose(j.restPos, j.bone.quaternion, one));
  joints.forEach((j, k) => j.bone.quaternion.copy(saved[k]));
  return arm.tips[f].clone().applyMatrix4(m4);
}

/** Hand-local position of a named site for the given shape. */
export function siteLocal(arm: ArmRig, s: ArrayLike<number>, site: HandSite): Vector3 {
  const knuckles = () => arm.fingers.i[0].restPos.clone().add(arm.fingers.m[0].restPos).add(arm.fingers.r[0].restPos).add(arm.fingers.p[0].restPos).multiplyScalar(0.25);
  const palm = () => knuckles().multiplyScalar(0.62);
  switch (site) {
    case "wrist": return new Vector3();
    case "palm": return palm().addScaledVector(arm.nL, 0.018);
    case "back": return palm().addScaledVector(arm.nL, -0.022);
    case "knuckles": return knuckles().addScaledVector(arm.nL, -0.012);
    case "thumbSide": return palm().addScaledVector(arm.tL, 0.042);
    case "pinkySide": return palm().addScaledVector(arm.tL, -0.042);
    case "fingers": return tipLocal(arm, s, "i").add(tipLocal(arm, s, "m")).multiplyScalar(0.5);
    case "index": return tipLocal(arm, s, "i");
    case "middle": return tipLocal(arm, s, "m");
    case "ring": return tipLocal(arm, s, "r");
    case "pinky": return tipLocal(arm, s, "p");
    case "thumb": return tipLocal(arm, s, "t");
  }
}

/** Hand-local position of a finger joint: 0 knuckle, 1 middle joint, 2 tip joint, 3 fingertip. */
export function fingerJointLocal(arm: ArmRig, s: ArrayLike<number>, f: (typeof FINGERS)[number], k: 0 | 1 | 2 | 3): Vector3 {
  const joints = arm.fingers[f];
  const saved = joints.map(j => j.bone.quaternion.clone());
  applyShape(arm, s);
  m4.identity();
  for (let j = 0; j < k; j++) m4.multiply(m4b.compose(joints[j].restPos, joints[j].bone.quaternion, one));
  const p = (k === 3 ? arm.tips[f] : joints[k].restPos).clone().applyMatrix4(m4);
  joints.forEach((j, n) => j.bone.quaternion.copy(saved[n]));
  return p;
}

const shapeCache = new WeakMap<ArmRig, Map<string, Float32Array>>();
/**
 * A handshape's 20 joint values for this character. Shapes that position the thumb tip relative
 * to the fingers (M, N, T, K…) are solved here: the thumb's four joints are adjusted, within their
 * limits, until the tip reaches its target.
 */
export function shapeFor(arm: ArmRig, name: string): Float32Array {
  let byName = shapeCache.get(arm);
  if (!byName) shapeCache.set(arm, (byName = new Map()));
  const hit = byName.get(name);
  if (hit) return hit;
  const s = shapeVector(name);
  const spec = HANDSHAPES[name].thumbTo;
  if (spec) {
    const target = fingerJointLocal(arm, s, spec.a, spec.joint);
    if (spec.b) target.add(fingerJointLocal(arm, s, spec.b, spec.joint)).multiplyScalar(0.5);
    target.addScaledVector(arm.nL, spec.out ?? 0).addScaledVector(arm.fL, spec.along ?? 0);
    const preset = s.slice(16, 20);
    const cost = () => {
      const miss = tipLocal(arm, s, "t").distanceToSquared(target) * 1e4;
      let reg = 0;
      for (let i = 0; i < 4; i++) reg += (s[16 + i] - preset[i]) ** 2 * 2e-6;
      return miss + reg + (spec.straight ? (s[18] ** 2 + s[19] ** 2) * 4e-5 : 0);
    };
    let best = cost();
    for (const step of [12, 6, 3, 1.5, 0.75, 0.35]) {
      for (let round = 0, improved = true; improved && round < 25; round++) {
        improved = false;
        for (let i = 16; i < 20; i++) for (const dir of [1, -1]) {
          const old = s[i];
          s[i] = lim(old + dir * step, THUMB_LIMITS[i - 16]);
          const c = cost();
          if (c < best - 1e-9) { best = c; improved = true; } else s[i] = old;
        }
      }
    }
  }
  byName.set(name, s);
  return s;
}
