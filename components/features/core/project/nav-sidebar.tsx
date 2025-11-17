'use client'

import { LayoutDashboard, ListTodo, Menu, ChevronRight, ChevronLeft, FolderKanban, GitBranch, Calendar, BarChart3, Sparkles, X, Plus } from 'lucide-react'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProjectSidebarProps {
  projectId: string
  projectName?: string
  isOpen: boolean
  onClose: () => void
  onCreateTask?: () => void
  onCreateSprint?: () => void
}

export default function ProjectSidebar({
  projectId,
  projectName = 'Project',
  isOpen,
  onClose,
  onCreateTask,
  onCreateSprint,
}: ProjectSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: `/core/workspace/project/${projectId}` },
    { id: 'board', icon: ListTodo, label: 'Board', path: `/core/workspace/project/${projectId}/board` },
    { id: 'backlog', icon: Menu, label: 'Backlog', path: `/core/workspace/project/${projectId}/backlog` },
    { id: 'sprints', icon: GitBranch, label: 'Sprints', path: `/core/workspace/project/${projectId}/sprints` },
    { id: 'timeline', icon: Calendar, label: 'Timeline', path: `/core/workspace/project/${projectId}/timeline` },
    { id: 'summary', icon: BarChart3, label: 'Summary', path: `/core/workspace/project/${projectId}/summary` },
  ]

  const quickActions = [
    { id: 'create-task', icon: Plus, label: 'New Task', onClick: onCreateTask },
    { id: 'create-sprint', icon: GitBranch, label: 'New Sprint', onClick: onCreateSprint },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 
        ${collapsed ? 'w-20' : 'w-72'} 
        bg-gradient-to-b from-white via-blue-50/30 to-white
        border-r border-gray-200/80 shadow-xl lg:shadow-none
        transition-all duration-300 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 p-4 shadow-lg">
          <div className="relative z-10 flex items-center justify-between">
            <div
              className={`flex items-center gap-3 ${
                collapsed ? 'justify-center w-full' : ''
              }`}
            >
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-bold text-white text-sm truncate">
                      {projectName}
                    </span>
                  </div>
                  <span className="text-white/80 text-xs">Project Management</span>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </button>
          )}

          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Navigation
              </div>
            )}

            {navItems.map((item, index) => {
              const isActive = pathname === item.path
              return (
                <Link key={item.id} href={item.path}>
                  <button
                    className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 animate-fadeInUp ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                    } ${collapsed ? 'justify-center' : ''}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose()
                    }}
                  >
                    <item.icon
                      className={`w-5 h-5 transition-transform ${
                        !isActive && 'group-hover:scale-110'
                      }`}
                    />
                    {!collapsed && (
                      <span
                        className={`flex-1 text-left font-medium ${
                          isActive ? 'font-semibold' : ''
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                    {!collapsed && isActive && (
                      <ChevronRight className="w-4 h-4 animate-pulse" />
                    )}
                  </button>
                </Link>
              )
            })}
          </div>

          {!collapsed && (
            <div className="space-y-1 pt-4 border-t border-gray-200/50">
              <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-3 h-3" />
                Quick Actions
              </div>
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    action.onClick?.()
                    if (window.innerWidth < 1024) onClose()
                  }}
                  className="group w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 hover:shadow-md hover:text-emerald-700"
                >
                  <action.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span className="flex-1 text-left font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50">
          {!collapsed ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 rounded-xl p-4 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"></div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white text-xs font-medium mb-0.5">
                    Project Tools
                  </div>
                  <div className="text-white font-bold text-sm">Active</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
        </div>
      </aside>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        .animate-shine {
          animation: shine 3s infinite;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  )
}
