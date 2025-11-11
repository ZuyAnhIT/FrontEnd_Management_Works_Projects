"use client";

import { useEffect, useState } from "react";
import {
  FolderKanban,
  Plus,
  X,
  Sparkles,
  Calendar,
  User,
  Flag,
  Target,
  BarChart,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { getCurrentUser } from "@/app/api/apiUser";
import {
  getProjects,
  getTrashedProjects,
  createProject,
  deleteProject,
} from "@/app/api/apiProject";
import { useToast } from "@/components/ui/ToastProvider";

export default function CompanyProjectPage() {
  const { showToast } = useToast();

  const [workspaceList, setWorkspaceList] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [trashedProjects, setTrashedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "trash">("active");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(
    null
  );

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

  // 🧩 1️⃣ Lấy danh sách workspace và dự án trong công ty
  const loadAllProjects = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      const workspaces = user.workspaces || [];

      if (workspaces.length === 0) {
        showToast("Công ty hiện chưa có workspace nào.", "warning");
        setLoading(false);
        return;
      }

      setWorkspaceList(workspaces);
      if (!selectedWorkspaceId) setSelectedWorkspaceId(workspaces[0].workspaceId);

      // Lấy tất cả dự án trong các workspace
      const allProjects: any[] = [];
      const allTrash: any[] = [];

      for (const ws of workspaces) {
        const active = await getProjects(ws.workspaceId);
        const trash = await getTrashedProjects(ws.workspaceId);

        const activeWithWs = active.map((p: any) => ({
          ...p,
          workspaceName: ws.workspaceName,
          workspaceId: ws.workspaceId,
        }));

        const trashWithWs = trash.map((p: any) => ({
          ...p,
          workspaceName: ws.workspaceName,
          workspaceId: ws.workspaceId,
        }));

        allProjects.push(...activeWithWs);
        allTrash.push(...trashWithWs);
      }

      setProjects(allProjects);
      setTrashedProjects(allTrash);
    } catch (err: any) {
      showToast(err.message || "Không thể tải danh sách dự án", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllProjects();
  }, []);

  // 🧩 2️⃣ Tạo dự án mới
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceId) {
      showToast("Vui lòng chọn workspace để tạo dự án!", "warning");
      return;
    }

    if (!form.name.trim() || !form.projectCode.trim()) {
      showToast("Vui lòng nhập đầy đủ tên và mã dự án!", "warning");
      return;
    }

    try {
      const newProject = await createProject(selectedWorkspaceId, form);
      setProjects((prev) => [...prev, newProject]);
      showToast("Đã tạo dự án mới!", "success");
      setForm({
        name: "",
        projectCode: "",
        description: "",
        goal: "",
        coverImageUrl: "",
        priority: "MEDIUM",
        startDate: "",
        dueDate: "",
      });
      setShowModal(false);
    } catch (err: any) {
      showToast(err.message || "Không thể tạo dự án!", "error");
    }
  };

  // 🧩 3️⃣ Xóa dự án
  const handleDelete = async (workspaceId: number, id: number) => {
    if (!confirm("Bạn có chắc muốn xóa dự án này không?")) return;
    try {
      await deleteProject(workspaceId, id);
      showToast("Đã xóa dự án!", "success");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      showToast(err.message || "Không thể xóa dự án!", "error");
    }
  };

  // 🧭 4️⃣ Render card dự án
  const renderCard = (p: any, isTrash = false) => (
    <div
      key={p.id}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
    >
      {p.coverImageUrl && (
        <img
          src={p.coverImageUrl}
          alt="cover"
          className="w-full h-40 object-cover"
        />
      )}

      <div
        className={`h-1 w-full ${
          p.priority === "HIGH"
            ? "bg-red-500"
            : p.priority === "LOW"
            ? "bg-gray-400"
            : "bg-blue-500"
        }`}
      ></div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-blue-100">
              <FolderKanban className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                {p.name}
              </h3>
              <p className="text-sm text-gray-500 font-mono">{p.projectCode}</p>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-xs rounded-full font-semibold ${
              p.status === "ACTIVE"
                ? "bg-blue-50 text-blue-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {p.status || "UNKNOWN"}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {p.description || "Không có mô tả"}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Target className="w-4 h-4 text-blue-500" />
          {p.goal || "Không có mục tiêu"}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> {p.managerName || "Chưa có QL"}
          </div>
          <div className="flex items-center gap-1">
            <Flag className="w-3.5 h-3.5" /> {p.priority}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {p.startDate
              ? new Date(p.startDate).toLocaleDateString("vi-VN")
              : "--"}{" "}
            →{" "}
            {p.dueDate
              ? new Date(p.dueDate).toLocaleDateString("vi-VN")
              : "--"}
          </div>
          <div className="flex items-center gap-1">
            <BarChart className="w-3.5 h-3.5" /> {p.progress || 0}%
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-400 italic">
          Workspace: {p.workspaceName || "Không xác định"}
        </div>

        {!isTrash && (
          <button
            onClick={() => handleDelete(p.workspaceId, p.id)}
            className="mt-4 w-full flex items-center justify-center gap-2 text-red-600 border border-red-200 py-2 rounded-lg hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-4 h-4" /> Xóa dự án
          </button>
        )}
      </div>
    </div>
  );

  const list = activeTab === "active" ? projects : trashedProjects;

  // 🧭 5️⃣ Render chính
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 animate-pulse">
        Đang tải danh sách dự án...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl p-8 mb-8 shadow-2xl text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <FolderKanban className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dự án công ty</h1>
              <p className="text-white/80 text-sm">
                Quản lý và tạo mới dự án trên toàn bộ workspace
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white text-blue-600 px-5 py-3 rounded-xl hover:bg-gray-50 font-semibold shadow-lg"
          >
            <Plus className="w-5 h-5" /> Tạo dự án mới
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-2 font-semibold ${
              activeTab === "active"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500"
            }`}
          >
            Dự án hiện tại ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab("trash")}
            className={`pb-2 font-semibold ${
              activeTab === "trash"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500"
            }`}
          >
            Dự án đã xóa ({trashedProjects.length})
          </button>
        </div>

        {/* Danh sách */}
        {list.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border-2 border-dashed border-gray-200 p-16 text-center">
            <FolderKanban className="w-10 h-10 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === "trash"
                ? "Không có dự án đã xóa."
                : "Chưa có dự án nào."}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((p) => renderCard(p, activeTab === "trash"))}
          </div>
        )}

        {/* Modal tạo dự án */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 flex items-center justify-between text-white">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Tạo dự án mới
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Workspace
                  </label>
                  <select
                    value={selectedWorkspaceId || ""}
                    onChange={(e) => setSelectedWorkspaceId(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                  >
                    <option value="">-- Chọn workspace --</option>
                    {workspaceList.map((ws) => (
                      <option key={ws.workspaceId} value={ws.workspaceId}>
                        {ws.workspaceName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Tên dự án
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nhập tên dự án"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Mã dự án
                  </label>
                  <input
                    value={form.projectCode}
                    onChange={(e) =>
                      setForm({ ...form, projectCode: e.target.value })
                    }
                    placeholder="VD: ENG001"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                  >
                    <option value="LOW">Thấp</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HIGH">Cao</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Mục tiêu (Goal)
                  </label>
                  <input
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    placeholder="VD: Hoàn thành MVP trong 3 tháng"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Mô tả ngắn gọn..."
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="col-span-2 flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border-2 border-gray-200 rounded-xl py-3 hover:bg-gray-50 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl py-3 hover:from-blue-600 hover:to-cyan-600 font-semibold"
                  >
                    Tạo dự án
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}