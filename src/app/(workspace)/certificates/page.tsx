import type { Metadata } from "next";
import CertificatesScreen from "@/components/workspace/CertificatesScreen";
import { requireUser } from "@/lib/server/auth";
import { courseOverview } from "@/lib/server/learning";

export const metadata: Metadata = { title: "Certificates" };

export default async function CertificatesPage() {
  const user = await requireUser();
  return <CertificatesScreen overview={await courseOverview(user.id)} />;
}
