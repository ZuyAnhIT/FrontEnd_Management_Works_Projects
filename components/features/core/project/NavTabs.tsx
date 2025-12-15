'use client'

import {
  LayoutDashboard,
  ListTodo,
  Menu as MenuIcon,
  GitBranch, // Sử dụng cho List View
  Archive,
  Calendar, // Sử dụng cho Timeline
  CalendarDays, // Sử dụng cho Calendar View
} from 'lucide-react'
import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface ProjectNavTabsProps {
  projectId: string
  onMenuToggle?: () => void
}

// =============================================================================
// 2. CONFIGURATION
// =============================================================================

const getNavTabs = (workspaceId: string, projectId: string) => [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: `/core/workspace/${workspaceId}/project/${projectId}`,
      isBasePath: true, // Đánh dấu đây là path gốc (base path)
    },
    {
      id: 'board',
      icon: ListTodo,
      label: 'Board',
      path: `/core/workspace/${workspaceId}/project/${projectId}/board`,
    },
    {
      id: 'list',
      icon: GitBranch,
      label: 'List',
      path: `/core/workspace/${workspaceId}/project/${projectId}/list`,
    },
    {
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
    {
      id: 'timeline',
      icon: Calendar,
      label: 'Timeline',
      path: `/core/workspace/${workspaceId}/project/${projectId}/timeline`,
    },
    {
      id: 'archived', 
      icon: Archive,
      label: 'Archived',
      path: `/core/workspace/${workspaceId}/project/${projectId}/archived`,
    },
];

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function ProjectNavTabs({
  projectId,
  onMenuToggle,
}: ProjectNavTabsProps) {
  // --- HOOKS ---
  const pathname = usePathname();
  const { workspaceId } = useParams() as { workspaceId: string };
  const navTabs = getNavTabs(workspaceId, projectId);

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
              
              // Logic check active path:
              // 1. Path hiện tại trùng khớp hoàn toàn với tab path.
              // 2. Nếu là Dashboard (base path), kiểm tra xem path có kết thúc bằng project ID không.
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
                    
                    {/* Icon */}
                    <TabIcon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    
                    <span>{tab.label}</span>
                  </button>

                  {/* Active Indicator Bar (Gạch chân xanh) */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-full animate-in fade-in duration-200"></div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar (giữ lại style gốc) */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}