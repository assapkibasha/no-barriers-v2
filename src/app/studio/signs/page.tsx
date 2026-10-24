import { requireAdmin } from "@/lib/server/auth";
import SignStudio from "./SignStudio";

export const metadata = { title: "Sign studio | No Barriers" };

/** Team tool for previewing every sign. Open in development; administrators only in production. */
export default async function Page() {
  if (process.env.NODE_ENV === "production") await requireAdmin();
  return <SignStudio />;
}
