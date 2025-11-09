"use client";
import { useState, useEffect } from "react";
import Header from "@/components/features/member/Header";
import Sidebar from "@/components/features/member/Sidebar";
import { getCurrentUser } from "@/app/api/apiUser";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("home");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  // 🧩 Lấy thông tin user từ API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        // ✅ Chuẩn hóa dữ liệu
        setUser({
          name: data.fullName || "Người dùng",
          email: data.email || "Không có email",
        });
      } catch (err: any) {
        showToast(err.message || "Không thể tải thông tin người dùng", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [showToast]);

  // Hiển thị khi đang load
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Đang tải thông tin người dùng...
      </div>
    );

  // Nếu chưa đăng nhập (token hết hạn hoặc lỗi)
  if (!user)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 🧭 Header nhận user động */}
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} user={user} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
