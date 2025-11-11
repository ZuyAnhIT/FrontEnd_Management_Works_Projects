"use client";

import { useState, useEffect } from "react";
import Header from "@/components/features/core/Header";
import Sidebar from "@/components/features/core/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Loader2 } from "lucide-react";

export default function CoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Lấy thông tin user từ Context
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // ✅ State cho danh sách workspace mà user quản lý
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loadingWs, setLoadingWs] = useState(true);

  useEffect(() => {
    // Khi user đã đăng nhập, lấy workspace từ dữ liệu user
    if (isAuthenticated && user?.workspaces) {
      // 🔹 Chỉ lọc workspace mà user là WORKSPACE_ADMIN
      const managedWorkspaces = user.workspaces.filter(
        (w) => w.roleCode === "WORKSPACE_ADMIN"
      );
      setWorkspaces(managedWorkspaces);
      setLoadingWs(false);
    } else {
      setWorkspaces([]);
      setLoadingWs(false);
    }
  }, [isAuthenticated, user]);

  // 🌀 Hiển thị trong khi AuthContext đang xác thực
  if (isAuthLoading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        Đang xác thực...
      </div>
    );

  // 🚫 Fallback nếu user chưa đăng nhập
  if (!user)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Vui lòng đăng nhập lại.
      </div>
    );

  // ✅ Layout chính
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
  onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
  user={{
    name: user.fullName || "Người dùng",
    email: user.email || "Không có email",
  }}
/>


      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          workspaces={workspaces}
          loadingWs={loadingWs}
        />

        {/* Nội dung chính */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
