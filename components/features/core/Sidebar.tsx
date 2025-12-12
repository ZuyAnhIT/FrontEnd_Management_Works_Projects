"use client";

import {
  Home,
  UserCheck,
  FolderKanban,
  ClipboardCheck,
  Settings,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Building2,
  X,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeMenu: string | null;
  setActiveMenu: (id: string) => void;
  workspaces?: any[]; // ✅ Nhận data từ Layout (đã xử lý quyền)
}

export default function Sidebar({
  isOpen,
  onClose,
  activeMenu,
  setActiveMenu,
  workspaces = [] // Default empty
}: SidebarProps) {
  
  const [collapsed, setCollapsed] = useState(false);
  const [showProjects, setShowProjects] = useState(true); 
  const [projects, setProjects] = useState<any[]>([]); 

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const workspaceId = params.workspaceId;
  const { showToast } = useToast();

  const isWorkspaceView = pathname?.startsWith("/core/workspace/");

  // Menu Configs
  const memberMenu = [
    { id: "home", icon: Home, label: "Overview", path: "/core" }, // Sửa path về /core
    // { id: "company", icon: Building2, label: "Company", path: "/core/company" }, // Tạm ẩn nếu chưa có
    // { id: "tasks", icon: UserCheck, label: "My Work", path: "/core/tasks" },
  ];

  const workspaceMenu = [
    { id: "overview", icon: Home, label: "Summary", path: `/core/workspace/${workspaceId}` },
    { 
      id: "projects", 
      icon: FolderKanban, 
      label: "Projects",
      path: `/core/workspace/${workspaceId}/project`,
      hasSubmenu: true 
    },
    { id: "members", icon: ClipboardCheck, label: "People", path: `/core/workspace/${workspaceId}/members` },
    { id: "settings", icon: Settings, label: "Settings", path: `/core/workspace/${workspaceId}/settings` },
  ];

  const menuToRender = isWorkspaceView ? workspaceMenu : memberMenu;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR CONTAINER (FIXED) */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 
          bg-[#F4F5F7] border-r border-slate-200
          flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? "w-[64px]" : "w-64"} 
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ===== HEADER (FIXED TOP) ===== */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/50 bg-[#F4F5F7] shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden transition-all ${collapsed ? 'justify-center w-full' : ''}`}>
            
            {/* Logo Icon */}
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
               {isWorkspaceView ? <Briefcase className="w-4 h-4 text-white" /> : <Building2 className="w-4 h-4 text-white" />}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1 animate-in fade-in duration-200">
                <span className="block text-slate-900 font-bold text-sm truncate">
                    {isWorkspaceView ? "Workspace" : "WorkNet"}
                </span>
                <span className="block text-slate-500 text-[10px] font-semibold uppercase tracking-wide">
                    {isWorkspaceView ? "Department" : "Enterprise"}
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===== SCROLLABLE CONTENT ===== */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar">
          
          {/* SECTION 1: MAIN MENU */}
          <div className="space-y-1">
            {menuToRender.map((item: any) => {
              // Logic check active path tốt hơn
              const isActive = activeMenu === item.path || (item.hasSubmenu && activeMenu?.startsWith(item.path));
              
              return (
                <div key={item.id}>
                    <div className="flex items-center">
                        <button
                            onClick={() => {
                                if (item.path) {
                                    router.push(item.path);
                                    if (window.innerWidth < 1024) onClose();
                                }
                            }}
                            className={`group relative flex-1 flex items-center rounded-md transition-all duration-200 ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2 gap-3'} ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'}`}
                            title={collapsed ? item.label : undefined}
                        >
                            {isActive && <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r-full"></div>}
                            <item.icon className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4'} ${isActive ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'} transition-colors`} />
                            {!collapsed && <span className="text-left text-sm font-medium">{item.label}</span>}
                        </button>

                        {/* Chevron Toggle */}
                        {!collapsed && item.hasSubmenu && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowProjects(!showProjects); }}
                                className="p-2 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 ml-1"
                            >
                                {showProjects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        )}
                    </div>

                    {/* Submenu Projects (Placeholder) */}
                    {!collapsed && item.hasSubmenu && showProjects && projects.length > 0 && (
                        <div className="mt-1 space-y-1 ml-4 border-l-2 border-slate-200 pl-2 animate-in slide-in-from-top-2 duration-200">
                            {projects.map((p: any) => (
                                <button
                                    key={p.id}
                                    onClick={() => router.push(`/core/workspace/${workspaceId}/project/${p.id}`)}
                                    className="block w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
              );
            })}
          </div>

          {/* SECTION 2: WORKSPACES LIST (Received from Props) */}
          {!isWorkspaceView && !collapsed && (
              <div className="pt-4 border-t border-slate-200 mx-1">
                  <div className="px-2 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Workspaces</span>
                      {workspaces.length > 0 && <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">{workspaces.length}</span>}
                  </div>
                  
                  <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                      {workspaces.length > 0 ? (
                          workspaces.map((ws) => (
                              <button
                                  key={ws.id}
                                  onClick={() => router.push(`/core/workspace/${ws.id}`)}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition-colors text-sm group"
                              >
                                  <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-blue-500 transition-colors"></div>
                                  <span className="truncate flex-1 text-left">{ws.name || ws.workspaceName}</span>
                              </button>
                          ))
                      ) : (
                          <div className="px-3 py-2 text-xs text-slate-400 italic">No workspaces found</div>
                      )}
                  </div>
              </div>
          )}
        </nav>

        {/* ===== FOOTER: COLLAPSE TOGGLE ===== */}
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
                   <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-200 text-slate-500 group-hover:text-slate-700">
                      <ChevronLeft className="w-4 h-4" />
                   </div>
                   <span className="text-xs font-medium">Collapse sidebar</span>
                </>
             )}
           </button>
        </div>
      </aside>

      {/* Placeholder div để đẩy content sang phải */}
      <div className={`hidden lg:block transition-all duration-300 ease-in-out ${collapsed ? "w-[64px]" : "w-64"}`} />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </>
  );
}