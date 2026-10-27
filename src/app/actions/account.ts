"use server";

import { ObjectId } from "mongodb";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/server/auth";
import { collections, logEvent } from "@/lib/server/db";

export type AccountState = { ok?: string; error?: string } | undefined;

export async function updateProfile(_: AccountState, data: FormData): Promise<AccountState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again." };
  const name = String(data.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 60) return { error: "Enter a name between 2 and 60 characters." };
  const { users } = await collections();
  await users.updateOne({ _id: new ObjectId(user.id) }, { $set: { name } });
  await logEvent({ userId: new ObjectId(user.id), type: "settings", data: { name: true } });
  return { ok: "Your name has been updated." };
}

export async function changePassword(_: AccountState, data: FormData): Promise<AccountState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again." };
  const current = String(data.get("current") ?? ""), next = String(data.get("next") ?? "");
  if (next.length < 8 || next.length > 200) return { error: "Use a new password of at least 8 characters." };
  const { users, sessions } = await collections();
  const doc = await users.findOne({ _id: new ObjectId(user.id) });
  if (!doc || !(await verifyPassword(current, doc.passwordHash))) return { error: "Your current password is not correct." };
  await users.updateOne({ _id: doc._id }, { $set: { passwordHash: await hashPassword(next) } });
  // Sign out other devices; this one keeps its session.
  const all = await sessions.find({ userId: doc._id }).sort({ createdAt: -1 }).toArray();
  if (all.length > 1) await sessions.deleteMany({ userId: doc._id, _id: { $nin: [all[0]._id] } });
  await logEvent({ userId: doc._id, type: "settings", data: { password: true } });
  return { ok: "Password changed. Other devices have been signed out." };
}
