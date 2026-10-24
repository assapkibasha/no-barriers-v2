"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { IconSettings } from "@tabler/icons-react";
import { setLeftHanded } from "@/app/actions/learning";
import type { SessionUser } from "@/lib/server/auth";
import styles from "./workspace.module.css";

export default function ProfileScreen({ user, completed }: { user: SessionUser; completed: number }) {
  const [leftHanded, setLeft] = useState(user.settings.leftHanded);
  const [saving, startSaving] = useTransition();
  const days = (count: number) => `${count} ${count === 1 ? "day" : "days"}`;

  return <section className={styles.settings}>
    <h1>Your profile</h1><p>{user.email}</p>
    <div className={styles.panel}>
      <label className={styles.toggle}><input type="checkbox" checked={leftHanded} disabled={saving} onChange={event => { const value = event.target.checked; setLeft(value); startSaving(() => setLeftHanded(value)); }} /><span><strong>I sign with my left hand</strong><small>The signer mirrors every sign so it matches your dominant hand.</small></span></label>
      <dl className={styles.facts}><div><dt>Experience</dt><dd>{user.xp} XP</dd></div><div><dt>Current streak</dt><dd>{days(user.streak.current)}</dd></div><div><dt>Best streak</dt><dd>{days(user.streak.best)}</dd></div><div><dt>Lessons completed</dt><dd>{completed}</dd></div></dl>
    </div>
    {user.role === "admin" && <details><summary><IconSettings size={18} /> Administrator tools</summary><p>Preview every sign and any sequence on the signing avatar.</p><Link className={styles.secondary} href="/studio/signs">Open sign studio</Link></details>}
  </section>;
}
