"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/features/admin/Header"; 
import Sidebar from "@/components/features/core/Sidebar"; 
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { getCompanyWorkspaces } from "@/services/apiWorkspace";

export default function CoreLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading: isAuthLoading, isAuthenticated, activeCompany } = useAuth();
  
  // State workspace (Giữ lại logic fetch để dùng sau này nếu cần)
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  
  const pathname = usePathname();

  const insideProject = pathname?.includes("/project/");

  useEffect(() => {
    if (isAuthenticated && activeCompany?.companyId) {
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
    } else {
        setWorkspaces([]);
    }
  }, [isAuthenticated, activeCompany]);

  if (isAuthLoading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Authenticating...</p>
      </div>
    );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500">
        <p>Session expired. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* 1) Core Header */}
      {!insideProject && (
        <div className="flex-shrink-0 z-50">
          <AdminHeader
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        
        {/* 2) Core Sidebar */}
        {!insideProject && (
          <div className="flex-shrink-0 z-40">
             <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeMenu={pathname} 
                setActiveMenu={() => {}}
                // 🔴 ĐÃ SỬA: Comment dòng dưới lại để tránh lỗi TypeScript 
                // vì component Sidebar hiện tại chưa có prop này.
                // workspaces={workspaces} 
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