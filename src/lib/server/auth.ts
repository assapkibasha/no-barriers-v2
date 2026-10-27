import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { collections, type UserDoc } from "./db";

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number, options: { N: number; r: number; p: number }) => Promise<Buffer>;
const SCRYPT = { N: 16384, r: 8, p: 1 };
const SESSION_COOKIE = "nb_session";
const SESSION_DAYS = 30;
const MAX_FAILED = 8;
const LOCK_MINUTES = 15;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password.normalize("NFKC"), salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, n, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const key = await scryptAsync(password.normalize("NFKC"), Buffer.from(salt, "base64"), expected.length, { ...SCRYPT, N: Number(n) });
  return timingSafeEqual(key, expected);
}

const tokenHash = (token: string) => createHash("sha256").update(token).digest("base64url");
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function createSession(userId: UserDoc["_id"]) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  const { sessions } = await collections();
  await sessions.insertOne({ _id: tokenHash(token), userId, createdAt: new Date(), expiresAt, userAgent: ((await headers()).get("user-agent") ?? "").slice(0, 200) });
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await (await collections()).sessions.deleteOne({ _id: tokenHash(token) });
  jar.delete(SESSION_COOKIE);
}

export type SessionUser = Pick<UserDoc, "email" | "name" | "role" | "audience" | "xp" | "streak" | "settings"> & { id: string; /** ISO date the account was created. */ createdAt: string };

/** The signed-in user for this request, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { sessions, users } = await collections();
  const session = await sessions.findOne({ _id: tokenHash(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await users.findOne({ _id: session.userId }, { projection: { passwordHash: 0 } });
  if (!user) return null;
  // Monitoring: record activity at most every few minutes.
  if (Date.now() - user.lastActiveAt.getTime() > 5 * 60_000) void users.updateOne({ _id: user._id }, { $set: { lastActiveAt: new Date() } });
  return { id: user._id.toHexString(), email: user.email, name: user.name, role: user.role, audience: user.audience, xp: user.xp, streak: user.streak, settings: user.settings, createdAt: user.createdAt.toISOString() };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/learn");
  return user;
}

/** Emails listed in ADMIN_EMAILS become administrators when they sign up or sign in. */
export const isBootstrapAdmin = (email: string) => (process.env.ADMIN_EMAILS ?? "").split(",").map(normalizeEmail).filter(Boolean).includes(normalizeEmail(email));

export const loginLimits = { MAX_FAILED, LOCK_MINUTES };
