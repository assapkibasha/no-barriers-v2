import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getCurrentUser()) redirect("/learn");
  const email = (await searchParams).email;
  return <LoginForm email={typeof email === "string" ? email : ""} />;
}
