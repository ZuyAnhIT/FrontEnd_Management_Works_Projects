"use client";

// =============================================================================
// 1. IMPORTS
// =============================================================================

import React, { useState } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import {
    Home,
    FolderKanban,
    ClipboardCheck,
    Settings,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Building2,
    X
} from "lucide-react";

// Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeMenu: string | null;
    setActiveMenu: (id: string) => void;
    workspaces?: any[]; 
}

interface MenuItem {
    id: string;
    icon: React.ElementType; // Định nghĩa kiểu chuẩn cho component Icon
    label: string;
    path: string;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thanh điều hướng chính (Sidebar).
 * Quản lý menu theo ngữ cảnh (Workspace hoặc Overview) và hỗ trợ chế độ thu gọn.
 */
export default function Sidebar({
    isOpen,
    onClose,
    activeMenu,
    setActiveMenu,
    workspaces = [] 
}: SidebarProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const workspaceId = params.workspaceId;

    // ---------------------------------------------------------------------------
    // 5. BINDINGS & CONFIGS (Xử lý logic hiển thị menu)
    // ---------------------------------------------------------------------------

    // Xác định ngữ cảnh hiện tại dựa trên URL
    const isWorkspaceView = pathname?.startsWith("/core/workspace/");

    // Cấu hình Menu cho màn hình Tổng quan (Member View)
    const memberMenu: MenuItem[] = [
        { id: "overview", icon: Home, label: "Overview", path: "/core" }, 
    ];

    // Cấu hình Menu cho màn hình Không gian làm việc (Workspace View)
    const workspaceMenu: MenuItem[] = [
        { id: "summary", icon: Home, label: "Summary", path: `/core/workspace/${workspaceId}` },
        { 
            id: "projects", 
            icon: FolderKanban, 
            label: "Projects",
            path: `/core/workspace/${workspaceId}/project`,
        },
        { id: "people", icon: ClipboardCheck, label: "People", path: `/core/workspace/${workspaceId}/members` },
        { id: "settings", icon: Settings, label: "Settings", path: `/core/workspace/${workspaceId}/settings` },
    ];

    // Lựa chọn danh sách menu phù hợp để hiển thị
    const menuToRender = isWorkspaceView ? workspaceMenu : memberMenu;

    // ---------------------------------------------------------------------------
    // 6. HANDLERS
    // ---------------------------------------------------------------------------

    /**
     * Xử lý điều hướng khi người dùng nhấn vào một mục trên Menu
     */
    const handleMenuClick = (item: MenuItem) => {
        if (item.path) {
            setActiveMenu(item.path);
            router.push(item.path);
            // Tự động đóng sidebar trên màn hình nhỏ sau khi chọn
            if (window.innerWidth < 1024) onClose();
        }
    };

    /**
     * Xử lý điều hướng khi nhấn vào một Workspace trong danh sách
     */
    const handleWorkspaceClick = (id: string | number) => {
        router.push(`/core/workspace/${id}`);
        if (window.innerWidth < 1024) onClose();
    };

    // ---------------------------------------------------------------------------
    // 7. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <>
            {/* Lớp nền tối mờ dành cho thiết bị di động */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 lg:hidden animate-in fade-in duration-200"
                    onClick={onClose}
                />
            )}

