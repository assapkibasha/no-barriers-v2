"use client";

import { useRouter } from "next/navigation";
import LandingPage from "./landing";

export default function Home() {
  const router = useRouter();
  return <LandingPage onLogin={() => router.push("/login")} onRegister={(role = "Learner") => router.push(`/register?as=${encodeURIComponent(role)}`)} />;
}
