import type { LessonDefinition } from "../learning/rules.ts";
import { numberSigns } from "../signing/signs/numbers.ts";
import { ALL_LESSONS, CONTENT_VERSION, findLesson, isReady, type LessonDef } from "./curriculum.ts";
import { gloss, LEXICON } from "./lexicon.ts";

/** What the avatar plays: sign ids and "spell:WORD" items. */
export type Play = string[];

export type Option = { id: string; label: string; play?: Play };
export type Step =
  | { kind: "learn"; id: string; animation: string; sign: string; gloss: string; tip?: string; play: Play }
  | { kind: "question"; id: string; animation: string; type: "recognize" | "pick" | "spell" | "number" | "phrase"; prompt: string; play?: Play; options: Option[] };

export type LessonPlan = { lessonId: string; version: number; title: string; goal: string; note?: string; unit: string; level: string; steps: Step[]; /** Caption text for every sign the lesson plays. */ glosses: Record<string, string> };
export type BuiltLesson = { plan: LessonPlan; definition: LessonDefinition; answers: Record<string, string> };

/** Small deterministic PRNG so a lesson always produces the same questions. */
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const shuffle = <T,>(items: T[], rand: () => number) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const LETTERS = "ABCD";

/** Signs taught in this lesson and all earlier ones, for review and distractors. */
function signsUpTo(lesson: LessonDef) {
  const idx = ALL_LESSONS.findIndex(l => l.id === lesson.id);
  return ALL_LESSONS.slice(0, idx).flatMap(l => l.signs ?? []);
}

export function buildLesson(lessonId: string): BuiltLesson {
  const lesson = findLesson(lessonId);
  if (!lesson || !isReady(lesson)) throw new Error("This lesson is not available yet.");
  const rand = rng(`${lesson.id}@${CONTENT_VERSION}`);
  const taught = lesson.signs ?? [];
  const earlier = signsUpTo(lesson);
  // Distractors come from signs the learner has already met; the unit's later signs fill in only when too few.
  const seen = [...new Set([...taught, ...earlier].map(gloss))];
  const glossPool = seen.length >= 4 ? seen : [...new Set([...seen, ...lesson.unit.lessons.flatMap(l => l.signs ?? []).map(gloss)])];
  const steps: Step[] = [];
  const answers: Record<string, string> = {};
  let q = 0;

  const choose = (correct: string, pool: string[], n = 4) => {
    const distractors = shuffle([...new Set(pool)].filter(p => p !== correct), rand).slice(0, n - 1);
    return shuffle([correct, ...distractors], rand);
  };
  const question = (type: Extract<Step, { kind: "question" }>["type"], prompt: string, play: Play | undefined, labels: string[], correct: string, plays?: Play[]) => {
    const id = `${lesson.id}-q${++q}`;
    const options = labels.map((label, i) => ({ id: LETTERS[i], label, play: plays?.[i] }));
    answers[id] = options[labels.indexOf(correct)].id;
    steps.push({ kind: "question", id, animation: `q:${id}`, type, prompt, play, options });
  };
  const recognize = (sign: string) => question("recognize", "What does this sign mean?", [sign], choose(gloss(sign), glossPool), gloss(sign));
  const pick = (sign: string) => {
    const others = shuffle([...new Set([...taught, ...earlier])].filter(s => s !== sign && gloss(s) !== gloss(sign)), rand).slice(0, 2);
    if (others.length < 2) return recognize(sign);
    const order = shuffle([sign, ...others], rand);
    question("pick", `Which one means “${gloss(sign)}”?`, undefined, order.map((_, i) => `Sign ${LETTERS[i]}`), `Sign ${LETTERS[order.indexOf(sign)]}`, order.map(s => [s]));
  };

  // Teach in pairs, checking each pair straight away.
  taught.forEach((sign, i) => {
    const def = LEXICON.get(sign)!;
    steps.push({ kind: "learn", id: `${lesson.id}-learn-${sign}`, animation: sign, sign, gloss: def.gloss, tip: def.tip, play: [sign] });
    if (i % 2 === 1 || i === taught.length - 1) recognize(shuffle(taught.slice(Math.max(0, i - 1), i + 1), rand)[0]);
  });
  // Then practise every new sign once more, the other way round.
  for (const sign of shuffle(taught, rand)) pick(sign);
  // Spaced review of earlier signs.
  for (const sign of shuffle(earlier, rand).slice(0, taught.length ? 2 : 4)) recognize(sign);

  for (const word of lesson.spell ?? []) {
    const pool = [...(lesson.spell ?? []), ...ALL_LESSONS.flatMap(l => l.spell ?? [])];
    question("spell", "Which word is being fingerspelled?", [`spell:${word}`], choose(word, pool), word);
  }
  for (const n of lesson.numbers ?? []) {
    const near = [n + 1, n + 10, n - 1, n * 2, Math.max(0, n - 10), Number(String(n).split("").reverse().join(""))].filter(x => x !== n && x >= 0);
    question("number", "Which number is this?", numberSigns(n), choose(String(n), [...near.map(String), ...(lesson.numbers ?? []).map(String)]), String(n));
  }
  const allPhrases = ALL_LESSONS.flatMap(l => l.phrases ?? []).map(p => p.meaning);
  for (const phrase of lesson.phrases ?? []) question("phrase", "What is being signed?", phrase.play, choose(phrase.meaning, [...(lesson.phrases ?? []).map(p => p.meaning), ...allPhrases]), phrase.meaning);

  const played = steps.flatMap(s => (s.kind === "learn" ? s.play : [...(s.play ?? []), ...s.options.flatMap(o => o.play ?? [])]));
  const glosses = Object.fromEntries(played.map(id => [id, id.startsWith("spell:") ? id.slice(6) : gloss(id)]));
  const plan: LessonPlan = { lessonId: lesson.id, version: CONTENT_VERSION, title: lesson.title, goal: lesson.goal, note: lesson.note, unit: lesson.unit.title, level: lesson.unit.level, steps, glosses };
  const definition: LessonDefinition = {
    id: lesson.id, version: CONTENT_VERSION,
    requiredAnimations: steps.map(s => s.animation),
    questions: steps.flatMap(s => (s.kind === "question" ? [{ id: s.id, animationId: s.animation, correctOptionId: answers[s.id] }] : [])),
  };
  return { plan, definition, answers };
}

const cache = new Map<string, BuiltLesson>();
export function getLesson(lessonId: string) {
  let built = cache.get(lessonId);
  if (!built) cache.set(lessonId, (built = buildLesson(lessonId)));
  return built;
}
