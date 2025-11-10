"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  FolderKanban,
  Plus,
  X,
  Sparkles,
  FileText,
  Calendar,
  User,
  Target,
  Flag,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { getCurrentUser } from "@/app/api/apiUser";
import {
  getProjects,
  createProject,
  deleteProject,
  getTrashedProjects,
} from "@/app/api/apiProject";
import { useToast } from "@/components/ui/ToastProvider";

export default function ProjectPage() {
  const { showToast } = useToast();
  const params = useParams();
  const workspaceId = Number(params.workspaceId);

  const [companyId, setCompanyId] = useState<number | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [trashed, setTrashed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTrash, setShowTrash] = useState(false); // 🔁 toggle Thùng rác

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

  // 🧩 1️⃣ Lấy companyId từ user hiện tại
  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const user = await getCurrentUser();
        const id = user.company?.companyId || null;
        if (!id) throw new Error("Không tìm thấy công ty.");
        setCompanyId(id);
      } catch (err: any) {
        showToast(err.message || "Không thể lấy thông tin người dùng.", "error");
        setLoading(false);
      }
    };
    fetchCompanyId();
  }, [showToast]);

  // 🧩 2️⃣ Lấy danh sách dự án (hoặc thùng rác)
  useEffect(() => {
    if (!companyId || !workspaceId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = showTrash
          ? await getTrashedProjects(workspaceId)
          : await getProjects(workspaceId);
        showTrash ? setTrashed(data) : setProjects(data);
      } catch (err: any) {
        showToast(err.message || "Không thể tải danh sách dự án", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId, workspaceId, showTrash, showToast]);

  // 🧩 3️⃣ Tạo dự án mới
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.projectCode.trim()) {
      showToast("Vui lòng nhập đầy đủ tên và mã dự án!", "warning");
      return;
    }
    try {
      const newProject = await createProject(workspaceId, form);
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

  // 🗑️ 4️⃣ Xóa dự án
  const handleDelete = async (projectId: number) => {
    const confirm = window.confirm("Bạn có chắc muốn xóa dự án này?");
    if (!confirm) return;
    try {
      await deleteProject(workspaceId, projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      showToast("Đã chuyển dự án vào thùng rác.", "success");
    } catch (err: any) {
      showToast(err.message || "Không thể xóa dự án!", "error");
    }
  };

  // 🧭 5️⃣ Render
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">
          Đang tải danh sách dự án...
        </div>
      </div>
    );

  const currentList = showTrash ? trashed : projects;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/40 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-cyan-500 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <FolderKanban className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-white">
                    Dự án / Projects
                  </h1>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-white/80">
                  Quản lý danh sách các dự án trong phòng ban
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTrash(!showTrash)}
                className="flex items-center gap-2 px-5 py-3 bg-white text-green-600 rounded-xl hover:bg-gray-50 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {showTrash ? (
                  <>
                    <RefreshCw className="w-5 h-5" /> Quay lại danh sách
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" /> Thùng rác
                  </>
                )}
              </button>

              {!showTrash && (
                <button
                  onClick={() => setShowModal(true)}
                  className="group flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold hover:scale-105"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Tạo dự án mới
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {currentList.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 p-16 text-center animate-fadeInUp">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <FolderKanban className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {showTrash ? "Thùng rác trống" : "Chưa có dự án nào"}
            </h3>
            <p className="text-gray-500 mb-6">
              {showTrash
                ? "Không có dự án nào trong thùng rác"
                : "Tạo dự án đầu tiên để bắt đầu"}
            </p>
            {!showTrash && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Tạo dự án đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
            {currentList.map((p, i) => (
              <div
                key={p.id}
                className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="h-2 w-full bg-green-500"></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-green-100 group-hover:scale-110 transition-transform duration-300">
                      <FolderKanban className="w-7 h-7 text-green-600" />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full border border-gray-200">
                      <Flag className="w-3 h-3 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-600">
                        {p.priority}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Mã: <span className="font-mono">{p.projectCode}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {p.description || "Không có mô tả"}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-gray-400" />
                      {p.managerName || "Chưa có quản lý"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(p.startDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>

                  {!showTrash && (
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="absolute top-3 right-3 bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 flex items-center justify-between">
                <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Tạo dự án mới
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-1">Tên dự án</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nhập tên dự án"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Mã dự án</label>
                  <input
                    value={form.projectCode}
                    onChange={(e) => setForm({ ...form, projectCode: e.target.value })}
                    placeholder="VD: ENG001"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Mô tả</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Mô tả ngắn gọn..."
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Mục tiêu (Goal)</label>
                  <input
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    placeholder="VD: Hoàn thiện MVP trong 3 tháng"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border-2 border-gray-200 rounded-xl py-3 hover:bg-gray-50 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl py-3 hover:from-green-600 hover:to-emerald-600 font-semibold"
                  >
                    Tạo
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
