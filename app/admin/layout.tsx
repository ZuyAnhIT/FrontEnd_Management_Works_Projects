"use client";

import { useState, useEffect } from "react";
import Header from "@/components/features/admin/Header"; // Đảm bảo là AdminHeader đã tối ưu
import Sidebar from "@/components/features/admin/Sidebar"; // Đảm bảo là AdminSidebar đã tối ưu
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

  const { user, isLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loadingWs, setLoadingWs] = useState(false);

  // Fetch workspaces logic (Giữ nguyên)
  useEffect(() => {
    if (isAuthenticated && user?.company?.companyId) {
      const companyId = user.company.companyId;
      const fetchWorkspaces = async () => {
        try {
          setLoadingWs(true);
          const data = await getCompanyWorkspaces(companyId);
          setWorkspaces(data || []);
        } catch (err: any) {
          showToast(
            err.message || "Failed to load workspaces",
            "error"
          );
        } finally {
          setLoadingWs(false);
        }
      };
      fetchWorkspaces();
    }
  }, [isAuthenticated, user, showToast]);

  // 1. Loading Screen chuyên nghiệp
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Authenticating Admin Access...</p>
      </div>
    );
  }

  // 2. Fallback nếu chưa login (thường Middleware đã chặn)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500 gap-2">
        <ShieldAlert className="w-10 h-10 text-red-500" />
        <p>Session expired. Please log in again.</p>
      </div>
    );
  }

  return (
    // 3. Layout Full Screen cố định
    <div className="h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      
      {/* Header cố định */}
      <div className="flex-shrink-0 z-50">
         <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar cố định bên trái */}
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

        {/* Main Content cuộn độc lập */}
        <main className="flex-1 overflow-y-auto scroll-smooth relative">
           {children}
        </main>
      </div>
    </div>
  );
}