            {/* Vùng chứa thanh điều hướng */}
            <aside
                className={cn(
                    "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#F4F5F7] border-r border-slate-200/80 transition-all duration-300 ease-in-out shadow-[2px_0_8px_rgba(0,0,0,0.02)]",
                    isCollapsed ? "w-[68px]" : "w-64",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* ================= HEADER ================= */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80 bg-[#F4F5F7] shrink-0">
                    <div className={cn(
                        "flex items-center gap-3 overflow-hidden transition-all",
                        isCollapsed && "justify-center w-full"
                    )}>
                        
                        {/* Biểu tượng Logo */}
                        <div className="w-8 h-8 rounded-[6px] bg-[#0052CC] flex items-center justify-center shrink-0 shadow-sm border border-[#0047B3]">
                            {isWorkspaceView ? (
                                <Briefcase className="w-4 h-4 text-white stroke-[2.5]" />
                            ) : (
                                <Building2 className="w-4 h-4 text-white stroke-[2.5]" />
                            )}
                        </div>

                        {/* Tiêu đề Header (Ẩn khi thu gọn) */}
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1 animate-in fade-in duration-300">
                                <span className="block text-[#172B4D] font-black text-[14px] truncate tracking-tight">
                                    {isWorkspaceView ? "Workspace" : "WorkNet"}
                                </span>
                                <span className="block text-[#6B778C] text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                    {isWorkspaceView ? "Department" : "Enterprise"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Nút đóng cho thiết bị di động */}
                    <button 
                        onClick={onClose} 
                        className="lg:hidden p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors active:scale-95"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ================= CONTENT (Scrollable) ================= */}
                <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6 custom-scrollbar">
                    
                    {/* KHỐI 1: MAIN MENU */}
                    <div className="space-y-1">
                        {menuToRender.map((item: MenuItem) => {
                            const isActive = activeMenu === item.path || pathname === item.path;
                            
                            return (
                                <div key={item.id} className="flex items-center">
                                    <button
                                        onClick={() => handleMenuClick(item)}
                                        className={cn(
                                            "group relative flex-1 flex items-center rounded-md transition-all duration-200 border border-transparent outline-none",
                                            isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2 gap-3",
                                            isActive 
                                                ? "bg-[#E3F2FD] text-[#0052CC]" 
                                                : "text-[#42526E] hover:bg-[#091E420F] hover:text-[#172B4D]"
                                        )}
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        {/* Dải màu đánh dấu active */}
                                        {isActive && (
                                            <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#0052CC] rounded-r-full" />
                                        )}
                                        
                                        <item.icon 
                                            className={cn(
                                                "shrink-0 transition-colors",
                                                isCollapsed ? "w-5 h-5" : "w-4 h-4",
                                                isActive ? "text-[#0052CC] stroke-[2.5]" : "text-[#6B778C] group-hover:text-[#172B4D]"
                                            )} 
                                        />
                                        
                                        {!isCollapsed && (
                                            <span className={cn("text-left text-[13px]", isActive ? "font-bold" : "font-medium")}>
                                                {item.label}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* KHỐI 2: WORKSPACES LIST (Chỉ hiện ở màn Overview và không thu gọn) */}
                    {!isWorkspaceView && !isCollapsed && (
                        <div className="pt-4 border-t border-slate-200/80 mx-1">
                            
                            <div className="px-2 mb-2 flex items-center justify-between">
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                    Workspaces
                                </span>
                                {workspaces.length > 0 && (
                                    <span className="bg-[#091E420F] text-[#42526E] font-bold px-1.5 py-0.5 rounded text-[10px]">
                                        {workspaces.length}
                                    </span>
                                )}
                            </div>
                            
                            <div className="space-y-0.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                {workspaces.length > 0 ? (
                                    workspaces.map((ws) => (
                                        <button
                                            key={ws.id}
                                            onClick={() => handleWorkspaceClick(ws.id)}
                                            className={cn(
                                                "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors group",
                                                "text-[#42526E] hover:bg-[#091E420F] hover:text-[#172B4D]"
                                            )}
                                        >
                                            <div className="w-2 h-2 rounded-sm bg-slate-300 group-hover:bg-[#0052CC] transition-colors shrink-0" />
                                            <span className="truncate flex-1 text-left">
                                                {ws.name || ws.workspaceName}
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-3 text-[12px] text-slate-400 italic font-medium">
                                        No workspaces found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </nav>

                {/* ================= FOOTER (Nút thu gọn) ================= */}
                <div className="p-4 border-t border-slate-200/80 bg-[#F4F5F7] shrink-0">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={cn(
                            "hidden lg:flex w-full items-center rounded-md transition-colors group outline-none",
                            "text-[#42526E] hover:bg-[#091E420F] hover:text-[#172B4D]",
                            isCollapsed ? "justify-center py-2" : "justify-start gap-3 px-2 py-2"
                        )}
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-[#172B4D] transition-colors" />
                        ) : (
                            <>
                                <div className="flex items-center justify-center w-6 h-6 rounded bg-[#091E420F] text-[#42526E] group-hover:bg-white group-hover:shadow-sm shrink-0 transition-all">
                                    <ChevronLeft className="w-4 h-4" />
                                </div>
                                <span className="text-[13px] font-bold">Collapse sidebar</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Div lót dùng để đẩy phần nội dung bên phải (Main Content) khi Desktop */}
            <div 
                className={cn(
                    "hidden lg:block transition-all duration-300 ease-in-out shrink-0", 
                    isCollapsed ? "w-[68px]" : "w-64"
                )} 
            />

            {/* STYLES CỤC BỘ (Thanh cuộn tàng hình/thẩm mỹ) */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C1C7D0; }
            `}</style>
        </>
    );
}