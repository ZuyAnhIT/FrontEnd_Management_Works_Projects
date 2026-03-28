"use client";

import { useState } from "react";
import SuperAdminHeader from "@/components/features/super-admin/layout/SuperAdminHeader";
import SuperAdminSidebar from "@/components/features/super-admin/layout/SuperAdminSidebar";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState("dashboard");

    // Chỉ giữ lại thuần túy HTML/CSS Layout, bỏ hoàn toàn logic Auth
    return (
        <div className="h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 z-50">
                <SuperAdminHeader 
                    onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
                />
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="flex-shrink-0 z-40">
                    <SuperAdminSidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                    />
                </div>

                {/* Nội dung trang (Dashboard, Users, Plans...) sẽ render ở đây */}
                <main className="flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}