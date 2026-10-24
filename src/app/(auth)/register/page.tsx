import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { isAudience } from "@/lib/audiences";
import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Create your account" };

export default async function RegisterPage(props: PageProps<"/register">) {
  if (await getCurrentUser()) redirect("/learn");
  const { role } = await props.searchParams;
  return <AuthForm mode="register" audience={isAudience(role) ? role : "Learner"} />;
}
