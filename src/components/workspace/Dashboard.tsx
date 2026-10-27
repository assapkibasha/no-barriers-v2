"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconCheck, IconClock, IconLock, IconPhoto, IconPlayerPlay, IconSearch } from "@tabler/icons-react";
import { levels } from "@/lib/course/curriculum";
import { UNIT_PHOTO_CREDITS } from "@/lib/course/unit-photos";
import type { CourseOverview, LessonStatus } from "@/lib/server/learning";
import styles from "./workspace.module.css";

const statusText: Record<LessonStatus, string> = { completed: "Completed", in_progress: "In progress", available: "Ready to learn", locked: "Locked", coming_soon: "Coming soon" };
/** Each lesson zooms in slightly on its unit's centred portrait, so a unit's cards don't look identical. */
const CROPS: [origin: string, zoom: number][] = [["50% 42%", 1], ["50% 42%", 1.08], ["50% 42%", 1.15], ["50% 42%", 1.04], ["50% 42%", 1.11]];
/**
 * Bumped whenever a unit's photo file is replaced, so the URL changes and Next's image cache (and
 * the browser's) can never serve the old file under the new one's path. Units not listed here have
 * never been replaced since the cache-busting scheme was added.
 */
const PHOTO_VERSION: Record<string, number> = {
  u1: 2, u2: 2, u3: 2, u4: 2, u5: 2, u6: 2, u7: 2, u8: 2, u9: 2, u10: 2, u11: 2, u12: 2,
  u13: 2, u14: 2, u15: 2, u16: 2, u17: 2, u18: 2, u19: 2,
};

type Unit = CourseOverview["units"][number];

export default function Dashboard({ name, overview }: { name: string; overview: CourseOverview }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");
  // Units whose photo failed to load fall back to an icon.
  const [noArt, setNoArt] = useState<Set<string>>(() => new Set());
  const lessons = overview.units.flatMap(unit => unit.lessons.map((lesson, i) => ({ ...lesson, unit, number: i + 1 })));
  const next = lessons.find(lesson => lesson.id === overview.next);
  const term = query.trim().toLowerCase();
  const units = overview.units
    .filter(unit => level === "All" || unit.level === level)
    .map(unit => ({ ...unit, lessons: unit.lessons.filter(lesson => !term || `${lesson.title} ${lesson.goal} ${unit.title}`.toLowerCase().includes(term)) }))
    .filter(unit => unit.lessons.length);

  const art = (unitId: string, sizes: string, [origin, zoom] = CROPS[0], priority = false) => noArt.has(unitId) ? <IconPhoto size={40} stroke={1.5} />
    : <Image src={`/units/${unitId}.jpg?v=${PHOTO_VERSION[unitId] ?? 1}`} alt="" fill sizes={sizes} priority={priority} className={styles.artImage} style={{ transformOrigin: origin, ["--zoom" as string]: zoom }} onError={() => setNoArt(s => new Set(s).add(unitId))} />;

  const card = (unit: Unit, lesson: Unit["lessons"][number]) => {
    const open = lesson.status !== "locked" && lesson.status !== "coming_soon";
    const number = lessons.find(l => l.id === lesson.id)?.number ?? 1;
    const badge = lesson.status === "completed" ? <IconCheck size={14} stroke={3} /> : lesson.status === "coming_soon" ? <IconClock size={14} /> : lesson.status === "locked" ? <IconLock size={14} /> : <IconPlayerPlay size={14} />;
    const body = <>
      <div className={styles.lessonArt} data-status={lesson.status}>
        {art(unit.id, "(max-width: 520px) 92vw, (max-width: 1100px) 45vw, 360px", CROPS[(number - 1) % CROPS.length])}
        {lesson.status === "completed" && <span className={styles.doneMark}><IconCheck size={15} stroke={3} /></span>}
        <span className={styles.badge} data-status={lesson.status}>{badge}{statusText[lesson.status]}</span>
      </div>
      <div className={styles.cardBody}><small>Lesson {number}</small><h3>{lesson.title}</h3><p>{lesson.status === "locked" ? "Complete the previous lesson to unlock." : lesson.status === "coming_soon" ? "Animations for this lesson are in production." : lesson.goal}</p></div>
    </>;
    return open
      ? <Link key={lesson.id} className={styles.lessonCard} href={`/learn/${lesson.id}`}>{body}</Link>
      : <div key={lesson.id} className={`${styles.lessonCard} ${styles.disabledCard}`} aria-disabled="true">{body}</div>;
  };

  return <>
    <div className={styles.pageHeading}><div><h1>Good to see you, {name.split(" ")[0]}.</h1><p>One lesson at a time. Start where you left off.</p></div><span>{overview.completed} of {overview.total} lessons complete</span></div>
    {next
      ? <section className={styles.continue}>
        <div className={styles.continueText}><span>{next.unit.level} · {next.unit.title} · Lesson {next.number}</span><h2>{next.title}</h2><p>{next.goal}</p>
          <Link className={styles.primary} href={`/learn/${next.id}`}>{next.status === "in_progress" ? "Continue lesson" : "Start lesson"}<IconArrowRight size={18} /></Link></div>
        <div className={styles.continueArt} aria-hidden="true">{art(next.unit.id, "(max-width: 800px) 40vw, 420px", CROPS[0], true)}</div>
      </section>
      : <section className={styles.continue}><div className={styles.continueText}><span>All available lessons</span><h2>You are up to date.</h2><p>New lessons are being added. Review any lesson to keep your signing sharp.</p></div></section>}
    <section className={styles.directory}>
      <div className={styles.directoryHeading}><h2>Your course</h2><label className={styles.search}><IconSearch size={18} /><input aria-label="Find a lesson" placeholder="Find a lesson" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      <div className={styles.filters}>{["All", ...levels].map(value => <button key={value} aria-pressed={level === value} className={level === value ? styles.active : ""} onClick={() => setLevel(value)}>{value}</button>)}</div>
      {units.length === 0 && <p role="status">No lessons match your search. Try another word.</p>}
      {units.map(unit => {
        const available = unit.lessons.filter(lesson => lesson.status !== "coming_soon");
        const done = available.filter(lesson => lesson.status === "completed").length;
        return <section key={unit.id} className={styles.unit} aria-labelledby={`${unit.id}-heading`}>
          <div className={styles.unitHeading}>
            <div><small>{unit.level} · Unit {unit.id.slice(1)}</small><h3 id={`${unit.id}-heading`}>{unit.title}</h3><p>{unit.summary}</p></div>
            {available.length > 0 && <span className={styles.unitProgress}>{done} of {available.length}</span>}
          </div>
          <div className={styles.lessonGrid}>{unit.lessons.map(lesson => card(unit, lesson))}</div>
        </section>;
      })}
      {overview.units.some(unit => UNIT_PHOTO_CREDITS[unit.id]) && <details className={styles.credits}>
        <summary>Photo credits</summary>
        <ul>{overview.units.filter(unit => UNIT_PHOTO_CREDITS[unit.id]).map(unit => { const c = UNIT_PHOTO_CREDITS[unit.id]; return <li key={unit.id}>
          <strong>{unit.title}:</strong> <a href={c.source} target="_blank" rel="noreferrer">{c.title.replace(/\.\w+$/, "")}</a> by {c.author}, {c.licenseUrl ? <a href={c.licenseUrl} target="_blank" rel="noreferrer">{c.license}</a> : c.license}, via Wikimedia Commons. Cropped and colour-adjusted.
        </li>; })}</ul>
      </details>}
    </section>
  </>;
}
