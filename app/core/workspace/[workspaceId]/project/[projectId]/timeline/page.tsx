'use client'

import { Timeline } from '@/components/features/core/project/timeline'
import { mockProjects } from '@/lib/mock-data'

export default function TimelinePage() {
  const project = mockProjects[0]

  return <Timeline project={project} />
}
