import { redirect } from "next/navigation";

/** The old local preview now lives at /learn with real accounts. */
export default function LearningPreview() {
  redirect("/learn");
}
