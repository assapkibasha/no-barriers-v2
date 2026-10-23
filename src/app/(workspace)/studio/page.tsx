import type { Metadata } from "next";
import StudioScreen from "@/components/workspace/StudioScreen";

export const metadata: Metadata = { title: "Course studio preview" };

export default function StudioPage() {
  return <StudioScreen />;
}
