'use client'

import {
  LayoutDashboard,
  ListTodo,
  Menu as MenuIcon,
  GitBranch,
  Calendar,
  BarChart3,
  ChevronRight,
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
      id: 'backlog',
      icon: MenuIcon,
      label: 'Backlog',
      path: `/core/workspace/${workspaceId}/project/${projectId}/backlog`,
    },
    {
      id: 'sprints',
      icon: GitBranch,
      label: 'Sprints',
      path: `/core/workspace/${workspaceId}/project/${projectId}/sprints`,
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
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center h-14 px-4 gap-2">
        
        {/* Menu button for mobile */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <MenuIcon className="w-5 h-5 text-gray-700" />
        </button>

        {/* Navigation Tabs */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-0.5">
            {navTabs.map((tab) => {
              const isActive =
                pathname === tab.path ||
                (tab.id === 'dashboard' &&
                  pathname.endsWith(`/project/${projectId}`))

              return (
                <Link key={tab.id} href={tab.path}>
                  <button
                    className={`flex items-center gap-2 px-4 py-2.5 whitespace-nowrap transition-all duration-200 font-medium border-b-2 ${
                      isActive
                        ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                        : 'text-gray-600 border-transparent hover:text-gray-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>

                    {isActive && (
                      <ChevronRight className="w-3 h-3 animate-pulse" />
                    )}
                  </button>
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
