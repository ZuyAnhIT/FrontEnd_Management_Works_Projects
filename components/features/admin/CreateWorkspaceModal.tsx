"use client";
import { useState } from "react";
import {
  PlusCircle,
  X,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  FileText,
  Building,
  Palette,
} from "lucide-react";
import { createWorkspace } from "@/services/apiWorkspace";
import { useToast } from "@/components/ui/ToastProvider";

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  companyId,
  onSuccess,
}: any) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    workspaceName: "",
    description: "",
    coverImage: "",
    color: "#3B82F6",
  });

  const resetForm = () => {
    setForm({
      workspaceName: "",
      description: "",
      coverImage: "",
      color: "#3B82F6",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workspaceName.trim()) {
      showToast("Vui lòng nhập tên workspace!", "warning");
      return;
    }
    setLoading(true);
    try {
      const newWorkspace = await createWorkspace(companyId, form);
      onSuccess(newWorkspace);
      resetForm();
    } catch (err: any) {
      showToast(err.message || "Không thể tạo workspace!", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const colorOptions = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Pink", value: "#EC4899" },
    { name: "Green", value: "#10B981" },
    { name: "Orange", value: "#F59E0B" },
    { name: "Red", value: "#EF4444" },
    { name: "Teal", value: "#14B8A6" },
    { name: "Indigo", value: "#6366F1" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slideUp"
      >
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-8 overflow-hidden">
          {/* Animated background effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/30">
                <PlusCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                  Tạo Workspace mới
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </h2>
                <p className="text-white/80 text-sm">
                  Tạo không gian làm việc cho phòng ban
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
            {/* Workspace Name - Full Width */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Building className="w-4 h-4 text-blue-500" />
                Tên Workspace <span className="text-red-500">*</span>
              </label>
              <input
                value={form.workspaceName}
                onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
                placeholder="VD: Phòng Marketing"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                required
              />
            </div>

            {/* Description */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Mô tả workspace
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
                placeholder="Mô tả về workspace này..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-gray-400 focus:ring-4 focus:ring-gray-400/10 outline-none resize-none transition-all"
              />
            </div>

            {/* Color Picker */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Palette className="w-4 h-4 text-purple-500" />
                Màu chủ đạo
              </label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setForm({ ...form, color: color.value })}
                    className={`relative w-full aspect-square rounded-xl transition-all duration-300 hover:scale-110 ${
                      form.color === color.value
                        ? "ring-4 ring-offset-2 ring-blue-500 scale-110"
                        : "hover:ring-2 hover:ring-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {form.color === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-gray-800" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <span className="text-sm text-gray-600 font-mono">{form.color}</span>
              </div>
            </div>

            {/* Cover Image */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4 text-pink-500" />
                Ảnh bìa (URL)
              </label>
              <div className="relative">
                <input
                  value={form.coverImage}
                  onChange={(e) =>
                    setForm({ ...form, coverImage: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all"
                />
                {form.coverImage && (
                  <div className="mt-3 relative rounded-xl overflow-hidden border-2 border-gray-200">
                    <img
                      src={form.coverImage}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                {!form.coverImage && (
                  <div className="mt-3 relative rounded-xl overflow-hidden border-2 border-dashed border-gray-300">
                    <div
                      className="w-full h-40 flex items-center justify-center"
                      style={{ backgroundColor: form.color }}
                    >
                      <Building className="w-12 h-12 text-white/50" />
                    </div>
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
                className="flex-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white rounded-xl py-3.5 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 font-bold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Tạo Workspace
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