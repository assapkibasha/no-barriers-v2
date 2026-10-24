"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconAward, IconBook, IconCheck, IconChartBar, IconClock, IconFlame, IconLock, IconLogout, IconMenu2, IconPlayerPlay, IconSearch, IconStar, IconUser, IconX } from "@tabler/icons-react";
import type { CourseOverview, LessonStatus } from "@/lib/server/learning";
import type { SessionUser } from "@/lib/server/auth";
import { signOut } from "@/app/actions/auth";
import { setLeftHanded } from "@/app/actions/learning";
import styles from "./learning-system.module.css";

type Screen = "dashboard" | "profile" | "certificates";
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
const STATUS_TEXT: Record<LessonStatus, string> = { completed: "Completed", in_progress: "In progress", available: "Ready to learn", locked: "Locked", coming_soon: "Coming soon" };

export default function LearningSystem({ user, overview }: { user: SessionUser; overview: CourseOverview }) {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All");
  const [menu, setMenu] = useState(false);
  const [leftHanded, setLeft] = useState(user.settings.leftHanded);
  const [saving, startSaving] = useTransition();

  const lessons = overview.units.flatMap(u => u.lessons.map(l => ({ ...l, unit: u })));
  const next = lessons.find(l => l.id === overview.next);
  const percent = overview.total ? Math.round(overview.completed / overview.total * 100) : 0;
  const term = query.trim().toLowerCase();
  const units = overview.units
    .filter(u => level === "All" || u.level === level)
    .map(u => ({ ...u, lessons: u.lessons.filter(l => !term || `${l.title} ${l.goal} ${u.title}`.toLowerCase().includes(term)) }))
    .filter(u => u.lessons.length);
  const navigate = (s: Screen) => { setScreen(s); setMenu(false); window.scrollTo(0, 0); };
  const levelDone = (lv: string) => lessons.filter(l => l.unit.level === lv && l.status !== "coming_soon").every(l => l.status === "completed") && lessons.some(l => l.unit.level === lv && l.status === "completed");

  useEffect(() => {
    if (!menu) return;
    const close = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menu]);

  return <div className={styles.system}>
    {menu && <button className={styles.backdrop} aria-label="Close navigation" onClick={() => setMenu(false)} />}
    <aside className={`${styles.sidebar} ${menu ? styles.open : ""}`}>
      <div className={styles.brand}><Image src="/no%20barriers%20logo.jpeg" width={32} height={30} alt="" /><strong>no barriers</strong><button className={styles.mobileClose} aria-label="Close navigation" onClick={() => setMenu(false)}><IconX size={20} /></button></div>
      <div className={styles.account}><span className={styles.avatar}>{user.name.slice(0, 2).toUpperCase()}</span><div><strong>{user.name}</strong><small>{user.audience}{user.role === "admin" ? " · Admin" : ""}</small></div></div>
      <nav aria-label="Learner navigation">
        {([["dashboard", "My learning", IconBook], ["certificates", "Certificates", IconAward], ["profile", "Profile", IconUser]] as const).map(([dest, title, Icon]) =>
          <button key={dest} className={screen === dest ? styles.active : ""} onClick={() => navigate(dest)}><Icon size={20} />{title}</button>)}
        {user.role === "admin" && <Link href="/admin" className={styles.navLink}><IconChartBar size={20} />Monitoring</Link>}
      </nav>
      <div className={styles.sidebarBottom}><form action={signOut}><button><IconLogout size={18} /> Sign out</button></form></div>
    </aside>
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <button className={styles.menuButton} aria-label="Open navigation" onClick={() => setMenu(true)}><IconMenu2 size={22} /></button>
        <span>My learning <IconArrowRight size={14} /> <strong>{screen === "dashboard" ? "Overview" : screen === "profile" ? "Profile" : "Certificates"}</strong></span>
        <div className={styles.stats}>
          <span title="Daily streak"><IconFlame size={18} />{user.streak.current}</span>
          <span title="Experience points"><IconStar size={18} />{user.xp} XP</span>
          <div className={styles.overall}><small>Course completion</small><strong>{percent}%</strong></div>
        </div>
      </header>
      <main className={styles.main}>
        {screen === "dashboard" && <>
          <div className={styles.pageHeading}><div><h1>Good to see you, {user.name.split(" ")[0]}.</h1><p>One lesson at a time. Start where you left off.</p></div><span>{overview.completed} of {overview.total} lessons complete</span></div>
          {next ? <section className={styles.continue}><div><span>{next.unit.level} · {next.unit.title}</span><h2>{next.title}</h2><p>{next.goal}</p></div><Link className={styles.primary} href={`/learn/${next.id}`}>{next.status === "in_progress" ? "Continue lesson" : "Start lesson"}<IconArrowRight size={18} /></Link></section>
            : <section className={styles.continue}><div><span>All available lessons</span><h2>You are up to date.</h2><p>New lessons are being added. Review any lesson to keep your signing sharp.</p></div></section>}
          <section className={styles.directory}>
            <div className={styles.directoryHeading}><h2>Your course</h2><label className={styles.search}><IconSearch size={18} /><input aria-label="Find a lesson" placeholder="Find a lesson" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
            <div className={styles.filters}>{LEVELS.map(v => <button key={v} aria-pressed={level === v} className={level === v ? styles.active : ""} onClick={() => setLevel(v)}>{v}</button>)}</div>
            {units.length === 0 && <p role="status">No lessons match your search. Try another word.</p>}
            {units.map(u => <section key={u.id} className={styles.unit} aria-labelledby={`${u.id}-h`}>
              <div className={styles.unitHeading}><small>{u.level}</small><h3 id={`${u.id}-h`}>{u.title}</h3><p>{u.summary}</p></div>
              <div className={styles.lessonGrid}>{u.lessons.map(l => {
                const open = l.status !== "locked" && l.status !== "coming_soon";
                const icon = l.status === "completed" ? <IconCheck size={30} /> : l.status === "coming_soon" ? <IconClock size={28} /> : open ? <IconPlayerPlay size={30} /> : <IconLock size={26} />;
                const body = <><div className={styles.lessonArt}>{icon}<span>{STATUS_TEXT[l.status]}</span></div><div className={styles.cardBody}><small>{u.title}</small><h3>{l.title}</h3><p>{l.status === "locked" ? "Complete the previous lesson to unlock." : l.status === "coming_soon" ? "Animations for this lesson are in production." : l.goal}</p></div></>;
                return open ? <Link key={l.id} href={`/learn/${l.id}`} className={styles.lessonCard}>{body}</Link> : <div key={l.id} className={`${styles.lessonCard} ${styles.disabledCard}`} aria-disabled="true">{body}</div>;
              })}</div>
            </section>)}
          </section>
        </>}

        {screen === "profile" && <section className={styles.settings}>
          <h1>Your profile</h1><p>{user.email}</p>
          <div className={styles.panel}>
            <label className={styles.toggle}><input type="checkbox" checked={leftHanded} disabled={saving} onChange={e => { const v = e.target.checked; setLeft(v); startSaving(() => setLeftHanded(v)); }} /><span><strong>I sign with my left hand</strong><small>The signer mirrors every sign so it matches your dominant hand.</small></span></label>
            <dl className={styles.facts}><div><dt>Experience</dt><dd>{user.xp} XP</dd></div><div><dt>Current streak</dt><dd>{user.streak.current} {user.streak.current === 1 ? "day" : "days"}</dd></div><div><dt>Best streak</dt><dd>{user.streak.best} days</dd></div><div><dt>Lessons completed</dt><dd>{overview.completed}</dd></div></dl>
          </div>
        </section>}

        {screen === "certificates" && <section className={styles.settings}>
          <h1>Your certificates</h1><p>A certificate is awarded when you complete every lesson in a level.</p>
          {(["Beginner", "Intermediate", "Advanced"] as const).map(lv => <div key={lv} className={styles.empty}>
            <IconAward size={36} /><h2>{lv}</h2>
            <p>{levelDone(lv) ? "Level complete. Certificate issuance will be connected soon." : `${lessons.filter(l => l.unit.level === lv && l.status === "completed").length} of ${lessons.filter(l => l.unit.level === lv && l.status !== "coming_soon").length} available lessons completed.`}</p>
          </div>)}
        </section>}
      </main>
    </div>
  </div>;
}
