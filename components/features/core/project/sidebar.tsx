'use client'

import { FolderKanban, Users, Settings, ChevronLeft, ChevronRight, X, Sparkles, Crown, Plus, ListTodo, GitBranch } from 'lucide-react'
import { useState } from 'react'
import { usePathname, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface ProjectCoreSidebarProps {
  projectId: string
  projectName: string
  isOpen: boolean
  onClose: () => void
  onCreateTask?: () => void
  onCreateSprint?: () => void
}

export default function ProjectCoreSidebar({
  projectId,
  projectName,
  isOpen,
  onClose,
  onCreateTask,
  onCreateSprint,
}: ProjectCoreSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { workspaceId } = useParams() as { workspaceId: string }

  const projectMenu = [
    {
      id: 'projects',
      icon: FolderKanban,
      label: 'Dự án',
      path: `/core/workspace/${workspaceId}/project/${projectId}`,
    },
    {
      id: 'members',
      icon: Users,
      label: 'Thành viên',
      path: `/core/workspace/${workspaceId}/project/${projectId}/member`,
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Cài đặt',
      path: `/core/workspace/${workspaceId}/project/${projectId}/settings`,
    },
  ]

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 
        ${collapsed ? 'w-20' : 'w-72'} 
        bg-gradient-to-b from-white via-blue-50/40 to-white
        border-r border-blue-200/50 shadow-xl lg:shadow-none
        transform transition-all duration-300 ease-in-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        flex flex-col`}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-4 shadow-lg">
          <div className="absolute inset-0 bg-grid-white/10"></div>

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
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span className="font-bold text-white text-sm truncate">
                      {projectName}
                    </span>
                  </div>
                  <span className="text-white/80 text-xs">Quản lý dự án</span>
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

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          

          <div className="space-y-1">
            {!collapsed && (
              <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Quản lý
              </div>
            )}
            {projectMenu.map((item, index) => {
              const isActive = pathname === item.path
              return (
                <Link key={item.id} href={item.path}>
                  <button
                    className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-[1.02]'
                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                    } ${collapsed ? 'justify-center' : ''}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose()
                    }}
                  >
                    <item.icon className="w-5 h-5" />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                </Link>
              )
            })}
          </div>

          <div className="space-y-2">
            {!collapsed && (
              <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Thao tác nhanh
              </div>
            )}
            <button
              onClick={onCreateTask}
              className="group w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              {!collapsed && <span>Tạo Task</span>}
            </button>
            <button
              onClick={onCreateSprint}
              className="group w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all duration-200"
            >
              <GitBranch className="w-5 h-5" />
              {!collapsed && <span>Tạo Sprint</span>}
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-200/50">
          {!collapsed ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 rounded-xl p-4 shadow-lg">
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white text-xs font-medium mb-0.5">
                    Quyền hạn
                  </div>
                  <div className="text-white font-bold text-sm flex items-center gap-1">
                    Project Admin
                    <Sparkles className="w-3 h-3 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
        </div>
      </aside>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .bg-grid-white\\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }
      `}</style>
    </>
  )
}
