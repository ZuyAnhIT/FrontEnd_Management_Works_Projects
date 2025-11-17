'use client'

import { Dashboard } from '@/components/features/core/project/dashboard'
import { mockProjects } from '@/lib/mock-data'

export default function ProjectDashboard() {
  const project = mockProjects[0]

  return <Dashboard project={project} />
}
