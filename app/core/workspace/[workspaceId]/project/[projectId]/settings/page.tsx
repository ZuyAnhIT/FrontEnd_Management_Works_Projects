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
  Target,
  Hash,
  Calendar,
  Flag,
} from "lucide-react";

import {
  getProjectDetail,
  updateProject,
  updateProjectStatus,
} from "@/services/apiProject";
import { deleteProject } from "@/services/apiProject"; // Nếu bạn có API xóa

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import LoadingButton from "@/components/ui/LoadingButton";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function ProjectSettingsPage() {
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter();

  const workspaceId = Number(params.workspaceId);
  const projectId = Number(params.projectId);

  const { user, isLoading: isAuthLoading } = useAuth();
  const companyId = user?.company?.companyId || null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal Delete Project
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    projectCode: "",
    description: "",
    goal: "",
    coverImageUrl: "",
    priority: "MEDIUM",
    startDate: "",
    dueDate: "",
  });

  // Load project detail
  useEffect(() => {
    if (isAuthLoading) return;
    if (!companyId) {
      showToast("Không tìm thấy thông tin công ty!", "error");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getProjectDetail(workspaceId, projectId);

        setForm({
          name: data.name || "",
          projectCode: data.projectCode || "",
          description: data.description || "",
          goal: data.goal || "",
          coverImageUrl: data.coverImageUrl || "",
          priority: data.priority || "MEDIUM",
          startDate: data.startDate?.split("T")[0] || "",
          dueDate: data.dueDate?.split("T")[0] || "",
        });
      } catch (err: any) {
        showToast(err.message || "Không thể tải thông tin dự án!", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId, projectId, workspaceId, isAuthLoading, showToast]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Update project
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Tên dự án không được để trống!", "warning");
      return;
    }

    setSaving(true);
    try {
      await updateProject(workspaceId, projectId, {
        name: form.name,
        projectCode: form.projectCode,
        description: form.description,
        goal: form.goal,
        coverImageUrl: form.coverImageUrl,
        priority: form.priority,
        startDate: form.startDate,
        dueDate: form.dueDate,
      });

      showToast("Cập nhật dự án thành công!", "success");
    } catch (err: any) {
      showToast(err.message || "Cập nhật thất bại!", "error");
    } finally {
      setSaving(false);
    }
  };

  // Open delete modal
  const openDeleteModal = () => {
    if (!form.name) return;
    setIsDeleteModalOpen(true);
  };

  // Confirm delete project
  const handleConfirmDelete = async () => {
    if (!companyId) return;

    setDeleting(true);
    try {
      await deleteProject(workspaceId, projectId);
      showToast("Xóa dự án thành công!", "success");
      setIsDeleteModalOpen(false);
      router.push(`/core/${workspaceId}`);
    } catch (err: any) {
      showToast(err.message || "Xóa thất bại!", "error");
      setDeleting(false);
    }
  };

  if (isAuthLoading || loading)
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 px-4">
      {/* Card Settings */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fadeInUp">
        <div className="p-6 border-b border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-lg">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Cài đặt Dự án
            </h1>
            <p className="text-sm text-gray-500">
              Chỉnh sửa thông tin chi tiết dự án.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Project Name */}
            <div>
              <label className="font-medium text-gray-700 text-sm mb-1 block">
                Tên dự án *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full border-2 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            {/* Project Code */}
            <div>
              <label className="font-medium text-gray-700 text-sm mb-1 block">
                Mã dự án
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.projectCode}
                  onChange={(e) => handleChange("projectCode", e.target.value)}
                  className="w-full border-2 rounded-xl px-4 pl-10 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="font-medium text-gray-700 text-sm mb-1 block">
                Mô tả
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full border-2 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>

            {/* Goal */}
            <div>
              <label className="font-medium text-gray-700 text-sm mb-1 block">
                Mục tiêu dự án
              </label>
              <textarea
                rows={3}
                value={form.goal}
                onChange={(e) => handleChange("goal", e.target.value)}
                className="w-full border-2 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="font-medium text-gray-700 text-sm mb-1 block">
                Ảnh bìa (URL)
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.coverImageUrl}
                  onChange={(e) =>
                    handleChange("coverImageUrl", e.target.value)
                  }
                  className="w-full border-2 rounded-xl px-4 pl-10 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="font-medium text-gray-700 text-sm mb-1 block">
                Mức độ ưu tiên
              </label>
              <select
                value={form.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                className="w-full border-2 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="w-full border-2 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                  className="w-full border-2 rounded-xl px-4 py-3"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
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

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-xl border border-red-200 overflow-hidden animate-fadeInUp">
        <div className="p-6 border-b border-red-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 flex items-center justify-center rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Khu vực nguy hiểm
            </h1>
            <p className="text-sm text-gray-500">
              Các hành động này không thể hoàn tác.
            </p>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-gray-900">Xóa dự án</h3>
          <p className="text-sm text-gray-600 mt-1">
            Xóa dự án sẽ xóa toàn bộ sprint, task, dữ liệu liên quan.
          </p>

          <LoadingButton
            type="button"
            onClick={openDeleteModal}
            isLoading={deleting}
            text="Xóa Dự án"
            loadingText="Đang xóa..."
            className="bg-red-600 hover:bg-red-700 mt-4"
            icon={<Trash2 className="w-4 h-4 mr-2" />}
          />
        </div>
      </div>

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        title="Xác nhận xóa dự án"
        description={`Bạn có chắc chắn muốn xóa dự án "${form.name}"? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.`}
        confirmText="Vẫn Xóa"
      />
    </div>
  );
}
