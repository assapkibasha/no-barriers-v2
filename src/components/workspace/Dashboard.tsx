"use client";

import { useState } from "react";
import Link from "next/link";
import { IconArrowRight, IconCheck, IconLock, IconPlayerPlay, IconSearch } from "@tabler/icons-react";
import { curriculum, lessonHref, levels, type Lesson } from "@/lib/curriculum";
import { useProgress } from "./ProgressProvider";
import styles from "./workspace.module.css";

export default function Dashboard() {
  const { name, completedCount, current, isComplete, isUnlocked } = useProgress();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");
  const filtered = curriculum.filter(item => (level === "All" || item.level === level) && item.title.toLowerCase().includes(query.toLowerCase()));

  const card = (item: Lesson) => {
    const unlocked = isUnlocked(item.id);
    const body = <>
      <div className={styles.lessonArt}>{isComplete(item.id) ? <IconCheck size={32} /> : unlocked ? <IconPlayerPlay size={32} /> : <IconLock size={28} />}<span>{item.level}</span></div>
      <div className={styles.cardBody}><small>Lesson {item.id} · {isComplete(item.id) ? "Completed" : unlocked ? "Ready to learn" : "Locked"}</small><h3>{item.title}</h3><p>{unlocked ? item.description : `Complete Lesson ${item.id - 1} to unlock.`}</p></div>
    </>;
    return unlocked
      ? <Link className={styles.lessonCard} key={item.id} href={lessonHref(item)}>{body}</Link>
      : <div className={`${styles.lessonCard} ${styles.locked}`} key={item.id}>{body}</div>;
  };

  return <>
    <div className={styles.pageHeading}><div><h1>Good to see you, {name}.</h1><p>One lesson at a time. Start where you left off.</p></div><span>{completedCount} of {curriculum.length} lessons complete</span></div>
    <section className={styles.continue}><div><span>{current.level} · Lesson {current.id}</span><h2>{current.title}</h2><p>{current.description}</p></div><Link className={styles.primary} href={lessonHref(current)}>{isComplete(current.id) ? "Review lesson" : "Open lesson"}<IconArrowRight size={18} /></Link></section>
    <section className={styles.directory}>
      <div className={styles.directoryHeading}><h2>Your lessons</h2><label className={styles.search}><IconSearch size={18} /><input aria-label="Find a lesson" placeholder="Find a lesson" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      <div className={styles.filters}>{["All", ...levels].map(value => <button key={value} aria-pressed={level === value} className={level === value ? styles.active : ""} onClick={() => setLevel(value)}>{value}</button>)}</div>
      {filtered.length === 0 && <p role="status">No lessons match your search. Try another title.</p>}
      <div className={styles.lessonGrid}>{filtered.map(card)}</div>
    </section>
  </>;
}
