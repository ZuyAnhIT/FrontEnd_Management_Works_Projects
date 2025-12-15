"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users,
  FolderKanban,
  CreditCard,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Briefcase,
  LayoutGrid,
  Home
} from "lucide-react";

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeMenu: string;
  setActiveMenu: (id: string) => void;
  workspaces: any[]; // Giữ lại để tránh lỗi type ở Parent
  loadingWs: boolean;
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function AdminSidebar({
  isOpen,
  onClose,
  activeMenu,
  setActiveMenu,
}: SidebarProps) {
  // --- STATE & HOOKS ---
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // =========================================================================
  // 3. LOGIC: CONTEXT DETECTION (Xác định ngữ cảnh)
  // =========================================================================
  const isPortal = pathname?.startsWith("/portal");
  const isCompanyContext = pathname?.startsWith("/admin/company");

  // =========================================================================
  // 4. LOGIC: MENU CONFIGURATION (Cấu hình Menu)
  // =========================================================================

  // Menu cho Portal (User/Guest)
  const portalMenuItems = useMemo(() => [
    { 
      id: "portal-home", 
      icon: Home, 
      label: "Portal Home", 
      path: "/portal" 
    },
  ], []);

  // Menu cho Admin Hub (Danh sách công ty)
  const rootMenuItems = useMemo(() => [
    { 
      id: "companies", 
      icon: LayoutGrid, 
      label: "My Companies", 
      path: "/admin" 
    },
  ], []);
  
  // Menu cho Company Admin (Quản trị công ty)
  const companyMenuItems = useMemo(() => [
    { id: "dashboard", icon: LayoutDashboard, label: "Overview", path: "/admin/company/dashboard" },
    { id: "info", icon: Building2, label: "Company Info", path: "/admin/company/companyinfo" },
    { id: "members", icon: Users, label: "Members", path: "/admin/company/members" },
    { id: "workspaces", icon: FolderKanban, label: "Workspaces", path: "/admin/company/workspaces" },
    { id: "billing", icon: CreditCard, label: "Billing", path: "/admin/company/billing" },
  ], []);

  // Xác định danh sách menu cần hiển thị dựa trên ngữ cảnh
  const currentMenuItems = useMemo(() => {
    if (isPortal) return portalMenuItems;
    if (isCompanyContext) return companyMenuItems;
    return rootMenuItems;
  }, [isPortal, isCompanyContext, portalMenuItems, rootMenuItems, companyMenuItems]);

  // =========================================================================
  // 5. LOGIC: HEADER CONFIGURATION (Cấu hình Header Sidebar)
  // =========================================================================
  
  const headerConfig = useMemo(() => {
    if (isPortal) {
      return { 
        title: "My Workspace", 
        subtitle: "User Portal", 
        icon: FolderKanban, 
        color: "bg-indigo-600" 
      };
    }
    if (isCompanyContext) {
      return { 
        title: "Company Admin", 
        subtitle: "Management", 
        icon: Building2, 
        color: "bg-blue-600" 
      };
    }
    return { 
      title: "Admin Hub", 
      subtitle: "Select Company", 
      icon: Briefcase, 
      color: "bg-slate-900" 
    };
  }, [isPortal, isCompanyContext]);

  const HeaderIcon = headerConfig.icon;

  // =========================================================================
  // 6. RENDER
  // =========================================================================

  return (
    <>
      {/* --- Mobile Overlay --- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* --- SIDEBAR CONTAINER --- */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50
          bg-white border-r border-slate-200 shadow-sm
          flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? "w-[70px]" : "w-64"} 
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ===== HEADER SECTION ===== */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden transition-all ${collapsed ? 'justify-center w-full' : ''}`}>
            
            {/* Logo Context */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors text-white ${headerConfig.color}`}>
               <HeaderIcon className="w-5 h-5" />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1 animate-in fade-in duration-300">
                <span className="block text-slate-900 font-bold text-sm truncate leading-tight">
                    {headerConfig.title}
                </span>
                <span className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wide mt-0.5">
                    {headerConfig.subtitle}
                </span>
              </div>
            )}
          </div>

          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===== NAVIGATION SECTION ===== */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          
          {/* Label Group (Chỉ hiện ở Admin Context) */}
          {!collapsed && isCompanyContext && (
             <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
               Management
             </div>
          )}

          {currentMenuItems.map((item) => {
            // Logic check Active: 
            // Nếu là root path (/admin hoặc /portal) thì check exact match
            // Nếu là sub path thì check startsWith
            const isActive = (item.path === "/admin" || item.path === "/portal")
                ? pathname === item.path 
                : pathname?.startsWith(item.path);

            return (
              <Link key={item.id} href={item.path} className="block">
                <div
                  onClick={() => { 
                      setActiveMenu(item.id);
                      // Đóng menu trên mobile khi click
                      if(window.innerWidth < 1024) onClose(); 
                  }}
                  className={`
                    group relative flex items-center rounded-xl transition-all duration-200 cursor-pointer
                    ${collapsed ? 'justify-center py-3 px-0' : 'px-3 py-2.5 gap-3'} 
                    ${isActive 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                  )}

                  <item.icon 
                    className={`
                        transition-colors
                        ${collapsed ? 'w-5 h-5' : 'w-4.5 h-4.5'} 
                        ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
                    `} 
                  />
                  
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            )
          })}

          {/* Dòng kẻ phân cách */}
          {isCompanyContext && <div className="my-4 border-t border-slate-100 mx-2" />}

          {/* Nút Back to Hub (Chỉ hiện khi ở Company Admin) */}
          {isCompanyContext && !isPortal && (
            <Link href="/admin" className="block">
                <div 
                    className={`
                        group flex items-center rounded-xl transition-all duration-200 cursor-pointer text-slate-500 hover:bg-slate-50 hover:text-slate-900
                        ${collapsed ? 'justify-center py-3 px-0' : 'px-3 py-2.5 gap-3'} 
                    `}
                    title="Back to all companies"
                >
                    <LayoutGrid className={`${collapsed ? 'w-5 h-5' : 'w-4.5 h-4.5'} text-slate-400 group-hover:text-slate-600`} />
                    {!collapsed && <span className="text-sm">Back to Hub</span>}
                </div>
            </Link>
          )}

        </nav>

        {/* ===== FOOTER SECTION ===== */}
        <div className="p-3 border-t border-slate-100 bg-white space-y-1">
           {/* Settings Link */}
           <button 
             onClick={() => router.push("/settings/profile")}
             className={`
                w-full flex items-center rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors
                ${collapsed ? 'justify-center py-3' : 'px-3 py-2.5 gap-3'}
             `}
             title="Settings"
           >
             <Settings className="w-4.5 h-4.5" />
             {!collapsed && <span className="text-sm font-medium">Settings</span>}
           </button>

           {/* Collapse Toggle Button */}
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

      {/* Spacer để đẩy content bên phải (Layout Shift Fix) */}
      <div className={`hidden lg:block transition-all duration-300 ease-in-out ${collapsed ? "w-[70px]" : "w-64"}`} />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </>
  );
}