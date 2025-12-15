'use client'

import {
  FolderKanban, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  X,
  LayoutGrid
} from 'lucide-react'
import { useState } from 'react'
import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'

// =============================================================================
// 1. CONFIGURATION & INTERFACES
// =============================================================================

interface ProjectCoreSidebarProps {
  projectId: string
  projectName: string // Giữ lại prop nhưng không dùng trong UI này
  isOpen: boolean
  onClose: () => void
}

const getProjectMenu = (workspaceId: string, projectId: string) => [
  {
    id: 'general',
    icon: FolderKanban,
    label: 'General',
    path: `/core/workspace/${workspaceId}/project/${projectId}`, // Dashboard/Overview
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
];

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function ProjectCoreSidebar({
  projectId,
  isOpen,
  onClose,
}: ProjectCoreSidebarProps) {
  // --- STATE & HOOKS ---
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { workspaceId } = useParams() as { workspaceId: string }
  const projectMenu = getProjectMenu(workspaceId, projectId);

  // --- RENDER ---
  return (
    <>
      {/* Mobile Overlay (Backdrop) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50
          ${collapsed ? 'w-[64px]' : 'w-64'}
          bg-[#F4F5F7] border-r border-slate-200
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col`}
      >
        
        {/* =================================================
            HEADER: MANAGE PROJECT (h-14 matches Admin Header height)
        ================================================= */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200/50 bg-[#F4F5F7] shrink-0">
          <div className={`flex items-center gap-2 overflow-hidden transition-all text-slate-500 font-bold text-xs uppercase tracking-wider ${collapsed ? 'justify-center w-full' : ''}`}>
            
            {/* Icon Quản lý */}
            <LayoutGrid className="w-4 h-4" />

            {/* Text Manage */}
            {!collapsed && (
              <span className="animate-in fade-in duration-200 whitespace-nowrap">
                Manage Project
              </span>
            )}
          </div>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =================================================
            MENU LIST
        ================================================= */}
        <nav className="flex-1 overflow-y-auto pt-2 px-3 pb-6 space-y-6 custom-scrollbar">
          
          <div className="space-y-1">
            {projectMenu.map((item) => {
              // Logic check active: path hiện tại trùng với item path
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
                      // Đóng menu trên thiết bị mobile sau khi click
                      if (window.innerWidth < 1024) onClose()
                    }}
                  >
                    {/* Active Indicator Bar (Thanh xanh bên trái) */}
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
        </nav>

        {/* =================================================
            FOOTER: Collapse Button (Desktop Only)
        ================================================= */}
        <div className="p-4 border-t border-slate-200 bg-[#F4F5F7] shrink-0">
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
                  {/* Icon Collapse */}
                  <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-200 text-slate-500 group-hover:text-slate-700">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">Collapse sidebar</span>
               </>
             )}
           </button>
        </div>

      </aside>
      
      {/* Custom Scrollbar Styles (giữ nguyên styles gốc) */}
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