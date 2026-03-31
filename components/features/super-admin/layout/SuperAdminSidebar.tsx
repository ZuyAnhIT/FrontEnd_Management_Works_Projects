"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Styles)
// =============================================================================

import React, { useState, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Users,
    Building2,
    CreditCard,
    LayoutDashboard,
    Settings,
    ChevronLeft,
    ChevronRight,
    X,
    ShieldAlert,
} from "lucide-react";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & CONFIG
// =============================================================================

export interface SuperAdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeMenu: string;
    setActiveMenu: (id: string) => void;
}

interface MenuItem {
    id: string;
    icon: React.ElementType;
    label: string;
    path: string;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function SuperAdminSidebar({
    isOpen,
    onClose,
    activeMenu,
    setActiveMenu,
}: SuperAdminSidebarProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Định nghĩa danh sách menu quản trị
    const menuItems: MenuItem[] = useMemo(() => [
        { id: "dashboard", icon: LayoutDashboard, label: "Overview", path: "/super-admin" },
        { id: "companies", icon: Building2, label: "Companies", path: "/super-admin/companies" },
        { id: "users", icon: Users, label: "User Directory", path: "/super-admin/users" },
        { id: "plans", icon: SubscriptionPlans, label: "Service Plans", path: "/super-admin/plans" },
    ], []);

    // ---------------------------------------------------------------------------
    // 5. HANDLERS
    // ---------------------------------------------------------------------------

    /**
     * Xử lý khi nhấn vào mục menu
     */
    const handleNavigation = useCallback((id: string, path: string) => {
        setActiveMenu(id);
        // Tự động đóng sidebar trên mobile sau khi chọn menu
        if (window.innerWidth < 1024) {
            onClose();
        }
    }, [onClose, setActiveMenu]);

    /**
     * Chuyển đổi trạng thái thu gọn/mở rộng của Sidebar
     */
    const toggleCollapse = useCallback(() => {
        setIsCollapsed(prev => !prev);
    }, []);

    // ---------------------------------------------------------------------------
    // 6. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <>
            {/* Lớp nền tối mờ cho thiết bị di động */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 lg:hidden animate-in fade-in duration-200"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out shadow-sm",
                    isCollapsed ? "w-[68px]" : "w-64",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* ===== HEADER: BRAND LOGO ===== */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
                    <div className={cn(
                        "flex items-center gap-3 overflow-hidden transition-all",
                        isCollapsed && "justify-center w-full"
                    )}>
                        <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shrink-0 shadow-sm border border-red-700">
                            <ShieldAlert className="w-5 h-5 text-white stroke-[2.5]" />
                        </div>

                        {!isCollapsed && (
                            <div className="min-w-0 flex-1 animate-in fade-in duration-300">
                                <span className="block text-[#172B4D] font-black text-[14px] truncate leading-tight uppercase tracking-tight">
                                    Platform Admin
                                </span>
                                <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                    System Core
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Nút đóng cho Mobile */}
                    <button 
                        onClick={onClose} 
                        className="lg:hidden p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ===== BODY: NAVIGATION MENU ===== */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                    {!isCollapsed && (
                        <div className="px-3 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Core Management
                        </div>
                    )}

                    {menuItems.map((item) => {
                        // Xác định trạng thái Active dựa trên URL hiện tại
                        const isActive = item.path === "/super-admin" 
                            ? pathname === item.path 
                            : pathname?.startsWith(item.path);

                        return (
                            <Link key={item.id} href={item.path} className="block outline-none">
                                <div
                                    onClick={() => handleNavigation(item.id, item.path)}
                                    className={cn(
                                        "group relative flex items-center rounded-lg transition-all duration-200 cursor-pointer border border-transparent",
                                        isCollapsed ? "justify-center py-3 px-0" : "px-3 py-2.5 gap-3",
                                        isActive 
                                            ? "bg-red-50 text-red-700 shadow-sm border-red-100/50" 
                                            : "text-[#42526E] hover:bg-slate-50 hover:text-[#172B4D]"
                                    )}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    {/* Thanh chỉ báo Active bên trái */}
                                    {isActive && (
                                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-red-600 rounded-r-full" />
                                    )}

                                    <item.icon 
                                        className={cn(
                                            "transition-colors shrink-0",
                                            isCollapsed ? "w-5 h-5" : "w-4.5 h-4.5",
                                            isActive ? "text-red-600 stroke-[2.5]" : "text-slate-400 group-hover:text-slate-600"
                                        )} 
                                    />
                                    
                                    {!isCollapsed && (
                                        <span className={cn("text-[13px] font-semibold", isActive ? "text-red-700" : "text-[#42526E]")}>
                                            {item.label}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* ===== FOOTER: ACTIONS & COLLAPSE ===== */}
                <div className="p-3 border-t border-slate-100 bg-white space-y-1">
                    {/* Mục cấu hình hệ thống */}
                    <Link href="/super-admin/settings" className="block outline-none">
                        <button 
                            onClick={() => handleNavigation("settings", "/super-admin/settings")}
                            className={cn(
                                "w-full flex items-center rounded-lg transition-all text-[#42526E] hover:bg-slate-50 hover:text-[#172B4D]",
                                isCollapsed ? "justify-center py-3" : "px-3 py-2.5 gap-3"
                            )}
                            title="Global Settings"
                        >
                            <Settings className="w-4.5 h-4.5 opacity-70" />
                            {!isCollapsed && <span className="text-[13px] font-semibold">Global Settings</span>}
                        </button>
                    </Link>

                    {/* Nút thu gọn Sidebar */}
                    <button
                        onClick={toggleCollapse}
                        className={cn(
                            "hidden lg:flex w-full items-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95",
                            isCollapsed ? "justify-center py-3" : "justify-end px-3 py-2"
                        )}
                        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>
            </aside>

            {/* Khối lót (Spacer) để đẩy nội dung chính sang phải trên Desktop */}
            <div 
                className={cn(
                    "hidden lg:block transition-all duration-300 ease-in-out shrink-0", 
                    isCollapsed ? "w-[68px]" : "w-64"
                )} 
            />

            {/* Styles cho thanh cuộn thẩm mỹ */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B3BAC5; }
            `}</style>
        </>
    );
}

/**
 * Biểu tượng đại diện cho quản lý gói cước
 */
function SubscriptionPlans(props: any) {
    return <CreditCard {...props} />;
}