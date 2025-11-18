"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Settings,
  Sparkles,
  Loader2,
  Save,
  Palette,
  FileText,
  Trash2,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";

// ⛔️ Sửa đường dẫn nếu bạn chưa di chuyển file
import {
  getWorkspaceDetail,
  updateWorkspace,
  deleteWorkspace,
} from "@/services/apiWorkspace";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import LoadingButton from "@/components/ui/LoadingButton";
// ✅ 1. Import Modal Xác nhận
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function WorkspaceSettingsPage() {
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter();
  const workspaceId = Number(params.workspaceId);

  // ✅ Lấy user và companyId từ Context
  const { user, isLoading: isAuthLoading } = useAuth();
  const companyId = user?.company?.companyId || null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ 2. State cho Modal Xóa
  const [deleting, setDeleting] = useState(false); // Dùng cho nút loading
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Dùng để Mở/Đóng

  const [form, setForm] = useState({
    workspaceName: "",
    description: "",
    coverImage: "",
    color: "#3B82F6",
  });

  // 🧩 1. Lấy thông tin chi tiết workspace
  useEffect(() => {
    if (isAuthLoading) return;
    if (!companyId || !workspaceId) {
      if (!isAuthLoading)
        showToast("Lỗi: Không tìm thấy thông tin công ty/workspace", "error");
      setLoading(false);
      return;
    }

    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        const data = await getWorkspaceDetail(companyId, workspaceId);
        setForm({
          workspaceName: data.workspaceName || "",
          description: data.description || "",
          coverImage: data.coverImage || "",
          color: data.color || "#3B82F6",
        });
      } catch (err: any) {
        showToast(err.message || "Không thể tải thông tin phòng ban!", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [companyId, workspaceId, isAuthLoading, showToast]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 🧩 2. Xử lý Cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workspaceName.trim()) {
      showToast("Vui lòng nhập tên phòng ban!", "warning");
      return;
    }
    if (!companyId) return;

    setSaving(true);
    try {
      await updateWorkspace(companyId, workspaceId, {
        name: form.workspaceName,
        description: form.description,
        coverImage: form.coverImage,
        color: form.color,
      });
      showToast("Cập nhật thông tin thành công!", "success");
    } catch (err: any) {
      showToast(err.message || "Cập nhật thất bại!", "error");
    } finally {
      setSaving(false);
    }
  };

  // 🧩 3. ✅ SỬA LẠI: Hàm này chỉ MỞ MODAL
  const openDeleteModal = () => {
    if (!form.workspaceName) return; // Không cho xóa nếu form chưa tải
    setIsDeleteModalOpen(true);
  };

  // 🧩 4. ✅ HÀM MỚI: Logic Xóa (được gọi bởi Modal)
  const handleConfirmDelete = async () => {
    if (!companyId) return;

    setDeleting(true);
    try {
      await deleteWorkspace(companyId, workspaceId);
      showToast("Đã xóa workspace thành công!", "success");
      setIsDeleteModalOpen(false); // Đóng modal
      router.push("/core"); // Chuyển về trang dashboard core
    } catch (err: any) {
      showToast(err.message || "Xóa thất bại!", "error");
      setDeleting(false); // Chỉ set false khi lỗi (để giữ modal)
    }
    // Không cần setDeleting(false) khi thành công vì trang sẽ chuyển hướng
  };

  if (isAuthLoading || loading)
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 px-4">
      {/* 🎨 Thẻ (Card) Thông tin chính */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fadeInUp">
        {/* Header của thẻ */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Cài đặt Workspace
              </h1>
              <p className="text-sm text-gray-500">
                Chỉnh sửa thông tin chi tiết cho phòng ban của bạn.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Tên Workspace */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tên Workspace <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.workspaceName}
                onChange={(e) => handleChange("workspaceName", e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                required
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                placeholder="Mô tả mục đích của phòng ban này..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Ảnh bìa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Ảnh bìa (URL)
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.coverImage}
                    onChange={(e) => handleChange("coverImage", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Màu sắc */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Màu đại diện
                </label>
                <div className="flex items-center gap-3 border-2 border-gray-200 rounded-xl px-4 py-3">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => handleChange("color", e.target.value)}
                    className="w-10 h-6 border-none rounded cursor-pointer"
                  />
                  <span className="font-mono text-gray-700">{form.color}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer của thẻ (Nút Lưu) */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
            <LoadingButton
              type="submit"
              isLoading={saving}
              text="Lưu thay đổi"
              loadingText="Đang lưu..."
              className="px-6 py-3"
              icon={<Save className="w-4 h-4 mr-2" />}
            />
          </div>
        </form>
      </div>

      {/* 🎨 Thẻ (Card) Khu vực Nguy hiểm */}
      <div className="bg-white rounded-xl shadow-xl border border-red-200 overflow-hidden animate-fadeInUp">
        <div className="p-6 border-b border-red-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 flex items-center justify-center rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Khu vực Nguy hiểm
              </h1>
              <p className="text-sm text-gray-500">
                Các hành động này không thể hoàn tác.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">Xóa Phòng ban này</h3>
            <p className="text-sm text-gray-600 mt-1">
              Một khi bạn xóa, tất cả dự án và công việc bên trong sẽ bị xóa
              vĩnh viễn.
            </p>
          </div>

          {/* ✅ SỬA LẠI: Nút này gọi 'openDeleteModal' */}
          <LoadingButton
            type="button"
            onClick={openDeleteModal}
            isLoading={deleting} // Vô hiệu hóa nút khi modal đang xử lý
            text="Xóa Workspace này"
            loadingText="Đang xóa..."
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500" // 🎨 Đổi màu nút
            icon={<Trash2 className="w-4 h-4 mr-2" />}
          />
        </div>
      </div>

      {/* ✅ 5. THÊM MODAL XÁC NHẬN XÓA */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        title="Xác nhận Xóa Workspace"
        description={`Bạn có chắc chắn muốn xóa workspace "${form.workspaceName}"? Mọi dự án và công việc bên trong sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.`}
        confirmText="Vẫn Xóa"
      />
    </div>
  );
}
