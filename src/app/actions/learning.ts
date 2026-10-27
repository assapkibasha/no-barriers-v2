"use server";

import { ObjectId } from "mongodb";
import { getLesson } from "@/lib/course/exercises";
import { isLessonComplete, recordAnimation, restoreHearts, startLesson, submitAnswer, type LessonProgress } from "@/lib/learning/rules";
import { getCurrentUser } from "@/lib/server/auth";
import { collections, logEvent } from "@/lib/server/db";
import { isUnlocked, touchStreak, XP_LESSON_BONUS, XP_PER_ANSWER } from "@/lib/server/learning";

export type LessonSync = { state: LessonProgress; completed: boolean; xpGained?: number; error?: string; /** Completed by this call (show the completion screen). */ justCompleted?: boolean };

async function context(lessonId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Please sign in again to continue.");
  const userId = new ObjectId(user.id);
  const { definition } = getLesson(lessonId);
  const { progress } = await collections();
  const completed = new Set((await progress.find({ userId, status: "completed" }, { projection: { lessonId: 1 } }).toArray()).map(d => d.lessonId));
  if (!isUnlocked(lessonId, completed)) throw new Error("Finish the previous lesson to unlock this one.");
  let doc = await progress.findOne({ userId, lessonId });
  // Content changed since the learner started: begin a fresh attempt but keep the completion record.
  if (doc && doc.state.lessonVersion !== definition.version) doc = { ...doc, state: startLesson(definition) };
  return { userId, definition, progress, doc };
}

const fail = (error: unknown, state?: LessonProgress): LessonSync => ({ state: state!, completed: false, error: error instanceof Error ? error.message : "Something went wrong. Please try again." });

/** Open (or resume) a lesson. */
export async function openLesson(lessonId: string): Promise<LessonSync> {
  try {
    const { userId, definition, progress, doc } = await context(lessonId);
    if (doc) {
      // A completed lesson can be practised again from a fresh state.
      if (doc.status === "completed") return { state: startLesson(definition), completed: true };
      // Work already done but never recorded (e.g. an older rule required every question's signing to
      // finish playing): record the completion now so the learner is not stuck.
      if (isLessonComplete(definition, doc.state)) return { ...(await save(userId, lessonId, doc.state, false)), justCompleted: true };
      return { state: doc.state, completed: false };
    }
    const now = new Date();
    const state = startLesson(definition);
    await progress.updateOne({ userId, lessonId }, { $setOnInsert: { userId, lessonId, state, status: "in_progress", attempts: 1, mistakes: 0, startedAt: now, updatedAt: now, completedAt: null } }, { upsert: true });
    await logEvent({ userId, type: "lesson_start", lessonId });
    return { state, completed: false };
  } catch (error) { return fail(error); }
}

async function save(userId: ObjectId, lessonId: string, state: LessonProgress, completedBefore: boolean, extra: { mistake?: boolean; xp?: number } = {}): Promise<LessonSync> {
  const { definition } = getLesson(lessonId);
  const { progress, users } = await collections();
  const done = isLessonComplete(definition, state);
  const firstCompletion = done && !completedBefore;
  const xpGained = (extra.xp ?? 0) + (firstCompletion ? XP_LESSON_BONUS : 0);
  if (!completedBefore) {
    await progress.updateOne({ userId, lessonId }, {
      $set: { state, updatedAt: new Date(), ...(done ? { status: "completed" as const, completedAt: new Date() } : {}) },
      $inc: { mistakes: extra.mistake ? 1 : 0 },
    });
  }
  if (xpGained) await users.updateOne({ _id: userId }, { $inc: { xp: xpGained } });
  if (firstCompletion) {
    await touchStreak(userId);
    await logEvent({ userId, type: "lesson_complete", lessonId, data: { hearts: state.hearts, xp: state.xp } });
  }
  return { state, completed: done || completedBefore, xpGained };
}

/** The learner finished watching an animation (a new sign, or a question's signing). */
export async function markWatched(lessonId: string, state: LessonProgress, animationId: string): Promise<LessonSync> {
  try {
    const { userId, definition, doc } = await context(lessonId);
    const completedBefore = doc?.status === "completed";
    // Completed lessons are practised locally from the client's state; others always use the stored state.
    const base = completedBefore ? state : doc?.state ?? startLesson(definition);
    return await save(userId, lessonId, recordAnimation(definition, base, animationId), completedBefore);
  } catch (error) { return fail(error, state); }
}

export async function answerQuestion(lessonId: string, state: LessonProgress, input: { submissionId: string; questionId: string; optionId: string }): Promise<LessonSync & { correct: boolean; correctOptionId: string }> {
  try {
    const { userId, definition, doc } = await context(lessonId);
    const completedBefore = doc?.status === "completed";
    const base = completedBefore ? state : doc?.state ?? startLesson(definition);
    const correctOptionId = definition.questions.find(q => q.id === input.questionId)?.correctOptionId ?? "";
    const correct = input.optionId === correctOptionId;
    const firstTime = correct && !base.correctQuestions.includes(input.questionId) && !completedBefore;
    const next = submitAnswer(definition, base, input, completedBefore ? 0 : XP_PER_ANSWER);
    await logEvent({ userId, type: "answer", lessonId, data: { questionId: input.questionId, correct } });
    const result = await save(userId, lessonId, next, completedBefore, { mistake: !correct && !completedBefore, xp: firstTime ? XP_PER_ANSWER : 0 });
    return { ...result, correct, correctOptionId };
  } catch (error) { return { ...fail(error, state), correct: false, correctOptionId: "" }; }
}

/** After reviewing the missed signs, refill the hearts and continue. */
export async function finishReview(lessonId: string, state: LessonProgress): Promise<LessonSync> {
  try {
    const { userId, doc } = await context(lessonId);
    const completedBefore = doc?.status === "completed";
    const base = completedBefore ? state : doc!.state;
    const next = restoreHearts(base);
    if (!completedBefore) {
      const { progress } = await collections();
      await progress.updateOne({ userId, lessonId }, { $inc: { attempts: 1 } });
      await logEvent({ userId, type: "review", lessonId });
    }
    return await save(userId, lessonId, next, completedBefore);
  } catch (error) { return fail(error, state); }
}

export async function setLeftHanded(leftHanded: boolean) {
  const user = await getCurrentUser();
  if (!user) return;
  const { users } = await collections();
  await users.updateOne({ _id: new ObjectId(user.id) }, { $set: { "settings.leftHanded": leftHanded } });
  await logEvent({ userId: new ObjectId(user.id), type: "settings", data: { leftHanded } });
}
