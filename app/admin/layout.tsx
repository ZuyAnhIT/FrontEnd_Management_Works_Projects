"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Services)
// =============================================================================

import React, { useEffect, useState, useCallback } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

// Internal Components
import Header from "@/components/features/admin/Header"; 
import Sidebar from "@/components/features/admin/Sidebar"; 

// Context & Services
import { useAuth } from "@/context/AuthContext";
import { getCompanyWorkspaces } from "@/services/apiWorkspace";

// =============================================================================
// 2. INTERFACES & TYPES
// =============================================================================

interface AdminLayoutProps {
    children: React.ReactNode;
}

interface SidebarWorkspace {
    id: number;
    name: string;
    roleCode?: string; 
}

// Mo rong kieu cua Sidebar de pass loi TypeScript
// Luu y: Ban nen cap nhat file Sidebar.tsx de match voi interface nay
type ExtendedSidebarProps = React.ComponentProps<typeof Sidebar> & {
    isOpen: boolean;
    onClose: () => void;
    activeMenu?: string;
    setActiveMenu?: React.Dispatch<React.SetStateAction<string>>;
    workspaces?: SidebarWorkspace[];
    loadingWs?: boolean;
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Admin Layout (Core Wrapper).
 * Quan ly trang thai hien thi Sidebar, Header va data Workspaces cho toan bo cac trang Core.
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const { user, isAuthenticated, activeCompany, isLoading, role } = useAuth();

    // UI States
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState("home");

    // Data States
    const [workspaces, setWorkspaces] = useState<SidebarWorkspace[]>([]);
    const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
    
    // ---------------------------------------------------------------------------
    // 5. DATA FETCHING (Handlers)
    // ---------------------------------------------------------------------------

    /**
     * Lay danh sach workspace dua theo phan quyen (Role-based access)
     */
    const fetchWorkspaces = useCallback(async () => {
        if (!activeCompany?.companyId || !user) return;

        // KICH BAN 1: COMPANY_ADMIN (Duoc phep lay tat ca workspace trong cong ty)
        if (role === "COMPANY_ADMIN") {
            setIsLoadingWorkspaces(true);
            try {
                const response = await getCompanyWorkspaces(activeCompany.companyId, {
                    page: 0,
                    size: 50,
                    sortBy: "createdAt",
                    sortDir: "desc",
                });
                
                const mappedWorkspaces = response.content?.map(w => ({
                    id: w.workspaceId,
                    name: w.workspaceName,
                    roleCode: w.roleCode 
                })) || [];
                
                setWorkspaces(mappedWorkspaces);
            } catch (err: any) {
                // Chi log loi 403, khong hien thi toast gay phien phuc
                console.error("[Auth] Failed to fetch admin workspaces:", err.message);
            } finally {
                setIsLoadingWorkspaces(false);
            }
            return;
        } 
        
        // KICH BAN 2: MEMBER / GUEST (Chi lay nhung workspace duoc chi dinh tu User Profile)
        if (role && (role.includes("MEMBER") || role.includes("GUEST"))) {
            const userWorkspaces = user.workspaceMemberships
                ?.filter(w => w.companyId === activeCompany.companyId)
                .map(w => ({
                    id: w.workspaceId,
                    name: w.workspaceName,
                    roleCode: w.roleCode, 
                })) || [];
            
            setWorkspaces(userWorkspaces as SidebarWorkspace[]);
            return;
        }
        
        // KICH BAN 3: Cac truong hop khac (Clear data)
        setWorkspaces([]);
        
    }, [activeCompany, role, user]);

    // ---------------------------------------------------------------------------
    // 6. SIDE EFFECTS
    // ---------------------------------------------------------------------------

    /**
     * Theo doi trang thai xac thuc de tu dong tai du lieu workspace
     */
    useEffect(() => {
        if (isAuthenticated && activeCompany?.companyId && user) {
            fetchWorkspaces();
        } else if (!isLoading) {
            setWorkspaces([]);
        }
    }, [isAuthenticated, activeCompany, user, isLoading, fetchWorkspaces]); 

    // ---------------------------------------------------------------------------
    // 7. RENDER LOGIC
    // ---------------------------------------------------------------------------

    // MAN HINH 1: Dang kiem tra xac thuc (Loading Screen)
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F5F7] gap-4">
                <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80" />
                <p className="text-[12px] font-black text-[#6B778C] uppercase tracking-[0.2em]">Authenticating Session...</p>
            </div>
        );
    }

    // MAN HINH 2: Loi xac thuc (Fallback Error)
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F5F7] gap-4 animate-in fade-in duration-300">
                <div className="p-4 bg-red-50 rounded-full">
                    <ShieldAlert className="w-12 h-12 text-[#FF5630]" />
                </div>
                <h2 className="text-lg font-black text-[#172B4D] uppercase tracking-tight">Access Denied</h2>
                <p className="text-[14px] text-[#42526E] font-medium">Session expired or invalid. Please log in again.</p>
            </div>
        );
    }

    // MAN HINH 3: Giao dien chinh cua Admin Layout (Core Structure)
    return (
        <div className="h-screen w-full bg-[#F4F5F7] flex flex-col font-sans text-[#172B4D] overflow-hidden">

            {/* HEADER (Sticky top) */}
            <div className="flex-shrink-0 z-50">
                <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            </div>

            {/* MAIN WORKING AREA */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* SIDEBAR NAVIGATION */}
                <div className="flex-shrink-0 z-40">
                    <Sidebar
                        // Fix: Gom tat ca props vao 1 object duy nhat de tranh loi "specified more than once"
                        {...({
                            isOpen: isSidebarOpen,
                            onClose: () => setIsSidebarOpen(false),
                            activeMenu,
                            setActiveMenu,
                            workspaces,
                            loadingWs: isLoadingWorkspaces
                        } as ExtendedSidebarProps)}
                    />
                </div>

                {/* DYNAMIC CONTENT CONTAINER */}
                <main className="flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar bg-[#F4F5F7]">
                    {children}
                </main>
            </div>

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