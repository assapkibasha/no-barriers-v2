import { DirectionalLight, HemisphereLight, type Object3D, PerspectiveCamera, Quaternion, Scene, SRGBColorSpace, Vector3, WebGLRenderer, ACESFilmicToneMapping, type Mesh } from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { buildRig, siteLocal, type ArmRig, type Rig } from "./rig";
import { buildBody, bodyPush, capsulePush, segmentClosest, updateBody, type Capsule } from "./physics";
import { compileSign, restSign, type CompiledSign, type Hands } from "./compile";
import { applyBody, type Reaction } from "./body";
import { applyArm, makePlan, placeClavicle, planArm, type ArmPlan } from "./solve";
import { buildTimeline, type SequenceItem, type Timeline } from "./timeline";
import { type HandPose, clonePose, makePose, sampleTrack } from "./track";
import { loadSigns } from "./signs";
import type { SignDef, Vec3 } from "./types";

export const DEFAULT_MODEL = "/avatar/berthin.glb";

/** A sign id, a fingerspelled word ("spell:KIGALI"), or an id with options. */
export type PlayItem = string | { id: string; pace?: number };

export type PlayerEvents = {
  /** Index of the item currently being signed, or -1 while resting. */
  onSign?: (index: number) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
};

const gltfCache = new Map<string, Promise<GLTF>>();
function loadModel(url: string) {
  let p = gltfCache.get(url);
  if (!p) {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    p = loader.loadAsync(url);
    p.catch(() => gltfCache.delete(url));
    gltfCache.set(url, p);
  }
  return p;
}

/** Start downloading the character early, e.g. when a lesson card is hovered. */
export const preloadAvatar = (url = DEFAULT_MODEL) => void loadModel(url).catch(() => undefined);

type Expanded = { id: string; origin: number; pace?: number; shift?: Vec3; lead?: number };
/** Expand fingerspelling into letters that drift slightly sideways, as real fingerspelling does. */
export function expandItems(items: PlayItem[]): Expanded[] {
  const out: Expanded[] = [];
  items.forEach((item, origin) => {
    const id = typeof item === "string" ? item : item.id;
    const pace = typeof item === "string" ? undefined : item.pace;
    if (id.startsWith("spell:")) {
      const letters = id.slice(6).toLowerCase().replace(/[^a-z]/g, "").split("");
      letters.forEach((c, k) => {
        const double = k > 0 && letters[k - 1] === c;
        out.push({ id: `abc.${c}`, origin, pace: (pace ?? 1) * 0.8, shift: [Math.min(k, 8) * 0.012 + (double ? 0.025 : 0), 0, 0], lead: k === 0 ? undefined : double ? 0.24 : 0.17 });
      });
    } else out.push({ id, origin, pace });
  });
  return out;
}

export class SignAvatarPlayer {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(30, 1, 0.1, 20);
  private controls: OrbitControls;
  private lastFrame = 0;
  private rig!: Rig;
  private body!: ReturnType<typeof buildBody>;
  private hands!: Hands;
  private rest!: { dom: HandPose; non: HandPose };
  private current = { dom: makePose(), non: makePose() };
  private compiled = new Map<string, CompiledSign>();
  private defs = new Map<string, SignDef>();
  private timeline: Timeline | null = null;
  private playTime = 0;
  private time = 0;
  private idle = 1;
  private markIndex = -1;
  /** Maps each expanded sign back to the item the caller passed. */
  private origins: number[] = [];
  private speed = 1;
  private mirror = false;
  private visible = true;
  private lastItems: PlayItem[] = [];
  private finish: ((done: boolean) => void) | null = null;
  private resizeObserver: ResizeObserver;
  private intersection: IntersectionObserver;
  private returning = false;
  private static readonly UP = new Vector3(0, 1, 0);
  private readonly target = new Vector3(0, 1.4, 0.04);

