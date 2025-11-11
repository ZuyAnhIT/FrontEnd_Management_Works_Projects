"use client";

import { useEffect, useState } from "react";
// ✅ Lấy user từ Context
import { useAuth } from "@/context/AuthContext";
// ⛔️ SỬA LỖI: Import từ 'services/'
import { getCompanyWorkspaces } from "@/services/apiWorkspace";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Users,
  FolderKanban,
  Crown,
  ChevronRight,
  Sparkles,
  Building2,
  Loader2,
} from "lucide-react";

export default function CoreDashboardPage() {
  const { showToast } = useToast();
  const router = useRouter();

  // ✅ Lấy user từ Context, không gọi API
  const { user, isLoading: isAuthLoading } = useAuth();

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy vai trò của user trong từng workspace
  const userRoleMap = (user?.workspaces || []).reduce((map, ws) => {
    map[ws.workspaceId] = ws.roleCode;
    return map;
  }, {} as Record<number, string>);

  // 🧩 Lấy danh sách workspace của công ty
  useEffect(() => {
    if (isAuthLoading) return; // Chờ auth xong

    const companyId = user?.company?.companyId;

    if (companyId) {
      // User Gói VIP (có công ty)
      const fetchData = async () => {
        try {
          setLoading(true);
          const companyWorkspaces = await getCompanyWorkspaces(companyId);
          setWorkspaces(companyWorkspaces || []);
        } catch (err: any) {
          showToast(err.message || "Không thể tải dữ liệu tổng quan", "error");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else if (user?.workspaces) {
      // User Gói Thường (không có công ty, chỉ có workspace cá nhân)
      setWorkspaces(user.workspaces || []); // Chỉ hiển thị workspace cá nhân
      setLoading(false);
    } else {
      // User không có gì cả
      setLoading(false);
    }
  }, [isAuthLoading, user, showToast]); // Re-fetch khi user thay đổi

  // 🧭 Xử lý click workspace
  const handleWorkspaceClick = (ws: any) => {
    // Luôn cho phép click để "Nhập vai"
    router.push(`/core/workspace/${ws.workspaceId}`);
  };

  if (isAuthLoading || loading)
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
          <p className="text-gray-600 font-medium">
            Đang tải thông tin tổng quan...
          </p>
        </div>
      </div>
    );

  // Thống kê tổng quan
  const totalMembers = workspaces.reduce(
    (sum, ws) => sum + (ws.memberCount || 0),
    0
  );
  const totalProjects = workspaces.reduce(
    (sum, ws) => sum + (ws.projectCount || 0),
    0
  );
  const adminWorkspaces = workspaces.filter((ws) =>
    userRoleMap[ws.workspaceId]?.includes("ADMIN")
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white">
      {/* 🎨 Nền mờ ảo */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* 🔹 Header với gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl p-8 shadow-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">
                Dashboard
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Chào mừng trở lại, {user?.fullName || "Người dùng"}! 👋
            </h1>
            <p className="text-white/80 text-lg">
              Quản lý các phòng ban và dự án trong công ty của bạn
            </p>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-8 top-1/2 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* 📊 Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                Workspace
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {workspaces.length}
            </h3>
            <p className="text-sm text-gray-600">Tổng số phòng ban</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-green-50 text-green-600 rounded-full">
                Thành viên
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {totalMembers}
            </h3>
            <p className="text-sm text-gray-600">Tổng nhân sự</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                <FolderKanban className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-purple-50 text-purple-600 rounded-full">
                Dự án
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {totalProjects}
            </h3>
            <p className="text-sm text-gray-600">Đang hoạt động</p>
          </div>
        </div>

        {/* 🔹 Danh sách workspace */}
        <div className="space-y-4 animate-fadeInUp delay-150">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Phòng ban của bạn
            </h2>
            {adminWorkspaces > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-full border border-yellow-200">
                <Crown className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-700">
                  {adminWorkspaces} quyền Admin
                </span>
              </div>
            )}
          </div>

          {workspaces.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 animate-fadeIn">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có phòng ban nào
              </h3>
              <p className="text-gray-500">
                Liên hệ quản trị viên để được thêm vào workspace
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {workspaces.map((ws, index) => {
                const userRole = userRoleMap[ws.workspaceId] || "MEMBER";
                const isAdmin = userRole.includes("ADMIN");

                return (
                  <div
                    key={ws.workspaceId}
                    onClick={() => handleWorkspaceClick(ws)}
                    className={`group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 cursor-pointer animate-fadeInUp ${
                      isAdmin
                        ? "bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50 border-2 border-green-200 hover:shadow-2xl hover:scale-[1.02]"
                        : "bg-white border border-gray-200 hover:shadow-xl hover:scale-[1.01]"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Decorative gradient overlay */}
                    {isAdmin && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}

                    <div className="relative p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Icon */}
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${
                            isAdmin
                              ? "bg-gradient-to-br from-green-500 to-emerald-500"
                              : // ✅ SỬA LỖI: Xóa từ "VÀ" ở đây
                                "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                        >
                          <Building2 className="w-7 h-7 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-xl truncate">
                              {ws.workspaceName}
                            </h3>
                            {isAdmin && (
                              <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              <span className="font-medium">
                                {ws.memberCount || 0}
                              </span>
                              <span>thành viên</span>
                            </div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="flex items-center gap-1.5">
                              <FolderKanban className="w-4 h-4" />
                              <span className="font-medium">
                                {ws.projectCount || 0}
                              </span>
                              <span>dự án</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`text-xs font-bold px-4 py-2 rounded-full shadow-sm ${
                            isAdmin
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {isAdmin ? "Quản trị viên" : "Thành viên"}
                        </div>

                        <ChevronRight
                          className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${
                            isAdmin ? "text-green-600" : "text-gray-400"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Bottom accent line for admin */}
                    {isAdmin && (
                      <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 🎨 Style cho animation (Thêm từ file cũ) */}
      <style jsx>{`
        .bg-grid-white\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
