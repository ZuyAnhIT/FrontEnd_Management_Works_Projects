'use client'

import { LayoutDashboard, ListTodo, Menu, ChevronRight, ChevronLeft, FolderKanban, GitBranch, Calendar, BarChart3, Sparkles, X, Plus, ChevronDown } from 'lucide-react'
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
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: `/core/workspace/project/${projectId}`, color: 'from-purple-500 to-indigo-500' },
    { id: 'board', icon: ListTodo, label: 'Board', path: `/core/workspace/project/${projectId}/board`, color: 'from-blue-500 to-cyan-500' },
    { id: 'backlog', icon: Menu, label: 'Backlog', path: `/core/workspace/project/${projectId}/backlog`, color: 'from-indigo-500 to-purple-500' },
    { id: 'sprints', icon: GitBranch, label: 'Sprints', path: `/core/workspace/project/${projectId}/sprints`, color: 'from-emerald-500 to-teal-500' },
    { id: 'timeline', icon: Calendar, label: 'Timeline', path: `/core/workspace/project/${projectId}/timeline`, color: 'from-purple-500 to-pink-500' },
    { id: 'summary', icon: BarChart3, label: 'Summary', path: `/core/workspace/project/${projectId}/summary`, color: 'from-pink-500 to-rose-500' },
  ]

  const quickActions = [
    { id: 'create-task', icon: Plus, label: 'New Task', onClick: onCreateTask, color: 'from-blue-500 to-cyan-500' },
    { id: 'create-sprint', icon: GitBranch, label: 'New Sprint', onClick: onCreateSprint, color: 'from-emerald-500 to-teal-500' },
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
        ${collapsed ? 'w-20' : 'w-80'} 
        bg-gradient-to-br from-slate-50 via-white to-slate-50
        border-r border-slate-200 shadow-2xl lg:shadow-xl
        transition-all duration-300 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header Section */}
        <div className="relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"></div>
          <div className="absolute inset-0 bg-grid-white/10"></div>
          
          {/* Header Content */}
          <div className="relative z-10 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                    <FolderKanban className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-base truncate">
                        {projectName}
                      </span>
                      <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0 animate-pulse" />
                    </div>
                    <span className="text-white/80 text-xs font-medium">Project Management</span>
                  </div>
                )}
              </div>

              {/* Desktop Collapse Button */}
              {!collapsed && (
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="hidden lg:flex p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
              )}

              {/* Mobile Close Button */}
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Collapsed Expand Button */}
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="w-full flex justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {!collapsed && (
            <div className="px-3 py-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Navigation
                </span>
              </div>
            </div>
          )}

          {navItems.map((item, index) => {
            const isActive = pathname === item.path
            return (
              <Link key={item.id} href={item.path}>
                <button
                  className={`group relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 animate-fadeInUp overflow-hidden ${
                    isActive
                      ? 'bg-white shadow-lg scale-[1.02] ring-2 ring-blue-100'
                      : 'hover:bg-white/80 hover:shadow-md hover:scale-[1.01]'
                  } ${collapsed ? 'justify-center' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose()
                  }}
                >
                  {/* Active Indicator */}
                  {isActive && !collapsed && (
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.color} rounded-r-full`}></div>
                  )}

                  {/* Icon with Gradient on Active */}
                  <div className={`relative flex-shrink-0 transition-transform ${!isActive && 'group-hover:scale-110'}`}>
                    {isActive && (
                      <div className={`absolute -inset-2 bg-gradient-to-r ${item.color} rounded-xl blur opacity-20`}></div>
                    )}
                    <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive 
                        ? `bg-gradient-to-r ${item.color}` 
                        : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}>
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                  </div>

                  {/* Label */}
                  {!collapsed && (
                    <>
                      <span className={`flex-1 text-left font-semibold transition-colors ${
                        isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
                      }`}>
                        {item.label}
                      </span>
                      
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-slate-400 animate-pulse" />
                      )}
                    </>
                  )}

                  {/* Collapsed Active Indicator */}
                  {collapsed && isActive && (
                    <div className="absolute right-1 top-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              </Link>
            )
          })}

          {/* Quick Actions Section */}
          {!collapsed && (
            <>
              <div className="pt-4 pb-2">
                <div className="flex items-center gap-2 px-3">
                  <div className="w-1 h-4 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Quick Actions
                  </span>
                </div>
              </div>

              {quickActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={() => {
                    action.onClick?.()
                    if (window.innerWidth < 1024) onClose()
                  }}
                  className="group relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:shadow-md hover:scale-[1.01] overflow-hidden"
                >
                  {/* Hover Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                  
                  <div className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 group-hover:bg-white transition-all group-hover:scale-110">
                    <action.icon className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  
                  <span className="flex-1 text-left font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                    {action.label}
                  </span>
                  
                  <Plus className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-slate-200">
          {!collapsed ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-4 shadow-xl group cursor-pointer hover:scale-[1.02] transition-transform">
              {/* Animated Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shine"></div>
              
              {/* Content */}
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-xs font-semibold mb-0.5 opacity-90">
                    Project Tools
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-white font-bold text-sm">Active & Running</div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
              </div>
            </div>
          ) : (
            <div className="flex justify-center group cursor-pointer">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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
        
        .bg-grid-white\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
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