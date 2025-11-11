"use client";
import { useEffect, useState } from "react";
import {
  FolderKanban,
  Edit,
  Trash2,
  Calendar,
  Palette,
  FileText,
  X,
  Loader2,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import {
  getCompanyWorkspaces,
  getWorkspaceDetail,
  updateWorkspace,
  updateWorkspaceStatus,
  deleteWorkspace,
  createWorkspace,
} from "@/app/api/apiWorkspace";
import { getCurrentUser } from "@/app/api/apiUser";
import { useToast } from "@/components/ui/ToastProvider";

export default function CompanyWorkspacesPage() {
  const { showToast } = useToast();

  const [companyId, setCompanyId] = useState<number | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 📦 Trạng thái modal chi tiết
  const [selectedWorkspace, setSelectedWorkspace] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    coverImage: "",
    color: "#3B82F6",
  });
   // Modal tạo mới
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

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
      }
    };
    fetchUser();
  }, [showToast]);

  // 🧩 2️⃣ Lấy tất cả workspace theo công ty
  useEffect(() => {
    if (!companyId) return;
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
  }, [companyId, showToast]);

  // 🧩 3️⃣ Xem chi tiết workspace (mở modal)
  const openWorkspaceDetail = async (workspaceId: number) => {
    try {
      setLoading(true);
      const data = await getWorkspaceDetail(companyId!, workspaceId);
      setSelectedWorkspace(data);
      setForm({
        name: data.workspaceName,
        description: data.description || "",
        coverImage: data.coverImage || "",
        color: data.color || "#3B82F6",
      });
      setShowDetailModal(true);
    } catch (err: any) {
      showToast(err.message || "Không thể tải chi tiết workspace.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 4️⃣ Cập nhật thông tin workspace
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !selectedWorkspace) return;

    try {
      const updated = await updateWorkspace(companyId, selectedWorkspace.workspaceId, form);
      setSelectedWorkspace(updated);
      setWorkspaces((prev) =>
        prev.map((ws) => (ws.workspaceId === updated.workspaceId ? updated : ws))
      );
      showToast("Cập nhật workspace thành công!", "success");
      setShowDetailModal(false);
    } catch (err: any) {
      showToast(err.message || "Lỗi khi cập nhật workspace.", "error");
    }
  };

  // 🧩 5️⃣ Cập nhật trạng thái
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!companyId || !selectedWorkspace) return;
    try {
      const res = await updateWorkspaceStatus(companyId, selectedWorkspace.workspaceId, { newStatus });
      setSelectedWorkspace(res.data);
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.workspaceId === selectedWorkspace.workspaceId
            ? { ...ws, status: newStatus }
            : ws
        )
      );
      showToast("Cập nhật trạng thái thành công!", "success");
    } catch (err: any) {
      showToast(err.message || "Lỗi khi cập nhật trạng thái.", "error");
    }
  };

  // 🧩 6️⃣ Xóa workspace
  const handleDelete = async () => {
    if (!companyId || !selectedWorkspace) return;
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa workspace này?");
    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      await deleteWorkspace(companyId, selectedWorkspace.workspaceId);
      setWorkspaces((prev) =>
        prev.filter((w) => w.workspaceId !== selectedWorkspace.workspaceId)
      );
      setShowDetailModal(false);
      showToast("Đã xóa workspace thành công!", "success");
    } catch (err: any) {
      showToast(err.message || "Không thể xóa workspace.", "error");
    } finally {
      setIsDeleting(false);
    }
  };
 // 🧩 7️⃣ Tạo workspace mới
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !form.name.trim()) {
      showToast("Vui lòng nhập tên phòng ban!", "warning");
      return;
    }

    try {
      setCreating(true);
      const payload = {
        workspaceName: form.name,
        description: form.description,
        color: form.color,
        coverImage: form.coverImage,
      };
      const newWs = await createWorkspace(companyId, payload);
      setWorkspaces((prev) => [...prev, newWs]);
      showToast("Tạo phòng ban mới thành công!", "success");
      setShowCreateModal(false);
      setForm({ name: "", description: "", coverImage: "", color: "#3B82F6" });
    } catch (err: any) {
      showToast(err.message || "Không thể tạo workspace mới.", "error");
    } finally {
      setCreating(false);
    }
  };
  // 🧭 7️⃣ Loading
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );

  // 🧭 8️⃣ Giao diện chính
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-10">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl p-8 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                <FolderKanban className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Workspace Công ty</h1>
                <p className="text-white/80">
                  Quản lý toàn bộ workspace của công ty bạn
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="group flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold hover:scale-105"
            >
              <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Tạo phòng ban mới
            </button>
          </div>
        </div>

        {/* Danh sách workspace */}
        {workspaces.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 p-16 text-center">
            <FolderKanban className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có workspace nào
            </h3>
            <p className="text-gray-500">Hãy bắt đầu bằng cách tạo mới.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <div
                key={ws.workspaceId}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                {ws.coverImage && (
                  <img
                    src={ws.coverImage}
                    alt={ws.workspaceName}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">
                      {ws.workspaceName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${ws.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : ws.status === "INACTIVE"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                    >
                      {ws.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {ws.description || "Chưa có mô tả."}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {new Date(ws.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span
                      className="inline-block w-4 h-4 rounded-full"
                      style={{ backgroundColor: ws.color }}
                    ></span>
                  </div>
                  <button
                    onClick={() => openWorkspaceDetail(ws.workspaceId)}
                    className="inline-flex items-center justify-center w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-semibold"
                  >
                    Xem chi tiết
                    <Sparkles className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal chi tiết workspace */}
      {showDetailModal  && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slideUp">
            {/* Header */}
            <div
              className="relative p-6 text-white"
              style={{
                 background: `linear-gradient(to right, ${selectedWorkspace?.color || "#3B82F6"}, #0ea5e9)`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FolderKanban className="w-6 h-6" />
                  <h2 className="text-xl font-bold">
                    {selectedWorkspace.workspaceName}
                  </h2>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
              
   
            {/* Body */}
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Tên workspace
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
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

              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-pink-500" />
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-16 h-10 border rounded"
                />
                <span className="text-sm font-mono">{form.color}</span>
              </div>

              <select
                value={selectedWorkspace.status}
                onChange={handleStatusChange}
                className="mt-3 px-4 py-2 rounded-xl font-semibold bg-gray-50 border border-gray-200"
              >
                <option value="ACTIVE">🟢 ACTIVE</option>
                <option value="INACTIVE">🟡 INACTIVE</option>
                <option value="ARCHIVED">⚫ ARCHIVED</option>
              </select>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleDelete}
                  type="button"
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold"
                >
                  {isDeleting ? "Đang xóa..." : "Xóa"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
       {/* 🟢 Modal tạo workspace */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Tạo phòng ban mới</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Tên phòng ban"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-xl px-4 py-3"
              />
              <textarea
                placeholder="Mô tả"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-xl px-4 py-3"
              />
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-500" />
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-16 h-10 border rounded"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600"
              >
                {creating ? "Đang tạo..." : "Tạo mới"}
              </button>
            </form>
          </div>
        </div>
          )}
    </div>
  );
}