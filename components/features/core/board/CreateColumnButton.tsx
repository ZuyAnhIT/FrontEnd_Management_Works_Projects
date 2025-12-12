"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
// Đảm bảo đường dẫn import đúng file api của bạn
import { createProjectStatus } from "@/services/apiBoard"; 
import {useToast} from "@/components/ui/ToastProvider";

interface Props {
  projectId: number; // Bắt buộc phải có projectId để gọi API
  onSuccess?: (newColumn: any) => void; // Callback để báo cho component cha cập nhật lại list
}

export default function CreateColumnButton({ projectId, onSuccess }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [columnName, setColumnName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Hàm xử lý gọi API
  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnName.trim()) return;

    try {
      setIsLoading(true);

      // Payload theo yêu cầu của API
      const payload = {
        name: columnName,
        color: "#0091ff", // Màu mặc định hoặc random string
        isCompletedStatus: false // Mặc định là false
      };

      const newColumn = await createProjectStatus(projectId, payload);

      // Reset form
      setColumnName("");
      setIsEditing(false);
      
      // Báo cho component cha biết dữ liệu mới
      if (onSuccess) {
        onSuccess(newColumn);
      }

    } catch (error) {
      console.error("Lỗi tạo cột:", error);
      showToast("Không thể tạo trạng thái mới. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Giao diện khi đang nhập liệu (Form)
  if (isEditing) {
    return (
      <div className="w-[272px] shrink-0 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
        <form onSubmit={handleCreateColumn} className="flex flex-col gap-3">
          <input
            autoFocus
            type="text"
            placeholder="Nhập tên trạng thái..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isLoading || !columnName.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Giao diện nút bấm ban đầu
  return (
    <div className="w-[272px] h-12 shrink-0">
      <button
        onClick={() => setIsEditing(true)}
        className="w-full h-full flex items-center justify-center gap-2 rounded-xl bg-slate-100/50 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 text-slate-500 font-medium transition-all"
      >
        <Plus className="w-5 h-5" />
        Add Column
      </button>
    </div>
  );
}