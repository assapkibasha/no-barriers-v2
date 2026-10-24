"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconArrowLeft, IconArrowRight, IconAward, IconBook, IconChartBar, IconFlame, IconLogout, IconMenu2, IconStar, IconUser, IconX } from "@tabler/icons-react";
import { signOut } from "@/app/actions/auth";
import type { SessionUser } from "@/lib/server/auth";
import styles from "./workspace.module.css";

const navItems = [
  { href: "/learn", title: "My learning", Icon: IconBook },
  { href: "/certificates", title: "Certificates", Icon: IconAward },
  { href: "/profile", title: "Profile", Icon: IconUser },
];
const titles: Record<string, string> = { "/learn": "Overview", "/certificates": "Certificates", "/profile": "Profile" };

export default function WorkspaceShell({ user, percent, children }: { user: SessionUser; percent: number; children: ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const closeMenu = () => setMenu(false);

  useEffect(() => {
    if (!menu) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenu(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menu]);

  return <div className={styles.system}>
    {menu && <button className={styles.backdrop} aria-label="Close navigation" onClick={closeMenu} />}
    <aside className={`${styles.sidebar} ${menu ? styles.open : ""}`}>
      <div className={styles.brand}><Image src="/no%20barriers%20logo.jpeg" width={32} height={30} alt="" /><strong>no barriers</strong><button className={styles.mobileClose} aria-label="Close navigation" onClick={closeMenu}><IconX size={20} /></button></div>
      <div className={styles.account}><span className={styles.avatar}>{user.name.slice(0, 2).toUpperCase()}</span><div><strong>{user.name}</strong><small>{user.audience}{user.role === "admin" ? " · Admin" : ""}</small></div></div>
      <nav aria-label="Learner navigation">
        {navItems.map(({ href, title, Icon }) => {
          const active = pathname === href;
          return <Link key={href} href={href} className={active ? styles.active : ""} aria-current={active ? "page" : undefined} onClick={closeMenu}><Icon size={20} />{title}</Link>;
        })}
        {user.role === "admin" && <Link href="/admin" className={styles.navLink}><IconChartBar size={20} />Monitoring</Link>}
      </nav>
      <div className={styles.sidebarBottom}><Link href="/"><IconArrowLeft size={18} /> Back to website</Link><form action={signOut}><button><IconLogout size={18} /> Sign out</button></form></div>
    </aside>
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <button className={styles.menuButton} aria-label="Open navigation" onClick={() => setMenu(true)}><IconMenu2 size={22} /></button>
        <span>My learning <IconArrowRight size={14} /> <strong>{titles[pathname] ?? "Overview"}</strong></span>
        <div className={styles.stats}>
          <span title="Daily streak"><IconFlame size={18} />{user.streak.current}</span>
          <span title="Experience points"><IconStar size={18} />{user.xp} XP</span>
          <div className={styles.overall}><small>Course completion</small><strong>{percent}%</strong></div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  </div>;
}
