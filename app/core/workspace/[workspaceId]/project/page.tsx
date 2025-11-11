"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FolderKanban,
  Plus,
  X,
  Sparkles,
  Loader2,
  Trash2, // ✅ Thêm
} from "lucide-react";

// ⛔️ SỬA LỖI: Đảm bảo bạn import từ 'services/'
import {
  getProjects,
  getTrashedProjects,
  createProject,
  deleteProject,
} from "@/services/apiProject";
import { useToast } from "@/components/ui/ToastProvider";

// ✅ TỐI ƯU: Import các component con đã được tách
import ProjectCard from "@/components/features/core/project/ProjectCard";
import CreateProjectModal from "@/components/features/core/project/CreateProjectModal";

export default function ProjectPage() {
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter(); // Dùng để chuyển hướng
  const workspaceId = Number(params.workspaceId);

  const [projects, setProjects] = useState<any[]>([]);
  const [trashedProjects, setTrashedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "trash">("active");

  // 🧩 1️⃣ Lấy danh sách dự án (Logic đã đúng)
  const loadProjects = async () => {
    // Thêm kiểm tra workspaceId an toàn
    if (!workspaceId || isNaN(workspaceId)) {
      showToast("Workspace ID không hợp lệ.", "error");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getProjects(workspaceId);
      const trash = await getTrashedProjects(workspaceId);
      setProjects(data || []); // Đảm bảo là array
      setTrashedProjects(trash || []); // Đảm bảo là array
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
  }, [workspaceId]); // Chỉ phụ thuộc vào workspaceId

  // 🧩 2️⃣ Tạo dự án mới
  const handleCreateSuccess = (newProject: any) => {
    setProjects((prev) => [newProject, ...prev]); // Thêm vào đầu danh sách
    setShowModal(false);
    showToast("Đã tạo dự án mới!", "success");
  };

  // 🧩 3️⃣ Xóa dự án
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa dự án này không?")) return;
    try {
      await deleteProject(workspaceId, id);
      showToast("Đã xóa dự án!", "success");
      setProjects((prev) => prev.filter((p) => p.id !== id));
      // Tải lại thùng rác
      const trash = await getTrashedProjects(workspaceId);
      setTrashedProjects(trash);
    } catch (err: any) {
      showToast(err.message || "Không thể xóa dự án!", "error");
    }
  };

  // 🧭 4️⃣ Render
  if (loading)
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
      </div>
    );

  const list = activeTab === "active" ? projects : trashedProjects;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/40 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header (UI đã tốt) */}
        <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-cyan-500 rounded-3xl p-8 mb-8 shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <FolderKanban className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dự án / Projects</h1>
              <p className="text-white/80 text-sm">
                Quản lý và tạo mới dự án trong workspace
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-white text-green-600 px-5 py-3 rounded-xl hover:bg-gray-50 font-semibold shadow-lg transition-all duration-300 hover:scale-105 w-full md:w-auto"
          >
            <Plus className="w-5 h-5" /> Tạo dự án mới
          </button>
        </div>

        {/* Tabs (UI đã tốt) */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 px-1 font-semibold transition-all ${
              activeTab === "active"
                ? "text-green-600 border-b-2 border-green-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Dự án hiện tại ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab("trash")}
            className={`pb-3 px-1 font-semibold transition-all ${
              activeTab === "trash"
                ? "text-red-600 border-b-2 border-red-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" />
              Dự án đã xóa ({trashedProjects.length})
            </span>
          </button>
        </div>

        {/* Danh sách (Đã tối ưu) */}
        {list.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border-2 border-dashed border-gray-200 p-16 text-center animate-fadeInUp">
            <FolderKanban className="w-10 h-10 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === "trash"
                ? "Không có dự án đã xóa."
                : "Chưa có dự án nào."}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {activeTab === "active"
                ? "Hãy bắt đầu bằng cách tạo dự án mới."
                : ""}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
            {list.map((p) => (
              // ✅ TỐI ƯU: Dùng Component Card
              <ProjectCard
                key={p.id}
                p={p}
                onDelete={handleDelete}
                isTrash={activeTab === "trash"}
                workspaceId={workspaceId}
              />
            ))}
          </div>
        )}

        {/* Modal tạo dự án (Đã tối ưu) */}
        <CreateProjectModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          workspaceId={workspaceId}
          onSuccess={handleCreateSuccess}
        />
      </div>

      {/* 🎨 Style cho animation (Thêm từ file cũ) */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

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
          animation: fadeInUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
