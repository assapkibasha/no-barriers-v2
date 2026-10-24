import { notFound, redirect } from "next/navigation";
import { findLesson, isReady } from "@/lib/course/curriculum";
import { getLesson } from "@/lib/course/exercises";
import { requireUser } from "@/lib/server/auth";
import { courseOverview, READY_ORDER } from "@/lib/server/learning";
import LessonRunner from "./LessonRunner";

export default async function LessonPage({ params }: PageProps<"/learn/[lessonId]">) {
  const { lessonId } = await params;
  const lesson = findLesson(lessonId);
  if (!lesson || !isReady(lesson)) notFound();
  const user = await requireUser();
  const overview = await courseOverview(user.id);
  const status = overview.units.flatMap(u => u.lessons).find(l => l.id === lessonId)?.status;
  if (status === "locked") redirect("/learn");
  const { plan } = getLesson(lessonId);
  return <LessonRunner plan={plan} leftHanded={user.settings.leftHanded} nextLessonId={READY_ORDER[READY_ORDER.indexOf(lessonId) + 1] ?? null} />;
}

export async function generateMetadata({ params }: PageProps<"/learn/[lessonId]">) {
  const lesson = findLesson((await params).lessonId);
  return { title: `${lesson?.title ?? "Lesson"} | No Barriers` };
}
