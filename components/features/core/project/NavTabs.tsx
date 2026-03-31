"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo } from 'react';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ListTodo,
  Menu as MenuIcon,
  GitBranch,
  Archive,
  Calendar,
  CalendarDays,
} from 'lucide-react';

// Internal Hooks & Utils
import { useProjectRole } from '@/hooks/useProjectRole';
import { cn } from '@/lib/utils';

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface ProjectNavTabsProps {
  projectId: string;
  onMenuToggle?: () => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thanh điều hướng chính của Dự án (Project Navigation Tabs).
 * Quản lý việc hiển thị các tab chức năng dựa trên quyền hạn của người dùng (Guest vs Member).
 */
export default function ProjectNavTabs({
  projectId,
  onMenuToggle,
}: ProjectNavTabsProps) {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const pathname = usePathname();
  const { workspaceId } = useParams() as { workspaceId: string };
  
  // Lấy quyền của người dùng hiện tại trong dự án
  const { isGuest } = useProjectRole(Number(projectId));

  // ---------------------------------------------------------------------------
  // 5. TAB CONFIGURATION
  // ---------------------------------------------------------------------------

  // Tạo danh sách Tabs động dựa trên quyền (isGuest)
  const navTabs = useMemo(() => {
    const baseUrl = `/core/workspace/${workspaceId}/project/${projectId}`;
    
    const tabs = [
      {
        id: 'dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        path: baseUrl,
        isBasePath: true,
      },
      {
        id: 'board',
        icon: ListTodo,
        label: 'Board',
        path: `${baseUrl}/board`,
      },
      // Ẩn List với Guest
      !isGuest && {
        id: 'list',
        icon: GitBranch,
        label: 'List',
        path: `${baseUrl}/list`,
      },
      // Ẩn Backlog với Guest
      !isGuest && {
        id: 'backlog',
        icon: MenuIcon,
        label: 'Backlog',
        path: `${baseUrl}/backlog`,
      },
      {
        id: 'calendar',
        icon: CalendarDays,
        label: 'Calendar',
        path: `${baseUrl}/calendar`,
      },
      // Ẩn Timeline với Guest
      !isGuest && {
        id: 'timeline',
        icon: Calendar,
        label: 'Timeline',
        path: `${baseUrl}/timeline`,
      },
      // Ẩn Archived với Guest
      !isGuest && {
        id: 'archived', 
        icon: Archive,
        label: 'Archived',
        path: `${baseUrl}/archived`,
      },
    ];

    // Ép kiểu (Type Casting) an toàn sau khi lọc các giá trị falsy
    return tabs.filter(Boolean) as Array<{
      id: string;
      icon: React.ElementType;
      label: string;
      path: string;
      isBasePath?: boolean;
    }>;
  }, [workspaceId, projectId, isGuest]);

  // ---------------------------------------------------------------------------
  // 6. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <div className="bg-white border-b border-slate-200 sticky top-14 z-30 shadow-sm">
      <div className="flex items-center h-12 px-4 lg:px-6 gap-5">
        
        {/* Nút bật/tắt menu trên thiết bị di động */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-md hover:bg-[#091E4214] text-slate-500 transition-colors active:scale-95"
            title="Toggle Sidebar"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        )}

        {/* Vùng chứa các tab điều hướng */}
        <div className="flex-1 overflow-x-auto custom-scrollbar-hide">
          <div className="flex gap-6 h-full">
            {navTabs.map((tab) => {
              
              const isBaseUrl = `/core/workspace/${workspaceId}/project/${projectId}`;
              const isActive = 
                pathname === tab.path || 
                (tab.isBasePath && pathname === isBaseUrl);

              const TabIcon = tab.icon;

              return (
                <Link 
                  key={tab.id} 
                  href={tab.path} 
                  className="relative flex items-center h-full group"
                >
                  <button
                    className={cn(
                      "flex items-center gap-2 py-3 text-[13px] font-semibold transition-colors whitespace-nowrap outline-none",
                      isActive 
                        ? "text-[#0052CC]" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-2.5 -mx-2.5 rounded-md"
                    )}
                    tabIndex={-1}
                  >
                    <TabIcon 
                      className={cn(
                        "w-4 h-4 transition-colors", 
                        isActive ? "text-[#0052CC]" : "text-slate-400 group-hover:text-slate-600"
                      )} 
                    />
                    <span>{tab.label}</span>
                  </button>

                  {/* Đường gạch dưới (Active Indicator Bar) */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0052CC] rounded-t-[3px] animate-in fade-in duration-200" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar-hide::-webkit-scrollbar { display: none; }
        .custom-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}