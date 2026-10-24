import "server-only";
import { ObjectId } from "mongodb";
import { ALL_LESSONS, COURSE, isReady } from "@/lib/course/curriculum";
import { collections, type ProgressDoc } from "./db";

export const XP_PER_ANSWER = 10;
export const XP_LESSON_BONUS = 20;

const kigaliDay = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kigali" }).format(d);

/** Ready lessons in course order. A lesson unlocks when the previous ready lesson is complete. */
export const READY_ORDER = ALL_LESSONS.filter(isReady).map(l => l.id);

export function isUnlocked(lessonId: string, completed: Set<string>) {
  const i = READY_ORDER.indexOf(lessonId);
  return i === 0 || (i > 0 && (completed.has(READY_ORDER[i - 1]) || completed.has(lessonId)));
}

export type LessonStatus = "completed" | "in_progress" | "available" | "locked" | "coming_soon";
export type CourseOverview = {
  units: { id: string; level: string; title: string; summary: string; lessons: { id: string; title: string; goal: string; status: LessonStatus; hearts?: number }[] }[];
  completed: number;
  total: number;
  next: string | null;
};

export async function courseOverview(userId: string): Promise<CourseOverview> {
  const { progress } = await collections();
  const docs = await progress.find({ userId: new ObjectId(userId) }, { projection: { lessonId: 1, status: 1, "state.hearts": 1 } }).toArray();
  const byLesson = new Map(docs.map(d => [d.lessonId, d]));
  const completed = new Set(docs.filter(d => d.status === "completed").map(d => d.lessonId));
  const status = (id: string, ready: boolean): LessonStatus => {
    if (!ready) return "coming_soon";
    if (completed.has(id)) return "completed";
    if (!isUnlocked(id, completed)) return "locked";
    return byLesson.has(id) ? "in_progress" : "available";
  };
  return {
    units: COURSE.map(u => ({ id: u.id, level: u.level, title: u.title, summary: u.summary, lessons: u.lessons.map(l => ({ id: l.id, title: l.title, goal: l.goal, status: status(l.id, isReady(l)), hearts: byLesson.get(l.id)?.state.hearts })) })),
    completed: completed.size,
    total: READY_ORDER.length,
    next: READY_ORDER.find(id => !completed.has(id) && isUnlocked(id, completed)) ?? null,
  };
}

/** Daily learning streak, counted in Rwanda time. */
export async function touchStreak(userId: ObjectId) {
  const { users } = await collections();
  const user = await users.findOne({ _id: userId }, { projection: { streak: 1 } });
  if (!user) return;
  const today = kigaliDay();
  if (user.streak.lastDay === today) return;
  const yesterday = kigaliDay(new Date(Date.now() - 864e5));
  const current = user.streak.lastDay === yesterday ? user.streak.current + 1 : 1;
  await users.updateOne({ _id: userId }, { $set: { streak: { current, best: Math.max(current, user.streak.best), lastDay: today } } });
}

export type ProgressSummary = Pick<ProgressDoc, "lessonId" | "status" | "attempts" | "mistakes" | "updatedAt" | "completedAt"> & { hearts: number; xp: number };
