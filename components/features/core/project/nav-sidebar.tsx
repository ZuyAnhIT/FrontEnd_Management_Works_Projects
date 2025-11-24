'use client'

import { 
  LayoutDashboard, 
  ListTodo, 
  Menu, 
  ChevronRight, 
  ChevronLeft, 
  FolderKanban, 
  GitBranch, 
  Calendar, 
  BarChart3, 
  X, 
  Plus, 
  Settings,
  HelpCircle
} from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
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
    { id: 'backlog', icon: Menu, label: 'List', path: `/core/workspace/project/${projectId}/backlog` },
    { id: 'sprints', icon: GitBranch, label: 'Backlog', path: `/core/workspace/project/${projectId}/sprints` },
    { id: 'timeline', icon: Calendar, label: 'Timeline', path: `/core/workspace/project/${projectId}/timeline` },
    { id: 'summary', icon: BarChart3, label: 'Summary', path: `/core/workspace/project/${projectId}/summary` },
  ]

  const quickActions = [
    { id: 'create-task', icon: Plus, label: 'Create Task', onClick: onCreateTask },
    { id: 'create-sprint', icon: GitBranch, label: 'Create Sprint', onClick: onCreateSprint },
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
        ${collapsed ? 'w-[70px]' : 'w-64'} 
        bg-[#F4F5F7] border-r border-slate-200
        transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        
        {/* =================================================
            HEADER: Project Info
        ================================================= */}
        <div className="p-4 flex items-center gap-3 h-16 border-b border-slate-200/50">
           {/* Project Icon */}
           <div className={`
              relative flex items-center justify-center shrink-0 transition-all duration-300
              bg-blue-600 rounded-lg shadow-sm
              ${collapsed ? 'w-10 h-10 mx-auto' : 'w-8 h-8'}
           `}>
              <FolderKanban className="w-5 h-5 text-white" />
           </div>

           {/* Project Name & Collapse Toggle */}
           {!collapsed && (
             <div className="flex-1 min-w-0 flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex flex-col">
                   <span className="font-bold text-slate-800 text-sm truncate leading-tight">
                     {projectName}
                   </span>
                   <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                     Software Project
                   </span>
                </div>
             </div>
           )}
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
           {navItems.map((item) => {
             // Logic check active path chính xác hơn
             const isActive = pathname === item.path || (item.id !== 'dashboard' && pathname?.includes(`/${item.id}`));
             
             return (
               <Link key={item.id} href={item.path} className="block">
                 <button
                   className={`
                     group flex items-center w-full rounded-md transition-all duration-200 relative
                     ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2 gap-3'}
                     ${isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                     }
                   `}
                   onClick={() => { if (window.innerWidth < 1024) onClose() }}
                   title={collapsed ? item.label : undefined}
                 >
                    {/* Active Bar Indicator (Jira style) */}
                    {isActive && (
                        <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r-full"></div>
                    )}

                    <item.icon className={`
                        ${collapsed ? 'w-6 h-6' : 'w-5 h-5'}
                        ${isActive ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'}
                        transition-colors
                    `} />
                    
                    {!collapsed && (
                      <span className="text-sm font-medium truncate">
                        {item.label}
                      </span>
                    )}
                 </button>
               </Link>
             )
           })}

           {/* Divider */}
           <div className="my-4 border-t border-slate-200 mx-2"></div>

           {/* Quick Actions */}
           {!collapsed && (
             <div className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
               Actions
             </div>
           )}

           {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                    action.onClick?.();
                    if (window.innerWidth < 1024) onClose();
                }}
                className={`
                  group flex items-center w-full rounded-md transition-all duration-200
                  ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2 gap-3'}
                  text-slate-600 hover:bg-slate-200/60 hover:text-slate-900
                `}
                title={collapsed ? action.label : undefined}
              >
                 <action.icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} text-slate-500`} />
                 {!collapsed && <span className="text-sm font-medium">{action.label}</span>}
              </button>
           ))}
        </nav>

        {/* =================================================
            FOOTER: Settings & Collapse
        ================================================= */}
        <div className="p-3 border-t border-slate-200 bg-[#F4F5F7]">
           <div className="space-y-1 mb-2">
               <button className={`
                   flex items-center w-full rounded-md text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition-colors
                   ${collapsed ? 'justify-center py-3' : 'px-3 py-2 gap-3'}
               `}>
                  <Settings className="w-5 h-5 text-slate-500" />
                  {!collapsed && <span className="text-sm font-medium">Project Settings</span>}
               </button>
           </div>

           {/* Collapse Toggle (Desktop Only) */}
           <button
             onClick={() => setCollapsed(!collapsed)}
             className={`
                hidden lg:flex w-full items-center rounded-md text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 transition-colors mt-auto
                ${collapsed ? 'justify-center py-3' : 'justify-end px-3 py-2'}
             `}
             title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
           >
             {collapsed ? (
                <ChevronRight className="w-5 h-5" />
             ) : (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                   <span>Collapse</span>
                   <ChevronLeft className="w-4 h-4" />
                </div>
             )}
           </button>
        </div>
      </aside>
    </>
  )
}