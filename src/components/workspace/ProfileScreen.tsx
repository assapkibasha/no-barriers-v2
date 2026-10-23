"use client";

import { useState } from "react";
import Link from "next/link";
import { IconCheck, IconSettings } from "@tabler/icons-react";
import { useProgress } from "./ProgressProvider";
import styles from "./workspace.module.css";

export default function ProfileScreen() {
  const { name, saveName } = useProgress();
  const [draft, setDraft] = useState(name);
  const [saved, setSaved] = useState(false);

  return <section className={styles.settings}>
    <h1>Your profile</h1><p>Personalise your local learner preview.</p>
    <form onSubmit={event => { event.preventDefault(); setSaved(saveName(draft)); }}>
      <label>Display name<input value={draft} onChange={event => { setDraft(event.target.value); setSaved(false); }} required maxLength={40} /></label>
      <button className={styles.primary}>Save profile<IconCheck size={18} /></button>
      <p role="status">{saved ? "Profile saved in this browser." : ""}</p>
    </form>
    <details><summary><IconSettings size={18} /> Workspace previews</summary><p>Course editing is separate from the learner workspace.</p><Link className={styles.secondary} href="/studio">Open course studio preview</Link></details>
  </section>;
}
