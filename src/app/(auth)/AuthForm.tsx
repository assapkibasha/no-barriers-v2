"use client";

import { useActionState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";

const AUDIENCES = ["Learner", "Educator", "Family"] as const;

export default function AuthForm({ mode, audience = "Learner" }: { mode: "login" | "register"; audience?: string }) {
  const register = mode === "register";
  const [state, action, pending] = useActionState<AuthState, FormData>(register ? signUp : signIn, undefined);
  const f = state?.fields ?? {};
  return <div className="site-version site-version--1"><main className="auth-page">
    <div className="auth-visual"><strong>no barriers</strong><div className="auth-visual__copy"><h1>{register ? "Start with one sign." : "Welcome back."}</h1><p>Build a new way to connect, one lesson at a time.</p></div><div className="auth-visual__footer">Rwandan Sign Language</div></div>
    <div className="auth-form-wrap"><Link className="auth-back" href="/"><IconArrowLeft size={18} />Back to home</Link><div className="auth-form">
      <h1>{register ? "Create your account" : "Sign in"}</h1>
      <p>{register ? "Your progress is saved to your account, on any device." : "Continue where you left off."}</p>
      <form action={action} noValidate={false}>
        {register && <label>Full name<input name="name" autoComplete="name" required minLength={2} maxLength={60} placeholder="Your full name" defaultValue={f.name} /></label>}
        <label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" defaultValue={f.email} /></label>
        <label>Password<input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} required minLength={register ? 8 : undefined} placeholder={register ? "At least 8 characters" : "Your password"} /></label>
        {register && <label>Confirm password<input name="confirm" type="password" autoComplete="new-password" required minLength={8} placeholder="Repeat your password" /></label>}
        {register && <label>I am joining as<select name="audience" defaultValue={f.audience ?? audience} className="auth-select">{AUDIENCES.map(a => <option key={a} value={a}>{a === "Family" ? "Family member" : a}</option>)}</select></label>}
        {state?.error && <p role="alert" className="auth-error">{state.error}</p>}
        <button className="button button--teal auth-submit" type="submit" disabled={pending}>{pending ? "Please wait…" : register ? "Create account" : "Sign in"}<IconArrowRight size={18} /></button>
      </form>
      <p className="auth-switch">{register ? "Already have an account?" : "New to No Barriers?"} <Link href={register ? "/login" : "/register"}>{register ? "Sign in" : "Create an account"}</Link></p>
    </div></div>
  </main></div>;
}
