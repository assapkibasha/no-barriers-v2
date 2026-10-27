"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconArrowLeft, IconAward, IconBook, IconChartBar, IconFlame, IconLogout, IconStar, IconUser } from "@tabler/icons-react";
import { signOut } from "@/app/actions/auth";
import type { SessionUser } from "@/lib/server/auth";
import styles from "./workspace.module.css";

const navItems = [
  { href: "/learn", label: "Learn", title: "My learning", text: "Your course and progress", Icon: IconBook },
  { href: "/certificates", label: "Certificates", title: "Certificates", text: "Levels you have earned", Icon: IconAward },
  { href: "/profile", label: "Profile", title: "Profile", text: "Details, preferences and security", Icon: IconUser },
];
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "NB";

/** Course completion as a small ring. */
function Ring({ percent }: { percent: number }) {
  const r = 15, c = 2 * Math.PI * r;
  return <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
    <circle cx="18" cy="18" r={r} fill="none" strokeWidth="4" className={styles.ringTrack} />
    <circle cx="18" cy="18" r={r} fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} transform="rotate(-90 18 18)" className={styles.ringValue} />
  </svg>;
}

export default function WorkspaceShell({ user, completed, total, children }: { user: SessionUser; completed: number; total: number; children: ReactNode }) {
  const pathname = usePathname();
  const screen = navItems.find(item => item.href === pathname) ?? navItems[0];
  const percent = total ? Math.round(completed / total * 100) : 0;
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const navLink = ({ href, Icon }: (typeof navItems)[number], size: number, label: ReactNode) => {
    const active = pathname === href;
    return <Link key={href} href={href} className={active ? styles.active : ""} aria-current={active ? "page" : undefined}><Icon size={size} />{label}</Link>;
  };

  return <div className={styles.system}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}><Image src="/no%20barriers%20logo.jpeg" width={32} height={30} alt="" /><strong>no barriers</strong></div>
      <nav aria-label="Learner navigation">
        {navItems.map(item => navLink(item, 20, item.title))}
        {user.role === "admin" && <Link href="/admin" className={styles.navLink}><IconChartBar size={20} />Monitoring</Link>}
      </nav>
      <div className={styles.sidebarBottom}>
        <div className={styles.account}><span className={styles.avatar}>{initials(user.name)}</span><div><strong>{user.name}</strong><small>{user.role === "admin" ? "Administrator" : user.audience}</small></div></div>
        <Link href="/"><IconArrowLeft size={18} /> Back to website</Link>
        <form action={signOut}><button><IconLogout size={18} /> Sign out</button></form>
      </div>
    </aside>
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.mobileBrand} aria-label="No Barriers home"><Image src="/no%20barriers%20logo.jpeg" width={28} height={26} alt="" priority /></Link>
        <div className={styles.titleBlock}>
          <strong className={styles.topTitle}>{screen.title}</strong>
          <p>{screen.href === "/learn" ? today : screen.text}</p>
        </div>
        <div className={styles.stats}>
          <span className={styles.chip} data-tone="streak" title={`${user.streak.current}-day streak · best ${user.streak.best}`}><IconFlame size={18} /><strong>{user.streak.current}</strong><small>day streak</small></span>
          <span className={styles.chip} data-tone="xp" title="Experience points"><IconStar size={18} /><strong>{user.xp.toLocaleString("en-GB")}</strong><small>XP</small></span>
          <span className={styles.progress} title={`${completed} of ${total} lessons complete`}><Ring percent={percent} /><span><strong>{percent}%</strong><small>Course</small></span></span>
          <Link className={styles.profileButton} href="/profile" aria-label={`Profile: ${user.name}`}><span className={styles.avatar}>{initials(user.name)}</span></Link>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
    <nav className={styles.bottomNav} aria-label="Learner navigation">
      {navItems.map(item => navLink(item, 22, <span>{item.label}</span>))}
      {user.role === "admin" && <Link href="/admin"><IconChartBar size={22} /><span>Monitoring</span></Link>}
    </nav>
  </div>;
}
