import { Matrix4, Quaternion, Vector3 } from "three";
import type { BodyAnchor, Dir, HandKey, HandSite, NonManual, SignDef, Vec3 } from "./types";
import type { ArmRig, Rig } from "./rig";
import { shapeFor, siteLocal } from "./rig";
import { type Key, cloneKey, makePose, minSegmentTime, sampleTrack } from "./track";
import { chooseElbow, makePlan } from "./solve";
import type { BodyProxy } from "./physics";

/**
 * Body landmarks for the default character, measured from its mesh (metres, model space).
 * x is side-relative: positive toward the signing hand's own side.
 */
const ANCHORS: Record<BodyAnchor, Vec3> = {
  top: [0, 1.79, 0.04],
  forehead: [0, 1.71, 0.125],
  temple: [0.07, 1.69, 0.075],
  templeOpp: [-0.07, 1.69, 0.075],
  eye: [0.035, 1.655, 0.13],
  nose: [0, 1.62, 0.15],
  cheek: [0.058, 1.60, 0.11],
  cheekOpp: [-0.058, 1.60, 0.11],
  ear: [0.09, 1.635, 0.01],
  earOpp: [-0.09, 1.635, 0.01],
  mouth: [0, 1.578, 0.142],
  chin: [0, 1.538, 0.13],
  neck: [0, 1.495, 0.07],
  shoulder: [0.16, 1.445, 0.04],
  shoulderOpp: [-0.16, 1.445, 0.04],
  chest: [0, 1.36, 0.115],
  chestSide: [0.09, 1.36, 0.11],
  chestOpp: [-0.09, 1.36, 0.11],
  stomach: [0, 1.17, 0.145],
  waist: [0, 1.06, 0.145],
  neutral: [0.06, 1.30, 0.34],
  neutralHigh: [0.06, 1.50, 0.33],
  neutralLow: [0.06, 1.14, 0.30],
  side: [0.26, 1.30, 0.22],
  elbowOpp: [-0.2, 1.12, 0.12],
};

const WORDS: Record<string, Vec3> = { up: [0, 1, 0], down: [0, -1, 0], fwd: [0, 0, 1], back: [0, 0, -1], in: [-1, 0, 0], out: [1, 0, 0] };

/** Side-relative direction to model space for the given arm. */
export function dirVector(d: Dir, arm: ArmRig): Vector3 {
  const out = new Vector3();
  if (typeof d === "string") for (const w of d.split("+")) {
    const base = WORDS[w.trim()];
    if (!base) throw new Error(`Unknown direction "${w}".`);
    out.add(new Vector3(...base));
  } else out.set(...d);
  out.x *= arm.sign;
  return out.normalize();
}

const sideVec = (p: Vec3, arm: ArmRig) => new Vector3(p[0] * arm.sign, p[1], p[2]);

const mA = new Matrix4(), mB = new Matrix4();
/** World rotation for a hand so its fingers point along `dir` and its palm faces `palm`. */
export function handRotation(arm: ArmRig, dir: Vector3, palm: Vector3): Quaternion {
  const n = palm.clone().addScaledVector(dir, -palm.dot(dir));
  if (n.lengthSq() < 1e-6) throw new Error("Palm and finger directions must differ.");
  n.normalize();
  const basis = (a: Vector3, b: Vector3, m: Matrix4) => m.makeBasis(a, b, a.clone().cross(b));
  basis(dir, n, mA); basis(arm.f0, arm.n0, mB);
  return new Quaternion().setFromRotationMatrix(mA.multiply(mB.transpose())).multiply(arm.handW0).normalize();
}

export type CompiledSign = {
  id: string;
  gloss: string;
  dom: Key[];
  non: Key[] | null;
  nm?: NonManual;
  duration: number;
};

type Ctx = { rig: Rig; chestQInv: Quaternion; body?: BodyProxy };

type Resolved = { hs: string; at: string; off: Vec3; site: HandSite; dir: Dir; palm: Dir };
const DEFAULTS: Resolved = { hs: "flat", at: "neutral", off: [0, 0, 0], site: "palm", dir: "up", palm: "fwd" };

