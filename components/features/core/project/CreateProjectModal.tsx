"use client";
import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
// ⛔️ SỬA LỖI: Đảm bảo bạn import từ 'services/'
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

  // Hàm reset form
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
      onSuccess(newProject); // Gửi data về cho cha
      resetForm(); // Reset form
      // onClose() được gọi bởi onSuccess trong file cha (ProjectPage)
    } catch (err: any) {
      showToast(err.message || "Không thể tạo dự án!", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Đây là phần UI đầy đủ (Lấy từ code cũ của bạn)
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose} // Đóng khi click nền mờ
    >
      <div
        onClick={(e) => e.stopPropagation()} // Ngăn đóng khi click vào modal
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slideUp"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 flex items-center justify-between text-white">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5" /> Tạo dự án mới
          </h2>
          <button
            onClick={onClose} // Dùng prop onClose
            className="p-1 hover:bg-white/20 rounded-lg"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form (lấy từ code cũ) */}
        <form
          onSubmit={handleCreate}
          className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto"
        >
          {/* Tên dự án (full width) */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1">
              Tên dự án <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nhập tên dự án"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 outline-none"
              required
            />
          </div>

          {/* Mã dự án */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Mã dự án <span className="text-red-500">*</span>
            </label>
            <input
              value={form.projectCode}
              onChange={(e) =>
                setForm({ ...form, projectCode: e.target.value.toUpperCase() })
              }
              placeholder="VD: ENG001"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 outline-none"
              required
            />
          </div>

          {/* Mức độ ưu tiên */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Mức độ ưu tiên
            </label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 outline-none"
            >
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
            </select>
          </div>

          {/* Ngày bắt đầu */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 outline-none"
            />
          </div>

          {/* Ngày kết thúc */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Ngày kết thúc
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 outline-none"
            />
          </div>

          {/* Mục tiêu (full width) */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1">
              Mục tiêu (Goal)
            </label>
            <input
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              placeholder="VD: Hoàn thành MVP trong 3 tháng"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 outline-none"
            />
          </div>

          {/* Mô tả (full width) */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              placeholder="Mô tả ngắn gọn..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 outline-none resize-none"
            />
          </div>

          {/* Ảnh bìa (full width) */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1">
              Ảnh bìa (URL)
            </label>
            <input
              value={form.coverImageUrl}
              onChange={(e) =>
                setForm({ ...form, coverImageUrl: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 outline-none"
            />
          </div>

          {/* Nút bấm (full width) */}
          <div className="col-span-2 flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-200 rounded-xl py-3 hover:bg-gray-50 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl py-3 hover:from-green-600 hover:to-emerald-600 font-semibold disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Tạo dự án"
              )}
            </button>
          </div>
        </form>
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
          animation: fadeIn 0.3s ease-out;
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
