"use client";

import { useState, useEffect } from "react";
import Header from "@/components/features/core/Header"; // Đảm bảo đây là CoreHeader đã tối ưu
import Sidebar from "@/components/features/core/Sidebar"; // Đảm bảo đây là MemberSidebar/CoreSidebar đã tối ưu
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { getCompanyWorkspaces } from "@/services/apiWorkspace";

export default function CoreLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading: isAuthLoading, isAuthenticated, activeCompany } = useAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loadingWs, setLoadingWs] = useState(true);

  const pathname = usePathname();

  // 🔥 Chỉ ẩn Sidebar/Header Core khi vào sâu trong Project (ví dụ: board, backlog)
  // Nếu chỉ là danh sách dự án (/project), có thể vẫn muốn hiện Core Sidebar tùy logic của bạn.
  // Ở đây mình giữ nguyên logic của bạn.
  const insideProject = pathname?.includes("/project/");

  useEffect(() => {
    if (isAuthenticated && activeCompany?.companyId) {
      const fetchWorkspaces = async () => {
        try {
          // setLoadingWs(true);
          const response = await getCompanyWorkspaces(activeCompany.companyId, {
             page: 0, size: 100, sortBy: "name", sortDir: "asc" 
          });
          setWorkspaces(response.content || []);
        } catch (err: any) {
          console.error("Failed to load workspaces", err);
        } finally {
          // setLoadingWs(false);
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
    // Có thể redirect về login ở đây hoặc hiển thị thông báo
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500">
        <p>Session expired. Please log in again.</p>
      </div>
    );
  }

  return (
    // Layout Full Screen, Nền xám nhạt
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* 🔥 1) Header Core: Chỉ hiện khi KHÔNG ở trong Project */}
      {!insideProject && (
        <div className="flex-shrink-0 z-50">
          <Header
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            user={{
              name: user.fullName || "User",
              email: user.email || "user@example.com",
            }}
          />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        
        {/* 🔥 2) Sidebar Core: Chỉ hiện khi KHÔNG ở trong Project */}
        {!insideProject && (
          <div className="flex-shrink-0 z-40">
             <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeMenu={pathname} // Truyền pathname để highlight menu
                setActiveMenu={() => {}}
                // Truyền props nếu Sidebar của bạn hỗ trợ nhận data từ ngoài (như AdminSidebar)
                // Nếu Sidebar tự fetch data thì bỏ 2 dòng dưới
                // workspaces={workspaces}
                // loadingWs={loadingWs}
             />
          </div>
        )}

        {/* Nội dung chính - Scroll độc lập */}
        <main className="flex-1 overflow-y-auto scroll-smooth relative">
           {children}
        </main>
      </div>
    </div>
  );
}