import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { ALL_LESSONS, isReady } from "@/lib/course/curriculum";
import { requireAdmin } from "@/lib/server/auth";
import { collections } from "@/lib/server/db";
import styles from "../../admin.module.css";

const when = (d: Date | null | undefined) => (d ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Kigali" }).format(d) : "—");
const EVENT_TEXT: Record<string, string> = { signup: "Created account", login: "Signed in", logout: "Signed out", lesson_start: "Started lesson", answer: "Answered", lesson_complete: "Completed lesson", review: "Reviewed missed signs", settings: "Changed settings" };

export default async function LearnerDetail({ params }: PageProps<"/admin/users/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();
  const userId = new ObjectId(id);
  const { users, progress, events } = await collections();
  const [user, lessons, recent] = await Promise.all([
    users.findOne({ _id: userId }, { projection: { passwordHash: 0 } }),
    progress.find({ userId }).toArray(),
    events.find({ userId }).sort({ at: -1 }).limit(60).toArray(),
  ]);
  if (!user) notFound();
  const byLesson = new Map(lessons.map(l => [l.lessonId, l]));

  return <main className={styles.admin}>
    <header className={styles.header}><div><Link href="/admin" className={styles.back}>← All learners</Link><h1>{user.name}</h1><p>{user.email} · {user.audience} · joined {when(user.createdAt)} · last active {when(user.lastActiveAt)}</p></div></header>
    <section className={styles.cards}>
      <div><small>Lessons completed</small><strong>{lessons.filter(l => l.status === "completed").length}</strong></div>
      <div><small>XP</small><strong>{user.xp}</strong></div>
      <div><small>Streak</small><strong>{user.streak.current}</strong></div>
      <div><small>Signs with left hand</small><strong>{user.settings.leftHanded ? "Yes" : "No"}</strong></div>
    </section>
    <section className={styles.block}><h2>Lesson progress</h2><div className={styles.tableWrap}><table>
      <thead><tr><th>Lesson</th><th>Status</th><th>Hearts</th><th>Attempts</th><th>Mistakes</th><th>Last update</th></tr></thead>
      <tbody>{ALL_LESSONS.filter(isReady).map(l => { const p = byLesson.get(l.id); return <tr key={l.id}>
        <td><strong>{l.title}</strong><small>{l.unit.title}</small></td>
        <td>{p ? (p.status === "completed" ? "Completed" : "In progress") : "Not started"}</td>
        <td>{p?.state.hearts ?? "—"}</td><td>{p?.attempts ?? "—"}</td><td>{p?.mistakes ?? "—"}</td><td>{when(p?.completedAt ?? p?.updatedAt)}</td>
      </tr>; })}</tbody>
    </table></div></section>
    <section className={styles.block}><h2>Recent activity</h2><ul className={styles.events}>{recent.map(e => <li key={String(e._id)}>
      <time>{when(e.at)}</time><span>{EVENT_TEXT[e.type] ?? e.type}{e.lessonId ? ` · ${e.lessonId}` : ""}{e.type === "answer" ? (e.data?.correct ? " · correct" : " · incorrect") : ""}</span>
    </li>)}</ul>{recent.length === 0 && <p className={styles.empty}>No activity yet.</p>}</section>
  </main>;
}
