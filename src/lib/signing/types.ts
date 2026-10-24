/**
 * Sign definition language.
 *
 * All spatial values are body-relative and side-relative so that one definition works for
 * either hand and for left-handed (mirrored) playback:
 *   x: toward the hand's own side ("out"), y: up, z: forward toward the viewer. Metres.
 */
export type Vec3 = [number, number, number];

/** Direction words, combinable with "+", e.g. "up+fwd". */
export type DirWord = "up" | "down" | "fwd" | "back" | "in" | "out";
export type Dir = string | Vec3;

/** Body landmarks. Lateral anchors refer to the hand's own side; "Opp" variants to the other side. */
export type BodyAnchor =
  | "top" | "forehead" | "temple" | "templeOpp" | "eye" | "nose" | "cheek" | "cheekOpp" | "ear" | "earOpp"
  | "mouth" | "chin" | "neck" | "shoulder" | "shoulderOpp" | "chest" | "chestSide" | "chestOpp"
  | "stomach" | "waist" | "neutral" | "neutralHigh" | "neutralLow" | "side" | "elbowOpp";

/** Points on a hand. Used both as the moving hand's contact site and as a target on the other hand. */
export type HandSite = "palm" | "back" | "wrist" | "knuckles" | "fingers" | "index" | "middle" | "ring" | "pinky" | "thumb" | "thumbSide" | "pinkySide";

/** A target on the other hand, e.g. "other.palm". Offsets are then [along fingers, out of palm, toward thumb]. */
export type OtherAnchor = `other.${HandSite}`;

export type HandKey = {
  /** Seconds from the start of the sign (at normal speed). */
  t: number;
  /** Handshape name from the handshape library. Inherits from the previous key when omitted. */
  hs?: string;
  at?: BodyAnchor | OtherAnchor;
  off?: Vec3;
  /** Which point of this hand is placed on the target. Default "palm". */
  site?: HandSite;
  /** Direction the hand points (wrist to knuckles). */
  dir?: Dir;
  /** Direction the palm faces. */
  palm?: Dir;
  /** Arc bulge for the movement arriving at this key. Number = toward the viewer; vector = side-relative. */
  arc?: number | Vec3;
  /** 0 = come to rest at this key, 1 = flow through it. Defaults: 0 for first/last key, 1 otherwise. */
  flow?: number;
  /** Extra elbow hint, side-relative. */
  elbow?: Vec3;
  /** Hold this key for extra seconds. */
  hold?: number;
};

export type NonManual = "nod" | "shake" | "yesno" | "wh" | "tilt" | "lean" | "smile";

export type SignDef = {
  id: string;
  /** English meaning shown to learners. */
  gloss: string;
  /** Dominant hand keys. Omitted for compounds. */
  r?: HandKey[];
  /** Compound sign: played as this sequence of other signs (e.g. JANUARY = MONTH + 1). */
  seq?: string[];
  /** Non-dominant hand keys (two-handed signs). */
  l?: HandKey[];
  nm?: NonManual;
  /** Short learner tip: handshape, location, movement. */
  tip?: string;
  /** Book reference, e.g. "REB RSL manual p.35". */
  src?: string;
  /** Marks signs whose motion is inferred and should be checked by a Deaf signer. */
  review?: boolean;
};

export type FingerPose = [mcp: number, pip: number, dip: number];
export type ThumbPose = [opp: number, abd: number, flex1: number, flex2: number];
export type HandshapeDef = {
  i: FingerPose; m: FingerPose; r: FingerPose; p: FingerPose; t: ThumbPose;
  /** Spread of the fingers in degrees (index/ring/pinky fan around the middle finger). */
  spread?: number;
  /** Per-finger spread overrides [index, middle, ring, pinky]. */
  spreads?: [number, number, number, number];
  /**
   * Place the thumb tip at a point defined by the other fingers (solved per character):
   * between fingers `a` and `b` (or on `a`) at joint `joint` (1 = middle joint, 2 = tip joint),
   * moved `out` metres toward the palm side and `along` toward the fingertips.
   * `straight` keeps the thumb joints extended (T: straight thumb under the folded index).
   */
  thumbTo?: { a: "i" | "m" | "r" | "p"; b?: "i" | "m" | "r" | "p"; joint: 0 | 1 | 2 | 3; out?: number; along?: number; straight?: boolean };
};
