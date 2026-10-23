"use client";

import Link from "next/link";
import { IconArrowRight, IconAward } from "@tabler/icons-react";
import { curriculum } from "@/lib/curriculum";
import { useProgress } from "./ProgressProvider";
import styles from "./workspace.module.css";

export default function CertificatesScreen() {
  const { completedCount } = useProgress();

  return <section className={styles.settings}>
    <h1>Your certificates</h1><p>Certificates will become available after approved level assessments.</p>
    <div className={styles.empty}><IconAward size={40} /><h2>No certificates issued yet</h2><p>You have completed {completedCount} of {curriculum.length} preview lessons. Certificate issuance is not connected yet.</p><Link className={styles.primary} href="/learn">Continue learning<IconArrowRight size={18} /></Link></div>
  </section>;
}
