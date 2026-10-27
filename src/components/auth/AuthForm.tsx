"use client";

import { useActionState, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconAlertCircle, IconArrowLeft, IconArrowRight, IconCheck, IconEye, IconEyeOff, IconInfoCircle } from "@tabler/icons-react";
import { checkEmail, signIn, signUp, type AuthState } from "@/app/actions/auth";
import styles from "./auth.module.css";

type Mode = "login" | "register";

const VISUAL: Record<Mode, { src: string; alt: string; title: string; points: string[] }> = {
  login: {
    src: "/landing/Teal%20Laptop%20Creative%20Workspace%20Collage.png", alt: "Illustration of a sign language lesson on a laptop",
    title: "Welcome back. Your signs are waiting.",
    points: ["Pick up exactly where you left off", "Keep your daily streak going", "Practise with a 3D signer you can turn and slow down"],
  },
  register: {
    src: "/landing/community_transparent.png", alt: "Illustration of smiling young learners",
    title: "Start learning Rwandan Sign Language today.",
    points: ["Short lessons, one sign at a time", "Quick checks that make signs stick", "Free to start, at your own pace"],
  },
};

/** Two-panel layout shared by sign-in and registration. */
function Shell({ mode, children }: { mode: Mode; children: React.ReactNode }) {
  const v = VISUAL[mode];
  return <main className={styles.page}>
    <aside className={styles.visual}>
      <Link href="/" className={styles.brand}><Image src="/no%20barriers%20logo.jpeg" width={34} height={32} alt="" />no barriers</Link>
      <div className={styles.showcase}>
        <Image className={styles.art} src={v.src} alt={v.alt} width={1448} height={1086} priority sizes="(max-width: 900px) 220px, 45vw" />
        <div className={styles.pitch}>
          <h2>{v.title}</h2>
          <ul className={styles.benefits}>{v.points.map(p => <li key={p}><IconCheck size={20} stroke={2.4} />{p}</li>)}</ul>
        </div>
      </div>
      <p className={styles.visualFoot}>Rwandan Sign Language · guided by the REB teacher training manual</p>
    </aside>
    <section className={styles.formSide}>
      <div className={styles.topRow}>
        <Link className={styles.back} href="/"><IconArrowLeft size={18} />Back to home</Link>
        <p className={styles.switchTop}>{mode === "login" ? <>New to No Barriers? <Link href="/register">Create an account</Link></> : <>Already have an account? <Link href="/login">Sign in</Link></>}</p>
      </div>
      <div className={styles.card}>
        {children}
        <p className={styles.switchBottom}>{mode === "login" ? <>New to No Barriers? <Link href="/register">Create an account</Link></> : <>Already have an account? <Link href="/login">Sign in</Link></>}</p>
      </div>
    </section>
  </main>;
}

function GoogleMark() {
  return <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>;
}

/** "Continue with Google" placeholder: explains that Google sign-in is on its way. */
function GoogleButton({ onPress }: { onPress: () => void }) {
  return <button type="button" className={styles.google} onClick={onPress}><GoogleMark />Continue with Google</button>;
}

function Notice({ kind, children }: { kind: "error" | "info"; children: React.ReactNode }) {
  return <div className={`${styles.notice} ${styles[kind]}`} role={kind === "error" ? "alert" : "status"}>
    {kind === "error" ? <IconAlertCircle size={20} /> : <IconInfoCircle size={20} />}<div>{children}</div>
  </div>;
}

function PasswordInput({ id, name, autoComplete, placeholder, minLength, onChange, describedBy }: { id: string; name: string; autoComplete: string; placeholder: string; minLength?: number; onChange?: (v: string) => void; describedBy?: string }) {
  const [shown, setShown] = useState(false);
  return <div className={styles.password}>
    <input id={id} name={name} className={styles.input} type={shown ? "text" : "password"} autoComplete={autoComplete} required minLength={minLength} placeholder={placeholder} aria-describedby={describedBy} onChange={e => onChange?.(e.target.value)} />
    <button type="button" className={styles.eye} onClick={() => setShown(s => !s)} aria-label={shown ? "Hide password" : "Show password"} aria-pressed={shown}>{shown ? <IconEyeOff size={20} /> : <IconEye size={20} />}</button>
  </div>;
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return <button className={styles.primary} type="submit" disabled={pending}>{pending ? <><span className={styles.spinner} aria-hidden="true" />Please wait…</> : <>{children}<IconArrowRight size={18} /></>}</button>;
}

const Fine = () => <p className={styles.fine}>By continuing you agree to the <Link href="/#terms">Terms of use</Link> and <Link href="/#privacy">Privacy policy</Link>.</p>;
const GOOGLE_SOON = "Signing in with Google is coming soon. For now, please continue with your email.";

