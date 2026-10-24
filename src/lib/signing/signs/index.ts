import type { SignDef } from "../types";

/** Sign ids are "<topic>.<name>"; each topic is a separate chunk loaded on demand. */
const TOPICS: Record<string, () => Promise<{ default: SignDef[] }>> = {
  abc: () => import("./abc"),
  num: () => import("./numbers"),
  greet: () => import("./greetings"),
  time: () => import("./time"),
  basic: () => import("./basic"),
  family: () => import("./family"),
  food: () => import("./food"),
  clothes: () => import("./clothes"),
  color: () => import("./clothes"),
};

export const signTopics = Object.keys(TOPICS);

export async function loadTopic(topic: string): Promise<SignDef[]> {
  const load = TOPICS[topic];
  if (!load) throw new Error(`Unknown sign topic "${topic}".`);
  return (await load()).default;
}

export async function loadSigns(ids: string[]): Promise<Map<string, SignDef>> {
  const topics = [...new Set(ids.map(id => id.split(".")[0]))];
  const lists = await Promise.all(topics.map(loadTopic));
  const map = new Map<string, SignDef>();
  for (const list of lists) for (const def of list) map.set(def.id, def);
  return map;
}
