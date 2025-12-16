'use client'

import {
  LayoutDashboard,
  ListTodo,
  Menu as MenuIcon,
  GitBranch,
  Archive,
  Calendar,
  CalendarDays,
} from 'lucide-react'
import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'
import { useMemo } from 'react'
import { useProjectRole } from '@/hooks/useProjectRole' // ✅ Import Hook phân quyền

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface ProjectNavTabsProps {
  projectId: string
  onMenuToggle?: () => void
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function ProjectNavTabs({
  projectId,
  onMenuToggle,
}: ProjectNavTabsProps) {
  // --- HOOKS ---
  const pathname = usePathname();
  const { workspaceId } = useParams() as { workspaceId: string };
  
  // ✅ Lấy quyền guest
  const { isGuest } = useProjectRole(Number(projectId));

  // ✅ Tạo danh sách Tabs động dựa trên quyền
  const navTabs = useMemo(() => {
    const tabs = [
      {
        id: 'dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        path: `/core/workspace/${workspaceId}/project/${projectId}`,
        isBasePath: true,
      },
      {
        id: 'board',
        icon: ListTodo,
        label: 'Board',
        path: `/core/workspace/${workspaceId}/project/${projectId}/board`,
      },
      // Ẩn List với Guest
      !isGuest && {
        id: 'list',
        icon: GitBranch,
        label: 'List',
        path: `/core/workspace/${workspaceId}/project/${projectId}/list`,
      },
      // Ẩn Backlog với Guest
      !isGuest && {
        id: 'backlog',
        icon: MenuIcon,
        label: 'Backlog',
        path: `/core/workspace/${workspaceId}/project/${projectId}/backlog`,
      },
      {
        id: 'calendar',
        icon: CalendarDays,
        label: 'Calendar',
        path: `/core/workspace/${workspaceId}/project/${projectId}/calendar`,
      },
      // Ẩn Timeline với Guest
      !isGuest && {
        id: 'timeline',
        icon: Calendar,
        label: 'Timeline',
        path: `/core/workspace/${workspaceId}/project/${projectId}/timeline`,
      },
      // Ẩn Archived với Guest
      !isGuest && {
        id: 'archived', 
        icon: Archive,
        label: 'Archived',
        path: `/core/workspace/${workspaceId}/project/${projectId}/archived`,
      },
    ];

    // Lọc bỏ các mục false/undefined
    return tabs.filter((tab): tab is { id: string; icon: any; label: string; path: string; isBasePath?: boolean } => Boolean(tab));
  }, [workspaceId, projectId, isGuest]);

  // --- RENDER ---
  return (
    <div className="bg-white border-b border-slate-200 sticky top-14 z-30">
      <div className="flex items-center h-12 px-4 lg:px-6 gap-4">
        
        {/* Mobile Menu Toggle Button */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
            title="Toggle Menu"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        )}

        {/* Navigation Tabs Container */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 h-full">
            {navTabs.map((tab) => {
              
              const isBaseUrl = `/core/workspace/${workspaceId}/project/${projectId}`;
              const isActive = 
                pathname === tab.path || 
                (tab.isBasePath && pathname === isBaseUrl);

              const TabIcon = tab.icon;

              return (
                <Link key={tab.id} href={tab.path} className="relative flex items-center h-full group">
                  <button
                    className={`
                      flex items-center gap-2 py-3 text-sm font-medium transition-colors whitespace-nowrap
                      ${isActive 
                        ? 'text-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                      }
                    `}
                  >
                    <TabIcon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span>{tab.label}</span>
                  </button>

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-full animate-in fade-in duration-200"></div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}