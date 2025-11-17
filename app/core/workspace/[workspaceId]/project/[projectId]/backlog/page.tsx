'use client'

import { Backlog } from '@/components/features/core/project/backlog'
import { mockProjects } from '@/lib/mock-data'

export default function BacklogPage() {
  const project = mockProjects[0]

  return <Backlog project={project} />
}
