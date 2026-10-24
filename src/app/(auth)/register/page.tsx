import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth";
import AuthForm from "../AuthForm";

export const metadata = { title: "Create your account | No Barriers" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  if (await getCurrentUser()) redirect("/learn");
  const as = (await searchParams).as;
  return <AuthForm mode="register" audience={typeof as === "string" ? as : undefined} />;
}
