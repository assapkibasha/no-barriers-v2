import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LessonView from "@/components/workspace/LessonView";
import { curriculum, lessonBySlug } from "@/lib/curriculum";

export const dynamicParams = false;

export function generateStaticParams() {
  return curriculum.map(lesson => ({ lessonSlug: lesson.slug }));
}

export async function generateMetadata(props: PageProps<"/learn/[lessonSlug]">): Promise<Metadata> {
  const { lessonSlug } = await props.params;
  return { title: lessonBySlug(lessonSlug)?.title ?? "Lesson" };
}

export default async function LessonPage(props: PageProps<"/learn/[lessonSlug]">) {
  const { lessonSlug } = await props.params;
  const lesson = lessonBySlug(lessonSlug);
  if (!lesson) notFound();
  // Keyed so answer state resets when moving between lessons.
  return <LessonView key={lesson.id} lesson={lesson} />;
}
