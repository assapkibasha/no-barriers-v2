import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth";
import { LoginForm } from "../AuthForm";

export const metadata = { title: "Sign in | No Barriers" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getCurrentUser()) redirect("/learn");
  const email = (await searchParams).email;
  return <LoginForm email={typeof email === "string" ? email : ""} />;
}
