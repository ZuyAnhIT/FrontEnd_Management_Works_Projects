'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import ProjectCoreSidebar from '@/components/features/core/project/sidebar'
import ProjectNavTabs from '@/components/features/core/project/nav-tabs'
import ProjectHeader from '@/components/features/core/project/header'
import { mockProjects, Task, Sprint } from '@/lib/mock-data'
import { CreateTaskModal } from '@/components/features/core/project/create-task-modal'
import { CreateSprintModal } from '@/components/features/core/project/create-sprint-modal'

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams() as { projectId: string }

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showSprintModal, setShowSprintModal] = useState(false)

  const project = mockProjects.find((p) => p.id === projectId)
  const projectName = project?.name || 'Project'

  const handleTaskCreate = (task: Task) => {
    console.log('[v0] Task created:', task)
    setShowTaskModal(false)
  }

  const handleSprintCreate = (sprint: Sprint) => {
    console.log('[v0] Sprint created:', sprint)
    setShowSprintModal(false)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar cố định */}
      <ProjectCoreSidebar
        projectId={projectId}
        projectName={projectName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCreateTask={() => setShowTaskModal(true)}
        onCreateSprint={() => setShowSprintModal(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header cố định */}
        <div className="shrink-0">
          <ProjectHeader
            projectName={projectName}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            onTaskCreate={handleTaskCreate}
            onSprintCreate={handleSprintCreate}
          />

          {/* Nav Tabs */}
          <ProjectNavTabs
            projectId={projectId}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Nội dung scroll riêng */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>

      {/* Task Modal */}
      <CreateTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onCreate={handleTaskCreate}
      />

      {/* Sprint Modal */}
      <CreateSprintModal
        isOpen={showSprintModal}
        onClose={() => setShowSprintModal(false)}
        onCreate={handleSprintCreate}
      />
    </div>
  )
}
