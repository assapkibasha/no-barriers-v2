import "server-only";
import { MongoClient, type Db, type ObjectId } from "mongodb";
import type { LessonProgress } from "@/lib/learning/rules";

export type Role = "learner" | "admin";
export type Audience = "Learner" | "Educator" | "Family";

export type UserDoc = {
  _id: ObjectId;
  email: string;
  name: string;
  role: Role;
  audience: Audience;
  passwordHash: string;
  createdAt: Date;
  lastActiveAt: Date;
  xp: number;
  streak: { current: number; best: number; lastDay: string | null };
  settings: { leftHanded: boolean };
  failedLogins: number;
  lockedUntil: Date | null;
};

export type SessionDoc = { _id: string; userId: ObjectId; createdAt: Date; expiresAt: Date; userAgent: string };

export type ProgressDoc = {
  _id?: ObjectId;
  userId: ObjectId;
  lessonId: string;
  state: LessonProgress;
  status: "in_progress" | "completed";
  attempts: number;
  mistakes: number;
  startedAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
};

export type EventType = "signup" | "login" | "logout" | "lesson_start" | "answer" | "lesson_complete" | "review" | "settings";
export type EventDoc = { userId: ObjectId; type: EventType; lessonId?: string; data?: Record<string, unknown>; at: Date };

type Cache = { client: MongoClient; db: Promise<Db> };
const globalCache = globalThis as unknown as { __nbMongo?: Cache };

/** One pooled client per server process (also across hot reloads in development). */
export function getDb(): Promise<Db> {
  if (globalCache.__nbMongo) return globalCache.__nbMongo.db;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured. Add it to .env.local.");
  const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 8000, appName: "no-barriers" });
  const db = client.connect().then(async c => {
    const db = c.db(process.env.MONGODB_DB || "no_barriers");
    await ensureIndexes(db);
    return db;
  });
  db.catch(() => { delete globalCache.__nbMongo; });
  globalCache.__nbMongo = { client, db };
  return db;
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection<UserDoc>("users").createIndexes([{ key: { email: 1 }, unique: true }, { key: { lastActiveAt: -1 } }, { key: { createdAt: -1 } }]),
    db.collection<SessionDoc>("sessions").createIndexes([{ key: { expiresAt: 1 }, expireAfterSeconds: 0 }, { key: { userId: 1 } }]),
    db.collection<ProgressDoc>("progress").createIndexes([{ key: { userId: 1, lessonId: 1 }, unique: true }, { key: { lessonId: 1, status: 1 } }]),
    db.collection<EventDoc>("events").createIndexes([{ key: { userId: 1, at: -1 } }, { key: { at: 1 }, expireAfterSeconds: 60 * 60 * 24 * 400 }]),
  ]);
}

export const collections = async () => {
  const db = await getDb();
  return {
    users: db.collection<UserDoc>("users"),
    sessions: db.collection<SessionDoc>("sessions"),
    progress: db.collection<ProgressDoc>("progress"),
    events: db.collection<EventDoc>("events"),
  };
};

export async function logEvent(event: Omit<EventDoc, "at">) {
  const { events } = await collections();
  await events.insertOne({ ...event, at: new Date() });
}
