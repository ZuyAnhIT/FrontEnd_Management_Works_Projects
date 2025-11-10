"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  FolderKanban,
  Edit,
  Trash2,
  Calendar,
  Palette,
  Image as ImageIcon,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import {
  getWorkspaceDetail,
  updateWorkspace,
  updateWorkspaceStatus,
  deleteWorkspace,
} from "@/app/api/apiWorkspace";
import { getCurrentUser } from "@/app/api/apiUser";
import { useToast } from "@/components/ui/ToastProvider";

export default function WorkspaceDetailPage() {
  const { showToast } = useToast();
  const params = useParams();
  const workspaceId = Number(params.workspaceId);

  const [companyId, setCompanyId] = useState<number | null>(null);
  const [workspace, setWorkspace] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    coverImage: "",
    color: "#3B82F6",
  });

  // 🧩 1️⃣ Lấy thông tin user → companyId
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        const id = user.company?.companyId || null;
        if (!id) throw new Error("Không tìm thấy công ty của bạn.");
        setCompanyId(id);
      } catch (err: any) {
        showToast(err.message || "Không thể tải thông tin người dùng.", "error");
        setLoading(false);
      }
    };
    fetchUser();
  }, [showToast]);

  // 🧩 2️⃣ Lấy chi tiết workspace
  useEffect(() => {
    if (!companyId || !workspaceId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await getWorkspaceDetail(companyId, workspaceId);
        setWorkspace(data);
        setForm({
          name: data.workspaceName,
          description: data.description || "",
          coverImage: data.coverImage || "",
          color: data.color || "#3B82F6",
        });
      } catch (err: any) {
        showToast(err.message || "Không thể tải chi tiết workspace.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [companyId, workspaceId, showToast]);

  // 🧩 3️⃣ Cập nhật thông tin workspace
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !workspaceId) return;

    try {
      const updated = await updateWorkspace(companyId, workspaceId, form);
      setWorkspace(updated);
      setShowEditModal(false);
      showToast("Cập nhật workspace thành công!", "success");
    } catch (err: any) {
      showToast(err.message || "Lỗi khi cập nhật workspace.", "error");
    }
  };

  // 🧩 4️⃣ Cập nhật trạng thái
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!companyId || !workspaceId) return;
    try {
      const res = await updateWorkspaceStatus(companyId, workspaceId, { newStatus });
      setWorkspace(res.data);
      showToast("Cập nhật trạng thái thành công!", "success");
    } catch (err: any) {
      showToast(err.message || "Lỗi khi cập nhật trạng thái.", "error");
    }
  };

  // 🧩 5️⃣ Xóa workspace
  const handleDelete = async () => {
    if (!companyId || !workspaceId) return;
    const confirm = window.confirm("Bạn có chắc muốn xóa workspace này?");
    if (!confirm) return;

    try {
      setIsDeleting(true);
      await deleteWorkspace(companyId, workspaceId);
      showToast("Đã xóa workspace thành công!", "success");
      setWorkspace(null); // Ẩn nội dung
    } catch (err: any) {
      showToast(err.message || "Không thể xóa workspace.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // 🧭 Loading / Deleted
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    );

  if (!workspace)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Workspace này đã bị xóa hoặc không tồn tại.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/40 to-white py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-cyan-500 rounded-3xl p-8 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: workspace.color }}
              >
                <FolderKanban className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{workspace.workspaceName}</h1>
                <p className="text-white/80 text-sm">
                  Tạo ngày {new Date(workspace.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={workspace.status}
                onChange={handleStatusChange}
                className="px-4 py-2 rounded-xl font-semibold bg-white text-green-700 border border-gray-200 shadow-sm hover:bg-gray-50 transition-all"
              >
                <option value="ACTIVE">🟢 ACTIVE</option>
                <option value="INACTIVE">🟡 INACTIVE</option>
                <option value="ARCHIVED">⚫ ARCHIVED</option>
              </select>

              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-white rounded-xl flex items-center gap-2 hover:bg-gray-100 font-semibold"
              >
                <Edit className="w-4 h-4" /> Sửa
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-xl flex items-center gap-2 hover:bg-red-600 font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
          {workspace.coverImage && (
            <img
              src={workspace.coverImage}
              alt="cover"
              className="w-full h-64 object-cover rounded-xl border"
            />
          )}
          <div>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Mô tả
            </h2>
            <p className="text-gray-700">
              {workspace.description || "Chưa có mô tả."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-pink-500" />
            <span className="text-gray-600">Màu chủ đề:</span>
            <span
              className="w-6 h-6 rounded-full border shadow-sm"
              style={{ backgroundColor: workspace.color }}
            ></span>
            <span className="text-sm font-mono">{workspace.color}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Calendar className="w-4 h-4" />
            Ngày tạo:{" "}
            {new Date(workspace.createdAt).toLocaleDateString("vi-VN")}
          </div>
        </div>
      </div>

      {/* ✏️ Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-cyan-500 p-6">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Chỉnh sửa workspace</h2>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Tên workspace</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Ảnh bìa (URL)</label>
                <input
                  type="text"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Màu chủ đề</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-16 h-12 border-2 border-gray-200 rounded-xl cursor-pointer"
                  />
                  <span className="font-mono text-sm">{form.color}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border-2 border-gray-200 rounded-xl py-3 hover:bg-gray-50 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl py-3 hover:scale-105 transition-all font-semibold"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .bg-grid-white\\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
