import type { ReactNode } from "react";
import ProgressProvider from "@/components/workspace/ProgressProvider";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <ProgressProvider><WorkspaceShell>{children}</WorkspaceShell></ProgressProvider>;
}
