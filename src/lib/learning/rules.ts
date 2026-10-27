/** Backend-ready domain rules. Database writes must apply these atomically. */
export type LessonDefinition = {
  id: string;
  version: number;
  requiredAnimations: string[];
  questions: { id: string; animationId: string; correctOptionId: string }[];
};

export type LessonProgress = {
  lessonId: string;
  lessonVersion: number;
  watchedAnimations: string[];
  correctQuestions: string[];
  hearts: number;
  correctRun: number;
  xp: number;
  missedAnimations: string[];
  reviewedAnimations: string[];
  reviewRequired: boolean;
  processedAnswers: string[];
};

export function startLesson(lesson: LessonDefinition): LessonProgress {
  return { lessonId: lesson.id, lessonVersion: lesson.version, watchedAnimations: [], correctQuestions: [], hearts: 5, correctRun: 0, xp: 0, missedAnimations: [], reviewedAnimations: [], reviewRequired: false, processedAnswers: [] };
}

function validate(lesson: LessonDefinition, progress: LessonProgress) {
  if (progress.lessonId !== lesson.id || progress.lessonVersion !== lesson.version) throw new Error("Lesson content changed. Reload the lesson before continuing.");
}

export function recordAnimation(lesson: LessonDefinition, progress: LessonProgress, animationId: string): LessonProgress {
  validate(lesson, progress);
  // New signs must be watched; a question's own signing may also be (re)watched, e.g. during review.
  if (!lesson.requiredAnimations.includes(animationId) && !lesson.questions.some(q => q.animationId === animationId)) throw new Error("Unknown animation.");
  if (progress.reviewRequired) return { ...progress, reviewedAnimations: [...new Set([...progress.reviewedAnimations, animationId])] };
  return { ...progress, watchedAnimations: [...new Set([...progress.watchedAnimations, animationId])] };
}

/** Called after authenticated server-side validation, never with browser-supplied XP. */
export function submitAnswer(lesson: LessonDefinition, progress: LessonProgress, input: { submissionId: string; questionId: string; optionId: string }, firstCorrectXp: number): LessonProgress {
  validate(lesson, progress);
  if (!input.submissionId || !Number.isSafeInteger(firstCorrectXp) || firstCorrectXp < 0) throw new Error("Invalid answer configuration.");
  if (progress.processedAnswers.includes(input.submissionId)) return progress;
  if (progress.reviewRequired) throw new Error("Review the missed signs before retrying.");
  const question = lesson.questions.find(item => item.id === input.questionId);
  if (!question) throw new Error("Unknown question.");
  const next = { ...progress, processedAnswers: [...progress.processedAnswers, input.submissionId] };
  if (progress.correctQuestions.includes(question.id)) return next;
  if (input.optionId === question.correctOptionId) return { ...next, correctQuestions: [...progress.correctQuestions, question.id], correctRun: progress.correctRun + 1, xp: progress.xp + firstCorrectXp };
  const hearts = Math.max(0, progress.hearts - 1);
  return { ...next, hearts, correctRun: 0, reviewRequired: hearts === 0, reviewedAnimations: hearts === 0 ? [] : progress.reviewedAnimations, missedAnimations: [...new Set([...progress.missedAnimations, question.animationId])] };
}

export function restoreHearts(progress: LessonProgress): LessonProgress {
  if (!progress.reviewRequired) return progress;
  if (!progress.missedAnimations.every(id => progress.reviewedAnimations.includes(id))) throw new Error("Finish reviewing the missed signs first.");
  return { ...progress, hearts: 5, reviewRequired: false, missedAnimations: [], reviewedAnimations: [] };
}

export function isLessonComplete(lesson: LessonDefinition, progress: LessonProgress): boolean {
  validate(lesson, progress);
  return lesson.requiredAnimations.length + lesson.questions.length > 0 && !progress.reviewRequired && lesson.requiredAnimations.every(id => progress.watchedAnimations.includes(id)) && lesson.questions.every(item => progress.correctQuestions.includes(item.id));
}
