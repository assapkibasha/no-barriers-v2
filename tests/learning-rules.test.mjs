import assert from 'node:assert/strict';
import { test } from 'node:test';
import { startLesson, recordAnimation, submitAnswer, restoreHearts, isLessonComplete } from '../src/lib/learning/rules.ts';

const lesson = { id: 'numbers', version: 1, requiredAnimations: ['one','two'], questions: [{ id: 'q1', animationId: 'one', correctOptionId: 'a' }, { id: 'q2', animationId: 'two', correctOptionId: 'b' }] };
test('completion requires all animations and correct answers', () => {
  let progress = startLesson(lesson);
  progress = submitAnswer(lesson, progress, {submissionId:'1',questionId:'q1',optionId:'a'}, 10);
  progress = submitAnswer(lesson, progress, {submissionId:'2',questionId:'q2',optionId:'b'}, 10);
  assert.equal(isLessonComplete(lesson, progress), false);
  progress = recordAnimation(lesson, progress, 'one');
  assert.equal(isLessonComplete(lesson, progress), false);
  progress = recordAnimation(lesson, progress, 'two');
  assert.equal(isLessonComplete(lesson, progress), true);
});
test('five errors require review; recovery preserves completed work', () => {
  let progress = recordAnimation(lesson, startLesson(lesson), 'one');
  progress = submitAnswer(lesson, progress, {submissionId:'correct',questionId:'q1',optionId:'a'}, 10);
  for (let i=0;i<5;i++) progress = submitAnswer(lesson, progress, {submissionId:`wrong-${i}`,questionId:'q2',optionId:'a'}, 10);
  assert.equal(progress.hearts, 0);
  assert.throws(() => restoreHearts(progress));
  assert.throws(() => submitAnswer(lesson, progress, {submissionId:'blocked',questionId:'q2',optionId:'b'}, 10));
  progress = restoreHearts(recordAnimation(lesson, progress, 'two'));
  assert.equal(progress.hearts, 5);
  assert.deepEqual(progress.correctQuestions, ['q1']);
  assert.deepEqual(progress.watchedAnimations, ['one']);
  assert.equal(progress.xp, 10);
});
test('duplicate uploads and mastered questions cannot farm points', () => {
  const input = {submissionId:'retry',questionId:'q1',optionId:'a'};
  const progress = submitAnswer(lesson, startLesson(lesson), input, 10);
  assert.equal(submitAnswer(lesson, progress, input, 10), progress);
  const replay = submitAnswer(lesson, progress, {...input,submissionId:'another'}, 10);
  assert.equal(replay.xp, 10);
  assert.equal(replay.correctRun, 1);
});
test('unknown animation and changed content cannot award completion', () => {
  assert.throws(() => recordAnimation(lesson, startLesson(lesson), 'unknown'));
  assert.throws(() => isLessonComplete({...lesson,version:2}, startLesson(lesson)));
});