  private constructor(private container: HTMLElement, private events: PlayerEvents) {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.touchAction = "pan-y";

    this.scene.add(new HemisphereLight(0xfdfbf7, 0x5a5048, 1.6));
    const key = new DirectionalLight(0xffffff, 2.2); key.position.set(0.9, 2.4, 2.2); this.scene.add(key);
    const rim = new DirectionalLight(0xcfe9ff, 1.1); rim.position.set(-1.4, 2, -1.2); this.scene.add(rim);

    this.camera.position.copy(this.target).add(new Vector3(0, 0, 1));
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(this.target);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    this.controls.rotateSpeed = 0.55;
    // Front half only: never orbit behind the signer. The vertical angle is fixed.
    this.controls.minAzimuthAngle = -1.05;
    this.controls.maxAzimuthAngle = 1.05;
    this.controls.minPolarAngle = this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    // The view stays where the learner leaves it; it returns to the front only when the content changes.
    this.controls.addEventListener("start", () => { this.returning = false; });

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.intersection = new IntersectionObserver(([entry]) => { this.visible = entry.isIntersecting; this.loop(); });
    this.intersection.observe(container);
    document.addEventListener("visibilitychange", this.loop);
  }

  static async create(container: HTMLElement, opts: { modelUrl?: string; mirror?: boolean } & PlayerEvents = {}) {
    const player = new SignAvatarPlayer(container, opts);
    const gltf = await loadModel(opts.modelUrl ?? DEFAULT_MODEL);
    const model = cloneSkinned(gltf.scene) as Object3D;
    model.traverse(o => { if ((o as Mesh).isMesh) o.frustumCulled = false; });
    player.scene.add(model);
    player.rig = buildRig(model);
    player.body = buildBody(player.rig);
    // Read-only geometry helpers for the automated physics audit (npm run audit:signs), on the studio only.
    if (location.pathname.startsWith("/studio")) Object.assign(window, { __siteLocal: siteLocal, __bodyPush: bodyPush, __segmentClosest: segmentClosest });
    player.setMirror(!!opts.mirror);
    player.resize();
    player.loop();
    return player;
  }

  /** Left-handed view: the dominant hand becomes the left hand. */
  setMirror(mirror: boolean) {
    this.mirror = mirror;
    this.hands = mirror ? { dom: this.rig.L, non: this.rig.R } : { dom: this.rig.R, non: this.rig.L };
    this.compiled.clear();
    const rest = compileSign(this.rig, restSign(), this.hands, undefined, this.body.rest);
    this.rest = { dom: rest.dom[0], non: rest.non![0] };
    if (!this.timeline) this.current = { dom: clonePose(this.rest.dom), non: clonePose(this.rest.non) };
  }

  setSpeed(speed: number) { this.speed = Math.max(0.25, Math.min(1.5, speed)); }

  /** A momentary head-and-body reaction (approving nod, gentle head shake), layered on any motion. */
  react(kind: Reaction) { this.reactions.push({ kind, start: this.time }); }
  private reactions: { kind: Reaction; start: number }[] = [];

  /**
   * Play signs in order as one continuous performance. Resolves true when finished, false if
   * interrupted. `silent` plays without reporting caption progress (for the signer's own reactions).
   */
  async play(items: PlayItem[], opts: { silent?: boolean } = {}): Promise<boolean> {
    // New content brings the view back to the front; a replay keeps the learner's angle.
    if (JSON.stringify(items) !== JSON.stringify(this.lastItems)) this.returning = true;
    this.lastItems = items;
    let expanded = expandItems(items);
    // Load definitions and unfold compound signs until only motion signs remain.
    for (let depth = 0; depth < 4; depth++) {
      const missing = [...new Set(expanded.map(e => e.id))].filter(id => !this.defs.has(id));
      if (missing.length) (await loadSigns(missing)).forEach((d, id) => this.defs.set(id, d));
      if (!expanded.some(e => this.defs.get(e.id)?.seq)) break;
      expanded = expanded.flatMap(e => this.defs.get(e.id)?.seq?.map(id => ({ ...e, id, shift: undefined, lead: undefined })) ?? [e]);
    }
    this.origins = expanded.map(e => (opts.silent ? -1 : e.origin));
    const seq: SequenceItem[] = expanded.map(e => {
      const def = this.defs.get(e.id);
      if (!def) throw new Error(`No animation for "${e.id}".`);
      const key = `${e.id}@${e.shift?.join(",") ?? ""}`;
      let sign = this.compiled.get(key);
      if (!sign) this.compiled.set(key, (sign = compileSign(this.rig, def, this.hands, e.shift, this.body.rest)));
      return { sign, pace: e.pace, lead: e.lead };
    });
    this.finish?.(false);
    this.timeline = buildTimeline(seq, this.current, this.rest);
    this.playTime = 0;
    this.markIndex = -1;
    this.loop();
    return new Promise(resolve => { this.finish = resolve; });
  }

