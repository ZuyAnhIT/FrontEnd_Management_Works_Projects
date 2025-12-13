'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

// Components
import ProjectCoreSidebar from '@/components/features/core/project/sidebar'
import ProjectNavTabs from '@/components/features/core/project/nav-tabs'
import AdminHeader from '@/components/features/admin/Header' 

// Modals
import { CreateTaskModal } from '@/components/features/core/project/create-task-modal'
import { CreateSprintModal } from '@/components/features/core/project/create-sprint-modal'
import { useToast } from "@/components/ui/ToastProvider"

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast()
  const params = useParams()
  
  const projectId = params.projectId as string
  const workspaceId = Number(params.workspaceId) || 0

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showSprintModal, setShowSprintModal] = useState(false)

  // TODO: Fetch project name from API/Context based on projectId
  const projectName = "Project" 

  return (
    // 1. Main Container: Full viewport height, no body scroll
    <div className="flex h-screen bg-white overflow-hidden font-sans text-slate-900">

      {/* Sidebar (Fixed Left) */}
      <ProjectCoreSidebar
        projectId={projectId}
        projectName={projectName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        // Đã bỏ onCreateTask và onCreateSprint props
      />

      {/* Right Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">

        {/* Header Area (Fixed Top) */}
        <div className="flex-col bg-white border-b border-slate-200 shadow-sm z-20 relative">
          
          {/* ✅ Sử dụng AdminHeader mới */}
          <AdminHeader 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          />
          
          <ProjectNavTabs
            projectId={projectId}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            // Nếu bạn muốn nút Create Task/Sprint nằm ở Tab này, bạn có thể truyền hàm xuống đây
            // onCreateTask={() => setShowTaskModal(true)} 
          />
        </div>

        {/* Main Content Area (Scrollable) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar">
          {children}
        </main>
      </div>

      {/* --- MODALS --- */}
      {/* Vẫn giữ Modal ở đây để có thể kích hoạt từ các thành phần con khác nếu cần */}
      <CreateTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        projectId={Number(projectId)}
        workspaceId={workspaceId}
        onCreated={() => {
          showToast("Task created successfully", "success")
          setShowTaskModal(false)
        }}
      />

      <CreateSprintModal
        isOpen={showSprintModal}
        onClose={() => setShowSprintModal(false)}
        projectId={Number(projectId)}
        onCreated={() => {
          showToast("Sprint created successfully", "success")
          setShowSprintModal(false)
        }}
      />
    </div>
  )
}