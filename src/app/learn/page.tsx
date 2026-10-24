import LearningSystem from "../learning-system";
import { requireUser } from "@/lib/server/auth";
import { courseOverview } from "@/lib/server/learning";

export const metadata = { title: "My learning | No Barriers" };

export default async function LearnPage() {
  const user = await requireUser();
  return <LearningSystem user={user} overview={await courseOverview(user.id)} />;
}
