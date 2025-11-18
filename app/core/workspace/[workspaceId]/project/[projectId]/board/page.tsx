'use client'

import Board from '@/components/features/core/project/board'
import { mockProjects } from '@/lib/mock-data'

export default function BoardPage() {
  const project = mockProjects[0]
  return <Board project={project} />
}
