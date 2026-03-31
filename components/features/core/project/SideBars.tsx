"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useState, useMemo, useCallback } from "react";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import {
  FolderKanban,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutGrid,
  LucideIcon,
} from "lucide-react";

// Internal Hooks & Utils
import { useProjectRole } from "@/hooks/useProjectRole";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONFIGURATION & INTERFACES
// =============================================================================

interface ProjectCoreSidebarProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function ProjectCoreSidebar({
  projectId,
  isOpen,
  onClose,
}: ProjectCoreSidebarProps) {
  
  // ---------------------------------------------------------------------------
  // 4. STATE & HOOKS
  // ---------------------------------------------------------------------------
  
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { workspaceId } = useParams() as { workspaceId: string };

  const { isGuest } = useProjectRole(Number(projectId));

  // ---------------------------------------------------------------------------
  // 5. MENU CONFIGURATION
  // ---------------------------------------------------------------------------

  const projectMenu = useMemo(() => {
    const baseUrl = `/core/workspace/${workspaceId}/project/${projectId}`;

    const baseMenu = [
      {
        id: "general",
        icon: FolderKanban,
        label: "General Info",
        path: baseUrl,
      },
      !isGuest && {
        id: "members",
        icon: Users,
        label: "Members",
        path: `${baseUrl}/member`,
      },
      !isGuest && {
        id: "settings",
        icon: Settings,
        label: "Settings",
        path: `${baseUrl}/settings`,
      },
    ];

    return baseMenu.filter(Boolean) as Array<{
      id: string;
      icon: LucideIcon;
      label: string;
      path: string;
    }>;
  }, [workspaceId, projectId, isGuest]);

  // ---------------------------------------------------------------------------
  // 6. HANDLERS
  // ---------------------------------------------------------------------------

  const handleLinkClick = useCallback(() => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  }, [onClose]);

  // ---------------------------------------------------------------------------
  // 7. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-[#F4F5F7] border-r border-slate-200/60 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
          collapsed ? "w-[64px]" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* HEADER */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200/50 bg-[#F4F5F7] shrink-0">
          <div
            className={cn(
              "flex items-center gap-2 overflow-hidden transition-all text-slate-500 font-bold text-[10px] uppercase tracking-widest",
              collapsed ? "justify-center w-full" : ""
            )}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <span className="animate-in fade-in duration-200 whitespace-nowrap">
                Manage Project
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md hover:bg-[#091E4214] text-slate-500 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY (MENU LIST) */}
        <nav className="flex-1 overflow-y-auto pt-4 px-3 pb-6 space-y-6 custom-scrollbar">
          <div className="space-y-1">
            {projectMenu.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.id} href={item.path} className="block" onClick={handleLinkClick}>
                  <button
                    className={cn(
                      "group relative w-full flex items-center rounded-[3px] transition-all duration-150 outline-none",
                      collapsed ? "justify-center px-0 py-3" : "px-3 py-2 gap-3",
                      isActive
                        ? "bg-[#E3F2FD] text-[#0052CC]"
                        : "text-[#42526E] hover:bg-[#091E4214] hover:text-[#172B4D]"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#0052CC] rounded-r-[3px] animate-in fade-in duration-200" />
                    )}
                    <item.icon
                      className={cn(
                        "transition-colors shrink-0",
                        collapsed ? "w-5 h-5" : "w-4 h-4",
                        isActive ? "text-[#0052CC]" : "text-[#6B778C] group-hover:text-[#42526E]"
                      )}
                    />
                    {!collapsed && (
                      <span className={cn(
                        "text-[13px] font-semibold truncate",
                        isActive ? "text-[#0052CC]" : "text-[#42526E] group-hover:text-[#172B4D]"
                      )}>
                        {item.label}
                      </span>
                    )}
                  </button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* FOOTER */}
        <div className="p-3 border-t border-slate-200/50 bg-[#F4F5F7] shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hidden lg:flex w-full items-center rounded-md text-[#42526E] hover:bg-[#091E4214] hover:text-[#172B4D] transition-colors active:scale-95 outline-none",
              collapsed ? "justify-center py-2" : "justify-start gap-3 px-2 py-2"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 opacity-70" />
            ) : (
              <>
                <div className="flex items-center justify-center w-6 h-6 rounded bg-[#091E420A] text-[#6B778C] group-hover:text-[#42526E] shrink-0 border border-slate-200/60 shadow-sm">
                  <ChevronLeft className="w-4 h-4" />
                </div>
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                   Collapse
                </span>
              </>
            )}
          </button>
        </div>
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #091E4224; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #091E424F; }
      `}</style>
    </>
  );
}