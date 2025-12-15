"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

// Components
import ProjectCoreSidebar from "@/components/features/core/project/SideBars";
import ProjectNavTabs from "@/components/features/core/project/NavTabs";
import AdminHeader from "@/components/features/admin/Header";

// Modals
// Giữ nguyên import từ các path đã cung cấp
import CreateTaskModal from "@/components/features/core/task/CreateTaskModal";
import CreateSprintModal from "@/components/features/core/sprint/CreateSprintModal";

import { useToast } from "@/components/ui/ToastProvider";

// =================================================================
// 1. MAIN COMPONENT
// =================================================================

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showToast } = useToast();
  const params = useParams();

  // Lấy ID và chuyển đổi (giữ nguyên logic lấy từ params)
  const projectId = Number(params.projectId);
  const workspaceId = Number(params.workspaceId);

  // State UI
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);

  // TODO: Fetch project name from API/Context based on projectId
  const projectName = "Project";

  // Helper: Hàm thành công cho Modals
  const handleTaskCreated = () => {
    showToast("Task created successfully", "success");
    setShowTaskModal(false);
  };

  const handleSprintCreated = () => {
    showToast("Sprint created successfully", "success");
    setShowSprintModal(false);
  };

  return (
    // 1. Main Container: Full viewport height, no body scroll
    <div className="flex h-screen bg-white overflow-hidden font-sans text-slate-900">
      {/* Sidebar (Fixed Left) */}
      <ProjectCoreSidebar
        projectId={projectId.toString()}
        projectName={projectName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Right Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Header Area (Fixed Top) */}
        <div className="flex-col bg-white border-b border-slate-200 shadow-sm z-20 relative">
          {/* ✅ AdminHeader (Phần trên cùng) */}
          <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

          {/* ✅ ProjectNavTabs */}
          <ProjectNavTabs
            projectId={projectId.toString()}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            // Nếu cần: onCreateTask={() => setShowTaskModal(true)}
          />
        </div>

        {/* Main Content Area (Scrollable) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar">
          {children}
        </main>
      </div>

      {/* --- MODALS --- */}
      {/* Giữ Modal ở đây để chúng có thể được kích hoạt từ các component khác */}

      <CreateTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        projectId={projectId}
        workspaceId={workspaceId}
        // Giả định CreateTaskModal nhận đủ props cần thiết
        companyId={0} // Cần lấy companyId từ context/props
        members={[]} // Cần truyền members nếu modal cần
        onSuccess={handleTaskCreated}
      />

      <CreateSprintModal
        isOpen={showSprintModal}
        onClose={() => setShowSprintModal(false)}
        projectId={projectId}
        onSuccess={handleSprintCreated}
      />
    </div>
  );
}
