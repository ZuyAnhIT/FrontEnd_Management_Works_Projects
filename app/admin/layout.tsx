"use client";

import { useState, useEffect } from "react";
import Header from "@/components/features/admin/Header";
import Sidebar from "@/components/features/admin/Sidebar";
import { useAuth } from "@/context/AuthContext";
// ⛔️ SỬA ĐƯỜNG DẪN!
import { getCompanyWorkspaces } from "@/services/apiWorkspace";
import { useToast } from "@/components/ui/ToastProvider";
import { User } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("home");

  // 1. Lấy state từ Context, không gọi API
  const { user, isLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // 2. Layout chịu trách nhiệm lấy data cho Sidebar
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loadingWs, setLoadingWs] = useState(false);

  useEffect(() => {
    // Chỉ fetch khi đã đăng nhập và có companyId
    if (isAuthenticated && user?.company?.companyId) {
      const companyId = user.company.companyId;
      const fetchWorkspaces = async () => {
        try {
          setLoadingWs(true);
          // ⛔️ SỬA ĐƯỜNG DẪN!
          const data = await getCompanyWorkspaces(companyId);
          setWorkspaces(data || []);
        } catch (err: any) {
          showToast(
            err.message || "Không thể tải danh sách phòng ban",
            "error"
          );
        } finally {
          setLoadingWs(false);
        }
      };
      fetchWorkspaces();
    }
  }, [isAuthenticated, user, showToast]); // Thêm user, showToast

  // 3. Hiển thị loading (do AuthContext cung cấp)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Đang tải và xác thực...
      </div>
    );
  }

  // 4. Nếu AuthContext nói chưa đăng nhập (Guard đã chuyển hướng,
  // nhưng ta vẫn nên có 1 fallback)
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Vui lòng đăng nhập.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 5. Truyền user xuống Header */}
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* 6. Truyền data workspaces xuống Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          workspaces={workspaces} // <-- Truyền props
          loadingWs={loadingWs} // <-- Truyền props
        />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
