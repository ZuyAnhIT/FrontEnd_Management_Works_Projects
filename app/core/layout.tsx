"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/features/admin/Header"; 
import Sidebar from "@/components/features/core/Sidebar"; 
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";
import { usePathname } from "next/navigation";
import { getCompanyWorkspaces } from "@/services/apiWorkspace";

export default function CoreLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // ✅ Lấy đầy đủ thông tin từ AuthContext
  const { user, isLoading: isAuthLoading, isAuthenticated, activeCompany, role } = useAuth();
  
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  
  const pathname = usePathname();
  const insideProject = pathname?.includes("/project/");

  useEffect(() => {
    if (isAuthenticated && activeCompany?.companyId && user) {
      
      // 🟢 CASE 1: COMPANY_ADMIN (Quyền cao nhất)
      // Được phép gọi API để lấy toàn bộ Workspace của công ty
      if (role === "COMPANY_ADMIN") {
        const fetchWorkspaces = async () => {
          try {
            const response = await getCompanyWorkspaces(activeCompany.companyId, {
               page: 0, size: 100, sortBy: "name", sortDir: "asc" 
            });
            setWorkspaces(response.content || []);
          } catch (err: any) {
            console.error("Failed to load workspaces", err);
          }
        };
        fetchWorkspaces();
      } 
      
      // 🔵 CASE 2: MEMBER / WORKSPACE ADMIN
      // Không có quyền gọi API list all -> Lấy từ profile user đã đăng nhập
      else if (["COMPANY_MEMBER", "WORKSPACE_ADMIN", "WORKSPACE_MEMBER"].includes(role || "")) {
         const myWorkspaces = user.workspaceMemberships
            ?.filter(w => w.companyId === activeCompany.companyId)
            .map(w => ({
                id: w.workspaceId,
                name: w.workspaceName,
                // description: w.roleCode // Có thể hiển thị role nếu muốn
            })) || [];
         
         setWorkspaces(myWorkspaces);
      }
      
      // 🔴 CASE 3: GUEST -> Không hiển thị workspace nào
      else {
         setWorkspaces([]);
      }

    } else {
        setWorkspaces([]);
    }
  }, [isAuthenticated, activeCompany, role, user]);

  // 1. Màn hình chờ xác thực
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Authenticating...</p>
      </div>
    );
  }

  // 2. Chưa đăng nhập
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500 gap-2">
        <ShieldAlert className="w-10 h-10 text-red-500" />
        <p>Session expired. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* 1) Core Header: Chỉ hiện khi KHÔNG ở trong Project */}
      {!insideProject && (
        <div className="flex-shrink-0 z-50">
          <AdminHeader
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        
        {/* 2) Core Sidebar: Chỉ hiện khi KHÔNG ở trong Project */}
        {!insideProject && (
          <div className="flex-shrink-0 z-40">
             <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeMenu={pathname} 
                setActiveMenu={() => {}}
                // ✅ Truyền list workspace đã xử lý logic phân quyền ở trên
                workspaces={workspaces} 
             />
          </div>
        )}

        {/* Nội dung chính */}
        <main className="flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar">
           {children}
        </main>
      </div>
    </div>
  );
}