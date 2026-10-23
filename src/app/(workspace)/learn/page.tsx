import type { Metadata } from "next";
import Dashboard from "@/components/workspace/Dashboard";

export const metadata: Metadata = { title: "My learning" };

export default function LearnPage() {
  return <Dashboard />;
}
