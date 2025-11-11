"use client";

import { useState } from "react";
import { X, Palette, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
// ⛔️ SỬA LỖI: Đảm bảo bạn import từ /services/
import { createWorkspace } from "@/services/apiWorkspace";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  onSuccess: (newWs: any) => void;
}

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  companyId,
  onSuccess,
}: CreateWorkspaceModalProps) {
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    coverImage: "", // Thêm trường này nếu backend hỗ trợ
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Vui lòng nhập tên phòng ban!", "warning");
      return;
    }

    try {
      setCreating(true);
      const payload = {
        workspaceName: form.name,
        description: form.description,
        color: form.color,
        coverImage: form.coverImage || undefined,

      };

      const newWs = await createWorkspace(companyId, payload);
      showToast("Tạo phòng ban mới thành công!", "success");
      onSuccess(newWs); // Gửi data về cho cha
      onClose(); // Đóng modal

      // Reset form
      setForm({ name: "", description: "", color: "#3B82F6", coverImage: "" });
    } catch (err: any) {
      showToast(err.message || "Không thể tạo workspace mới.", "error");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Tạo phòng ban mới</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Tên phòng ban (Bắt buộc)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
            required
          />
          <textarea
            placeholder="Mô tả (Tùy chọn)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none resize-none"
          />
          <input
            type="text"
            placeholder="Link ảnh bìa (Tùy chọn)"
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
          />
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-500" />
            <label className="text-sm font-medium">Chọn màu đại diện</label>
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
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 flex items-center justify-center"
          >
            {creating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Đang tạo...
              </>
            ) : (
              "Tạo mới"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
