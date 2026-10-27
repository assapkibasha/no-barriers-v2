import type { PlayItem } from "./player";

/**
 * Varied greetings and celebrations for the signer, so it does not repeat itself lesson after lesson.
 * Greetings follow the learner's time of day (GOOD MORNING / AFTERNOON / EVENING are in the course).
 */
function timeGreeting(): string {
  const h = new Date().getHours();
  return h >= 5 && h < 12 ? "greet.good-morning" : h >= 12 && h < 18 ? "greet.good-afternoon" : "greet.good-evening";
}

const GREETINGS: (() => PlayItem[])[] = [
  () => ["greet.hello"],
  () => ["greet.hello", "basic.you"],
  () => [timeGreeting()],
  () => ["react.wave"],
  () => ["greet.hello", "greet.how", "basic.you"],
  () => ["react.wave", timeGreeting()],
];

const CELEBRATIONS: PlayItem[][] = [
  ["react.applause"],
  ["react.applause-big"],
  ["react.applause-flutter"],
  ["react.thumbs"],
  ["greet.good", "react.applause"],
  ["react.thumbs", "react.applause-flutter"],
];

/** Pick a random entry, never the same as last time (remembered per browser). */
function pickVaried<T>(key: string, options: T[]): T {
  let last = -1;
  try { last = Number(localStorage.getItem(key) ?? -1); } catch { /* storage unavailable */ }
  let i = Math.floor(Math.random() * options.length);
  if (i === last && options.length > 1) i = (i + 1 + Math.floor(Math.random() * (options.length - 1))) % options.length;
  try { localStorage.setItem(key, String(i)); } catch { /* storage unavailable */ }
  return options[i];
}

export const pickGreeting = () => pickVaried("nb-greeting", GREETINGS)();
export const pickCelebration = () => pickVaried("nb-celebration", CELEBRATIONS);
