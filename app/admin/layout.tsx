"use client";

import { useState, useEffect } from "react";
import Header from "@/components/features/admin/Header"; 
import Sidebar from "@/components/features/admin/Sidebar"; 
import { useAuth } from "@/context/AuthContext";
import { getCompanyWorkspaces } from "@/services/apiWorkspace";
import { useToast } from "@/components/ui/ToastProvider";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("home");

  // ✅ Lấy đầy đủ thông tin từ AuthContext
  const { user, isAuthenticated, activeCompany, isLoading, role } = useAuth();
  const { showToast } = useToast();

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loadingWs, setLoadingWs] = useState(false);
  
  // --- FETCH WORKSPACES LOGIC (ĐÃ SỬA QUYỀN) ---
  useEffect(() => {
    if (isAuthenticated && activeCompany?.companyId && user) {
      
      // 🟢 CASE 1: COMPANY_ADMIN -> Được phép gọi API lấy tất cả
      if (role === "COMPANY_ADMIN") {
        const fetchWorkspaces = async () => {
          try {
            setLoadingWs(true);
            const response = await getCompanyWorkspaces(activeCompany.companyId, {
              page: 0,
              size: 50,
              sortBy: "createdAt",
              sortDir: "desc",
            });
            setWorkspaces(response.content || []);
          } catch (err: any) {
            console.error("Fetch workspaces error:", err);
            // Không show toast lỗi 403 nữa để tránh spam UI, chỉ log
          } finally {
            setLoadingWs(false);
          }
        };
        fetchWorkspaces();
      } 
      
      // 🔵 CASE 2: MEMBER -> Lấy từ User Profile (Tránh lỗi 403)
      else if (role === "COMPANY_MEMBER" || role === "WORKSPACE_MEMBER") {
         const myWorkspaces = user.workspaceMemberships
            ?.filter(w => w.companyId === activeCompany.companyId)
            .map(w => ({
                id: w.workspaceId,
                name: w.workspaceName,
                // description: w.roleCode 
            })) || [];
         setWorkspaces(myWorkspaces);
      }
      
      // 🔴 CASE 3: GUEST -> Không hiển thị workspace
      else {
         setWorkspaces([]);
      }

    } else {
        setWorkspaces([]);
    }
  }, [isAuthenticated, activeCompany, role, user]); 

  // 1. Loading Screen
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Authenticating...</p>
      </div>
    );
  }

  // 2. Fallback
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500 gap-2">
        <ShieldAlert className="w-10 h-10 text-red-500" />
        <p>Session expired. Please log in again.</p>
      </div>
    );
  }

  return (
    // 3. Layout Full Screen
    <div className="h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">

      {/* Header */}
      <div className="flex-shrink-0 z-50">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="flex-shrink-0 z-40">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            workspaces={workspaces}
            loadingWs={loadingWs}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}