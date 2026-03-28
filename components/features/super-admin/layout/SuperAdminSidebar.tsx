"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Building2,
  CreditCard,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldAlert,
} from "lucide-react";

// Định nghĩa Props rõ ràng cho Sidebar
export interface SuperAdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeMenu: string;
  setActiveMenu: (id: string) => void;
}

export default function SuperAdminSidebar({
  isOpen,
  onClose,
  activeMenu,
  setActiveMenu,
}: SuperAdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const superAdminMenuItems = useMemo(() => [
    { id: "dashboard", icon: LayoutDashboard, label: "Tổng quan", path: "/super-admin" },
    { id: "companies", icon: Building2, label: "Quản lý Công ty", path: "/super-admin/companies" },
    { id: "users", icon: Users, label: "Quản lý Người dùng", path: "/super-admin/users" },
    { id: "plans", icon: CreditCard, label: "Quản lý Gói cước", path: "/super-admin/plans" },
  ], []);

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Chính */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50
          bg-white border-r border-slate-200 shadow-sm
          flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? "w-[70px]" : "w-64"} 
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header của Sidebar */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden transition-all ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors text-white bg-red-600">
               <ShieldAlert className="w-5 h-5" />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1 animate-in fade-in duration-300">
                <span className="block text-slate-900 font-bold text-sm truncate leading-tight">
                    Platform Admin
                </span>
                <span className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wide mt-0.5">
                    System Management
                </span>
              </div>
            )}
          </div>

          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {!collapsed && (
             <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
               Quản trị cốt lõi
             </div>
          )}

          {superAdminMenuItems.map((item) => {
            const isActive = item.path === "/super-admin" 
                ? pathname === item.path 
                : pathname?.startsWith(item.path);

            return (
              <Link key={item.id} href={item.path} className="block">
                <div
                  onClick={() => { 
                      setActiveMenu(item.id);
                      if(window.innerWidth < 1024) onClose(); 
                  }}
                  className={`
                    group relative flex items-center rounded-xl transition-all duration-200 cursor-pointer
                    ${collapsed ? 'justify-center py-3 px-0' : 'px-3 py-2.5 gap-3'} 
                    ${isActive 
                        ? 'bg-red-50 text-red-700 font-medium' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-red-600 rounded-r-full" />
                  )}

                  <item.icon 
                    className={`
                        transition-colors
                        ${collapsed ? 'w-5 h-5' : 'w-4.5 h-4.5'} 
                        ${isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'}
                    `} 
                  />
                  
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer của Sidebar */}
        <div className="p-3 border-t border-slate-100 bg-white space-y-1">
           <Link href="/super-admin/settings" className="block">
             <button 
               onClick={() => {
                  setActiveMenu("settings");
                  if(window.innerWidth < 1024) onClose();
               }}
               className={`
                  w-full flex items-center rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors
                  ${collapsed ? 'justify-center py-3' : 'px-3 py-2.5 gap-3'}
               `}
               title="Cấu hình hệ thống"
             >
               <Settings className="w-4.5 h-4.5" />
               {!collapsed && <span className="text-sm font-medium">Cấu hình hệ thống</span>}
             </button>
           </Link>

           <button
             onClick={() => setCollapsed(!collapsed)}
             className={`
                hidden lg:flex w-full items-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors
                ${collapsed ? 'justify-center py-3' : 'justify-end px-3 py-2'}
             `}
           >
             {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
           </button>
        </div>
      </aside>

      {/* Spacer giữ layout */}
      <div className={`hidden lg:block transition-all duration-300 ease-in-out ${collapsed ? "w-[70px]" : "w-64"}`} />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </>
  );
}