"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconAward, IconBook, IconChartBar, IconCheck, IconClock, IconFlame, IconLock, IconLogout, IconPhoto, IconPlayerPlay, IconSearch, IconStar, IconUser } from "@tabler/icons-react";
import type { CourseOverview, LessonStatus } from "@/lib/server/learning";
import type { SessionUser } from "@/lib/server/auth";
import { signOut } from "@/app/actions/auth";
import { UNIT_PHOTO_CREDITS } from "@/lib/course/unit-photos";
import { CertificatesPanel, ProfilePanel } from "./learn/AccountPanels";
import styles from "./learning-system.module.css";

type Screen = "dashboard" | "profile" | "certificates";
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
const STATUS_TEXT: Record<LessonStatus, string> = { completed: "Completed", in_progress: "In progress", available: "Ready to learn", locked: "Locked", coming_soon: "Coming soon" };
const SCREENS: Record<Screen, { title: string; text: string }> = {
  dashboard: { title: "My learning", text: "Your course and progress" },
  certificates: { title: "Certificates", text: "Levels you have earned" },
  profile: { title: "Profile", text: "Details, preferences and security" },
};
const NAV = [["dashboard", "Learn", IconBook], ["certificates", "Certificates", IconAward], ["profile", "Profile", IconUser]] as const;
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
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "NB";

/** Course completion as a small ring. */
function Ring({ percent }: { percent: number }) {
  const r = 15, c = 2 * Math.PI * r;
  return <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" className={styles.ring}>
    <circle cx="18" cy="18" r={r} fill="none" strokeWidth="4" className={styles.ringTrack} />
    <circle cx="18" cy="18" r={r} fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} transform="rotate(-90 18 18)" className={styles.ringValue} />
  </svg>;
}

