"use client";

import { useActionState, useState, useSyncExternalStore, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconAward, IconCertificate, IconClock, IconEye, IconEyeOff, IconLock, IconLogout, IconPrinter, IconSchool } from "@tabler/icons-react";
import type { CourseOverview } from "@/lib/server/learning";
import type { SessionUser } from "@/lib/server/auth";
import { changePassword, updateProfile, type AccountState } from "@/app/actions/account";
import { setLeftHanded } from "@/app/actions/learning";
import { signOut } from "@/app/actions/auth";
import { setSoundEnabled, setVibrationEnabled, soundEnabled, subscribeSound, vibrationEnabled } from "@/lib/sound";
import styles from "./account.module.css";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
const longDate = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("") || "NB";

function Toggle({ title, text, checked, onChange, disabled }: { title: string; text: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return <label className={styles.toggle}>
    <span><strong>{title}</strong><small>{text}</small></span>
    <span className={styles.switch}><input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)} /><span /></span>
  </label>;
}

export function ProfilePanel({ user, overview }: { user: SessionUser; overview: CourseOverview }) {
  const [left, setLeft] = useState(user.settings.leftHanded);
  const [saving, startSaving] = useTransition();
  const sound = useSyncExternalStore(subscribeSound, soundEnabled, () => true);
  const vibrate = useSyncExternalStore(subscribeSound, vibrationEnabled, () => true);
  const [nameState, nameAction, namePending] = useActionState<AccountState, FormData>(updateProfile, undefined);
  const [pwState, pwAction, pwPending] = useActionState<AccountState, FormData>(changePassword, undefined);
  const [showPw, setShowPw] = useState(false);
  const joined = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(user.createdAt));

  return <div className={styles.page}>
    {/* The sticky topbar already shows "Profile" as the page title; this heading exists for
        document structure and screen readers without repeating it on screen. */}
    <h1 className={styles.srOnly}>Profile</h1>

    <section className={styles.identity} aria-label="Your account">
      <span className={styles.avatar} aria-hidden="true">{initials(user.name)}</span>
      <div className={styles.identityText}>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <p className={styles.meta}>{user.role === "admin" ? "Administrator" : user.audience} · Joined {joined}</p>
      </div>
    </section>

    <dl className={styles.statStrip} aria-label="Your learning">
      <div><dt>Experience</dt><dd>{user.xp.toLocaleString("en-GB")} <span>XP</span></dd></div>
      <div><dt>Current streak</dt><dd>{user.streak.current} <span>{user.streak.current === 1 ? "day" : "days"}</span></dd></div>
      <div><dt>Best streak</dt><dd>{user.streak.best} <span>{user.streak.best === 1 ? "day" : "days"}</span></dd></div>
      <div><dt>Lessons completed</dt><dd>{overview.completed} <span>of {overview.total}</span></dd></div>
      <div><dt>Signs learned</dt><dd>{overview.signsLearned}</dd></div>
    </dl>

    <section className={styles.section} aria-labelledby="sec-details">
      <div className={styles.sectionIntro}><h3 id="sec-details">Personal details</h3><p>Your name appears in lessons and on your certificates.</p></div>
      <form action={nameAction} className={styles.panel}>
        <div className={styles.field}><label className={styles.label} htmlFor="profile-name">Full name</label><input id="profile-name" className={styles.input} name="name" defaultValue={user.name} required minLength={2} maxLength={60} autoComplete="name" /></div>
        <div className={styles.field}><label className={styles.label} htmlFor="profile-email">Email</label><input id="profile-email" className={styles.input} value={user.email} readOnly /><p className={styles.help}>Contact support to change the email on your account.</p></div>
        <div className={styles.panelFoot}>
          <p role="status" className={nameState?.error ? styles.statusError : styles.status}>{nameState?.error ?? nameState?.ok ?? ""}</p>
          <button className={styles.primary} disabled={namePending}>{namePending ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </section>

    <section className={styles.section} aria-labelledby="sec-prefs">
      <div className={styles.sectionIntro}><h3 id="sec-prefs">Learning preferences</h3><p>How the signer and lessons behave for you.</p></div>
      <div className={`${styles.panel} ${styles.toggles}`}>
        <Toggle title="Left-handed signing" text="The signer mirrors every sign to match your dominant hand." checked={left} disabled={saving} onChange={v => { setLeft(v); startSaving(() => setLeftHanded(v)); }} />
        <Toggle title="Sounds" text="Play sounds for answers, streaks and finished lessons." checked={sound} onChange={setSoundEnabled} />
        <Toggle title="Vibration" text="Vibrate on phones that support it." checked={vibrate} onChange={setVibrationEnabled} />
      </div>
    </section>

    <section className={styles.section} aria-labelledby="sec-password">
      <div className={styles.sectionIntro}><h3 id="sec-password">Password</h3><p>Use at least 8 characters. Changing it signs you out on your other devices.</p></div>
      <form action={pwAction} className={styles.panel}>
        <div className={styles.field}><label className={styles.label} htmlFor="pw-current">Current password</label>
          <div className={styles.password}><input id="pw-current" className={styles.input} name="current" type={showPw ? "text" : "password"} autoComplete="current-password" required />
            <button type="button" className={styles.eye} onClick={() => setShowPw(s => !s)} aria-label={showPw ? "Hide passwords" : "Show passwords"} aria-pressed={showPw}>{showPw ? <IconEyeOff size={18} /> : <IconEye size={18} />}</button></div>
        </div>
        <div className={styles.field}><label className={styles.label} htmlFor="pw-next">New password</label>
          <div className={styles.password}><input id="pw-next" className={styles.input} name="next" type={showPw ? "text" : "password"} autoComplete="new-password" required minLength={8} />
            <button type="button" className={styles.eye} onClick={() => setShowPw(s => !s)} aria-label={showPw ? "Hide passwords" : "Show passwords"} aria-pressed={showPw}>{showPw ? <IconEyeOff size={18} /> : <IconEye size={18} />}</button></div>
        </div>
        <div className={styles.panelFoot}>
          <span />
          <button className={styles.primary} disabled={pwPending}>{pwPending ? "Updating…" : "Update password"}</button>
        </div>
        {(pwState?.error || pwState?.ok) && <p role="status" className={pwState?.error ? styles.statusError : styles.status}>{pwState?.error ?? pwState?.ok}</p>}
      </form>
    </section>

    <section className={styles.section} aria-labelledby="sec-session">
      <div className={styles.sectionIntro}><h3 id="sec-session">Session</h3><p>You are signed in as {user.email}.</p></div>
      <form action={signOut} className={`${styles.panel} ${styles.panelRow}`}>
        <p>Sign out of No Barriers on this device.</p>
        <button className={styles.secondary}><IconLogout size={18} />Sign out</button>
      </form>
    </section>
  </div>;
}

