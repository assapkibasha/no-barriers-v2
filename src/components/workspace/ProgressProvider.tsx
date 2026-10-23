"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { curriculum, type Lesson } from "@/lib/curriculum";

type Progress = { completed: number[]; lastLesson: number };
const initialProgress: Progress = { completed: [], lastLesson: 1 };
const progressKey = "no-barriers-learning-preview-v1";
const nameKey = "nb-preview-name";

type ProgressContextValue = {
  ready: boolean;
  storageError: boolean;
  reportStorageError: () => void;
  name: string;
  saveName: (name: string) => boolean;
  completedCount: number;
  percent: number;
  current: Lesson;
  isComplete: (id: number) => boolean;
  isUnlocked: (id: number) => boolean;
  visitLesson: (id: number) => void;
  completeLesson: (id: number) => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("useProgress must be used inside ProgressProvider.");
  return value;
}

/** Browser-local preview progress. Replaced by server-validated progress in Phase 5. */
export default function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [name, setName] = useState("Learner");
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(progressKey) || "null");
        if (saved && Array.isArray(saved.completed)) {
          const completed = curriculum.filter(item => saved.completed.includes(item.id)).map(item => item.id);
          setProgress({ completed, lastLesson: curriculum.some(item => item.id === saved.lastLesson) ? saved.lastLesson : 1 });
        }
        setName(localStorage.getItem(nameKey) || "Learner");
      } catch { setStorageError(true); }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(progressKey, JSON.stringify(progress)); } catch {
      const notify = window.setTimeout(() => setStorageError(true), 0);
      return () => window.clearTimeout(notify);
    }
  }, [progress, ready]);

  const isComplete = (id: number) => progress.completed.includes(id);
  const isUnlocked = (id: number) => id === 1 || isComplete(id - 1) || isComplete(id);
  const current = curriculum.find(item => item.id === progress.lastLesson && isUnlocked(item.id) && !isComplete(item.id)) || curriculum.find(item => !isComplete(item.id) && isUnlocked(item.id)) || curriculum[0];

  const reportStorageError = useCallback(() => setStorageError(true), []);
  const visitLesson = useCallback((id: number) => setProgress(old => old.lastLesson === id ? old : { ...old, lastLesson: id }), []);
  const completeLesson = (id: number) => setProgress(old => ({ completed: Array.from(new Set([...old.completed, id])), lastLesson: Math.min(id + 1, curriculum.length) }));
  const saveName = (next: string) => {
    const value = next.trim() || "Learner";
    setName(value);
    try { localStorage.setItem(nameKey, value); return true; } catch { setStorageError(true); return false; }
  };

  return <ProgressContext.Provider value={{
    ready, storageError, reportStorageError, name, saveName,
    completedCount: progress.completed.length,
    percent: Math.round(progress.completed.length / curriculum.length * 100),
    current, isComplete, isUnlocked, visitLesson, completeLesson,
  }}>{children}</ProgressContext.Provider>;
}