export function LoginForm({ email = "" }: { email?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, undefined);
  const [note, setNote] = useState("");
  const id = useId();
  return <Shell mode="login">
    <h1>Sign in</h1>
    <p className={styles.lead}>Continue your Rwandan Sign Language journey.</p>
    <GoogleButton onPress={() => setNote(GOOGLE_SOON)} />
    <div className={styles.divider}>or</div>
    <form action={action} className={styles.form}>
      {note && <Notice kind="info">{note}</Notice>}
      {state?.error && <Notice kind="error">{state.error}</Notice>}
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-email`}>Email</label>
        <input id={`${id}-email`} className={styles.input} name="email" type="email" autoComplete="email" required placeholder="you@example.com" defaultValue={state?.fields?.email ?? email} aria-invalid={!!state?.error} />
      </div>
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label className={styles.label} htmlFor={`${id}-password`}>Password</label>
          <button type="button" className={styles.linkButton} onClick={() => setNote("Resetting a password by email is coming soon. Until then, an administrator can help you get back into your account.")}>Forgot password?</button>
        </div>
        <PasswordInput id={`${id}-password`} name="password" autoComplete="current-password" placeholder="Your password" />
      </div>
      <Submit pending={pending}>Sign in</Submit>
    </form>
  </Shell>;
}

/** A simple strength score (0–4) for feedback only; the server enforces the real rule (8+ characters). */
function strength(p: string) {
  if (!p) return 0;
  let s = p.length >= 8 ? 1 : 0;
  if (p.length >= 12) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return Math.max(1, Math.min(4, s));
}
const STRENGTH_TEXT = ["", "Too weak: use at least 8 characters", "Fair: longer is stronger", "Good password", "Strong password"];

export function RegisterForm({ audience = "Learner" }: { audience?: string }) {
  const [step, setStep] = useState<"email" | "details">("email");
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [exists, setExists] = useState(false);
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, undefined);
  const id = useId();

  const continueWithEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(""); setExists(false);
    setChecking(true);
    const res = await checkEmail(email);
    setChecking(false);
    if (!res.ok) { setEmailError(res.error ?? "Enter a valid email address."); return; }
    if (res.exists) { setExists(true); return; }
    setStep("details");
  };

  const score = password.length < 8 ? (password ? 1 : 0) : strength(password);
  return <Shell mode="register">
    <div className={styles.steps} aria-label={`Step ${step === "email" ? 1 : 2} of 2`}><span data-on="true" /><span data-on={step === "details"} /></div>
    {step === "email" ? <>
      <h1>Create your account</h1>
      <p className={styles.lead}>Learn Rwandan Sign Language one sign at a time.</p>
      <GoogleButton onPress={() => setNote(GOOGLE_SOON)} />
      <div className={styles.divider}>or</div>
      <form className={styles.form} onSubmit={continueWithEmail} noValidate>
        {note && <Notice kind="info">{note}</Notice>}
        {emailError && <Notice kind="error">{emailError}</Notice>}
        {exists && <Notice kind="info">You already have an account with this email. <Link href={`/login?email=${encodeURIComponent(email)}`}>Sign in instead</Link></Notice>}
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-email`}>Email</label>
          <input id={`${id}-email`} className={styles.input} type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!!emailError} />
        </div>
        <Submit pending={checking}>Continue with email</Submit>
      </form>
      <Fine />
    </> : <>
      <h1>Almost there</h1>
      <p className={styles.lead}>Tell us your name and choose a password.</p>
      <div className={styles.emailChip}><span>{email}</span><button type="button" className={styles.linkButton} onClick={() => { setStep("email"); setPassword(""); }}>Change</button></div>
      <form action={action} className={styles.form} style={{ marginTop: 20 }}>
        {state?.error && <Notice kind="error">{state.error.includes("already exists") ? <>{state.error} <Link href={`/login?email=${encodeURIComponent(email)}`}>Sign in</Link></> : state.error}</Notice>}
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="audience" value={audience} />
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-name`}>Full name</label>
          <input id={`${id}-name`} className={styles.input} name="name" autoComplete="name" required minLength={2} maxLength={60} placeholder="Your full name" defaultValue={state?.fields?.name} autoFocus />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-password`}>Password</label>
          <PasswordInput id={`${id}-password`} name="password" autoComplete="new-password" placeholder="At least 8 characters" minLength={8} onChange={setPassword} describedBy={`${id}-strength`} />
          <div className={styles.strength} data-score={score} aria-hidden="true"><span /><span /><span /><span /></div>
          <p id={`${id}-strength`} className={styles.hintText} aria-live="polite">{password ? STRENGTH_TEXT[score] : "Use 8 or more characters. A mix of letters, numbers and symbols is strongest."}</p>
        </div>
        <Submit pending={pending}>Create account</Submit>
      </form>
      <Fine />
    </>}
  </Shell>;
}
