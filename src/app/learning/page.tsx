"use client";

import LearningSystem from "../learning-system";
import { useRouter } from "next/navigation";

export default function LearningPreview() {
  const router = useRouter();
  return <LearningSystem onExit={() => router.push("/")} />;
}
