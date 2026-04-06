"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Components)
// =============================================================================

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

// Context & Services
import { useAuth } from "@/context/AuthContext";
import { getCompanyWorkspaces } from "@/services/apiWorkspace";

// Internal Components
import AdminHeader from "@/components/features/admin/Header"; 
import Sidebar from "@/components/features/core/Sidebar"; 

// =============================================================================
// 2. INTERFACES & TYPES
// =============================================================================

interface CoreLayoutProps {
    children: React.ReactNode;
}

interface SidebarWorkspace {
    id: number;
    name: string;
    roleCode?: string; 
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Core Layout Wrapper.
 * Cung cap bo khung dieu huong chung cho toan bo phan he Core (Workspace, My Tasks, Overview).
 * Xu ly viec an/hien thanh dieu huong khi nguoi dung di vao vung lam viec cua mot du an cu the.
 */
export default function CoreLayout({ children }: CoreLayoutProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const pathname = usePathname();
    const { user, isLoading: isAuthLoading, isAuthenticated, activeCompany, role } = useAuth();
    
    // UI States
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Data States
    const [workspaces, setWorkspaces] = useState<SidebarWorkspace[]>([]);
    
    // Kiem tra xem nguoi dung co dang o ben trong mot du an cu the khong de an Sidebar chung
    // Luu y: Route "/core/my-tasks" khong chua "/project/" nen Sidebar van se hien thi binh thuong
    const isInsideProject = pathname?.includes("/project/");

    // ---------------------------------------------------------------------------
    // 5. DATA FETCHING (Handlers)
    // ---------------------------------------------------------------------------

    /**
     * Tai danh sach khong gian lam viec hien thi tren Sidebar
     * Logic duoc phan nhanh dua tren vai tro cua nguoi dung
     */
    const fetchAuthorizedWorkspaces = useCallback(async () => {
        // Neu chua xac thuc hoac thieu du lieu co ban, xoa trang danh sach
        if (!isAuthenticated || !activeCompany?.companyId || !user) {
            setWorkspaces([]);
            return;
        }

        // KICH BAN 1: Quan tri vien cong ty (Company Admin) co quyen thay toan bo Workspace
        if (role === "COMPANY_ADMIN") {
            try {
                const response = await getCompanyWorkspaces(activeCompany.companyId, {
                    page: 0, 
                    size: 100, 
                    sortBy: "name", 
                    sortDir: "asc" 
                });
                
                const mappedWorkspaces = response.content?.map(w => ({
                    id: w.workspaceId,
                    name: w.workspaceName,
                })) || [];
                
                setWorkspaces(mappedWorkspaces);
            } catch (err: any) {
                console.error("[CoreLayout] Failed to load workspaces:", err.message);
            }
            return;
        } 
        
        // KICH BAN 2: Nguoi dung thong thuong (Chi thay nhung workspace duoc chi dinh tu profile)
        const validMemberRoles = ["COMPANY_MEMBER", "WORKSPACE_ADMIN", "WORKSPACE_MEMBER", "GUEST_WORKSPACE"];
        
        if (role && validMemberRoles.includes(role)) {
            const myWorkspaces = user.workspaceMemberships
                ?.filter(w => w.companyId === activeCompany.companyId)
                .map(w => ({
                    id: w.workspaceId,
                    name: w.workspaceName,
                })) || [];
            
            setWorkspaces(myWorkspaces as SidebarWorkspace[]);
            return;
        }
        
        // KICH BAN 3: Cac truong hop ngoai le khac (Vi du: Guest chua duoc assign)
        setWorkspaces([]);
        
    }, [isAuthenticated, activeCompany, user, role]);

    // ---------------------------------------------------------------------------
    // 6. SIDE EFFECTS
    // ---------------------------------------------------------------------------

    useEffect(() => {
        fetchAuthorizedWorkspaces();
    }, [fetchAuthorizedWorkspaces]);

    // ---------------------------------------------------------------------------
    // 7. RENDER LOGIC
    // ---------------------------------------------------------------------------

    // MAN HINH 1: Cho xac thuc (Loading Screen)
    if (isAuthLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F5F7] gap-4">
                <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80" />
                <p className="text-[12px] font-black text-[#6B778C] uppercase tracking-[0.2em]">
                    Authenticating Session...
                </p>
            </div>
        );
    }

    // MAN HINH 2: Loi xac thuc hoac phien het han (Fallback Error)
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F5F7] gap-4 animate-in fade-in duration-300">
                <div className="p-4 bg-[#FFEBE6] rounded-full border border-[#FFBDAD] shadow-sm">
                    <ShieldAlert className="w-12 h-12 text-[#BF2600]" />
                </div>
                <h2 className="text-[18px] font-black text-[#172B4D] uppercase tracking-tight">Access Denied</h2>
                <p className="text-[14px] text-[#42526E] font-medium">Session has expired or is invalid. Please log in again.</p>
            </div>
        );
    }

    // MAN HINH 3: Giao dien chinh (Main Layout)
    return (
        <div className="h-screen w-full bg-[#F4F5F7] flex flex-col font-sans text-[#172B4D] overflow-hidden">
            
            {/* SYSTEM HEADER: An di khi nguoi dung vao trong mot du an cu the */}
            {!isInsideProject && (
                <div className="flex-shrink-0 z-50">
                    <AdminHeader
                        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    />
                </div>
            )}

            {/* KHOI BO CUC CHINH */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* CORE SIDEBAR: An di khi nguoi dung vao trong mot du an cu the */}
                {!isInsideProject && (
                    <div className="flex-shrink-0 z-40">
                         <Sidebar
                            isOpen={isSidebarOpen}
                            onClose={() => setIsSidebarOpen(false)}
                            activeMenu={pathname || ""} 
                            setActiveMenu={() => {}}
                            workspaces={workspaces} 
                        />
                    </div>
                )}

                {/* KHU VUC NOI DUNG CHINH (Chua cac trang nhu Overview, My Tasks, Workspace Settings) */}
                <main className="flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar bg-[#F4F5F7]">
                    {children}
                </main>
                
            </div>
            
            {/* CAU HINH THANH CUON GIAO DIEN (Global Scrollbar Styles) */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B3BAC5; }
            `}</style>
        </div>
    );
}