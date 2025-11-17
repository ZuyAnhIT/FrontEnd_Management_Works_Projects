"use client";
import { useEffect, useState } from "react";
import {
  FolderKanban,
  Loader2,
  Sparkles,
  PlusCircle,
  Building,
  Trash2,
  Search,
  Grid3x3,
  List,
  Filter,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  getCompanyWorkspaces,
  deleteWorkspace,
} from "@/services/apiWorkspace";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";

import CreateWorkspaceModal from "@/components/features/admin/CreateWorkspaceModal";
import WorkspaceCard from "@/components/features/admin/WorkspaceCard";

export default function CompanyWorkspacesPage() {
  const { showToast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const companyId = user?.company?.companyId || null;
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (isAuthLoading) return;
    if (!companyId) {
      setLoading(false);
      return;
    }
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        const data = await getCompanyWorkspaces(companyId);
        setWorkspaces(data);
      } catch (err: any) {
        showToast(err.message || "Không thể tải danh sách workspace.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, [companyId, isAuthLoading, showToast]);

  const handleGoToWorkspace = (workspaceId: number) => {
    router.push(`/core/workspace/${workspaceId}`);
  };

  const handleDelete = async (workspaceId: number) => {
    if (!companyId) return;
    if (!window.confirm("Bạn có chắc muốn xóa workspace này không?")) return;

    try {
      await deleteWorkspace(companyId, workspaceId);
      showToast("Đã xóa workspace thành công!", "success");
      setWorkspaces((prev) => prev.filter((w) => w.workspaceId !== workspaceId));
    } catch (err: any) {
      showToast(err.message || "Xóa thất bại!", "error");
    }
  };

  const handleCreateSuccess = (newWs: any) => {
    setWorkspaces((prev) => [newWs, ...prev]);
    setShowCreateModal(false);
    showToast("Đã tạo workspace mới!", "success");
  };

  // Filter logic
  const filteredList = workspaces
    .filter((w) =>
      w.workspaceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter((w) =>
      filterStatus === "all" ? true : w.status === filterStatus
    );

  if (isAuthLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium animate-pulse">Đang tải workspace...</p>
        </div>
      </div>
    );

  if (!companyId)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Lỗi: Không tìm thấy thông tin công ty.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40">
      {/* Floating particles effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-2xl border border-white/50 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/90 via-cyan-500/90 to-teal-500/90 opacity-100 group-hover:opacity-95 transition-opacity"></div>
          
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/30 group-hover:scale-110 transition-transform duration-300">
                <Building className="w-9 h-9 text-white" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Sparkles className="w-3 h-3 text-yellow-900" />
                </div>
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-1 tracking-tight">Workspace Công ty</h1>
                <p className="text-white/90 text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Quản lý toàn bộ phòng ban và không gian làm việc
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="group/btn relative flex items-center gap-3 bg-white text-blue-600 px-6 py-3.5 rounded-xl font-bold shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-blue-500/20 w-full md:w-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
              <PlusCircle className="w-5 h-5 relative z-10 group-hover/btn:rotate-90 transition-transform duration-300" />
              <span className="relative z-10">Tạo phòng ban mới</span>
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
                placeholder="Tìm kiếm theo tên workspace hoặc mô tả..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border-2 border-gray-200">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent outline-none font-medium text-gray-700"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-50 rounded-xl p-1 border-2 border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Workspaces List */}
        {filteredList.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-dashed border-gray-300 p-20 text-center animate-fadeInUp">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <Building className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery || filterStatus !== "all"
                ? "Không tìm thấy workspace phù hợp"
                : "Chưa có workspace nào"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Bắt đầu bằng cách tạo phòng ban đầu tiên"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                Tạo phòng ban đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className={`animate-fadeInUp ${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }`}>
            {filteredList.map((ws, idx) => (
              <div
                key={ws.workspaceId}
                style={{ animationDelay: `${idx * 50}ms` }}
                className="animate-fadeInUp"
              >
                <WorkspaceCard
                  workspace={ws}
                  onDelete={handleDelete}
                  onNavigate={handleGoToWorkspace}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        )}

        <CreateWorkspaceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          companyId={companyId!}
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