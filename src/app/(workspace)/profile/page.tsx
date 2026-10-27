import type { Metadata } from "next";
import { ProfilePanel } from "@/components/workspace/AccountPanels";
import { requireUser } from "@/lib/server/auth";
import { courseOverview } from "@/lib/server/learning";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  return <ProfilePanel user={user} overview={await courseOverview(user.id)} />;
}
