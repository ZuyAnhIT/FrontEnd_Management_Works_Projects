"use client";

import { useState } from "react";
import AdminHeader from "@/components/features/admin/Header"; 
import AdminSidebar from "@/components/features/admin/Sidebar"; 
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

// =================================================================
// 1. MAIN COMPONENT
// =================================================================

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState("/portal"); // State để highlight menu
    const { user, isLoading, isAuthenticated } = useAuth();

    // 1. Loading Screen
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-3">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Loading Portal...</p>
            </div>
        );
    }

    // 2. Authentication Check (Fallback)
    if (!isAuthenticated || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500 gap-2">
                <ShieldAlert className="w-10 h-10 text-red-500" />
                <p>Access Denied. Please log in.</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
            
            {/* HEADER */}
            <div className="flex-shrink-0 z-50">
                <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
            </div>

            <div className="flex flex-1 overflow-hidden">
                
                {/* SIDEBAR (Admin Style - Dùng cho Portal) */}
                <div className="flex-shrink-0 z-40">
                    <AdminSidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        // Portal không cần hiển thị danh sách workspace quản trị ở sidebar
                        workspaces={[]} 
                        loadingWs={false}
                    />
                </div>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar bg-slate-50/50">
                    {children}
                </main>
            </div>
        </div>
    );
}