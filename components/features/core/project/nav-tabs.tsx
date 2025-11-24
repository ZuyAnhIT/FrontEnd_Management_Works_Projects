'use client'

import {
  LayoutDashboard,
  ListTodo,
  Menu as MenuIcon,
  GitBranch,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'

interface ProjectNavTabsProps {
  projectId: string
  onMenuToggle?: () => void
}

export default function ProjectNavTabs({
  projectId,
  onMenuToggle,
}: ProjectNavTabsProps) {
  const pathname = usePathname()
  const { workspaceId } = useParams() as { workspaceId: string }

  const navTabs = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: `/core/workspace/${workspaceId}/project/${projectId}`,
    },
    {
      id: 'board',
      icon: ListTodo,
      label: 'Board',
      path: `/core/workspace/${workspaceId}/project/${projectId}/board`,
    },
    {
      id: 'sprints',
      icon: GitBranch,
      label: 'Sprint',
      path: `/core/workspace/${workspaceId}/project/${projectId}/sprints`,
    },
    {
      id: 'backlog',
      icon: MenuIcon,
      label: 'Backlog',
      path: `/core/workspace/${workspaceId}/project/${projectId}/backlog`,
    },
  
    {
      id: 'timeline',
      icon: Calendar,
      label: 'Timeline',
      path: `/core/workspace/${workspaceId}/project/${projectId}/timeline`,
    },
    {
      id: 'summary',
      icon: BarChart3,
      label: 'Summary',
      path: `/core/workspace/${workspaceId}/project/${projectId}/summary`,
    },
  ]

  return (
    <div className="bg-white border-b border-slate-200 sticky top-14 z-30">
      <div className="flex items-center h-12 px-4 lg:px-6 gap-4">
        
        {/* Menu button for mobile */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        {/* Navigation Tabs Container */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 h-full">
            {navTabs.map((tab) => {
              // Logic check active path chính xác hơn
              const isActive = 
                pathname === tab.path || 
                (tab.id === 'dashboard' && pathname?.endsWith(`/project/${projectId}`));

              return (
                <Link key={tab.id} href={tab.path} className="relative flex items-center h-full group">
                  <button
                    className={`
                      flex items-center gap-2 py-3 text-sm font-medium transition-colors whitespace-nowrap
                      ${isActive 
                        ? 'text-blue-600' // Active: Chữ xanh
                        : 'text-slate-600 hover:text-slate-900' // Inactive: Chữ xám
                      }
                    `}
                  >
                    {/* Icon ẩn trên mobile nhỏ để tiết kiệm chỗ, hiện trên tablet trở lên */}
                    <tab.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    
                    <span>{tab.label}</span>
                  </button>

                  {/* Active Indicator Bar (Gạch chân xanh) */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-full animate-in fade-in zoom-in-x duration-200"></div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

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