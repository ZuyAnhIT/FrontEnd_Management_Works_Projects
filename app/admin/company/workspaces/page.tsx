"use client";
import { useEffect, useState } from "react";
import { FolderKanban, MoreVertical, Plus } from "lucide-react";
import { getCompanyWorkspaces, createWorkspace } from "@/app/api/apiWorkspace";
import { useToast } from "@/components/ui/ToastProvider";

export default function WorkspacePage() {
  const { showToast } = useToast();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    workspaceName: "",
    description: "",
    coverImage: "",
    color: "#3B82F6", // Mặc định xanh dương
  });

  const companyId = 1; //  TODO: Lấy từ token hoặc user.currentCompanyId

  // 🧩 Lấy danh sách workspace
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCompanyWorkspaces(companyId);
        setWorkspaces(data);
      } catch (err: any) {
        showToast(err.message || "Không thể tải danh sách phòng ban", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  // 🧩 Tạo workspace mới
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.workspaceName) {
      showToast("Vui lòng nhập tên phòng ban!", "warning");
      return;
    }

    try {
      const newWs = await createWorkspace(companyId, form);
      setWorkspaces((prev) => [...prev, newWs]);
      showToast(" Đã tạo phòng ban mới!", "success");
      setShowModal(false);
      setForm({ workspaceName: "", description: "", coverImage: "", color: "#3B82F6" });
    } catch (err: any) {
      showToast(err.message || " Không thể tạo phòng ban!", "error");
    }
  };

  if (loading)
    return (
      <div className="p-6 text-gray-500 text-center">Đang tải danh sách...</div>
    );

  return (
    <div className="p-6">
      {/* 🔹 Tiêu đề + nút tạo */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Phòng ban / Workspaces
          </h1>
          <p className="text-gray-600">
            Quản lý danh sách các phòng ban trong công ty
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Tạo phòng ban mới
        </button>
      </div>

      {/* 🔹 Danh sách workspace */}
      {workspaces.length === 0 ? (
        <div className="text-gray-500 text-center py-10">
          Chưa có phòng ban nào được tạo.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws) => (
            <div
              key={ws.workspaceId}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: ws.color || "#3B82F6" }}
                >
                  <FolderKanban className="w-6 h-6 text-white" />
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {ws.workspaceName}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {ws.description || "Không có mô tả"}
              </p>

              <div className="text-xs text-gray-400">
                Tạo ngày:{" "}
                {new Date(ws.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔹 Modal tạo workspace */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Tạo phòng ban mới</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tên phòng ban
                </label>
                <input
                  type="text"
                  value={form.workspaceName}
                  onChange={(e) =>
                    setForm({ ...form, workspaceName: e.target.value })
                  }
                  placeholder="Nhập tên phòng ban"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Nhập mô tả"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Ảnh bìa (URL)
                </label>
                <input
                  type="text"
                  value={form.coverImage}
                  onChange={(e) =>
                    setForm({ ...form, coverImage: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Màu chủ đề
                </label>
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) =>
                    setForm({ ...form, color: e.target.value })
                  }
                  className="mt-1 w-16 h-8 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
