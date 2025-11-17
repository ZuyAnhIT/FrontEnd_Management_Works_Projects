"use client";

import { useState, useEffect } from "react";
import Header from "@/components/features/core/Header";
import Sidebar from "@/components/features/core/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function CoreLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loadingWs, setLoadingWs] = useState(true);

  const pathname = usePathname();

  // 🔥 Chỉ khi vào project mới tắt sidebar + header
  const insideProject = pathname.includes("/project/");

  useEffect(() => {
    if (isAuthenticated && user?.workspaces) {
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

  if (isAuthLoading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        Đang xác thực...
      </div>
    );

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Vui lòng đăng nhập lại.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* 🔥 1) Chỉ hiển thị Header nếu KHÔNG ở trong Project */}
      {!insideProject && (
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          user={{
            name: user.fullName || "Người dùng",
            email: user.email || "Không có email",
          }}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        
        {/* 🔥 2) Chỉ hiển thị Sidebar khi KHÔNG ở trong Project */}
        {!insideProject && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            user={user}
            workspaces={workspaces}
            loadingWs={loadingWs}
          />
        )}

        {/* Nội dung chính - luôn hiển thị */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
