"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Services)
// =============================================================================

import React, { useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

// Internal Components
import AdminHeader from "@/components/features/admin/Header"; 
import AdminSidebar from "@/components/features/admin/Sidebar"; 

// Context
import { useAuth } from "@/context/AuthContext";

// =============================================================================
// 2. INTERFACES & TYPES
// =============================================================================

interface PortalLayoutProps {
    children: React.ReactNode;
}

// Mo rong kieu cua Sidebar de pass loi TypeScript tuong tu AdminLayout
type ExtendedSidebarProps = React.ComponentProps<typeof AdminSidebar> & {
    isOpen: boolean;
    onClose: () => void;
    activeMenu?: string;
    setActiveMenu?: React.Dispatch<React.SetStateAction<string>>;
    workspaces?: any[];
    loadingWs?: boolean;
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Portal Layout (Core Wrapper).
 * Giao dien bo khung danh rieng cho phan he Portal, tai su dung Header va Sidebar.
 */
export default function PortalLayout({ children }: PortalLayoutProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const { user, isLoading, isAuthenticated } = useAuth();
    
    // UI States
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState("/portal");
    
    // ---------------------------------------------------------------------------
    // 5. RENDER LOGIC
    // ---------------------------------------------------------------------------

    // MAN HINH 1: Dang kiem tra xac thuc (Loading Screen)
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F5F7] gap-4">
                <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80" />
                <p className="text-[12px] font-black text-[#6B778C] uppercase tracking-[0.2em]">
                    Loading Portal Environment...
                </p>
            </div>
        );
    }

    // MAN HINH 2: Loi xac thuc (Fallback Error)
    if (!isAuthenticated || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F5F7] gap-4 animate-in fade-in duration-300">
                <div className="p-4 bg-red-50 rounded-full border border-red-100 shadow-sm">
                    <ShieldAlert className="w-12 h-12 text-[#FF5630]" />
                </div>
                <h2 className="text-lg font-black text-[#172B4D] uppercase tracking-tight">Access Denied</h2>
                <p className="text-[14px] text-[#42526E] font-medium">Please authenticate to continue.</p>
            </div>
        );
    }

    // MAN HINH 3: Giao dien chinh cua Portal Layout
    return (
        <div className="h-screen w-full bg-[#F4F5F7] flex flex-col font-sans text-[#172B4D] overflow-hidden">
            
            {/* HEADER SECTION (Sticky top) */}
            <div className="flex-shrink-0 z-50">
                <AdminHeader onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            </div>

            {/* MAIN WORKING AREA */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* SIDEBAR NAVIGATION */}
                <div className="flex-shrink-0 z-40">
                    <AdminSidebar
                        {...({
                            isOpen: isSidebarOpen,
                            onClose: () => setIsSidebarOpen(false),
                            activeMenu,
                            setActiveMenu,
                            // Khong can truyen danh sach workspace cho Portal
                            workspaces: [], 
                            loadingWs: false
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