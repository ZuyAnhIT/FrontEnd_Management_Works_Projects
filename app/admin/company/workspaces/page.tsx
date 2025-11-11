"use client";
import { useEffect, useState } from "react";
import {
  FolderKanban,
  Loader2,
  Sparkles,
  PlusCircle,
  Building,
  Trash2, // ✅ Mới: Import icon Xóa
} from "lucide-react";
import { useRouter } from "next/navigation";

// ⛔️ Sửa đường dẫn nếu cần
import {
  getCompanyWorkspaces,
  deleteWorkspace, // ✅ Mới: Import hàm Xóa
} from "@/services/apiWorkspace";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";

// ✅ Mới: Import 2 modal
import CreateWorkspaceModal from "@/components/features/admin/CreateWorkspaceModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// Trang chính
export default function CompanyWorkspacesPage() {
  const { showToast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const companyId = user?.company?.companyId || null;
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ✅ Mới: State cho Modal Xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<any | null>(null);

  // 🧩 1. Lấy tất cả workspace theo công ty (Giữ nguyên)
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

  // 🧩 2. Hàm "Nhập vai" (Giữ nguyên)
  const handleGoToWorkspace = (workspaceId: number) => {
    router.push(`/core/workspace/${workspaceId}`);
  };

  // 🧩 3. ✅ Mới: Hàm Mở Modal Xóa
  const openDeleteConfirmation = (e: React.MouseEvent, workspace: any) => {
    e.stopPropagation(); // Ngăn thẻ cha (Link) bị click
    setWorkspaceToDelete(workspace);
    setIsDeleteModalOpen(true);
  };

  // 🧩 4. ✅ Mới: Hàm Xác nhận Xóa
  const handleConfirmDelete = async () => {
    if (!companyId || !workspaceToDelete) return;

    setIsDeleting(true);
    try {
      await deleteWorkspace(companyId, workspaceToDelete.workspaceId);
      showToast("Đã xóa workspace thành công!", "success");
      setWorkspaces((prev) =>
        prev.filter((w) => w.workspaceId !== workspaceToDelete.workspaceId)
      );
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Xóa thất bại!", "error");
    } finally {
      setIsDeleting(false);
      setWorkspaceToDelete(null);
    }
  };

  // 🧭 5. Loading (Giữ nguyên)
  if (isAuthLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );

  if (!companyId)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Lỗi: Không tìm thấy thông tin công ty.
      </div>
    );

  // 🧭 6. Giao diện chính
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-10">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        {/* Header (Giữ nguyên) */}
        <div className="relative bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl p-8 shadow-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                <FolderKanban className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Workspace Công ty
                </h1>
                <p className="text-white/80">
                  Quản lý toàn bộ workspace của công ty bạn
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="group flex items-center justify-center md:justify-start gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold hover:scale-105"
            >
              <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Tạo phòng ban mới
            </button>
          </div>
        </div>

        {/* Danh sách workspace */}
        {workspaces.length === 0 && !loading ? (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 p-16 text-center animate-fadeInUp">
            {/* ... (Code UI Trống) ... */}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
            {workspaces.map((ws) => (
              <div
                key={ws.workspaceId}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Ảnh bìa hoặc Icon */}
                {ws.coverImage ? (
                  <img
                    src={ws.coverImage}
                    alt={ws.workspaceName}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div
                    className="h-40 w-full flex items-center justify-center"
                    style={{ backgroundColor: ws.color || "#3B82F6" }}
                  >
                    <Building className="w-12 h-12 text-white/50" />
                  </div>
                )}

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Tên và Status */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">
                        {ws.workspaceName}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ws.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {ws.status}
                      </span>
                    </div>
                    {/* Mô tả */}
                    <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px] mt-2">
                      {ws.description || "Chưa có mô tả."}
                    </p>
                  </div>

                  {/* ✅ MỚI: Nhóm 2 nút */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleGoToWorkspace(ws.workspaceId)}
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-semibold"
                    >
                      Quản lý
                      <Sparkles className="w-4 h-4 ml-2" />
                    </button>
                    <button
                      onClick={(e) => openDeleteConfirmation(e, ws)}
                      className="p-3 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
                      title="Xóa Workspace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal tạo workspace (đã tách) */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        companyId={companyId!}
        onSuccess={(newWs) => {
          setWorkspaces((prev) => [...prev, newWs]);
        }}
      />

      {/* ✅ MỚI: Modal Xác nhận Xóa */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Xác nhận Xóa Workspace"
        description={`Bạn có chắc chắn muốn xóa workspace "${workspaceToDelete?.workspaceName}"? Mọi dự án và công việc bên trong sẽ bị xóa vĩnh viễn.`}
        confirmText="Vẫn Xóa"
      />
    </div>
  );
}
