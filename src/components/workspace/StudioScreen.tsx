"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { useProgress } from "./ProgressProvider";
import styles from "./workspace.module.css";

const draftKey = "nb-preview-course-draft";

export default function StudioScreen() {
  const { reportStorageError } = useProgress();
  const [draft, setDraft] = useState("Rwandan Sign Language");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try { setDraft(localStorage.getItem(draftKey) || "Rwandan Sign Language"); } catch { reportStorageError(); }
    }, 0);
    return () => window.clearTimeout(restore);
  }, [reportStorageError]);

  const save = () => {
    try { localStorage.setItem(draftKey, draft); setSaved(true); } catch { reportStorageError(); }
  };

  return <section className={styles.settings}>
    <Link className={styles.secondary} href="/profile"><IconArrowLeft size={18} />Back to profile</Link>
    <h1>Course studio preview</h1><p>Edit a browser-local draft. Publishing and administrator permissions will be connected later.</p>
    <form onSubmit={event => { event.preventDefault(); save(); }}>
      <label>Course name<input required value={draft} onChange={event => { setDraft(event.target.value); setSaved(false); }} /></label>
      <button className={styles.primary}>Save local draft<IconCheck size={18} /></button>
      <p role="status">{saved ? "Draft saved in this browser." : ""}</p>
    </form>
  </section>;
}
