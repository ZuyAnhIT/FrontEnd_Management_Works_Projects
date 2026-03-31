"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Utils)
// =============================================================================

import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";

// Internal Components
import ProjectCoreSidebar from "@/components/features/core/project/SideBars";
import ProjectNavTabs from "@/components/features/core/project/NavTabs";
import AdminHeader from "@/components/features/admin/Header";

// Modals
import CreateTaskModal from "@/components/features/core/task/CreateTaskModal";
import CreateSprintModal from "@/components/features/core/sprint/CreateSprintModal";

// Context & Utils
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & TYPES
// =============================================================================

interface ProjectLayoutProps {
    children: React.ReactNode;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Project Layout Wrapper.
 * Cung cap bo khung dieu huong vung chac cho phan he du an.
 * Bao gom Sidebar co dinh, Header he thong va Thanh tab dieu huong du an.
 */
export default function ProjectLayout({ children }: ProjectLayoutProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS, CONTEXT & PARAMS
    // ---------------------------------------------------------------------------
    
    const { showToast } = useToast();
    const { activeCompany } = useAuth();
    const params = useParams();

    // Chuyen doi tham so URL sang kieu so an toan
    const projectId = useMemo(() => Number(params.projectId), [params.projectId]);
    const workspaceId = useMemo(() => Number(params.workspaceId), [params.workspaceId]);
    const companyId = activeCompany?.companyId || 0;

    // ---------------------------------------------------------------------------
    // 5. STATE MANAGEMENT (UI)
    // ---------------------------------------------------------------------------

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showSprintModal, setShowSprintModal] = useState(false);

    // GIA DINH: Ten du an se duoc fetch hoac lay tu context sau
    const projectName = "Operational Project";

    // ---------------------------------------------------------------------------
    // 6. EVENT HANDLERS (Business Logic)
    // ---------------------------------------------------------------------------

    /**
     * Xu ly sau khi nhiem vu duoc tao thanh cong
     */
    const handleTaskCreationSuccess = useCallback(() => {
        showToast("Task has been successfully logged", "success");
        setShowTaskModal(false);
    }, [showToast]);

    /**
     * Xu ly sau khi Sprint duoc khoi tao thanh cong
     */
    const handleSprintCreationSuccess = useCallback(() => {
        showToast("Sprint cycle created successfully", "success");
        setShowSprintModal(false);
    }, [showToast]);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    const closeSidebar = useCallback(() => {
        setIsSidebarOpen(false);
    }, []);

    // ---------------------------------------------------------------------------
    // 7. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        // MAIN CONTAINER: Chiem toan bo chieu cao man hinh, khoa cuon trang ngang
        <div className="flex h-screen bg-white overflow-hidden font-sans text-[#172B4D]">
            
            {/* SIDEBAR DIEU HUONG (Fixed Left) */}
            <ProjectCoreSidebar
                projectId={projectId.toString()}
                projectName={projectName}
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
            />

            {/* KHU VUC NOI DUNG BEN PHAI (Main Wrapper) */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#F4F5F7]">
                
                {/* HEADER STACK (Fixed Top) */}
                <header className="flex flex-col bg-white border-b border-[#DFE1E6] shadow-sm z-20 relative">
                    
                    {/* TANG 1: SYSTEM HEADER */}
                    <AdminHeader onMenuToggle={toggleSidebar} />

                    {/* TANG 2: PROJECT CONTEXT NAV */}
                    <ProjectNavTabs
                        projectId={projectId.toString()}
                        onMenuToggle={toggleSidebar}
                        // Cho phep component con kich hoat modal neu can thiet
                        // onCreateTask={() => setShowTaskModal(true)}
                    />
                </header>

                {/* KHU VUC HIEN THI NOI DUNG DONG (Scrollable) */}
                <main className={cn(
                    "flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar",
                    "p-0 animate-in fade-in duration-500"
                )}>
                    {children}
                </main>
            </div>

            {/* --- GLOBAL MODALS REGISTRATION --- */}
            {/* Dat tai day de dam bao Modals luon co the duoc goi tu bat ky dau trong du an */}

            <CreateTaskModal
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
                projectId={projectId}
                workspaceId={workspaceId}
                companyId={companyId}
                members={[]} // Se duoc Modal tu dong fetch hoac truyen tu hook
                onSuccess={handleTaskCreationSuccess}
            />

            <CreateSprintModal
                isOpen={showSprintModal}
                onClose={() => setShowSprintModal(false)}
                projectId={projectId}
                onSuccess={handleSprintCreationSuccess}
            />

            {/* GLOBAL SCROLLBAR STYLES */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B3BAC5; }
            `}</style>
        </div>
    );
}