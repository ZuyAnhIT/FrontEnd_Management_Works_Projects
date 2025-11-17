"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// ✅ Lấy user từ Context
import { useAuth } from "@/context/AuthContext";
// ⛔️ SỬA LỖI: Import từ 'services/'
import { getWorkspaceDetail } from "@/services/apiWorkspace";
import {
  Settings,
  FolderKanban,
  Users,
  Clock,
  Sparkles,
  Target,
  Loader2,
  TrendingUp, // ✅ Thêm icon
  Calendar, // ✅ Thêm icon
  BarChart3, // ✅ Thêm icon
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function WorkspaceOverviewPage() {
  const { showToast } = useToast();
  const params = useParams();
  const workspaceId = Number(params.workspaceId);

  // ✅ Lấy user từ Context
  const { user, isLoading: isAuthLoading } = useAuth();
  const companyId = user?.company?.companyId || null; // Lấy companyId

  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<any>(null); // Khởi tạo là null

  // 🧩 Lấy thông tin chi tiết workspace
  useEffect(() => {
    // Chờ Auth và companyId sẵn sàng
    if (isAuthLoading) return;
    if (!companyId || !workspaceId) {
      if (!isAuthLoading)
        showToast("Không thể tải thông tin phòng ban!", "error");
      setLoading(false);
      return;
    }

    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        const data = await getWorkspaceDetail(companyId, workspaceId);

        // ⚙️ Giả lập số liệu thống kê (nếu cần)
        // setWorkspace({
        //   workspaceName: data.workspaceName,
        //   description: data.description || "Chưa có mô tả",
        //   memberCount: data.memberCount || Math.floor(Math.random() * 15) + 5,
        //   projectCount: data.projectCount || Math.floor(Math.random() * 10) + 1,
        //   taskCount: data.taskCount || Math.floor(Math.random() * 150) + 20,
        //   completionRate:
        //     data.completionRate || Math.floor(Math.random() * 100),
        // });
      } catch (err: any) {
        showToast(err.message || "Không thể tải thông tin phòng ban!", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [companyId, workspaceId, isAuthLoading, showToast]); // Thêm isAuthLoading

  if (isAuthLoading || loading)
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-white via-blue-50/40 to-white">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto text-green-500 animate-spin" />
          <p className="text-gray-600 font-medium">
            Đang tải dữ liệu workspace...
          </p>
        </div>
      </div>
    );

  if (!workspace)
    return (
      <div className="p-8 text-center text-red-500">
        Không thể tải dữ liệu phòng ban.
      </div>
    );

  // 🎨 Giao diện đầy đủ của bạn
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white">
      {/* 🎨 Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* 🔹 Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-cyan-500 rounded-3xl p-8 shadow-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-grid-white/10"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left side */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <FolderKanban className="w-8 h-8 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                  <span className="text-white/80 text-sm font-medium">
                    Workspace
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {workspace.workspaceName}
                </h1>
                <p className="text-white/80 text-sm">
                  /{workspace.workspaceName.toLowerCase().replace(/\s/g, "-")}
                </p>
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() =>
                  showToast("Chức năng này đang được phát triển", "info")
                }
                className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 text-white font-medium transition-all shadow-lg hover:shadow-xl"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Cài đặt</span>
              </button>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-8 top-1/2 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* 📊 Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeInUp">
          {/* Dự án */}
          <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <FolderKanban className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                  Projects
                </span>
              </div>

              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {workspace.projectCount}
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                Dự án đang hoạt động
              </p>

              <div className="mt-3 flex items-center gap-1 text-xs text-blue-600">
                <TrendingUp className="w-3 h-3" />
                <span>+2 tuần này</span>
              </div>
            </div>
          </div>

          {/* Thành viên */}
          <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-green-50 text-green-600 rounded-full">
                  Members
                </span>
              </div>

              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {workspace.memberCount}
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                Thành viên trong team
              </p>

              <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>+3 thành viên mới</span>
              </div>
            </div>
          </div>

          {/* Công việc */}
          <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-purple-50 text-purple-600 rounded-full">
                  Tasks
                </span>
              </div>

              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {workspace.taskCount}
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                Công việc tổng cộng
              </p>

              <div className="mt-3 flex items-center gap-1 text-xs text-purple-600">
                <Calendar className="w-3 h-3" />
                <span>12 deadline tuần này</span>
              </div>
            </div>
          </div>

          {/* Hoàn thành */}
          <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-orange-50 text-orange-600 rounded-full">
                  Progress
                </span>
              </div>

              <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-1">
                {workspace.completionRate}%
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                Tỷ lệ hoàn thành
              </p>

              {/* Progress bar */}
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-1000"
                  style={{ width: `${workspace.completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 📝 Description Card */}
        {workspace.description && workspace.description !== "Chưa có mô tả" && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-fadeInUp delay-100">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Mô tả workspace
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {workspace.description}
            </p>
          </div>
        )}

        {/* 💡 Quick Actions (Optional) */}
        <div className="grid md:grid-cols-3 gap-4 animate-fadeInUp delay-200">
          <button
            onClick={() => showToast("Chức năng đang phát triển", "info")}
            className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">
                Quản lý thành viên
              </h4>
            </div>
            <p className="text-sm text-gray-500">
              Thêm, xóa hoặc chỉnh sửa quyền thành viên
            </p>
          </button>

          <button
            onClick={() => showToast("Chức năng đang phát triển", "info")}
            className="p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">
                Báo cáo & Thống kê
              </h4>
            </div>
            <p className="text-sm text-gray-500">
              Xem hiệu suất và tiến độ chi tiết
            </p>
          </button>

          <button
            onClick={() => showToast("Chức năng đang phát triển", "info")}
            className="p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">
                Cấu hình Workspace
              </h4>
            </div>
            <p className="text-sm text-gray-500">
              Tùy chỉnh quy trình và quyền hạn
            </p>
          </button>
        </div>
      </div>

    </div>
  );
}
