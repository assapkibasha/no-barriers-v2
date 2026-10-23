import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";
import { isAudience } from "@/lib/audiences";

export const metadata: Metadata = { title: "Create your account" };

export default async function RegisterPage(props: PageProps<"/register">) {
  const { role } = await props.searchParams;
  return <AuthForm mode="register" audience={isAudience(role) ? role : "Learner"} />;
}
