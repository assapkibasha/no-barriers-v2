"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IconArrowLeft, IconArrowRight, IconAward, IconCheck, IconLock, IconMenu2, IconPlayerPlay, IconUser, IconBook, IconX, IconSearch, IconSettings } from "@tabler/icons-react";
import styles from "./learning-system.module.css";

const curriculum = [
  { id: 1, level: "Beginner", title: "Introduction to Rwandan Sign Language", description: "Meet the language and the community." },
  { id: 2, level: "Beginner", title: "The sign language alphabet", description: "Practise the handshapes that form your foundation." },
  { id: 3, level: "Beginner", title: "Numbers", description: "Build confidence with numbers in everyday conversation." },
  { id: 4, level: "Beginner", title: "Greetings and introductions", description: "Start your first conversation." },
  { id: 5, level: "Beginner", title: "Family and relationships", description: "Talk about the people in your life." },
  { id: 6, level: "Beginner", title: "Everyday expressions", description: "Bring your first signs together." },
  { id: 7, level: "Intermediate", title: "Building sentences", description: "Connect signs to express more." },
  { id: 8, level: "Intermediate", title: "Asking questions", description: "Keep a conversation going." },
  { id: 9, level: "Advanced", title: "Complex conversations", description: "Explore more detailed communication." },
];
type Screen = "dashboard" | "lesson" | "profile" | "certificates" | "studio";
type Progress = { completed: number[]; lastLesson: number };
const initialProgress: Progress = { completed: [], lastLesson: 1 };
const storageKey = "no-barriers-learning-preview-v1";

