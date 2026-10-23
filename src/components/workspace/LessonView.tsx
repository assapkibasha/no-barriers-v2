"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconArrowRight, IconCheck, IconLock, IconPlayerPlay } from "@tabler/icons-react";
import { lessonById, lessonHref, lessonsInLevel, type Lesson } from "@/lib/curriculum";
import { useProgress } from "./ProgressProvider";
import styles from "./workspace.module.css";

export default function LessonView({ lesson }: { lesson: Lesson }) {
  const { isComplete, isUnlocked, visitLesson, completeLesson } = useProgress();
  const [answer, setAnswer] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const unlocked = isUnlocked(lesson.id);
  const completed = isComplete(lesson.id);
  const courseLessons = lessonsInLevel(lesson.level);
  const courseCompleted = courseLessons.filter(item => isComplete(item.id)).length;
  const next = lessonById(lesson.id + 1);

  useEffect(() => { if (unlocked) visitLesson(lesson.id); }, [lesson.id, unlocked, visitLesson]);

  const heading = <div className={styles.lessonHeading}><Link className={styles.iconButton} href="/learn" aria-label="Back to lessons"><IconArrowLeft size={21} /></Link><div><span>{lesson.level} · Lesson {lesson.id}</span><h1>{lesson.title}</h1></div>{unlocked && <span className={styles.lessonStatus}>{completed ? <><IconCheck size={16} />Completed</> : "In practice"}</span>}</div>;

  if (!unlocked) return <>
    {heading}
    <section className={styles.empty}><IconLock size={40} /><h2>This lesson is locked</h2><p>Complete Lesson {lesson.id - 1} to unlock {lesson.title.toLowerCase()}.</p><Link className={styles.primary} href="/learn">Back to my learning<IconArrowRight size={18} /></Link></section>
  </>;

  return <>
    {heading}
    <div className={styles.lessonLayout}>
      <section className={styles.lessonActivity}>
        <div className={styles.animation}><IconPlayerPlay size={42} /><h2>Sign animation</h2><p>Your team’s approved animation will appear here.</p><span>{lesson.title}</span></div>
        <section className={styles.practice} aria-labelledby="practice-heading">
          <div><h2 id="practice-heading">Quick check</h2><p>Practice preview · Which number comes after four?</p></div>
          <div className={styles.answers} role="group" aria-label="Answer choices">{["Three", "Five", "Eight"].map((value, index) => <button key={value} aria-pressed={answer === index} disabled={result === "correct"} className={answer === index ? styles.selected : ""} onClick={() => { setAnswer(index); setResult(null); }}><span>{answer === index ? <IconCheck size={16} /> : String.fromCharCode(65 + index)}</span>{value}</button>)}</div>
          <div className={styles.practiceFooter}><p role="status" className={result === "incorrect" ? styles.error : ""}>{result === "correct" ? "Correct. You can complete this preview lesson." : result === "incorrect" ? "Try again. Count one step after four." : "Choose an answer to continue."}</p>{result === "correct" ? <button className={styles.primary} onClick={() => completeLesson(lesson.id)} disabled={completed}>{completed ? "Lesson completed" : "Complete preview lesson"}<IconCheck size={18} /></button> : <button className={styles.primary} disabled={answer === null} onClick={() => setResult(answer === 1 ? "correct" : "incorrect")}>Check answer<IconArrowRight size={18} /></button>}</div>
          {completed && <Link className={styles.nextLesson} href={next ? lessonHref(next) : "/learn"}>{next ? "Continue to next lesson" : "Return to my learning"}<IconArrowRight size={18} /></Link>}
        </section>
      </section>
      <aside className={styles.lessonSide}>
        <section className={styles.course}><h2>Your course</h2><p>{lesson.level} · {courseCompleted} of {courseLessons.length} complete</p><progress value={courseCompleted} max={courseLessons.length} aria-label={`${lesson.level} course completion`} />
          <nav aria-label="Course lessons">{courseLessons.map(item => {
            const icon = isComplete(item.id) ? <IconCheck size={18} /> : isUnlocked(item.id) ? <IconPlayerPlay size={18} /> : <IconLock size={18} />;
            return isUnlocked(item.id)
              ? <Link key={item.id} href={lessonHref(item)} aria-current={item.id === lesson.id ? "step" : undefined}>{icon}<span>{item.title}</span></Link>
              : <span key={item.id} className={styles.locked}>{icon}<span>{item.title}</span></span>;
          })}</nav>
        </section>
        <section className={styles.community}><h2>Learning together</h2><p>Follower activity will appear here when learner accounts are connected.</p></section>
      </aside>
    </div>
  </>;
}
