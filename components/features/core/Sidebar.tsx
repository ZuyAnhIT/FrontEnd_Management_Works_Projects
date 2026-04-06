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
    X,
    CheckSquare
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
    icon: React.ElementType; 
    label: string;
    path: string;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thanh dieu huong chinh (Sidebar).
 * Quan ly menu theo ngu canh (Workspace hoac Overview) va ho tro che do thu gon.
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
    // 5. BINDINGS & CONFIGS (Xu ly logic hien thi menu)
    // ---------------------------------------------------------------------------

    // Xac dinh ngu canh hien tai dua tren URL
    const isWorkspaceView = pathname?.startsWith("/core/workspace/");

    // Cau hinh Menu cho man hinh Tong quan (Global/Member View)
    const memberMenu: MenuItem[] = [
        { id: "overview", icon: Home, label: "Overview", path: "/core" }, 
        // Bổ sung tính năng công việc cá nhân
        { id: "my-tasks", icon: CheckSquare, label: "My Tasks", path: "/core/my-tasks" }, 
    ];

    // Cau hinh Menu cho man hinh Khong gian lam viec (Workspace View)
    const workspaceMenu: MenuItem[] = [
        { id: "summary", icon: Home, label: "Summary", path: `/core/workspace/${workspaceId}` },
        { id: "projects", icon: FolderKanban, label: "Projects", path: `/core/workspace/${workspaceId}/project` },
        { id: "people", icon: ClipboardCheck, label: "People", path: `/core/workspace/${workspaceId}/members` },
        { id: "settings", icon: Settings, label: "Settings", path: `/core/workspace/${workspaceId}/settings` },
    ];

    // Lua chon danh sach menu phu hop de hien thi
    const menuToRender = isWorkspaceView ? workspaceMenu : memberMenu;

    // ---------------------------------------------------------------------------
    // 6. HANDLERS
    // ---------------------------------------------------------------------------

    /**
     * Xu ly dieu huong khi nguoi dung nhan vao mot muc tren Menu
     */
    const handleMenuClick = (item: MenuItem) => {
        if (item.path) {
            setActiveMenu(item.path);
            router.push(item.path);
            // Tu dong dong sidebar tren man hinh nho sau khi chon
            if (window.innerWidth < 1024) onClose();
        }
    };

    /**
     * Xu ly dieu huong khi nhan vao mot Workspace trong danh sach
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
            {/* Lop nen toi mo danh cho thiet bi di dong */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-[#091E42]/40 backdrop-blur-[2px] z-40 lg:hidden animate-in fade-in duration-200"
                    onClick={onClose}
                />
            )}

            {/* Vung chua thanh dieu huong */}
            <aside
                className={cn(
                    "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#F4F5F7] border-r border-[#DFE1E6] transition-all duration-300 ease-in-out shadow-sm",
                    isCollapsed ? "w-[68px]" : "w-64",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* ================= HEADER ================= */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-[#DFE1E6] shrink-0">
                    <div className={cn(
                        "flex items-center gap-3 overflow-hidden transition-all",
                        isCollapsed && "justify-center w-full"
                    )}>
                        
                        {/* Bieu tuong Logo */}
                        <div className="w-8 h-8 rounded-[6px] bg-[#0052CC] flex items-center justify-center shrink-0 shadow-sm border border-[#0047B3]">
                            {isWorkspaceView ? (
                                <Briefcase className="w-4 h-4 text-white stroke-[2.5]" />
                            ) : (
                                <Building2 className="w-4 h-4 text-white stroke-[2.5]" />
                            )}
                        </div>

                        {/* Tieu de Header (An khi thu gon) */}
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1 animate-in fade-in duration-300">
                                <span className="block text-[#172B4D] font-black text-[14px] truncate tracking-tight uppercase">
                                    {isWorkspaceView ? "Workspace" : "WorkNet"}
                                </span>
                                <span className="block text-[#6B778C] text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                    {isWorkspaceView ? "Department" : "Enterprise"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Nut dong cho thiet bi di dong */}
                    <button 
                        onClick={onClose} 
                        className="lg:hidden p-1.5 rounded-md hover:bg-[#DFE1E6] text-[#42526E] transition-colors active:scale-95"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ================= CONTENT (Scrollable) ================= */}
                <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6 custom-scrollbar">
                    
                    {/* KHOI 1: MAIN MENU */}
                    <div className="space-y-1">
                        {menuToRender.map((item: MenuItem) => {
                            const isActive = activeMenu === item.path || pathname === item.path;
                            
                            return (
                                <div key={item.id} className="flex items-center">
                                    <button
                                        onClick={() => handleMenuClick(item)}
                                        title={isCollapsed ? item.label : undefined}
                                        className={cn(
                                            "group relative flex-1 flex items-center rounded-md transition-all duration-200 outline-none",
                                            isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5 gap-3",
                                            isActive 
                                                ? "bg-[#DEEBFF] text-[#0052CC]" 
                                                : "text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]"
                                        )}
                                    >
                                        {/* Dai mau danh dau active */}
                                        {isActive && (
                                            <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#0052CC] rounded-r-full" />
                                        )}
                                        
                                        <item.icon 
                                            className={cn(
                                                "shrink-0 transition-colors",
                                                isCollapsed ? "w-5 h-5" : "w-4 h-4",
                                                isActive ? "text-[#0052CC] stroke-[2.5]" : "text-[#6B778C] group-hover:text-[#172B4D]"
                                            )} 
                                        />
                                        
                                        {!isCollapsed && (
                                            <span className={cn(
                                                "text-left text-[12px] uppercase tracking-wider", 
                                                isActive ? "font-black" : "font-bold"
                                            )}>
                                                {item.label}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* KHOI 2: WORKSPACES LIST (Chi hien o man Overview va khong thu gon) */}
                    {!isWorkspaceView && !isCollapsed && (
                        <div className="pt-4 border-t border-[#DFE1E6] mx-1">
                            
                            <div className="px-2 mb-3 flex items-center justify-between">
                                <span className="text-[11px] font-black text-[#6B778C] uppercase tracking-[0.2em]">
                                    Workspaces
                                </span>
                                {workspaces.length > 0 && (
                                    <span className="bg-[#DFE1E6] text-[#172B4D] font-black px-1.5 py-0.5 rounded text-[10px]">
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
                                                "text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]"
                                            )}
                                        >
                                            <div className="w-2 h-2 rounded-sm bg-[#DFE1E6] group-hover:bg-[#0052CC] transition-colors shrink-0" />
                                            <span className="truncate flex-1 text-left font-bold">
                                                {ws.name || ws.workspaceName}
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-[#6B778C] italic">
                                        No workspaces available
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </nav>

                {/* ================= FOOTER (Nut thu gon) ================= */}
                <div className="p-4 border-t border-[#DFE1E6] bg-[#F4F5F7] shrink-0">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        className={cn(
                            "hidden lg:flex w-full items-center rounded-md transition-colors group outline-none",
                            "text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]",
                            isCollapsed ? "justify-center py-2.5" : "justify-start gap-3 px-2 py-2.5"
                        )}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-5 h-5 text-[#6B778C] group-hover:text-[#172B4D] transition-colors" />
                        ) : (
                            <>
                                <div className="flex items-center justify-center w-6 h-6 rounded bg-[#DFE1E6] text-[#42526E] group-hover:bg-white group-hover:shadow-sm shrink-0 transition-all">
                                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-wider">Collapse sidebar</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Div lot dung de day phan noi dung ben phai (Main Content) khi Desktop */}
            <div 
                className={cn(
                    "hidden lg:block transition-all duration-300 ease-in-out shrink-0", 
                    isCollapsed ? "w-[68px]" : "w-64"
                )} 
            />
        </>
    );
}