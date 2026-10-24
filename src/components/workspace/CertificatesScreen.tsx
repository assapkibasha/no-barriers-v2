import Link from "next/link";
import { IconArrowRight, IconAward } from "@tabler/icons-react";
import { levels } from "@/lib/course/curriculum";
import type { CourseOverview } from "@/lib/server/learning";
import styles from "./workspace.module.css";

export default function CertificatesScreen({ overview }: { overview: CourseOverview }) {
  const lessons = overview.units.flatMap(unit => unit.lessons.map(lesson => ({ ...lesson, level: unit.level })));

  return <section className={styles.settings}>
    <h1>Your certificates</h1><p>A certificate is awarded when you complete every lesson in a level.</p>
    {levels.map(level => {
      const available = lessons.filter(lesson => lesson.level === level && lesson.status !== "coming_soon");
      const done = available.filter(lesson => lesson.status === "completed").length;
      return <div key={level} className={styles.empty}><IconAward size={36} /><h2>{level}</h2>
        <p>{done > 0 && done === available.length ? "Level complete. Certificate issuance will be connected soon." : `${done} of ${available.length} available lessons completed.`}</p>
      </div>;
    })}
    <Link className={styles.primary} href="/learn">Continue learning<IconArrowRight size={18} /></Link>
  </section>;
}
