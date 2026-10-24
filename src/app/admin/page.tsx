import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { collections } from "@/lib/server/db";
import { READY_ORDER } from "@/lib/server/learning";
import styles from "./admin.module.css";

export const metadata = { title: "Monitoring | No Barriers" };

const fmt = (d: Date | null | undefined) => (d ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Africa/Kigali" }).format(d) : "—");
/** A moment `days` before now (request time). */
const daysAgo = (days: number) => new Date(Date.now() - days * 864e5);
const ago = (d: Date) => {
  const m = Math.round((Date.now() - d.getTime()) / 60000);
  return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`;
};

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const q = (await searchParams).q;
  const term = typeof q === "string" ? q.trim() : "";
  const { users, progress, events } = await collections();
  const weekAgo = daysAgo(7), dayAgo = daysAgo(1);
  const filter = term ? { $or: [{ email: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }, { name: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }] } : {};
  const [total, active7, active1, completions, list, perUser, popular] = await Promise.all([
    users.countDocuments(),
    users.countDocuments({ lastActiveAt: { $gte: weekAgo } }),
    users.countDocuments({ lastActiveAt: { $gte: dayAgo } }),
    progress.countDocuments({ status: "completed" }),
    users.find(filter, { projection: { passwordHash: 0 } }).sort({ lastActiveAt: -1 }).limit(200).toArray(),
    progress.aggregate<{ _id: unknown; done: number; mistakes: number }>([{ $group: { _id: "$userId", done: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }, mistakes: { $sum: "$mistakes" } } }]).toArray(),
    events.aggregate<{ _id: string; n: number }>([{ $match: { type: "lesson_complete", at: { $gte: daysAgo(30) } } }, { $group: { _id: "$lessonId", n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 5 }]).toArray(),
  ]);
  const stats = new Map(perUser.map(p => [String(p._id), p]));

  return <main className={styles.admin}>
    <header className={styles.header}><div><h1>Monitoring</h1><p>Accounts and learning activity. Times are in Rwanda time.</p></div><nav><Link href="/studio/signs">Sign studio</Link><Link href="/learn">My learning</Link></nav></header>
    <section className={styles.cards} aria-label="Totals">
      <div><small>Accounts</small><strong>{total}</strong></div>
      <div><small>Active today</small><strong>{active1}</strong></div>
      <div><small>Active this week</small><strong>{active7}</strong></div>
      <div><small>Lessons completed</small><strong>{completions}</strong></div>
    </section>
    {popular.length > 0 && <section className={styles.block}><h2>Most completed lessons, last 30 days</h2><ol className={styles.popular}>{popular.map(p => <li key={p._id}><span>{p._id}</span><strong>{p.n}</strong></li>)}</ol></section>}
    <section className={styles.block}>
      <div className={styles.tableHead}><h2>Learners</h2><form><input name="q" defaultValue={term} placeholder="Search name or email" aria-label="Search learners" /><button>Search</button></form></div>
      <div className={styles.tableWrap}><table>
        <thead><tr><th>Name</th><th>Joined as</th><th>Joined</th><th>Last active</th><th>Lessons</th><th>XP</th><th>Streak</th><th>Mistakes</th></tr></thead>
        <tbody>{list.map(u => { const s = stats.get(String(u._id)); return <tr key={String(u._id)}>
          <td><Link href={`/admin/users/${u._id}`}><strong>{u.name}</strong><small>{u.email}{u.role === "admin" ? " · admin" : ""}</small></Link></td>
          <td>{u.audience}</td><td>{fmt(u.createdAt)}</td><td>{ago(u.lastActiveAt)}</td>
          <td>{s?.done ?? 0} / {READY_ORDER.length}</td><td>{u.xp}</td><td>{u.streak.current} (best {u.streak.best})</td><td>{s?.mistakes ?? 0}</td>
        </tr>; })}</tbody>
      </table>{list.length === 0 && <p className={styles.empty}>{term ? "No learners match this search." : "No accounts yet."}</p>}</div>
    </section>
  </main>;
}
