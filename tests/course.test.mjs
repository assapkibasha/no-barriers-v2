import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ALL_LESSONS, isReady } from '../src/lib/course/curriculum.ts';
import { buildLesson } from '../src/lib/course/exercises.ts';
import { LEXICON } from '../src/lib/course/lexicon.ts';
import { HANDSHAPES } from '../src/lib/signing/handshapes.ts';
import { numberSigns } from '../src/lib/signing/signs/numbers.ts';

test('every sign a lesson uses exists, including compound parts and phrases', () => {
  for (const lesson of ALL_LESSONS) {
    for (const id of [...(lesson.signs ?? []), ...(lesson.phrases ?? []).flatMap(p => p.play).filter(p => !p.startsWith('spell:'))]) assert.ok(LEXICON.has(id), `${lesson.id} uses unknown sign ${id}`);
  }
  for (const sign of LEXICON.values()) for (const part of sign.seq ?? []) assert.ok(LEXICON.has(part), `${sign.id} uses unknown sign ${part}`);
});

test('every motion uses known handshapes and has increasing key times', () => {
  for (const sign of LEXICON.values()) for (const keys of [sign.r, sign.l].filter(Boolean)) {
    keys.forEach((k, i) => {
      if (k.hs) assert.ok(HANDSHAPES[k.hs], `${sign.id} uses unknown handshape ${k.hs}`);
      if (i) assert.ok(k.t > keys[i - 1].t, `${sign.id} key ${i} is not after the previous key`);
    });
  }
});

test('every ready lesson builds with valid, deterministic questions', () => {
  const ready = ALL_LESSONS.filter(isReady);
  assert.ok(ready.length >= 30);
  for (const lesson of ready) {
    const a = buildLesson(lesson.id), b = buildLesson(lesson.id);
    assert.deepEqual(a.answers, b.answers, `${lesson.id} is not deterministic`);
    assert.equal(new Set(a.definition.requiredAnimations).size, a.definition.requiredAnimations.length, `${lesson.id} repeats an animation`);
    for (const q of a.plan.steps.filter(s => s.kind === 'question')) {
      assert.ok(q.options.length >= 2, `${q.id} has too few options`);
      assert.ok(q.options.some(o => o.id === a.answers[q.id]), `${q.id} answer is not an option`);
      assert.equal(new Set(q.options.map(o => o.label)).size, q.options.length, `${q.id} repeats an option`);
    }
  }
});

test('numbers follow the manual: 10 + digit for teens, digits above, THOUSAND for thousands', () => {
  assert.deepEqual(numberSigns(7), ['num.7']);
  assert.deepEqual(numberSigns(13), ['num.10', 'num.3']);
  assert.deepEqual(numberSigns(20), ['num.2', 'num.0']);
  assert.deepEqual(numberSigns(1000), ['num.1', 'num.thousand']);
  assert.deepEqual(numberSigns(10000), ['num.10', 'num.thousand']);
  assert.deepEqual(numberSigns(1500), ['num.1', 'num.thousand', 'num.5', 'num.0', 'num.0']);
});
