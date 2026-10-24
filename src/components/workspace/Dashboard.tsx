"use client";

import { useState } from "react";
import Link from "next/link";
import { IconArrowRight, IconCheck, IconClock, IconLock, IconPlayerPlay, IconSearch } from "@tabler/icons-react";
import { levels } from "@/lib/course/curriculum";
import type { CourseOverview, LessonStatus } from "@/lib/server/learning";
import styles from "./workspace.module.css";

const statusText: Record<LessonStatus, string> = { completed: "Completed", in_progress: "In progress", available: "Ready to learn", locked: "Locked", coming_soon: "Coming soon" };

export default function Dashboard({ name, overview }: { name: string; overview: CourseOverview }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");
  const next = overview.units.flatMap(unit => unit.lessons.map(lesson => ({ ...lesson, unit }))).find(lesson => lesson.id === overview.next);
  const term = query.trim().toLowerCase();
  const units = overview.units
    .filter(unit => level === "All" || unit.level === level)
    .map(unit => ({ ...unit, lessons: unit.lessons.filter(lesson => !term || `${lesson.title} ${lesson.goal} ${unit.title}`.toLowerCase().includes(term)) }))
    .filter(unit => unit.lessons.length);

  const card = (unit: CourseOverview["units"][number], lesson: CourseOverview["units"][number]["lessons"][number]) => {
    const open = lesson.status !== "locked" && lesson.status !== "coming_soon";
    const icon = lesson.status === "completed" ? <IconCheck size={30} /> : lesson.status === "coming_soon" ? <IconClock size={28} /> : open ? <IconPlayerPlay size={30} /> : <IconLock size={26} />;
    const body = <>
      <div className={styles.lessonArt}>{icon}<span>{statusText[lesson.status]}</span></div>
      <div className={styles.cardBody}><small>{unit.title}</small><h3>{lesson.title}</h3><p>{lesson.status === "locked" ? "Complete the previous lesson to unlock." : lesson.status === "coming_soon" ? "Animations for this lesson are in production." : lesson.goal}</p></div>
    </>;
    return open
      ? <Link key={lesson.id} className={styles.lessonCard} href={`/learn/${lesson.id}`}>{body}</Link>
      : <div key={lesson.id} className={`${styles.lessonCard} ${styles.disabledCard}`} aria-disabled="true">{body}</div>;
  };

  return <>
    <div className={styles.pageHeading}><div><h1>Good to see you, {name.split(" ")[0]}.</h1><p>One lesson at a time. Start where you left off.</p></div><span>{overview.completed} of {overview.total} lessons complete</span></div>
    {next
      ? <section className={styles.continue}><div><span>{next.unit.level} · {next.unit.title}</span><h2>{next.title}</h2><p>{next.goal}</p></div><Link className={styles.primary} href={`/learn/${next.id}`}>{next.status === "in_progress" ? "Continue lesson" : "Start lesson"}<IconArrowRight size={18} /></Link></section>
      : <section className={styles.continue}><div><span>All available lessons</span><h2>You are up to date.</h2><p>New lessons are being added. Review any lesson to keep your signing sharp.</p></div></section>}
    <section className={styles.directory}>
      <div className={styles.directoryHeading}><h2>Your course</h2><label className={styles.search}><IconSearch size={18} /><input aria-label="Find a lesson" placeholder="Find a lesson" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      <div className={styles.filters}>{["All", ...levels].map(value => <button key={value} aria-pressed={level === value} className={level === value ? styles.active : ""} onClick={() => setLevel(value)}>{value}</button>)}</div>
      {units.length === 0 && <p role="status">No lessons match your search. Try another word.</p>}
      {units.map(unit => <section key={unit.id} className={styles.unit} aria-labelledby={`${unit.id}-heading`}>
        <div className={styles.unitHeading}><small>{unit.level}</small><h3 id={`${unit.id}-heading`}>{unit.title}</h3><p>{unit.summary}</p></div>
        <div className={styles.lessonGrid}>{unit.lessons.map(lesson => card(unit, lesson))}</div>
      </section>)}
    </section>
  </>;
}
