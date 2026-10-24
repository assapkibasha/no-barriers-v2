import type { Metadata } from "next";
import ProfileScreen from "@/components/workspace/ProfileScreen";
import { requireUser } from "@/lib/server/auth";
import { courseOverview } from "@/lib/server/learning";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const { completed } = await courseOverview(user.id);
  return <ProfileScreen user={user} completed={completed} />;
}
