'use client'

import { Sprints } from '@/components/features/core/project/sprints'
import { mockProjects } from '@/lib/mock-data'

export default function SprintsPage() {
  const project = mockProjects[0]

  return <Sprints project={project} />
}