  replay() { return this.lastItems.length ? this.play(this.lastItems) : Promise.resolve(false); }

  stop() {
    if (!this.timeline) return;
    // Glide back to rest from wherever the hands are.
    this.timeline = buildTimeline([], this.current, this.rest);
    this.playTime = 0;
  }

  /** Smoothly return the camera to the front view. */
  resetView() { this.returning = true; }

  get playing() { return !!this.timeline; }

  /** Pose at an exact moment, for thumbnails and tests. */
  seek(t: number) {
    if (!this.timeline) return;
    this.playTime = t;
    this.update(0);
    this.renderer.render(this.scene, this.camera);
  }
  pause() { this.paused = true; }
  private paused = false;
  /** Development aid: force the dominant handshape (20 values, see handshapes.ts). */
  shapeOverride: number[] | null = null;

  dispose() {
    this.finish?.(false);
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    this.intersection.disconnect();
    document.removeEventListener("visibilitychange", this.loop);
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private loop = () => {
    const run = this.visible && document.visibilityState === "visible";
    this.renderer.setAnimationLoop(run ? () => this.frame() : null);
    this.lastFrame = performance.now();
  };

  private resize() {
    const w = this.container.clientWidth || 1, h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.camera.aspect = w / h;
    // Frame the torso and the full signing space: head to waist, elbow to elbow.
    const tanHalf = Math.tan((this.camera.fov / 2) * Math.PI / 180);
    const dist = Math.max(0.5 / tanHalf, 0.46 / (tanHalf * this.camera.aspect));
    const dir = this.camera.position.clone().sub(this.target);
    this.camera.position.copy(this.target).addScaledVector(dir.normalize(), dist);
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  private frame() {
    if (!this.hands) return;
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    if (!this.paused) this.update(dt);
    if (this.returning) {
      // Glide back to the front: fast at first, settling gently.
      const az = this.controls.getAzimuthalAngle();
      if (Math.abs(az) < 0.002) this.returning = false;
      else this.camera.position.sub(this.target).applyAxisAngle(SignAvatarPlayer.UP, -az * Math.min(1, dt * 3.2)).add(this.target);
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private readonly chestQ = new Quaternion();

  private update(dt: number) {
    this.time += dt;
    const tl = this.timeline;
    if (tl) {
      this.playTime += dt * this.speed;
      sampleTrack(tl.dom, this.playTime, this.current.dom);
      sampleTrack(tl.non, this.playTime, this.current.non);
      const found = tl.marks.findLast(m => this.playTime >= m.start && this.playTime <= m.end + 0.25)?.index;
      const mark = found === undefined ? -1 : this.origins[found] ?? -1;
      if (mark !== this.markIndex) { this.markIndex = mark; this.events.onSign?.(mark); }
      if (this.playTime >= tl.duration) {
        this.timeline = null;
        this.events.onSign?.(-1);
        this.events.onEnd?.();
        const f = this.finish; this.finish = null; f?.(true);
      }
    } else {
      this.idleHands();
    }
    this.idle += ((tl ? 0.3 : 1) - this.idle) * Math.min(1, dt * 2.5);
    const domSign = this.mirror ? -1 : 1;
    const p = this.current.dom.pos;
    this.reactions = this.reactions.filter(r => this.time - r.start < 1.5);
    applyBody(this.rig, {
      time: this.time, idle: this.idle, timeline: tl, playTime: this.playTime, domSign,
      reactions: this.reactions.map(r => ({ kind: r.kind, age: this.time - r.start })),
      reach: tl ? { lateral: -p.x * domSign, height: p.y, forward: p.z } : undefined,
    });
    this.rig.root.updateMatrixWorld(true);
    updateBody(this.body.live);
    const chestM = this.rig.chest.matrixWorld;
    this.rig.chest.getWorldQuaternion(this.chestQ);
    if (this.shapeOverride) this.current.dom.shape.set(this.shapeOverride);
    const arms = [this.hands.non, this.hands.dom], poses = [this.current.non, this.current.dom];
    for (let i = 0; i < 2; i++) {
      this.wristPos[i].copy(poses[i].pos).applyMatrix4(chestM);
      this.fingerDir[i].copy(poses[i].fdir).applyQuaternion(this.chestQ);
    }
    // 1. Work out, from scratch, how far each wrist must move and how the elbow must swing to keep
    //    everything clear (body, the other arm, the other hand). This target can change abruptly.
    for (let i = 0; i < 2; i++) this.basePos[i].copy(this.wristPos[i]);
    for (let pass = 0; pass < 8; pass++) {
      for (let i = 0; i < 2; i++) {
        placeClavicle(arms[i], this.wristPos[i], this.shoulder[i]);
        planArm(arms[i], this.shoulder[i], this.wristPos[i], this.fingerDir[i], this.plans[i], { wrist: poses[i].wrist, body: this.body.live, swivel: poses[i].swivel, offset: this.elbowOffset[i], findClearance: true });
      }
      if (pass === 7 || !this.resolveContacts(arms, poses)) break;
    }
    // 2. Follow that target smoothly so the visible motion is always continuous: react quickly
    //    (~20 ms) when contact is building up, relax slowly (~80 ms) when it is no longer needed.
    const follow = (tau: number) => (dt > 0 ? 1 - Math.exp(-dt / tau) : 1);
    for (let i = 0; i < 2; i++) {
      const target = this.push.subVectors(this.wristPos[i], this.basePos[i]);
      const growing = target.lengthSq() > this.correction[i].lengthSq();
      this.correction[i].lerp(target, follow(growing ? 0.02 : 0.08));
      const clear = this.plans[i].clearance;
      // The elbow's escape swing is speed-limited, like a real shoulder (at most ~300°/s).
      const step = (clear - this.elbowOffset[i]) * follow(Math.abs(clear) > Math.abs(this.elbowOffset[i]) ? 0.03 : 0.09);
      const maxStep = dt > 0 ? 300 * dt : Infinity;
      this.elbowOffset[i] += Math.max(-maxStep, Math.min(maxStep, step));
    }
    // 3. Pose the arms with the smoothed corrections.
    for (let i = 0; i < 2; i++) {
      this.wristPos[i].copy(this.basePos[i]).add(this.correction[i]);
      placeClavicle(arms[i], this.wristPos[i], this.shoulder[i]);
      planArm(arms[i], this.shoulder[i], this.wristPos[i], this.fingerDir[i], this.plans[i], { wrist: poses[i].wrist, swivel: poses[i].swivel, offset: this.elbowOffset[i] });
      applyArm(arms[i], this.plans[i], poses[i].shape);
    }
  }

  private readonly basePos = [new Vector3(), new Vector3()];
  private readonly correction = [new Vector3(), new Vector3()];
  private readonly elbowOffset = [0, 0];

  private readonly wristPos = [new Vector3(), new Vector3()];
  private readonly fingerDir = [new Vector3(), new Vector3()];
  private readonly shoulder = [new Vector3(), new Vector3()];
  private readonly plans: [ArmPlan, ArmPlan] = [makePlan(), makePlan()];
  private readonly trialPlan = makePlan();
  private readonly reachN = new Vector3();
  private readonly reachD = new Vector3();
  private readonly probe = new Vector3();
  private readonly push = new Vector3();
  private readonly total = new Vector3();
  private readonly c0 = new Vector3();
  private readonly c1 = new Vector3();
  private readonly limbs: Capsule[] = [...Array(4)].map(() => ({ a: new Vector3(), b: new Vector3(), r: 0 }));
  /** Points of the hand that must stay outside the body, with their thickness in metres. */
  private static readonly HAND_POINTS = [["palm", 0.028], ["back", 0.02], ["wrist", 0.028], ["knuckles", 0.016], ["fingers", 0.011], ["thumb", 0.011], ["pinky", 0.009], ["index", 0.009]] as const;

  /**
   * Push each hand out of everything it must not enter. The dominant hand also yields to the other
   * arm and hand; forearms may not cross through each other. Returns true if anything moved.
   */
  private resolveContacts(arms: ArmRig[], poses: HandPose[]) {
    let moved = false;
    const [pn, pd] = this.plans;
    // The non-dominant limb as capsules: upper arm, forearm, palm, fingers.
    const [upper, fore, palm, fingers] = this.limbs;
    upper.a.copy(pn.S); upper.b.copy(pn.E); upper.r = 0.042;
    fore.a.copy(pn.E); fore.b.copy(pn.W); fore.r = 0.032;
    palm.a.copy(pn.W); palm.b.copy(siteLocal(arms[0], poses[0].shape, "knuckles")).applyQuaternion(pn.handQ).add(pn.W); palm.r = 0.022;
    fingers.a.copy(palm.b); fingers.b.copy(siteLocal(arms[0], poses[0].shape, "fingers")).applyQuaternion(pn.handQ).add(pn.W); fingers.r = 0.01;
    for (let i = 0; i < 2; i++) {
      const plan = this.plans[i];
      this.total.set(0, 0, 0);
      for (const [site, r] of SignAvatarPlayer.HAND_POINTS) {
        this.probe.copy(siteLocal(arms[i], poses[i].shape, site)).applyQuaternion(plan.handQ).add(plan.W).add(this.total);
        // Body first, then (dominant hand only) the other arm and hand, which are thinner, softer contacts.
        if (bodyPush(this.body.live, this.probe, r, this.push) > 0) this.total.add(this.push);
        if (i === 1) {
          this.push.set(0, 0, 0);
          for (const c of this.limbs) capsulePush(c, this.probe.copy(siteLocal(arms[i], poses[i].shape, site)).applyQuaternion(plan.handQ).add(plan.W).add(this.total), r * 0.55, this.push);
          this.total.add(this.push);
        }
      }
      if (this.total.lengthSq() > 1e-8) { this.wristPos[i].add(this.total); moved = true; }
    }
    // Forearms cross over each other, never through. As people do, keep the hands where they are and
    // swing the dominant elbow around its arm until its forearm clears the other one (smoothed later).
    // Only the thick, elbow-side part of each forearm counts: wrists may come close when hands touch.
    const MIN = 0.055;
    const gap = segmentClosest(pn.E, this.reachN.lerpVectors(pn.E, pn.W, 0.7), pd.E, this.reachD.lerpVectors(pd.E, pd.W, 0.7), this.c0, this.c1);
    if (gap < MIN) {
      const trial = this.trialPlan;
      const gapWith = (deg: number) => {
        planArm(arms[1], pd.S, pd.W, this.fingerDir[1], trial, { wrist: pd.wrist, swivel: pd.swivel, offset: pd.clearance + deg });
        return segmentClosest(pn.E, this.reachN, trial.E, this.reachD.lerpVectors(trial.E, trial.W, 0.7), this.c0, this.c1);
      };
      const dir = gapWith(12) >= gapWith(-12) ? 1 : -1;
      pd.clearance = Math.max(-100, Math.min(100, pd.clearance + dir * Math.min(45, (MIN - gap) * 1500)));
    }
    return moved;
  }

  /** Resting hands drift slightly and the fingers settle, like someone waiting. */
  private idleHands() {
    const t = this.time;
    for (const [pose, rest, seed] of [[this.current.dom, this.rest.dom, 0], [this.current.non, this.rest.non, 2.4]] as const) {
      pose.pos.copy(rest.pos);
      pose.pos.x += Math.sin(t * 0.7 + seed) * 0.004;
      pose.pos.y += Math.sin(t * 0.43 + seed * 1.7) * 0.005 + Math.sin(t * 2 * Math.PI * 0.21) * 0.002;
      pose.rot.copy(rest.rot);
      pose.wrist.copy(rest.wrist);
      pose.fdir.copy(rest.fdir);
      pose.swivel = rest.swivel;
      pose.shape.set(rest.shape);
      const fidget = Math.max(0, Math.sin(t * 0.31 + seed * 3)) ** 6;
      pose.shape[18] += fidget * 14;
      pose.shape[19] += fidget * 10;
      for (let f = 0; f < 4; f++) pose.shape[f * 4 + 1] += Math.sin(t * 0.5 + f + seed) * 3;
    }
  }
}