export default function LearningSystem({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [selected, setSelected] = useState(1);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");
  const [menu, setMenu] = useState(false);
  const [name, setName] = useState("Learner");
  const [draft, setDraft] = useState("");
  const [answer, setAnswer] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [studioSaved, setStudioSaved] = useState(false);

  useEffect(() => {
    const restore = window.setTimeout(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved && Array.isArray(saved.completed)) {
        const completed = curriculum.filter(item => saved.completed.includes(item.id)).map(item => item.id);
        setProgress({ completed, lastLesson: curriculum.some(item => item.id === saved.lastLesson) ? saved.lastLesson : 1 });
      }
      setName(localStorage.getItem("nb-preview-name") || "Learner");
      setDraft(localStorage.getItem("nb-preview-course-draft") || "Rwandan Sign Language");
    } catch { setStorageError(true); }
    setReady(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch {
      const notify = window.setTimeout(() => setStorageError(true), 0);
      return () => window.clearTimeout(notify);
    }
  }, [progress, ready]);

  const unlocked = (id: number) => id === 1 || progress.completed.includes(id - 1) || progress.completed.includes(id);
  const current = curriculum.find(item => item.id === progress.lastLesson && unlocked(item.id) && !progress.completed.includes(item.id)) || curriculum.find(item => !progress.completed.includes(item.id) && unlocked(item.id)) || curriculum[0];
  const lesson = curriculum.find(item => item.id === selected) || curriculum[0];
  const courseLessons = curriculum.filter(item => item.level === lesson.level);
  const courseCompleted = courseLessons.filter(item => progress.completed.includes(item.id)).length;
  const percent = Math.round(progress.completed.length / curriculum.length * 100);
  const navigate = (next: Screen) => { setScreen(next); setMenu(false); setQuery(""); window.scrollTo(0, 0); };
  const openLesson = (id: number) => {
    if (!unlocked(id)) return;
    setSelected(id); setAnswer(null); setResult(null);
    setProgress(old => ({ ...old, lastLesson: id })); navigate("lesson");
  };
  const complete = () => {
    if (result !== "correct") return;
    setProgress(old => ({ ...old, completed: Array.from(new Set([...old.completed, lesson.id])), lastLesson: Math.min(lesson.id + 1, curriculum.length) }));
  };
  const saveName = () => { try { localStorage.setItem("nb-preview-name", name.trim() || "Learner"); setProfileSaved(true); } catch { setStorageError(true); } };
  const filtered = curriculum.filter(item => (level === "All" || item.level === level) && item.title.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (!menu) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenu(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menu]);

  if (!ready) return <div className={styles.system}><main className={styles.main} role="status">Loading your learning workspace…</main></div>;

  return <div className={styles.system}>
    {menu && <button className={styles.backdrop} aria-label="Close navigation" onClick={() => setMenu(false)} />}
    <aside className={`${styles.sidebar} ${menu ? styles.open : ""}`}>
      <div className={styles.brand}><Image src="/no%20barriers%20logo.jpeg" width={32} height={30} alt="" /><strong>no barriers</strong><button className={styles.mobileClose} aria-label="Close navigation" onClick={() => setMenu(false)}><IconX size={20} /></button></div>
      <div className={styles.account}><span className={styles.avatar}>{name.slice(0, 2).toUpperCase()}</span><div><strong>{name}</strong><small>Learner preview</small></div></div>
      <nav aria-label="Learner navigation">{[
        { screen: "dashboard" as Screen, title: "My learning", Icon: IconBook },
        { screen: "certificates" as Screen, title: "Certificates", Icon: IconAward },
        { screen: "profile" as Screen, title: "Profile", Icon: IconUser },
      ].map(({ screen: destination, title, Icon }) => <button key={destination} className={screen === destination || (destination === "dashboard" && screen === "lesson") ? styles.active : ""} onClick={() => navigate(destination)}><Icon size={20} />{title}</button>)}</nav>
      <div className={styles.sidebarBottom}><p>Progress is stored in this browser during the preview.</p><button onClick={onExit}><IconArrowLeft size={18} /> Back to website</button></div>
    </aside>
    <div className={styles.workspace}>
      <header className={styles.topbar}><button className={styles.menuButton} aria-label="Open navigation" onClick={() => setMenu(true)}><IconMenu2 size={22} /></button><span>My learning <IconArrowRight size={14} /> <strong>{screen === "lesson" ? lesson.title : screen === "studio" ? "Studio preview" : screen === "dashboard" ? "Overview" : screen === "profile" ? "Profile" : "Certificates"}</strong></span><div className={styles.overall}><small>Program completion</small><strong>{percent}%</strong></div></header>
      {storageError && <p className={styles.notice} role="status">Browser storage is unavailable. Changes will last only for this session.</p>}
      <main className={styles.main}>
        {screen === "dashboard" && <>
          <div className={styles.pageHeading}><div><h1>Good to see you, {name}.</h1><p>One lesson at a time. Start where you left off.</p></div><span>{progress.completed.length} of {curriculum.length} lessons complete</span></div>
          <section className={styles.continue}><div><span>{current.level} · Lesson {current.id}</span><h2>{current.title}</h2><p>{current.description}</p></div><button className={styles.primary} onClick={() => openLesson(current.id)}>{progress.completed.includes(current.id) ? "Review lesson" : "Open lesson"}<IconArrowRight size={18} /></button></section>
          <section className={styles.directory}><div className={styles.directoryHeading}><h2>Your lessons</h2><label className={styles.search}><IconSearch size={18} /><input aria-label="Find a lesson" placeholder="Find a lesson" value={query} onChange={event => setQuery(event.target.value)} /></label></div><div className={styles.filters}>{["All", "Beginner", "Intermediate", "Advanced"].map(value => <button key={value} aria-pressed={level === value} className={level === value ? styles.active : ""} onClick={() => setLevel(value)}>{value}</button>)}</div>
          {filtered.length === 0 && <p role="status">No lessons match your search. Try another title.</p>}
          <div className={styles.lessonGrid}>{filtered.map(item => <button className={styles.lessonCard} key={item.id} disabled={!unlocked(item.id)} onClick={() => openLesson(item.id)}><div className={styles.lessonArt}>{progress.completed.includes(item.id) ? <IconCheck size={32} /> : unlocked(item.id) ? <IconPlayerPlay size={32} /> : <IconLock size={28} />}<span>{item.level}</span></div><div className={styles.cardBody}><small>Lesson {item.id} · {progress.completed.includes(item.id) ? "Completed" : unlocked(item.id) ? "Ready to learn" : "Locked"}</small><h3>{item.title}</h3><p>{unlocked(item.id) ? item.description : `Complete Lesson ${item.id - 1} to unlock.`}</p></div></button>)}</div></section>
        </>}

        {screen === "lesson" && <>
          <div className={styles.lessonHeading}><button className={styles.iconButton} onClick={() => navigate("dashboard")} aria-label="Back to lessons"><IconArrowLeft size={21} /></button><div><span>{lesson.level} · Lesson {lesson.id}</span><h1>{lesson.title}</h1></div><span className={styles.lessonStatus}>{progress.completed.includes(lesson.id) ? <><IconCheck size={16} />Completed</> : "In practice"}</span></div>
          <div className={styles.lessonLayout}><section className={styles.lessonActivity}>
            <div className={styles.animation}><IconPlayerPlay size={42} /><h2>Sign animation</h2><p>Your team’s approved animation will appear here.</p><span>{lesson.title}</span></div>
            <section className={styles.practice} aria-labelledby="practice-heading"><div><h2 id="practice-heading">Quick check</h2><p>Practice preview · Which number comes after four?</p></div><div className={styles.answers} role="group" aria-label="Answer choices">{["Three", "Five", "Eight"].map((value, index) => <button key={value} aria-pressed={answer === index} disabled={result === "correct"} className={answer === index ? styles.selected : ""} onClick={() => { setAnswer(index); setResult(null); }}><span>{answer === index ? <IconCheck size={16} /> : String.fromCharCode(65 + index)}</span>{value}</button>)}</div>
            <div className={styles.practiceFooter}><p role="status" className={result === "incorrect" ? styles.error : ""}>{result === "correct" ? "Correct. You can complete this preview lesson." : result === "incorrect" ? "Try again. Count one step after four." : "Choose an answer to continue."}</p>{result === "correct" ? <button className={styles.primary} onClick={complete} disabled={progress.completed.includes(lesson.id)}>{progress.completed.includes(lesson.id) ? "Lesson completed" : "Complete preview lesson"}<IconCheck size={18} /></button> : <button className={styles.primary} disabled={answer === null} onClick={() => setResult(answer === 1 ? "correct" : "incorrect")}>Check answer<IconArrowRight size={18} /></button>}</div>
            {progress.completed.includes(lesson.id) && <button className={styles.nextLesson} onClick={() => lesson.id < curriculum.length ? openLesson(lesson.id + 1) : navigate("dashboard")}>{lesson.id < curriculum.length ? "Continue to next lesson" : "Return to my learning"}<IconArrowRight size={18} /></button>}
            </section>
          </section><aside className={styles.lessonSide}><section className={styles.course}><h2>Your course</h2><p>{lesson.level} · {courseCompleted} of {courseLessons.length} complete</p><progress value={courseCompleted} max={courseLessons.length} aria-label={`${lesson.level} course completion`} /><nav aria-label="Course lessons">{courseLessons.map(item => <button key={item.id} aria-current={item.id === selected ? "step" : undefined} disabled={!unlocked(item.id)} onClick={() => openLesson(item.id)}>{progress.completed.includes(item.id) ? <IconCheck size={18} /> : unlocked(item.id) ? <IconPlayerPlay size={18} /> : <IconLock size={18} />}<span>{item.title}</span></button>)}</nav></section><section className={styles.community}><h2>Learning together</h2><p>Follower activity will appear here when learner accounts are connected.</p></section></aside></div>
        </>}

        {screen === "profile" && <section className={styles.settings}><h1>Your profile</h1><p>Personalise your local learner preview.</p><form onSubmit={event => { event.preventDefault(); saveName(); }}><label>Display name<input value={name} onChange={event => { setName(event.target.value); setProfileSaved(false); }} required maxLength={40} /></label><button className={styles.primary}>Save profile<IconCheck size={18} /></button><p role="status">{profileSaved ? "Profile saved in this browser." : ""}</p></form><details><summary><IconSettings size={18} /> Workspace previews</summary><p>Course editing is separate from the learner workspace.</p><button className={styles.secondary} onClick={() => navigate("studio")}>Open course studio preview</button></details></section>}
        {screen === "certificates" && <section className={styles.settings}><h1>Your certificates</h1><p>Certificates will become available after approved level assessments.</p><div className={styles.empty}><IconAward size={40} /><h2>No certificates issued yet</h2><p>You have completed {progress.completed.length} of {curriculum.length} preview lessons. Certificate issuance is not connected yet.</p><button className={styles.primary} onClick={() => navigate("dashboard")}>Continue learning<IconArrowRight size={18} /></button></div></section>}
        {screen === "studio" && <section className={styles.settings}><button className={styles.secondary} onClick={() => navigate("profile")}><IconArrowLeft size={18} />Back to profile</button><h1>Course studio preview</h1><p>Edit a browser-local draft. Publishing and administrator permissions will be connected later.</p><form onSubmit={event => { event.preventDefault(); try { localStorage.setItem("nb-preview-course-draft", draft); setStudioSaved(true); } catch { setStorageError(true); } }}><label>Course name<input required value={draft} onChange={event => { setDraft(event.target.value); setStudioSaved(false); }} /></label><button className={styles.primary}>Save local draft<IconCheck size={18} /></button><p role="status">{studioSaved ? "Draft saved in this browser." : ""}</p></form></section>}
      </main>
    </div>
  </div>;
}
