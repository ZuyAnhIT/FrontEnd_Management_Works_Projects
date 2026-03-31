"use client";

import React, { useState, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users,
  FolderKanban,
  CreditCard,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Briefcase,
  LayoutGrid,
  Home
} from "lucide-react";

// Internal Components & Utils
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/Tooltips";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveMenu: (id: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần Sidebar điều hướng chính của hệ thống.
 * Tự động thay đổi danh sách chức năng dựa trên ngữ cảnh người dùng đang truy cập
 * (Portal, Company Admin, hoặc Admin Hub).
 */
export default function AdminSidebar({
  isOpen,
  onClose,
  setActiveMenu,
}: SidebarProps) {
  // ---------------------------------------------------------------------------
  // 1. HOOKS & STATE
  // ---------------------------------------------------------------------------
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // 2. CONTEXT DETECTION (Xác định ngữ cảnh điều hướng)
  // ---------------------------------------------------------------------------
  const isPortal = pathname?.startsWith("/portal");
  const isCompanyContext = pathname?.startsWith("/admin/company");

  // ---------------------------------------------------------------------------
  // 3. MENU CONFIGURATION (Cấu hình danh mục theo ngữ cảnh)
  // ---------------------------------------------------------------------------

  const currentMenuItems = useMemo((): MenuItem[] => {
    // Ngữ cảnh Portal (Người dùng/Khách)
    if (isPortal) {
      return [
        { id: "portal-home", label: "Portal Home", icon: Home, path: "/portal" },
      ];
    }
    
    // Ngữ cảnh Quản trị Công ty (Company Admin)
    if (isCompanyContext) {
      return [
        { id: "dashboard", label: "Overview", icon: LayoutDashboard, path: "/admin/company/dashboard" },
        { id: "info", label: "Company Info", icon: Building2, path: "/admin/company/companyinfo" },
        { id: "members", label: "Members", icon: Users, path: "/admin/company/members" },
        { id: "workspaces", label: "Workspaces", icon: FolderKanban, path: "/admin/company/workspaces" },
        { id: "billing", label: "Billing", icon: CreditCard, path: "/admin/company/billing" },
      ];
    }

    // Ngữ cảnh Hub quản trị tổng (Default Admin Hub)
    return [
      { id: "companies", label: "My Companies", icon: LayoutGrid, path: "/admin" },
    ];
  }, [isPortal, isCompanyContext]);

  // Cấu hình giao diện Header của Sidebar
  const headerConfig = useMemo(() => {
    if (isPortal) return { title: "Worknet", sub: "Portal", icon: FolderKanban, color: "bg-indigo-600" };
    if (isCompanyContext) return { title: "Company", sub: "Admin", icon: Building2, color: "bg-blue-600" };
    return { title: "Admin", sub: "Hub", icon: Briefcase, color: "bg-slate-950" };
  }, [isPortal, isCompanyContext]);

  // ---------------------------------------------------------------------------
  // 4. HANDLERS
  // ---------------------------------------------------------------------------

  const handleItemClick = useCallback((id: string) => {
    setActiveMenu(id);
    if (window.innerWidth < 1024) onClose();
  }, [setActiveMenu, onClose]);

  // ---------------------------------------------------------------------------
  // 5. RENDER HELPERS
  // ---------------------------------------------------------------------------

  const renderNavLink = (item: MenuItem) => {
    const isActive = (item.path === "/admin" || item.path === "/portal")
      ? pathname === item.path
      : pathname?.startsWith(item.path);

    const Icon = item.icon;

    const content = (
      <Link href={item.path} className="block">
        <div
          onClick={() => handleItemClick(item.id)}
          className={cn(
            "group relative flex items-center rounded-xl transition-all duration-200 cursor-pointer",
            isCollapsed ? "justify-center py-3 px-0" : "px-3 py-2.5 gap-3",
            isActive 
              ? "bg-blue-50 text-blue-700 font-bold shadow-sm" 
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          {/* Chỉ báo trạng thái Active (Vertical Bar) */}
          {isActive && !isCollapsed && (
            <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
          )}

          <Icon className={cn(
            "transition-colors shrink-0",
            isCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]",
            isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
          )} />
          
          {!isCollapsed && (
            <span className="text-sm truncate">{item.label}</span>
          )}
        </div>
      </Link>
    );

    // Hiển thị Tooltip khi Sidebar đang thu gọn
    if (isCollapsed) {
      return (
        <Tooltip key={item.id} delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-bold">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <React.Fragment key={item.id}>{content}</React.Fragment>;
  };

  // ---------------------------------------------------------------------------
  // 6. MAIN RENDER
  // ---------------------------------------------------------------------------

  const HeaderIcon = headerConfig.icon;

  return (
    <TooltipProvider>
      {/* Lớp phủ cho Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Container chính của Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200 shadow-sm flex flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[72px]" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* KHU VỰC HEADER (Logo & Identity) */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
          <div className={cn(
            "flex items-center gap-3 overflow-hidden transition-all",
            isCollapsed ? "justify-center w-full" : ""
          )}>
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-white",
              headerConfig.color
            )}>
              <HeaderIcon className="w-4.5 h-4.5" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-left-2 duration-500">
                <span className="block text-slate-900 font-bold text-sm truncate tracking-tight">
                  {headerConfig.title}
                </span>
                <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest leading-none mt-0.5">
                  {headerConfig.sub}
                </span>
              </div>
            )}
          </div>

          <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KHU VỰC ĐIỀU HƯỚNG (Navigation) */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {!isCollapsed && isCompanyContext && (
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">
              Management
            </div>
          )}

          {currentMenuItems.map(renderNavLink)}

          {/* Nút quay về Hub tổng (Chỉ hiện khi đang trong công ty cụ thể) */}
          {isCompanyContext && !isPortal && (
            <>
              <div className="my-4 border-t border-slate-100 mx-2" />
              {renderNavLink({ id: "back-hub", label: "Back to Hub", icon: LayoutGrid, path: "/admin" })}
            </>
          )}
        </nav>

        {/* KHU VỰC FOOTER (Settings & Toggle) */}
        <div className="p-3 border-t border-slate-100 bg-white shrink-0 space-y-1">
          <button 
            onClick={() => router.push("/settings/profile")}
            className={cn(
              "w-full flex items-center rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors",
              isCollapsed ? "justify-center py-3" : "px-3 py-2.5 gap-3"
            )}
          >
            <Settings className="w-4.5 h-4.5" />
            {!isCollapsed && <span className="text-sm font-semibold">Settings</span>}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "hidden lg:flex w-full items-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors",
              isCollapsed ? "justify-center py-3" : "justify-end px-3 py-2"
            )}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Spacer giúp fix Layout Shift trên Desktop */}
      <div className={cn(
        "hidden lg:block transition-all duration-300 ease-in-out shrink-0",
        isCollapsed ? "w-[72px]" : "w-64"
      )} />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </TooltipProvider>
  );
}