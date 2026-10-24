import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth";
import AuthForm from "../AuthForm";

export const metadata = { title: "Sign in | No Barriers" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/learn");
  return <AuthForm mode="login" />;
}
