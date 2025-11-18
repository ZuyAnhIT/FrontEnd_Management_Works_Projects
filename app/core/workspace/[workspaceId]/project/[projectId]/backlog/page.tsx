"use client";

import { useParams } from "next/navigation";
import { Backlog } from "@/components/features/core/project/backlog";

export default function BacklogPage() {
  const params = useParams();

  const workspaceId = Number(params.workspaceId);
  const projectId = Number(params.projectId);

  return <Backlog workspaceId={workspaceId} projectId={projectId} />;
}