export default function LearningSystem({ user, overview }: { user: SessionUser; overview: CourseOverview }) {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All");
  // Units whose photo failed to load fall back to an icon.
  const [noArt, setNoArt] = useState<Set<string>>(() => new Set());

  const lessons = overview.units.flatMap(u => u.lessons.map((l, i) => ({ ...l, unit: u, number: i + 1 })));
  const next = lessons.find(l => l.id === overview.next);
  const percent = overview.total ? Math.round(overview.completed / overview.total * 100) : 0;
  const term = query.trim().toLowerCase();
  const units = overview.units
    .filter(u => level === "All" || u.level === level)
    .map(u => ({ ...u, lessons: u.lessons.filter(l => !term || `${l.title} ${l.goal} ${u.title}`.toLowerCase().includes(term)) }))
    .filter(u => u.lessons.length);
  const navigate = (s: Screen) => { setScreen(s); window.scrollTo(0, 0); };
  const art = (unitId: string, sizes: string, [origin, zoom] = CROPS[0], priority = false) => noArt.has(unitId) ? <IconPhoto size={40} stroke={1.5} />
    : <Image src={`/units/${unitId}.jpg?v=${PHOTO_VERSION[unitId] ?? 1}`} alt="" fill sizes={sizes} priority={priority} className={styles.artImage} style={{ transformOrigin: origin, ["--zoom" as string]: zoom }} onError={() => setNoArt(s => new Set(s).add(unitId))} />;
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return <div className={styles.system}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}><Image src="/no%20barriers%20logo.jpeg" width={32} height={30} alt="" /><strong>no barriers</strong></div>
      <nav aria-label="Learner navigation">
        {NAV.map(([dest, , Icon]) =>
          <button key={dest} className={screen === dest ? styles.active : ""} aria-current={screen === dest ? "page" : undefined} onClick={() => navigate(dest)}><Icon size={20} />{SCREENS[dest].title}</button>)}
        {user.role === "admin" && <Link href="/admin" className={styles.navLink}><IconChartBar size={20} />Monitoring</Link>}
      </nav>
      <div className={styles.sidebarBottom}>
        <div className={styles.account}><span className={styles.avatar}>{initials(user.name)}</span><div><strong>{user.name}</strong><small>{user.role === "admin" ? "Administrator" : user.audience}</small></div></div>
        <form action={signOut}><button><IconLogout size={18} /> Sign out</button></form>
      </div>
    </aside>
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.mobileBrand} aria-label="No Barriers home"><Image src="/no%20barriers%20logo.jpeg" width={28} height={26} alt="" priority /></Link>
        <div className={styles.titleBlock}>
          <strong className={styles.topTitle}>{SCREENS[screen].title}</strong>
          <p>{screen === "dashboard" ? today : SCREENS[screen].text}</p>
        </div>
        <div className={styles.stats}>
          <span className={styles.chip} data-tone="streak" title={`${user.streak.current}-day streak · best ${user.streak.best}`}><IconFlame size={18} /><strong>{user.streak.current}</strong><small>day streak</small></span>
          <span className={styles.chip} data-tone="xp" title="Experience points"><IconStar size={18} /><strong>{user.xp.toLocaleString("en-GB")}</strong><small>XP</small></span>
          <span className={styles.progress} title={`${overview.completed} of ${overview.total} lessons complete`}><Ring percent={percent} /><span><strong>{percent}%</strong><small>Course</small></span></span>
          <button className={styles.profileButton} onClick={() => navigate("profile")} aria-label={`Profile: ${user.name}`}><span className={styles.avatar}>{initials(user.name)}</span></button>
        </div>
      </header>
      <main className={styles.main}>
        {screen === "dashboard" && <>
          <div className={styles.pageHeading}><div><h1>Good to see you, {user.name.split(" ")[0]}.</h1><p>One lesson at a time. Start where you left off.</p></div><span>{overview.completed} of {overview.total} lessons complete</span></div>
          {next ? <section className={styles.continue}>
            <div className={styles.continueText}><span>{next.unit.level} · {next.unit.title} · Lesson {next.number}</span><h2>{next.title}</h2><p>{next.goal}</p>
              <Link className={styles.primary} href={`/learn/${next.id}`}>{next.status === "in_progress" ? "Continue lesson" : "Start lesson"}<IconArrowRight size={18} /></Link></div>
            <div className={styles.continueArt} aria-hidden="true">{art(next.unit.id, "(max-width: 800px) 40vw, 420px", CROPS[0], true)}</div>
          </section>
            : <section className={styles.continue}><div className={styles.continueText}><span>All available lessons</span><h2>You are up to date.</h2><p>New lessons are being added. Review any lesson to keep your signing sharp.</p></div></section>}
          <section className={styles.directory}>
            <div className={styles.directoryHeading}><h2>Your course</h2><label className={styles.search}><IconSearch size={18} /><input aria-label="Find a lesson" placeholder="Find a lesson" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
            <div className={styles.filters}>{LEVELS.map(v => <button key={v} aria-pressed={level === v} className={level === v ? styles.active : ""} onClick={() => setLevel(v)}>{v}</button>)}</div>
            {units.length === 0 && <p role="status">No lessons match your search. Try another word.</p>}
            {units.map(u => {
              const available = u.lessons.filter(l => l.status !== "coming_soon");
              const done = available.filter(l => l.status === "completed").length;
              return <section key={u.id} className={styles.unit} aria-labelledby={`${u.id}-h`}>
              <div className={styles.unitHeading}>
                <div><small>{u.level} · Unit {u.id.slice(1)}</small><h3 id={`${u.id}-h`}>{u.title}</h3><p>{u.summary}</p></div>
                {available.length > 0 && <span className={styles.unitProgress}>{done} of {available.length}</span>}
              </div>
              <div className={styles.lessonGrid}>{u.lessons.map(l => {
                const open = l.status !== "locked" && l.status !== "coming_soon";
                const number = lessons.find(x => x.id === l.id)?.number;
                const badge = l.status === "completed" ? <IconCheck size={14} stroke={3} /> : l.status === "coming_soon" ? <IconClock size={14} /> : l.status === "locked" ? <IconLock size={14} /> : <IconPlayerPlay size={14} />;
                const body = <>
                  <div className={styles.lessonArt} data-status={l.status}>
                    {art(u.id, "(max-width: 520px) 92vw, (max-width: 1100px) 45vw, 360px", CROPS[((number ?? 1) - 1) % CROPS.length])}
                    {l.status === "completed" && <span className={styles.doneMark}><IconCheck size={15} stroke={3} /></span>}
                    <span className={styles.badge} data-status={l.status}>{badge}{STATUS_TEXT[l.status]}</span>
                  </div>
                  <div className={styles.cardBody}><small>Lesson {number}</small><h3>{l.title}</h3><p>{l.status === "locked" ? "Complete the previous lesson to unlock." : l.status === "coming_soon" ? "Animations for this lesson are in production." : l.goal}</p></div>
                </>;
                return open ? <Link key={l.id} href={`/learn/${l.id}`} className={styles.lessonCard}>{body}</Link> : <div key={l.id} className={`${styles.lessonCard} ${styles.disabledCard}`} aria-disabled="true">{body}</div>;
              })}</div>
            </section>;
            })}
            {overview.units.some(u => UNIT_PHOTO_CREDITS[u.id]) && <details className={styles.credits}>
              <summary>Photo credits</summary>
              <ul>{overview.units.filter(u => UNIT_PHOTO_CREDITS[u.id]).map(u => { const c = UNIT_PHOTO_CREDITS[u.id]; return <li key={u.id}>
                <strong>{u.title}:</strong> <a href={c.source} target="_blank" rel="noreferrer">{c.title.replace(/\.\w+$/, "")}</a> by {c.author}, {c.licenseUrl ? <a href={c.licenseUrl} target="_blank" rel="noreferrer">{c.license}</a> : c.license}, via Wikimedia Commons. Cropped and colour-adjusted.
              </li>; })}</ul>
            </details>}
          </section>
        </>}

        {screen === "profile" && <ProfilePanel user={user} overview={overview} />}
        {screen === "certificates" && <CertificatesPanel user={user} overview={overview} />}
      </main>
    </div>
    <nav className={styles.bottomNav} aria-label="Learner navigation">
      {NAV.map(([dest, label, Icon]) =>
        <button key={dest} className={screen === dest ? styles.active : ""} aria-current={screen === dest ? "page" : undefined} onClick={() => navigate(dest)}><Icon size={22} /><span>{label}</span></button>)}
      {user.role === "admin" && <Link href="/admin"><IconChartBar size={22} /><span>Monitoring</span></Link>}
    </nav>
  </div>;
}
