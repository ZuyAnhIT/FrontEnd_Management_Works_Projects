'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import ProjectCoreSidebar from '@/components/features/core/project/sidebar'
import ProjectNavTabs from '@/components/features/core/project/nav-tabs'
import ProjectHeader from '@/components/features/core/project/header'
import { CreateTaskModal } from '@/components/features/core/project/create-task-modal'
import { CreateSprintModal } from '@/components/features/core/project/create-sprint-modal'

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams() as { projectId: string }

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showSprintModal, setShowSprintModal] = useState(false)

  const projectName = "Project"

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Sidebar */}
      <ProjectCoreSidebar
        projectId={projectId}
        projectName={projectName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCreateTask={() => setShowTaskModal(true)}
        onCreateSprint={() => setShowSprintModal(true)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="shrink-0">
          <ProjectHeader
            projectName={projectName}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            onTaskCreate={() => setShowTaskModal(true)}
            onSprintCreate={() => setShowSprintModal(true)}
          />

          <ProjectNavTabs
            projectId={projectId}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>

      {/* Task Modal */}
      <CreateTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        projectId={Number(projectId)}
        workspaceId={1}    // ⚠ sau này bạn thay bằng real workspaceId
        onCreated={() => {
          console.log("[API] Task created")
          setShowTaskModal(false)
        }}
      />

      {/* Sprint Modal */}
      <CreateSprintModal
        isOpen={showSprintModal}
        onClose={() => setShowSprintModal(false)}
        projectId={Number(projectId)}
        onCreated={() => {
          console.log("[API] Sprint created")
          setShowSprintModal(false)
        }}
      />
    </div>
  )
}
