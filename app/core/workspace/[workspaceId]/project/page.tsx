"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FolderKanban,
  Plus,
  Sparkles,
  Loader2,
  Trash2,
  Search,
  Grid3x3,
  List,
  Filter,
  TrendingUp,
} from "lucide-react";

import {
  getProjects,
  getTrashedProjects,
  createProject,
  deleteProject,
} from "@/services/apiProject";
import { useToast } from "@/components/ui/ToastProvider";

import ProjectCard from "@/components/features/core/project/ProjectCard";
import CreateProjectModal from "@/components/features/core/project/CreateProjectModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function ProjectPage() {
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter();
  const workspaceId = Number(params.workspaceId);

  const [projects, setProjects] = useState<any[]>([]);
  const [trashedProjects, setTrashedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "trash">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // ⭐ Thêm state cho modal xoá
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadProjects = async () => {
    if (!workspaceId || isNaN(workspaceId)) {
      showToast("Workspace ID không hợp lệ.", "error");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getProjects(workspaceId);
      const trash = await getTrashedProjects(workspaceId);
      setProjects(data || []);
      setTrashedProjects(trash || []);
    } catch (err: any) {
      showToast(err.message || "Không thể tải danh sách dự án", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      loadProjects();
    }
  }, [workspaceId]);

  const handleCreateSuccess = (newProject: any) => {
    setProjects((prev) => [newProject, ...prev]);
    setShowModal(false);
    showToast("Đã tạo dự án mới!", "success");
  };

  // ⭐ Bấm nút xóa => chỉ mở modal
  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  // ⭐ Khi người dùng xác nhận trong modal
  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setDeleteLoading(true);

      await deleteProject(workspaceId, deleteTargetId);

      showToast("Đã xóa dự án!", "success");

      // cập nhật danh sách
      const data = await getProjects(workspaceId);
      const trash = await getTrashedProjects(workspaceId);
      setProjects(data);
      setTrashedProjects(trash);
    } catch (err: any) {
      showToast(err.message || "Không thể xóa dự án!", "error");
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
    }
  };

  // Filter logic
  const filteredList = (activeTab === "active" ? projects : trashedProjects)
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((p) =>
      filterPriority === "all" ? true : p.priority === filterPriority
    );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium animate-pulse">Đang tải dự án...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/40">
      {/* Floating particles effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-2xl border border-white/50 overflow-hidden group">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/90 via-emerald-500/90 to-teal-500/90 opacity-100 group-hover:opacity-95 transition-opacity"></div>

          {/* Animated shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/30 group-hover:scale-110 transition-transform duration-300">
                <FolderKanban className="w-9 h-9 text-white" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Sparkles className="w-3 h-3 text-yellow-900" />
                </div>
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-1 tracking-tight">Dự án của bạn</h1>
                <p className="text-white/90 text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Quản lý và theo dõi tiến độ dự án
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="group/btn relative flex items-center gap-3 bg-white text-green-600 px-6 py-3.5 rounded-xl font-bold shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-green-500/20 w-full md:w-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
              <Plus className="w-5 h-5 relative z-10 group-hover/btn:rotate-90 transition-transform duration-300" />
              <span className="relative z-10">Tạo dự án mới</span>
            </button>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 mb-6 shadow-xl border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên hoặc mã dự án..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border-2 border-gray-200">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-transparent outline-none font-medium text-gray-700"
              >
                <option value="all">Tất cả mức độ</option>
                <option value="HIGH">Cao</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="LOW">Thấp</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-50 rounded-xl p-1 border-2 border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid"
                    ? "bg-white text-green-600 shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list"
                    ? "bg-white text-green-600 shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs with Professional Design */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-2 mb-6 shadow-lg border border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("active")}
              className={`group relative flex-1 px-6 py-4 font-bold rounded-xl transition-all duration-300 overflow-hidden ${activeTab === "active"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                  : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {/* Hover effect background */}
              <div className={`absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === "active" ? "hidden" : ""
                }`}></div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${activeTab === "active"
                      ? "bg-white/20 shadow-inner"
                      : "bg-green-100 text-green-600"
                    }`}>
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">Dự án hiện tại</div>
                    <div className={`text-xs ${activeTab === "active" ? "text-white/80" : "text-gray-500"
                      }`}>
                      Đang hoạt động
                    </div>
                  </div>
                </div>
                <div className={`flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-lg font-bold transition-all ${activeTab === "active"
                    ? "bg-white/20 text-white shadow-inner"
                    : "bg-gray-100 text-gray-700"
                  }`}>
                  {projects.length}
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("trash")}
              className={`group relative flex-1 px-6 py-4 font-bold rounded-xl transition-all duration-300 overflow-hidden ${activeTab === "trash"
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30"
                  : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {/* Hover effect background */}
              <div className={`absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === "trash" ? "hidden" : ""
                }`}></div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${activeTab === "trash"
                      ? "bg-white/20 shadow-inner"
                      : "bg-red-100 text-red-600"
                    }`}>
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">Đã xóa</div>
                    <div className={`text-xs ${activeTab === "trash" ? "text-white/80" : "text-gray-500"
                      }`}>
                      Thùng rác
                    </div>
                  </div>
                </div>
                <div className={`flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-lg font-bold transition-all ${activeTab === "trash"
                    ? "bg-white/20 text-white shadow-inner"
                    : "bg-gray-100 text-gray-700"
                  }`}>
                  {trashedProjects.length}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Projects List */}
        {filteredList.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-dashed border-gray-300 p-20 text-center animate-fadeInUp">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <FolderKanban className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery || filterPriority !== "all"
                ? "Không tìm thấy dự án phù hợp"
                : activeTab === "trash"
                  ? "Thùng rác trống"
                  : "Chưa có dự án nào"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterPriority !== "all"
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : activeTab === "active"
                  ? "Bắt đầu bằng cách tạo dự án mới"
                  : "Các dự án đã xóa sẽ xuất hiện ở đây"}
            </p>
            {activeTab === "active" && !searchQuery && filterPriority === "all" && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <Plus className="w-5 h-5" />
                Tạo dự án đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className={`animate-fadeInUp ${viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }`}>
            {filteredList.map((p, idx) => (
              <div
                key={p.id}
                style={{ animationDelay: `${idx * 50}ms` }}
                className="animate-fadeInUp"
              >
                <ProjectCard
                  p={p}
                  onDelete={() => handleDelete(p.id)}
                  isTrash={activeTab === "trash"}
                  workspaceId={workspaceId}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        )}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!deleteLoading) setIsDeleteModalOpen(false);
          }}
          onConfirm={confirmDelete}
          isLoading={deleteLoading}
          title="Xóa dự án?"
          description="Bạn có chắc muốn xóa dự án này? Dự án sẽ được đưa vào thùng rác."
          confirmText="Xóa ngay"
          cancelText="Hủy"
        />
        <CreateProjectModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          workspaceId={workspaceId}
          onSuccess={handleCreateSuccess}
        />
      </div>

      <style jsx>{`
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
          animation: fadeInUp 0.6s ease-out forwards;
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}