/** Short, stable reference printed on a certificate. */
function certificateId(userId: string, level: string) {
  let h = 2166136261;
  for (const ch of userId + level) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return `NB-${level.slice(0, 3).toUpperCase()}-${(h >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(0, 6)}`;
}

export function CertificatesPanel({ user, overview }: { user: SessionUser; overview: CourseOverview }) {
  const lessons = overview.units.flatMap(u => u.lessons.map(l => ({ ...l, level: u.level })));
  const print = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add(styles.printTarget);
    document.body.classList.add("nb-printing");
    const done = () => { document.body.classList.remove("nb-printing"); el.classList.remove(styles.printTarget); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    window.print();
  };

  return <div className={styles.page}>
    <h1 className={styles.srOnly}>Certificates</h1>
    <p className={styles.pageIntro}>Complete every lesson in a level to earn its certificate, with your name, the completion date and a reference you can share.</p>
    <div className={styles.levels}>
    {LEVELS.map(level => {
      const own = lessons.filter(l => l.level === level);
      const available = own.filter(l => l.status !== "coming_soon");
      const done = available.filter(l => l.status === "completed");
      const comingSoon = own.length - available.length;
      const earned = available.length > 0 && done.length === available.length && comingSoon === 0;
      const state = earned ? "earned" : available.length === 0 ? "soon" : done.length > 0 ? "progress" : "start";
      const completedOn = earned ? done.map(l => l.completedAt).filter(Boolean).sort().at(-1) : undefined;
      const certId = `certificate-${level}`;
      const pct = available.length ? Math.round(done.length / available.length * 100) : 0;
      return <section key={level} className={styles.levelCard} aria-labelledby={`${certId}-h`}>
        <div className={styles.level}>
          <span className={styles.levelBadge} data-state={state}>{earned ? <IconAward size={22} /> : state === "soon" ? <IconClock size={20} /> : <IconSchool size={20} />}</span>
          <div>
            <h2 id={`${certId}-h`}>{level} certificate</h2>
            <p>{earned ? `Earned on ${longDate(completedOn ?? new Date().toISOString())}.`
              : state === "soon" ? "Lessons for this level are being produced. They will appear in your course when ready."
              : `${done.length} of ${available.length} available lessons completed${comingSoon ? ` · ${comingSoon} more lessons coming soon` : ""}.`}</p>
            {state === "progress" || state === "start" ? <div className={styles.bar} role="progressbar" aria-label={`${level} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><span style={{ width: `${pct}%` }} /></div> : null}
          </div>
          <span className={styles.state} data-state={state}>{earned ? "Earned" : state === "soon" ? "Coming soon" : state === "progress" ? "In progress" : "Not started"}</span>
        </div>
        {earned ? <>
          <div id={certId} className={styles.certificate}>
            <div className={styles.certBrand}><Image src="/no%20barriers%20logo.jpeg" width={26} height={24} alt="" />no barriers</div>
            <p className={styles.certKicker}>Certificate of completion</p>
            <h3 className={styles.certTitle}>Rwandan Sign Language</h3>
            <p className={styles.certText}>This certifies that</p>
            <p className={styles.certName}>{user.name}</p>
            <p className={styles.certText}>has successfully completed every lesson of the <strong>{level}</strong> level of the No Barriers Rwandan Sign Language course.</p>
            <div className={styles.certFoot}>
              <div><strong>{longDate(completedOn ?? new Date().toISOString())}</strong><span>Date of completion</span></div>
              <span className={styles.seal} aria-hidden="true"><IconCertificate size={30} /></span>
              <div><strong>{certificateId(user.id, level)}</strong><span>Certificate reference</span></div>
            </div>
          </div>
          <div className={styles.certActions}><button className={styles.primary} onClick={() => print(certId)}><IconPrinter size={18} />Print or save as PDF</button></div>
        </> : state !== "soon" && !(comingSoon && done.length === available.length) ? <div className={styles.certActions}>
          <Link className={styles.secondary} href="/learn">Continue learning<IconArrowRight size={18} /></Link>
        </div> : comingSoon && available.length > 0 && done.length === available.length ? <p className={styles.note}><IconLock size={16} /> You have completed every available lesson. The certificate unlocks when the remaining lessons are released.</p> : null}
      </section>;
    })}
    </div>
  </div>;
}
