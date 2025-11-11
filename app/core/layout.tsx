"use client";
import { useState, useEffect } from "react";
import Header from "@/components/features/core/Header"; // Header mới
import Sidebar from "@/components/features/core/Sidebar"; // Sidebar mới
import { useAuth } from "@/context/AuthContext"; // ✅ Lấy từ Context
import { useToast } from "@/components/ui/ToastProvider";
import { Loader2 } from "lucide-react";
// ⛔️ SỬA LỖI: Import từ 'services/'
import { getCompanyWorkspaces } from "@/services/apiWorkspace";

export default function CoreLayout({
  // Đổi tên từ AdminLayout
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1. Lấy user và loading từ Context (KHÔNG GỌI API)
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // 2. Layout này sẽ chịu trách nhiệm fetch data cho Sidebar
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loadingWs, setLoadingWs] = useState(true);

  useEffect(() => {
    // Chỉ fetch khi đã đăng nhập và có companyId
    if (isAuthenticated && user?.company?.companyId) {
      const fetchWorkspaces = async () => {
        try {
          setLoadingWs(true);
          const data = await getCompanyWorkspaces(user.company.companyId);
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
    } else if (isAuthenticated && !user?.company?.companyId) {
      // Đã đăng nhập nhưng không thuộc công ty (ví dụ: Gói Thường)
      setLoadingWs(false);
    }
  }, [isAuthenticated, user, showToast]);

  // 3. Hiển thị loading (do AuthContext cung cấp)
  if (isAuthLoading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        Đang xác thực...
      </div>
    );

  // 4. Guard: AuthContext đã xử lý việc này, nhưng thêm 1 lớp an toàn
  if (!user)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Vui lòng đăng nhập lại.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 5. Truyền user (đã có) xuống Header */}
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* 6. Truyền user và data workspaces xuống Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user} // Truyền user
          workspaces={workspaces}
          loadingWs={loadingWs}
        />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
