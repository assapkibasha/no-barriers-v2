"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import type { Audience } from "@/lib/audiences";

/** Preview only: no account is created and any credentials open the learner workspace (see issue #4). */
export default function AuthForm({ mode, audience = "Learner" }: { mode: "login" | "register"; audience?: Audience }) {
  const router = useRouter();
  const [passwordError, setPasswordError] = useState("");
  const register = mode === "register";

  return <div className="site-version site-version--1"><main className="auth-page">
    <div className="auth-visual"><strong>no barriers</strong><div className="auth-visual__copy"><h1>{register ? "Start with one sign." : "Welcome back."}</h1><p>Build a new way to connect, one lesson at a time.</p></div><div className="auth-visual__footer">Rwandan Sign Language</div></div>
    <div className="auth-form-wrap"><Link className="auth-back" href="/"><IconArrowLeft size={18} />Back to home</Link><div className="auth-form"><h1>{register ? "Create your account" : "Sign in"}</h1><p>Local preview · Account authentication is not connected yet.{register ? ` Joining as ${audience.toLowerCase()}.` : ""}</p>
    <form onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); if (register && data.get("password") !== data.get("confirm")) { setPasswordError("Passwords do not match. Please try again."); return; } setPasswordError(""); router.push("/learn"); }}>
      {register && <label>Full name<input name="name" autoComplete="name" required placeholder="Your full name" /></label>}
      <label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
      <label>Password<input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} required minLength={8} placeholder="At least 8 characters" /></label>
      {register && <label>Confirm password<input name="confirm" type="password" autoComplete="new-password" required minLength={8} placeholder="Repeat your password" /></label>}
      {passwordError && <p role="alert">{passwordError}</p>}
      <button className="button button--teal auth-submit" type="submit">{register ? "Create account" : "Sign in"}<IconArrowRight size={18} /></button>
    </form>
    <Link className="google-button" style={{ marginTop: 16 }} href="/learn">Explore without an account</Link>
    <p className="auth-switch">{register ? "Already have an account?" : "New to No Barriers?"} <Link href={register ? "/login" : "/register"}>{register ? "Sign in" : "Create an account"}</Link></p>
    </div></div>
  </main></div>;
}
