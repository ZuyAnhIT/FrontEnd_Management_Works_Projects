"use client";
import { useState } from "react";
import {
  Plus,
  X,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Calendar,
  Flag,
  Target,
  FileText,
  Code,
} from "lucide-react";
import { createProject } from "@/services/apiProject";
import { useToast } from "@/components/ui/ToastProvider";

export default function CreateProjectModal({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: any) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
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

  const resetForm = () => {
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
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.projectCode.trim()) {
      showToast("Vui lòng nhập đầy đủ tên và mã dự án!", "warning");
      return;
    }
    setLoading(true);
    try {
      const newProject = await createProject(workspaceId, form);
      onSuccess(newProject);
      resetForm();
    } catch (err: any) {
      showToast(err.message || "Không thể tạo dự án!", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const priorityOptions = [
    { value: "LOW", label: "Thấp", color: "from-gray-400 to-gray-500" },
    { value: "MEDIUM", label: "Trung bình", color: "from-amber-400 to-orange-500" },
    { value: "HIGH", label: "Cao", color: "from-red-400 to-rose-500" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-slideUp"
      >
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 overflow-hidden">
          {/* Animated background effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/30">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                  Tạo dự án mới
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </h2>
                <p className="text-white/80 text-sm">
                  Bắt đầu một dự án mới với thông tin đầy đủ
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 hover:rotate-90"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Enhanced Form */}
        <form
          onSubmit={handleCreate}
          className="p-8 max-h-[70vh] overflow-y-auto"
        >
          <div className="space-y-6">
            {/* Project Name - Full Width */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-green-500" />
                Tên dự án <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Hệ thống quản lý dự án"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium"
                required
              />
            </div>

            {/* Project Code & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Code className="w-4 h-4 text-blue-500" />
                  Mã dự án <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.projectCode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      projectCode: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="VD: PRJ001"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono font-bold"
                  required
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Flag className="w-4 h-4 text-amber-500" />
                  Mức độ ưu tiên
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm({ ...form, priority: option.value })}
                      className={`relative px-3 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                        form.priority === option.value
                          ? `bg-gradient-to-r ${option.color} text-white shadow-lg scale-105`
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-red-500" />
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Goal */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Target className="w-4 h-4 text-purple-500" />
                Mục tiêu dự án
              </label>
              <input
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                placeholder="VD: Hoàn thành MVP trong 3 tháng"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Mô tả dự án
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
                placeholder="Mô tả chi tiết về dự án..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-gray-400 focus:ring-4 focus:ring-gray-400/10 outline-none resize-none transition-all"
              />
            </div>

            {/* Cover Image */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4 text-pink-500" />
                Ảnh bìa (URL)
              </label>
              <div className="relative">
                <input
                  value={form.coverImageUrl}
                  onChange={(e) =>
                    setForm({ ...form, coverImageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all"
                />
                {form.coverImageUrl && (
                  <div className="mt-3 relative rounded-xl overflow-hidden border-2 border-gray-200">
                    <img
                      src={form.coverImageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border-2 border-gray-300 rounded-xl py-3.5 hover:bg-gray-50 hover:border-gray-400 font-bold text-gray-700 transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-xl py-3.5 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 font-bold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Tạo dự án
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

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
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}