'use client'

import { Summary } from '@/components/features/core/project/summary'
import { mockProjects } from '@/lib/mock-data'

export default function SummaryPage() {
  const project = mockProjects[0]

  return <Summary project={project} />
}
