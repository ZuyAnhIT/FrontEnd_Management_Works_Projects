'use client'

import { 
  FolderKanban, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Plus, 
  GitBranch 
} from 'lucide-react'
import { useState } from 'react'
import { usePathname, useParams } from 'next/navigation'
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
  const pathname = usePathname()
  const { workspaceId } = useParams() as { workspaceId: string }

  const projectMenu = [
    {
      id: 'projects',
      icon: FolderKanban,
      label: 'General',
      path: `/core/workspace/${workspaceId}/project/${projectId}`,
    },
    {
      id: 'members',
      icon: Users,
      label: 'Members',
      path: `/core/workspace/${workspaceId}/project/${projectId}/member`,
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      path: `/core/workspace/${workspaceId}/project/${projectId}/settings`,
    },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50
        ${collapsed ? 'w-[64px]' : 'w-64'}
        bg-[#F4F5F7] border-r border-slate-200
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col`}
      >
        
        {/* =================================================
            HEADER: Project Info
        ================================================= */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/50">
          <div className={`flex items-center gap-3 overflow-hidden transition-all ${collapsed ? 'justify-center w-full' : ''}`}>
            {/* Icon Project: Vuông bo góc, nền xanh */}
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
              <FolderKanban className="w-4 h-4 text-white" />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1 animate-in fade-in duration-200">
                <span className="block text-slate-900 font-bold text-sm truncate">{projectName}</span>
                <span className="block text-slate-500 text-[10px] font-semibold uppercase tracking-wide">Software Project</span>
              </div>
            )}
          </div>

          {/* Close Button (Mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =================================================
            MENU LIST
        ================================================= */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar">
          
          {/* Main Menu Section */}
          <div className="space-y-1">
            {!collapsed && (
               <div className="px-3 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                 Manage
               </div>
            )}

            {projectMenu.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link key={item.id} href={item.path} className="block">
                  <button
                    className={`
                      group relative w-full flex items-center rounded-md transition-all duration-200
                      ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2 gap-3'}
                      ${isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                      }
                    `}
                    title={collapsed ? item.label : undefined}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose()
                    }}
                  >
                    {/* Active Indicator Bar */}
                    {isActive && (
                        <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r-full"></div>
                    )}

                    <item.icon className={`
                        ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}
                        ${isActive ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'}
                        transition-colors
                    `} />

                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                </Link>
              )
            })}
          </div>

          {/* Quick Actions Section */}
          <div className="space-y-1 border-t border-slate-200 pt-4 mx-1">
            {!collapsed && (
               <div className="px-2 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                 Quick Actions
               </div>
            )}

            <button
              onClick={() => {
                  onCreateTask?.();
                  if (window.innerWidth < 1024) onClose();
              }}
              className={`
                group w-full flex items-center rounded-md transition-all duration-200 text-slate-600 hover:bg-slate-200/60 hover:text-slate-900
                ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2 gap-3'}
              `}
              title={collapsed ? "Create Task" : undefined}
            >
              <Plus className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4'} text-slate-500 group-hover:text-slate-700`} />
              {!collapsed && <span className="text-sm font-medium">Create Task</span>}
            </button>

            <button
              onClick={() => {
                  onCreateSprint?.();
                  if (window.innerWidth < 1024) onClose();
              }}
              className={`
                group w-full flex items-center rounded-md transition-all duration-200 text-slate-600 hover:bg-slate-200/60 hover:text-slate-900
                ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2 gap-3'}
              `}
              title={collapsed ? "Create Sprint" : undefined}
            >
              <GitBranch className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4'} text-slate-500 group-hover:text-slate-700`} />
              {!collapsed && <span className="text-sm font-medium">Create Sprint</span>}
            </button>
          </div>
        </nav>

        {/* =================================================
            FOOTER: Collapse Button
        ================================================= */}
        <div className="p-4 border-t border-slate-200">
           <button
             onClick={() => setCollapsed(!collapsed)}
             className={`
                hidden lg:flex w-full items-center rounded-md text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 transition-colors
                ${collapsed ? 'justify-center py-2' : 'justify-start gap-3 px-2 py-2'}
             `}
             title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
           >
             {collapsed ? (
                <ChevronRight className="w-5 h-5" />
             ) : (
                <>
                   <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-200 text-slate-500 group-hover:text-slate-700">
                      <ChevronLeft className="w-4 h-4" />
                   </div>
                   <span className="text-xs font-medium">Collapse sidebar</span>
                </>
             )}
           </button>
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
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  )
}