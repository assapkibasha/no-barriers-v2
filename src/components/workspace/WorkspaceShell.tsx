"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconArrowLeft, IconArrowRight, IconAward, IconBook, IconMenu2, IconUser, IconX } from "@tabler/icons-react";
import { lessonBySlug } from "@/lib/curriculum";
import { useProgress } from "./ProgressProvider";
import styles from "./workspace.module.css";

const navItems = [
  { href: "/learn", title: "My learning", Icon: IconBook },
  { href: "/certificates", title: "Certificates", Icon: IconAward },
  { href: "/profile", title: "Profile", Icon: IconUser },
];
const titles: Record<string, string> = { "/learn": "Overview", "/certificates": "Certificates", "/profile": "Profile", "/studio": "Studio preview" };

function pageTitle(pathname: string) {
  if (pathname.startsWith("/learn/")) return lessonBySlug(pathname.split("/")[2])?.title ?? "Lesson";
  return titles[pathname] ?? "Overview";
}

export default function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { ready, storageError, name, percent } = useProgress();
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
      <div className={styles.account}><span className={styles.avatar}>{name.slice(0, 2).toUpperCase()}</span><div><strong>{name}</strong><small>Learner preview</small></div></div>
      <nav aria-label="Learner navigation">{navItems.map(({ href, title, Icon }) => {
        const active = pathname === href || (href === "/learn" && pathname.startsWith("/learn/"));
        return <Link key={href} href={href} className={active ? styles.active : ""} aria-current={active ? "page" : undefined} onClick={closeMenu}><Icon size={20} />{title}</Link>;
      })}</nav>
      <div className={styles.sidebarBottom}><p>Progress is stored in this browser during the preview.</p><Link href="/"><IconArrowLeft size={18} /> Back to website</Link></div>
    </aside>
    <div className={styles.workspace}>
      <header className={styles.topbar}><button className={styles.menuButton} aria-label="Open navigation" onClick={() => setMenu(true)}><IconMenu2 size={22} /></button><span>My learning <IconArrowRight size={14} /> <strong>{pageTitle(pathname)}</strong></span>{ready && <div className={styles.overall}><small>Program completion</small><strong>{percent}%</strong></div>}</header>
      {storageError && <p className={styles.notice} role="status">Browser storage is unavailable. Changes will last only for this session.</p>}
      <main className={styles.main}>{ready ? children : <p role="status">Loading your learning workspace…</p>}</main>
    </div>
  </div>;
}
