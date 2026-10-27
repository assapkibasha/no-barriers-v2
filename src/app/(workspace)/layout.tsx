import type { ReactNode } from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import { requireUser } from "@/lib/server/auth";
import { courseOverview } from "@/lib/server/learning";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const { completed, total } = await courseOverview(user.id);
  return <WorkspaceShell user={user} completed={completed} total={total}>{children}</WorkspaceShell>;
}
