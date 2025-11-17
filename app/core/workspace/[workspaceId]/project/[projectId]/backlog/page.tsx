"use client";

import { useParams } from "next/navigation";
import { Backlog } from "@/components/features/core/project/backlog";

export default function BacklogPage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  return <Backlog projectId={projectId} />;
}
