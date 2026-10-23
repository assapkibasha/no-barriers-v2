import type { Metadata } from "next";
import CertificatesScreen from "@/components/workspace/CertificatesScreen";

export const metadata: Metadata = { title: "Certificates" };

export default function CertificatesPage() {
  return <CertificatesScreen />;
}
