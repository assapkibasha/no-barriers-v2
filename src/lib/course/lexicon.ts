import type { SignDef } from "../signing/types";
import abc from "../signing/signs/abc.ts";
import numbers from "../signing/signs/numbers.ts";
import greetings from "../signing/signs/greetings.ts";
import basic from "../signing/signs/basic.ts";
import time from "../signing/signs/time.ts";
import family from "../signing/signs/family.ts";
import food from "../signing/signs/food.ts";
import clothes from "../signing/signs/clothes.ts";

/** Every animated sign, by id. Plain data: safe to use on the server without three.js. */
export const LEXICON = new Map<string, SignDef>([abc, numbers, greetings, basic, time, family, food, clothes].flat().map(s => [s.id, s]));

export function gloss(id: string): string {
  const def = LEXICON.get(id);
  if (!def) throw new Error(`Sign "${id}" is not in the lexicon.`);
  return def.gloss;
}
