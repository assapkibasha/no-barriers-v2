"use client";

import { useState } from "react";
import LandingPage, { type Audience } from "./landing";
import LearningSystem from "./learning-system";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

export default function Home() {
  const [view, setView] = useState<"landing" | "login" | "register" | "learning">("landing");
  const [audience, setAudience] = useState<Audience>("Learner");
  const [passwordError, setPasswordError] = useState("");

  if (view === "learning") return <LearningSystem onExit={() => setView("landing")} />;
  if (view === "landing") return <LandingPage onLogin={() => setView("login")} onRegister={(role = "Learner") => { setAudience(role); setView("register"); }} />;
  const register = view === "register";
  return <div className="site-version site-version--1"><main className="auth-page">
    <div className="auth-visual"><strong>no barriers</strong><div className="auth-visual__copy"><h1>{register ? "Start with one sign." : "Welcome back."}</h1><p>Build a new way to connect, one lesson at a time.</p></div><div className="auth-visual__footer">Rwandan Sign Language</div></div>
    <div className="auth-form-wrap"><button className="auth-back" onClick={() => setView("landing")}><IconArrowLeft size={18} />Back to home</button><div className="auth-form"><h1>{register ? "Create your account" : "Sign in"}</h1><p>Local preview · Account authentication is not connected yet.{register ? ` Joining as ${audience.toLowerCase()}.` : ""}</p>
    <form onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); if (register && data.get("password") !== data.get("confirm")) { setPasswordError("Passwords do not match. Please try again."); return; } setPasswordError(""); setView("learning"); }}>
      {register && <label>Full name<input name="name" autoComplete="name" required placeholder="Your full name" /></label>}
      <label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
      <label>Password<input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} required minLength={8} placeholder="At least 8 characters" /></label>
      {register && <label>Confirm password<input name="confirm" type="password" autoComplete="new-password" required minLength={8} placeholder="Repeat your password" /></label>}
      {passwordError && <p role="alert">{passwordError}</p>}
      <button className="button button--teal auth-submit" type="submit">Enter learner preview<IconArrowRight size={18} /></button>
    </form>
    <button className="google-button" style={{ marginTop: 16 }} onClick={() => setView("learning")}>Explore without an account</button>
    <p className="auth-switch">{register ? "Already have an account?" : "New to No Barriers?"} <button onClick={() => { setPasswordError(""); setView(register ? "login" : "register"); }}>{register ? "Sign in" : "Create an account"}</button></p>
    </div></div>
  </main></div>;
}
