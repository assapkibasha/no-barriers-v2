import type { Metadata } from "next";
import Dashboard from "@/components/workspace/Dashboard";
import { requireUser } from "@/lib/server/auth";
import { courseOverview } from "@/lib/server/learning";

export const metadata: Metadata = { title: "My learning" };

export default async function LearnPage() {
  const user = await requireUser();
  return <Dashboard name={user.name} overview={await courseOverview(user.id)} />;
}
