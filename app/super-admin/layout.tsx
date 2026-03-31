"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal Components -> Utils)
// =============================================================================

import React, { useState, useCallback } from "react";

// Internal Components
import SuperAdminHeader from "@/components/features/super-admin/layout/SuperAdminHeader";
import SuperAdminSidebar from "@/components/features/super-admin/layout/SuperAdminSidebar";

// =============================================================================
// 2. INTERFACES & TYPES
// =============================================================================

interface SuperAdminLayoutProps {
    children: React.ReactNode;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Super Admin Layout Wrapper.
 * Cung cap cau truc bo khung bao gom Header, Sidebar va khu vuc noi dung chinh.
 * Logic xac thuc (Auth) da duoc loai bo de tap trung hoan toan vao Layout UI.
 */
export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    // Trang thai dong mo cua Sidebar tren giao dien di dong
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Trang thai quan ly muc menu dang duoc chon
    const [activeMenu, setActiveMenu] = useState("dashboard");

    // ---------------------------------------------------------------------------
    // 5. EVENT HANDLERS
    // ---------------------------------------------------------------------------

    /**
     * Xu ly dao nguoc trang thai hien thi cua Sidebar
     */
    const handleToggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    /**
     * Xu ly dong han Sidebar (thuong dung khi click ra ngoai tren mobile)
     */
    const handleCloseSidebar = useCallback(() => {
        setIsSidebarOpen(false);
    }, []);

    // ---------------------------------------------------------------------------
    // 6. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <div className="h-screen w-full bg-[#F4F5F7] flex flex-col font-sans text-[#172B4D] overflow-hidden">
            
            {/* KHOI TIEU DE (Header) */}
            <div className="flex-shrink-0 z-50">
                <SuperAdminHeader 
                    onMenuToggle={handleToggleSidebar} 
                />
            </div>

            {/* KHOI BO CUC CHINH (Main Layout) */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* THANH DIEU HUONG (Sidebar) */}
                <div className="flex-shrink-0 z-40">
                    <SuperAdminSidebar
                        isOpen={isSidebarOpen}
                        onClose={handleCloseSidebar}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                    />
                </div>

                {/* KHU VUC NOI DUNG (Dashboard, Users, Plans...) */}
                <main className="flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar p-6 md:p-8 bg-[#F4F5F7]">
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