"use client";
import { useEffect, useState } from "react";
import { FolderKanban, Plus, X, Sparkles, Palette, Image as ImageIcon, FileText, Calendar } from "lucide-react";
import { getCompanyWorkspaces, createWorkspace } from "@/app/api/apiWorkspace";
import { getCurrentUser } from "@/app/api/apiUser";
import { useToast } from "@/components/ui/ToastProvider";

export default function WorkspacePage() {
  const { showToast } = useToast();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);

  const [form, setForm] = useState({
    workspaceName: "",
    description: "",
    coverImage: "",
    color: "#3B82F6",
  });

  // 🧩 1️⃣ Lấy companyId từ user hiện tại
  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const user = await getCurrentUser();
        const id = user.company?.companyId || null;
        if (!id)
          throw new Error("Tài khoản của bạn chưa thuộc công ty nào.");
        setCompanyId(id);
      } catch (err: any) {
        showToast(err.message || "Không thể lấy thông tin người dùng.", "error");
        setLoading(false);
      }
    };
    fetchCompanyId();
  }, [showToast]);

  // 🧩 2️⃣ Lấy danh sách workspaces khi có companyId
  useEffect(() => {
    if (!companyId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getCompanyWorkspaces(companyId);
        setWorkspaces(data);
      } catch (err: any) {
        showToast(err.message || "Không thể tải danh sách phòng ban", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId, showToast]);

  // 🧩 3️⃣ Tạo workspace mới
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.workspaceName.trim()) {
      showToast("Vui lòng nhập tên phòng ban!", "warning");
      return;
    }

    if (!companyId) {
      showToast("Không xác định được công ty.", "error");
      return;
    }

    try {
      const newWs = await createWorkspace(companyId, form);
      setWorkspaces((prev) => [...prev, newWs]);
      showToast("Đã tạo phòng ban mới!", "success");

      // ✅ Reset form và đóng modal
      setForm({ workspaceName: "", description: "", coverImage: "", color: "#3B82F6" });
      setShowModal(false);
    } catch (err: any) {
      showToast(err.message || "Không thể tạo phòng ban!", "error");
    }
  };

  // 🧭 4️⃣ Render
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-green-50/40 to-white">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Đang tải danh sách phòng ban...</p>
        </div>
      </div>
    );

  if (!companyId)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-green-50/40 to-white">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FolderKanban className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500">Bạn chưa thuộc công ty nào để xem danh sách phòng ban.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/40 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-cyan-500 rounded-3xl p-8 mb-8 shadow-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <FolderKanban className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-white">Phòng ban / Workspaces</h1>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-white/80">
                  Quản lý danh sách các phòng ban trong công ty
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="group flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold hover:scale-105"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Tạo phòng ban mới
            </button>
          </div>
        </div>

        {/* Workspaces Grid */}
        {workspaces.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 p-16 text-center animate-fadeInUp">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <FolderKanban className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có phòng ban nào
            </h3>
            <p className="text-gray-500 mb-6">Tạo phòng ban đầu tiên để bắt đầu</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Tạo phòng ban đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
            {workspaces.map((ws, index) => (
              <div
                key={ws.workspaceId}
                className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fadeInUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Color Bar */}
                <div 
                  className="h-2 w-full"
                  style={{ backgroundColor: ws.color || "#3B82F6" }}
                ></div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: ws.color || "#3B82F6" }}
                    >
                      <FolderKanban className="w-7 h-7 text-white" />
                    </div>
                    
                    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full border border-gray-200">
                      <Sparkles className="w-3 h-3 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-600">Active</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    {ws.workspaceName}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {ws.description || "Không có mô tả"}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {ws.createdAt
                        ? new Date(ws.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "—"}
                    </div>
                    
                    <button className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 rounded-lg text-xs font-semibold hover:from-green-100 hover:to-emerald-100 transition-all duration-200">
                      Xem chi tiết
                    </button>
                  </div>
                </div>

                {/* Hover Glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-2xl -z-10"
                  style={{ backgroundColor: ws.color || "#3B82F6" }}
                ></div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
              {/* Modal Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-cyan-500 p-6">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Tạo phòng ban mới</h2>
                      <p className="text-white/80 text-sm">Thêm workspace cho công ty</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreate} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-green-500" />
                    Tên phòng ban
                  </label>
                  <input
                    type="text"
                    value={form.workspaceName}
                    onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
                    placeholder="Nhập tên phòng ban"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 outline-none hover:border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Mô tả
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Nhập mô tả ngắn gọn..."
                    rows={3}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 outline-none hover:border-gray-300 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-500" />
                    Ảnh bìa (URL)
                  </label>
                  <input
                    type="text"
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300 outline-none hover:border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-pink-500" />
                    Màu chủ đề
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-16 h-12 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-all"
                    />
                    <div className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 font-mono text-sm">
                      {form.color}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Tạo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .bg-grid-white\/10 {
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