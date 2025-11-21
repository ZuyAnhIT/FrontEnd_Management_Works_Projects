"use client";

import {
  Home,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Building,
  Users,
  FolderKanban,
  CreditCard,
  LayoutDashboard,
  X,
  Settings
} from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeMenu: string;
  setActiveMenu: (id: string) => void;
  workspaces: any[];
  loadingWs: boolean;
}

export default function AdminSidebar({
  isOpen,
  onClose,
  activeMenu,
  setActiveMenu,
  workspaces,
  loadingWs,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useAuth();

  const isCompanyAdminPage = pathname?.startsWith("/admin/company");
  const isCompanyAdminRole = role === "COMPANY_ADMIN";

  const defaultMenu = [
    { id: "home", icon: Home, label: "Dashboard", path: "/admin" },
    { id: "tasks", icon: UserCheck, label: "My Tasks", path: "/admin/tasks" },
  ];
  
  const companyMenu = [
    { id: "dashboard", icon: LayoutDashboard, label: "Overview", path: "/admin/company/dashboard" },
    { id: "info", icon: Building, label: "Company Info", path: "/admin/company/companyinfo" },
    { id: "members", icon: Users, label: "Members", path: "/admin/company/members" },
    { id: "workspaces", icon: FolderKanban, label: "Workspaces", path: "/admin/company/workspaces" },
    { id: "project", icon: FolderKanban, label: "Projects", path: "/admin/company/project" },
    { id: "billing", icon: CreditCard, label: "Billing", path: "/admin/company/billing" },
  ];

  const menuItems = isCompanyAdminPage ? companyMenu : defaultMenu;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR CONTAINER */}
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
            <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
               <Building className="w-4 h-4 text-white" />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1 animate-in fade-in duration-200">
                <span className="block text-slate-900 font-bold text-sm truncate">
                    {isCompanyAdminPage ? "Company Admin" : "System Admin"}
                </span>
                <span className="block text-slate-500 text-[10px] font-semibold uppercase tracking-wide">
                    Management Console
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
          
          {/* SECTION: MAIN MENU */}
          <div className="space-y-1">
             {!collapsed && (
                 <div className="px-3 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    General
                 </div>
             )}

             {menuItems.map((item) => {
                 const isActive = pathname === item.path;
                 return (
                    <Link key={item.id} href={item.path} className="block">
                        <button
                            className={`group relative w-full flex items-center rounded-md transition-all duration-200 ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2 gap-3'} ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'}`}
                            onClick={() => { 
                                setActiveMenu(item.id);
                                if(window.innerWidth < 1024) onClose(); 
                            }}
                            title={collapsed ? item.label : undefined}
                        >
                            {isActive && <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r-full"></div>}
                            <item.icon className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4'} ${isActive ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'} transition-colors`} />
                            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                        </button>
                    </Link>
                 )
             })}
          </div>
          
          {/* Settings Link (Static) */}
          <div className="space-y-1 border-t border-slate-200 pt-4 mx-1">
             <button 
                onClick={() => router.push("/admin/settings")}
                className={`group w-full flex items-center rounded-md transition-all duration-200 text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2 gap-3'}`}
                title={collapsed ? "Global Settings" : undefined}
             >
                 <Settings className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4'} text-slate-500 group-hover:text-slate-700`} />
                 {!collapsed && <span className="text-sm font-medium">Global Settings</span>}
             </button>
          </div>

        </nav>

        {/* ===== FOOTER: COLLAPSE TOGGLE (FIXED BOTTOM) ===== */}
        <div className="p-4 border-t border-slate-200 bg-[#F4F5F7] shrink-0">
           <button
             onClick={() => setCollapsed(!collapsed)}
             className={`
                hidden lg:flex w-full items-center rounded-md text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 transition-colors
                ${collapsed ? 'justify-center py-2' : 'justify-start gap-3 px-2 py-2'}
             `}
             title={collapsed ? "Expand" : "Collapse"}
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

      {/* ⚠️ QUAN TRỌNG: Placeholder div để đẩy nội dung chính sang phải */}
      <div 
         className={`hidden lg:block transition-all duration-300 ease-in-out ${collapsed ? "w-[64px]" : "w-64"}`} 
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </>
  );
}