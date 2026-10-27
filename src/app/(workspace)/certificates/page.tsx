import type { Metadata } from "next";
import { CertificatesPanel } from "@/components/workspace/AccountPanels";
import { requireUser } from "@/lib/server/auth";
import { courseOverview } from "@/lib/server/learning";

export const metadata: Metadata = { title: "Certificates" };

export default async function CertificatesPage() {
  const user = await requireUser();
  return <CertificatesPanel user={user} overview={await courseOverview(user.id)} />;
}