function compileHand(ctx: Ctx, arm: ArmRig, keys: HandKey[], other: { arm: ArmRig; keys: Key[] } | null, shift?: Vector3): Key[] {
  const out: Key[] = [];
  let prev: Resolved = DEFAULTS;
  const otherPose = makePose();
  const plan = makePlan();
  let prevSup = 0, prevSwivel = 0;
  keys.forEach((k, idx) => {
    const cur: Resolved = {
      hs: k.hs ?? prev.hs, site: k.site ?? prev.site, dir: k.dir ?? prev.dir, palm: k.palm ?? prev.palm,
      at: k.at ?? prev.at, off: k.off ?? (k.at ? [0, 0, 0] : prev.off),
    };
    prev = cur;
    const shape = shapeFor(arm, cur.hs);
    const rotW = handRotation(arm, dirVector(cur.dir, arm), dirVector(cur.palm, arm));
    let target: Vector3;
    if (cur.at.startsWith("other.")) {
      if (!other) throw new Error(`Sign uses "${cur.at}" without a second hand.`);
      // Other hand's pose at this time, back in model space.
      sampleTrack(other.keys, k.t, otherPose);
      const oRot = otherPose.rot.clone().premultiply(chestQ(ctx));
      const oWrist = otherPose.pos.clone().applyMatrix4(ctx.rig.chestRest);
      const site = siteLocal(other.arm, otherPose.shape, cur.at.slice(6) as HandSite).applyQuaternion(oRot);
      const f = other.arm.fL.clone().applyQuaternion(oRot), n = other.arm.nL.clone().applyQuaternion(oRot), t = other.arm.tL.clone().applyQuaternion(oRot);
      target = oWrist.add(site).addScaledVector(f, cur.off[0]).addScaledVector(n, cur.off[1]).addScaledVector(t, cur.off[2]);
    } else {
      const base = ANCHORS[cur.at as BodyAnchor];
      if (!base) throw new Error(`Unknown location "${cur.at}".`);
      target = sideVec(base, arm).add(sideVec(cur.off, arm));
      if (shift) target.add(shift);
    }
    // Turn the authored hand direction into forearm/wrist joint angles the arm can really make, then
    // place the wrist so the chosen part of the hand still lands on the target with that real orientation.
    const site = siteLocal(arm, shape, cur.site);
    const wrist = target.clone().sub(site.clone().applyQuaternion(rotW));
    for (let pass = 0; pass < 3; pass++) {
      chooseElbow(arm, arm.shoulder0, wrist, rotW, prevSup, ctx.body, plan, prevSwivel);
      wrist.copy(target).sub(site.clone().applyQuaternion(plan.handQ));
    }
    prevSup = plan.wrist.x;
    prevSwivel = plan.swivel;
    const key: Key = {
      t: k.t,
      pos: wrist.applyMatrix4(ctx.rig.chestRestInv),
      rot: plan.handQ.clone().premultiply(ctx.chestQInv),
      wrist: plan.wrist.clone(),
      fdir: arm.fL.clone().applyQuaternion(plan.handQ).applyQuaternion(ctx.chestQInv),
      swivel: plan.swivel,
      shape: shape.slice(),
      flow: k.flow ?? (idx === 0 || idx === keys.length - 1 ? 0 : 1),
      arc: k.arc === undefined ? undefined : (typeof k.arc === "number" ? new Vector3(0, 0, k.arc) : sideVec(k.arc, arm)).applyQuaternion(ctx.chestQInv),
    };
    out.push(key);
    if (k.hold) out.push({ ...cloneKey(key, k.t + k.hold, 0), arc: undefined });
  });
  // Later keys are shifted by the holds inserted before them.
  let delay = 0;
  for (let i = 0, k = 0; i < keys.length; i++, k++) {
    out[k].t += delay;
    if (keys[i].hold) { k++; out[k].t += delay; delay += keys[i].hold!; }
  }
  return out;
}

const chestQ = (ctx: Ctx) => ctx.chestQInv.clone().invert();

export type Hands = { dom: ArmRig; non: ArmRig };

/** Resolve a sign for the given hand assignment. `shift` moves body-anchored keys (used for fingerspelling drift). */
export function compileSign(rig: Rig, def: SignDef, hands: Hands, shift?: Vec3, body?: BodyProxy): CompiledSign {
  const ctx: Ctx = { rig, body, chestQInv: new Quaternion().setFromRotationMatrix(rig.chestRest).invert() };
  const sh = shift && sideVec(shift, hands.dom);
  if (!def.r) throw new Error(`"${def.id}" is a compound sign and has no motion of its own.`);
  const non = def.l ? compileHand(ctx, hands.non, def.l, null, sh) : null;
  const dom = compileHand(ctx, hands.dom, def.r, non ? { arm: hands.non, keys: non } : null, sh);
  retime(non ? [dom, non] : [dom]);
  const duration = Math.max(dom[dom.length - 1].t, non ? non[non.length - 1].t : 0);
  return { id: def.id, gloss: def.gloss, dom, non, nm: def.nm, duration };
}

/**
 * Stretch a sign's timing wherever a movement would be faster than a human hand can move.
 * Both hands share one time warp, so two-handed contacts stay in sync.
 */
export function retime(tracks: Key[][]) {
  const times = [...new Set(tracks.flatMap(keys => keys.map(k => k.t)))].sort((x, y) => x - y);
  if (times.length < 2) return;
  const scale = new Array(times.length - 1).fill(1);
  for (const keys of tracks) for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    const have = b.t - a.t;
    if (have <= 0) continue;
    // An arc makes the path longer than the straight line between the keys.
    const need = (minSegmentTime(a, b) + (b.arc ? b.arc.length() * 1.2 : 0)) * (a.flow > 0.5 && b.flow > 0.5 ? 0.85 : 1);
    if (need <= have) continue;
    // Spread the stretch over every grid interval this movement spans.
    for (let g = 0; g < times.length - 1; g++) if (times[g] >= a.t && times[g + 1] <= b.t) scale[g] = Math.max(scale[g], need / have);
  }
  const mapped = new Map<number, number>([[times[0], times[0]]]);
  for (let g = 0, acc = times[0]; g < times.length - 1; g++) mapped.set(times[g + 1], (acc += (times[g + 1] - times[g]) * scale[g]));
  for (const keys of tracks) for (const k of keys) k.t = mapped.get(k.t)!;
}

/** The resting "waiting" pose: hands loosely together in front of the waist. */
export function restSign(): SignDef {
  return {
    id: "_rest", gloss: "",
    // Symmetric and relaxed: forearms angled in, hands loosely together, the dominant one just above.
    r: [{ t: 0, hs: "rest", at: "waist", off: [0.04, 0.025, 0.06], dir: "in+fwd+down", palm: "in+up" }],
    l: [{ t: 0, hs: "rest", at: "waist", off: [0.04, 0.005, 0.06], dir: "in+fwd+down", palm: "in+up" }],
  };
}
