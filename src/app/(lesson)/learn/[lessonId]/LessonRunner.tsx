"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { IconArrowRight, IconCheck, IconFlame, IconHeartFilled, IconPlayerPlay, IconStar, IconVolume, IconVolumeOff, IconX } from "@tabler/icons-react";
import { play as playSound, setSoundEnabled, soundEnabled, subscribeSound } from "@/lib/sound";
import { pickCelebration, pickGreeting } from "@/lib/signing/reactions";
import SignStage, { type SignStageHandle } from "@/components/SignStage";
import type { LessonPlan, Step } from "@/lib/course/exercises";
import type { LessonProgress } from "@/lib/learning/rules";
import { answerQuestion, finishReview, markWatched, openLesson } from "@/app/actions/learning";
import styles from "./lesson.module.css";

type Question = Extract<Step, { kind: "question" }>;
type Feedback = { correct: boolean; correctOptionId: string } | null;

const satisfied = (s: Step, st: LessonProgress) => (s.kind === "learn" ? st.watchedAnimations.includes(s.animation) : st.correctQuestions.includes(s.id));

export default function LessonRunner({ plan, leftHanded, nextLessonId }: { plan: LessonPlan; leftHanded: boolean; nextLessonId: string | null }) {
  const stage = useRef<SignStageHandle>(null);
  const [state, setState] = useState<LessonProgress | null>(null);
  const [practice, setPractice] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const [turn, setTurn] = useState(0);
  /** The server has recorded this lesson as complete. */
  const [serverDone, setServerDone] = useState(false);
  /** A different greeting and celebration each lesson. */
  const [greeting] = useState(pickGreeting);
  const [celebration] = useState(pickCelebration);
  const [started, setStarted] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [played, setPlayed] = useState(false);
  const [done, setDone] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [stageItems, setStageItems] = useState<string[]>([]);
  /** Correct answers revealed by feedback, so review can replay the right sign. */
  const [known, setKnown] = useState<Record<string, string>>({});
  const [reviewing, setReviewing] = useState<Question | null>(null);
  /** Set when a run of correct answers reaches a milestone, to celebrate it. */
  const [streak, setStreak] = useState(0);
  const byId = useMemo(() => new Map(plan.steps.map(s => [s.id, s])), [plan]);
  const captionOf = (play: string[]) => play.map(p => plan.glosses[p] ?? p);

  useEffect(() => {
    openLesson(plan.lessonId).then(res => {
      if (res.error) { setError(res.error); return; }
      setState(res.state);
      if (res.justCompleted) { setXpGained(res.xpGained ?? 0); setStarted(true); setDone(true); return; }
      setPractice(res.completed);
      const pending = plan.steps.filter(s => !satisfied(s, res.state)).map(s => s.id);
      setQueue(pending);
      if (!pending.length) setDone(true);
      // Resuming mid-lesson skips the introduction.
      setStarted(res.state.watchedAnimations.length > 0 && !res.completed);
    });
  }, [plan]);

  const step = queue.length ? byId.get(queue[0]) : undefined;
  const total = plan.steps.length;
  const progress = state ? plan.steps.filter(s => satisfied(s, state)).length / total : 0;

  // Each new turn (including a missed question coming back) starts fresh.
  const turnKey = `${turn}:${step?.id ?? ""}`;
  const [shownTurn, setShownTurn] = useState("");
  if (turnKey !== shownTurn) {
    setShownTurn(turnKey);
    setChoice(null); setFeedback(null); setPlayed(false);
    if (step) setStageItems(step.kind === "learn" ? step.play : step.type === "pick" ? [] : step.play ?? []);
  }

  const sync = (res: { state: LessonProgress; completed: boolean; xpGained?: number; error?: string }) => {
    if (res.error) { setError(res.error); return false; }
    setError("");
    setState(res.state);
    setServerDone(res.completed);
    if (res.xpGained) setXpGained(x => x + res.xpGained!);
    return true;
  };

  const watched = async (animation: string) => {
    setPlayed(true);
    if (!state || state.watchedAnimations.includes(animation) && !state.reviewRequired) return;
    sync(await markWatched(plan.lessonId, state, animation));
  };

  const check = async () => {
    if (!state || !step || step.kind !== "question" || !choice) return;
    setBusy(true);
    const res = await answerQuestion(plan.lessonId, state, { submissionId: crypto.randomUUID(), questionId: step.id, optionId: choice });
    setBusy(false);
    if (!sync(res)) return;
    setFeedback({ correct: res.correct, correctOptionId: res.correctOptionId });
    setKnown(k => ({ ...k, [step.id]: res.correctOptionId }));
    // Sound and a reaction from the signer, like a teacher watching.
    const signer = stage.current?.player();
    const run = res.state.correctRun;
    const milestone = res.correct && [3, 5, 10, 15, 20].includes(run);
    setStreak(milestone ? run : 0);
    if (res.correct) { playSound(milestone ? "streak" : "correct", run); signer?.react("happy"); }
    else { playSound(res.state.reviewRequired ? "heartsOut" : "wrong"); signer?.react("sad"); }
    if (res.completed && !practice) { window.setTimeout(() => playSound("complete"), 450); setDone(true); }
  };

  const advance = () => {
    if (!state || !step) return;
    // Missed questions come back at the end of the lesson.
    const rest = queue.slice(1);
    const again = step.kind === "question" && !state.correctQuestions.includes(step.id) ? [step.id] : [];
    let next = [...rest, ...again];
    // Only finish when the server has recorded the completion; anything still missing comes back.
    if (!next.length && !practice && !serverDone) next = plan.steps.filter(s => !satisfied(s, state)).map(s => s.id);
    setQueue(next);
    setTurn(t => t + 1);
    if (!next.length) { setDone(true); if (!practice) playSound("complete"); }
  };

  const refill = async () => {
    if (!state) return;
    setBusy(true);
    const res = await finishReview(plan.lessonId, state);
    setBusy(false);
    if (sync(res)) playSound("refill");
  };

  if (error && !state) return <Shell plan={plan} progress={0} hearts={5}><div className={styles.message} role="alert"><h1>We could not open this lesson</h1><p>{error}</p><Link className={styles.primary} href="/learn">Back to my learning</Link></div></Shell>;
  if (!state) return <Shell plan={plan} progress={0} hearts={5}><div className={styles.message} role="status"><p>Loading your lesson…</p></div></Shell>;

  if (done) return <Shell plan={plan} progress={1} hearts={state.hearts}><div className={styles.message}>
    <SignStage items={celebration} autoPlay mirror={leftHanded} className={styles.smallStage} label="The signer applauds you" />
    <span className={styles.badge}><IconCheck size={36} /></span>
    <h1>{practice ? "Practice complete" : "Lesson complete!"}</h1>
    <p>{plan.goal}</p>
    {!practice && <p className={styles.xp}><IconStar size={20} /> {xpGained} XP earned</p>}
    <div className={styles.actions}>
      {nextLessonId && <Link className={styles.primary} href={`/learn/${nextLessonId}`} onClick={() => playSound("transition")}>Next lesson<IconArrowRight size={18} /></Link>}
      <Link className={nextLessonId ? styles.secondary : styles.primary} href="/learn">Back to my learning</Link>
    </div>
  </div></Shell>;

  // Out of hearts: review the missed signs, then continue.
  if (state.reviewRequired) {
    const missed = state.missedAnimations.map(a => plan.steps.find(s => s.animation === a)).filter((s): s is Question => s?.kind === "question");
    const allReviewed = state.missedAnimations.every(a => state.reviewedAnimations.includes(a));
    const playFor = (q: Question) => q.play ?? q.options.find(o => o.id === known[q.id])?.play ?? q.options.flatMap(o => o.play ?? []);
    const answerFor = (q: Question) => q.type === "pick" ? q.prompt.replace(/^Which one means /, "").replace(/\?$/, "") : q.options.find(o => o.id === known[q.id])?.label;
    return <Shell plan={plan} progress={progress} hearts={0}><div className={styles.layout}>
      <SignStage ref={stage} items={stageItems} captions={captionOf(stageItems)} autoPlay={false} mirror={leftHanded} className={styles.stage} />
      <section className={styles.panel}>
        <small className={styles.kicker}>Review</small>
        <h2>Let’s review</h2>
        <p>You ran out of hearts. Watch each sign you missed, then your hearts are refilled. Your progress is kept.</p>
        <ul className={styles.reviewList}>{missed.map((q, i) => <li key={q.id}><button aria-pressed={reviewing?.id === q.id} onClick={async () => { const play = playFor(q); setReviewing(q); setStageItems(play); if (await stage.current?.play(play)) void watched(q.animation); }}>
          {state.reviewedAnimations.includes(q.animation) ? <IconCheck size={18} /> : <IconPlayerPlay size={18} />}<span>{answerFor(q) ?? `Missed sign ${i + 1}`}</span>
        </button></li>)}</ul>
        <button className={styles.primary} disabled={!allReviewed || busy} onClick={refill}>Refill hearts and continue<IconArrowRight size={18} /></button>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </section>
    </div></Shell>;
  }

  if (!started) return <Shell plan={plan} progress={progress} hearts={state.hearts}><div className={styles.message}>
    <SignStage items={greeting} autoPlay mirror={leftHanded} className={styles.smallStage} label="The signer greets you" />
    <small>{plan.level} · {plan.unit}</small>
    <h1>{plan.title}</h1>
    <p className={styles.goal}>{plan.goal}</p>
    {plan.note && <div className={styles.note}><strong>Before you start</strong><p>{plan.note}</p></div>}
    {practice && <p>You have completed this lesson. Practising again will not change your score.</p>}
    <button className={styles.primary} onClick={() => { playSound("transition"); setStarted(true); }}>Start<IconArrowRight size={18} /></button>
  </div></Shell>;

  // Never show an empty page: if nothing is queued, the lesson is finished or still loading.
  if (!step) return <Shell plan={plan} progress={progress} hearts={state.hearts}><div className={styles.message} role="status"><p>Getting your next step ready…</p><Link className={styles.secondary} href="/learn">Back to my learning</Link></div></Shell>;
  const q = step.kind === "question" ? step : null;
  const isPick = q?.type === "pick";
  const canContinue = step.kind === "learn" ? played || state.watchedAnimations.includes(step.animation) : !!feedback;

  return <Shell plan={plan} progress={progress} hearts={state.hearts}>
    <div className={styles.layout}>
      <SignStage ref={stage} items={stageItems} captions={step.kind === "learn" ? [step.gloss] : captionOf(stageItems)} hideCaption={!!q && !feedback} autoPlay={!isPick} playKey={turnKey} mirror={leftHanded} className={styles.stage}
        onPlayed={() => void watched(step.animation)} label={step.kind === "learn" ? `Sign for ${step.gloss}` : "Sign to identify"} />
      <section className={styles.panel} aria-live="polite">
        {step.kind === "learn" ? <>
          <small className={styles.kicker}>New sign</small>
          <h2 className={styles.gloss}>{step.gloss}</h2>
          {step.tip && <p>{step.tip}</p>}
          <p className={styles.hint}>Watch it, replay it in slow motion, and turn the signer to see the hand from the side. Copy it with your own hands.</p>
        </> : q && <>
          <small className={styles.kicker}>{q.type === "pick" ? "Choose the sign" : q.type === "spell" ? "Fingerspelling" : q.type === "number" ? "Numbers" : q.type === "phrase" ? "Understanding" : "Quick check"}</small>
          <h2>{q.prompt}</h2>
          <div className={styles.options} role="group" aria-label="Answer choices" data-question={q.id}>{q.options.map(o => {
            const state = feedback ? (o.id === feedback.correctOptionId ? styles.right : o.id === choice ? styles.wrong : "") : o.id === choice ? styles.selected : "";
            return <button key={o.id} className={state} disabled={!!feedback || busy} aria-pressed={o.id === choice}
              onClick={() => { playSound("tap"); setChoice(o.id); if (o.play) { setStageItems(o.play); void stage.current?.play(o.play); } }}>
              <span>{o.id}</span>{o.label}{o.play && <IconPlayerPlay size={16} className={styles.playIcon} aria-label="plays this sign" />}
            </button>;
          })}</div>
          {isPick && !feedback && <p className={styles.hint}>Tap each option to watch it, then choose.</p>}
        </>}
        {error && <p className={styles.error} role="alert">{error}</p>}
      </section>
    </div>
    <footer className={`${styles.footer} ${feedback ? (feedback.correct ? styles.footerRight : styles.footerWrong) : ""}`}>
      <div className={styles.footerInner}>
        <p role="status">{feedback && streak ? <span className={styles.streak}><IconFlame size={20} />{streak} in a row!</span> : feedback ? (feedback.correct ? "Correct! Well done." : `Not quite. The answer is ${q?.options.find(o => o.id === feedback.correctOptionId)?.label}. This one will come back later.`) : step.kind === "learn" && !canContinue ? "Watch the sign to continue." : ""}</p>
        {q && !feedback ? <button className={styles.primary} disabled={!choice || busy} onClick={check}>{busy ? "Checking…" : "Check"}<IconArrowRight size={18} /></button>
          : <button className={styles.primary} disabled={!canContinue} onClick={advance}>Continue<IconArrowRight size={18} /></button>}
      </div>
    </footer>
  </Shell>;
}

function Shell({ plan, progress, hearts, children }: { plan: LessonPlan; progress: number; hearts: number; children: React.ReactNode }) {
  return <div className={styles.lesson}>
    <header className={styles.top}>
      <Link href="/learn" className={styles.exit} aria-label="Leave lesson"><IconX size={22} /></Link>
      <div className={styles.bar} role="progressbar" aria-label={`${plan.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}><span style={{ width: `${Math.round(progress * 100)}%` }} /></div>
      <span className={styles.hearts} aria-label={`${hearts} hearts left`}><IconHeartFilled size={22} />{hearts}</span>
      <SoundToggle />
    </header>
    <main className={styles.body}>{children}</main>
  </div>;
}

/** Mute or unmute learning sounds (remembered in this browser). */
function SoundToggle() {
  const on = useSyncExternalStore(subscribeSound, soundEnabled, () => true);
  return <button type="button" className={styles.exit} aria-pressed={on} aria-label={on ? "Mute sounds" : "Turn sounds on"} onClick={() => { setSoundEnabled(!on); if (!on) playSound("tap"); }}>
    {on ? <IconVolume size={22} /> : <IconVolumeOff size={22} />}
  </button>;
}
