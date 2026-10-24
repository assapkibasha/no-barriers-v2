"use server";

import { redirect } from "next/navigation";
import { MongoServerError } from "mongodb";
import { collections, logEvent, type Audience } from "@/lib/server/db";
import { createSession, destroySession, hashPassword, isBootstrapAdmin, loginLimits, normalizeEmail, verifyPassword } from "@/lib/server/auth";

export type AuthState = { error?: string; fields?: Record<string, string> } | undefined;

const AUDIENCES: Audience[] = ["Learner", "Educator", "Family"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

export async function signUp(_: AuthState, data: FormData): Promise<AuthState> {
  const name = text(data, "name"), email = normalizeEmail(text(data, "email"));
  const password = String(data.get("password") ?? ""), confirm = String(data.get("confirm") ?? "");
  const audience = AUDIENCES.includes(text(data, "audience") as Audience) ? (text(data, "audience") as Audience) : "Learner";
  const fields = { name, email, audience };
  if (name.length < 2 || name.length > 60) return { error: "Enter your name (2 to 60 characters).", fields };
  if (!EMAIL.test(email) || email.length > 200) return { error: "Enter a valid email address.", fields };
  if (password.length < 8 || password.length > 200) return { error: "Use a password of at least 8 characters.", fields };
  if (password !== confirm) return { error: "Passwords do not match. Please try again.", fields };

  try {
    const { users } = await collections();
    const now = new Date();
    const { insertedId } = await users.insertOne({
      email, name, audience, role: isBootstrapAdmin(email) ? "admin" : "learner", passwordHash: await hashPassword(password),
      createdAt: now, lastActiveAt: now, xp: 0, streak: { current: 0, best: 0, lastDay: null }, settings: { leftHanded: false }, failedLogins: 0, lockedUntil: null,
    } as never);
    await createSession(insertedId);
    await logEvent({ userId: insertedId, type: "signup", data: { audience } });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return { error: "An account with this email already exists. Sign in instead.", fields };
    console.error("Sign-up failed", error);
    return { error: "We could not create your account right now. Please try again shortly.", fields };
  }
  redirect("/learn");
}

export async function signIn(_: AuthState, data: FormData): Promise<AuthState> {
  const email = normalizeEmail(text(data, "email")), password = String(data.get("password") ?? "");
  const fields = { email };
  const invalid = { error: "That email and password do not match an account.", fields };
  if (!email || !password) return invalid;
  try {
    const { users } = await collections();
    const user = await users.findOne({ email });
    if (!user) { await hashPassword(password); return invalid; } // equalise timing
    if (user.lockedUntil && user.lockedUntil > new Date()) return { error: `Too many attempts. Try again in ${loginLimits.LOCK_MINUTES} minutes.`, fields };
    if (!(await verifyPassword(password, user.passwordHash))) {
      const failed = user.failedLogins + 1;
      await users.updateOne({ _id: user._id }, { $set: { failedLogins: failed >= loginLimits.MAX_FAILED ? 0 : failed, lockedUntil: failed >= loginLimits.MAX_FAILED ? new Date(Date.now() + loginLimits.LOCK_MINUTES * 60_000) : null } });
      return invalid;
    }
    await users.updateOne({ _id: user._id }, { $set: { failedLogins: 0, lockedUntil: null, lastActiveAt: new Date(), ...(isBootstrapAdmin(email) ? { role: "admin" as const } : {}) } });
    await createSession(user._id);
    await logEvent({ userId: user._id, type: "login" });
  } catch (error) {
    console.error("Sign-in failed", error);
    return { error: "We could not sign you in right now. Please try again shortly.", fields };
  }
  redirect("/learn");
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
