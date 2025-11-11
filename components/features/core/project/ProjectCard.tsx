"use client";
import {
  FolderKanban,
  Calendar,
  User,
  Flag,
  Target,
  BarChart,
  Trash2,
} from "lucide-react";
import Link from "next/link";

// 1. Map màu (Sửa lỗi Tailwind Purge)
const priorityColors: Record<string, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-green-500", // Đổi màu Medium cho đẹp hơn
  LOW: "bg-gray-400",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-600",
  PLANNING: "bg-blue-50 text-blue-600",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

export default function ProjectCard({
  p,
  onDelete,
  isTrash = false,
  workspaceId,
}: any) {
  // 2. Link đến trang Board của dự án
  const projectLink = `/core/workspace/${workspaceId}/project/${p.id}/board`;

  const formatDate = (dateString: string) => {
    if (!dateString) return "--";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (e) {
      return "--";
    }
  };

  return (
    <div
      key={p.id}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {p.coverImageUrl ? (
        <img
          src={p.coverImageUrl}
          alt="cover"
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <FolderKanban className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* 3. Thanh màu ưu tiên (đã sửa) */}
      <div
        className={`h-1 w-full ${priorityColors[p.priority] || "bg-gray-400"}`}
      ></div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-green-100">
              <FolderKanban className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors">
                {p.name}
              </h3>
              <p className="text-sm text-gray-500 font-mono">{p.projectCode}</p>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-xs rounded-full font-semibold ${
              statusColors[p.status] || "bg-gray-100 text-gray-500"
            }`}
          >
            {p.status || "UNKNOWN"}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px] flex-1">
          {p.description || "Không có mô tả"}
        </p>

        {/* ✅ PHẦN ĐÃ THÊM VÀO (TỪ CODE CŨ CỦA BẠN) */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Target className="w-4 h-4 text-green-500" />
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
            {formatDate(p.startDate)}
            {" → "}
            {formatDate(p.dueDate)}
          </div>
          <div className="flex items-center gap-1">
            <BarChart className="w-3.5 h-3.5" /> {p.progress || 0}%
          </div>
        </div>
        {/* ✅ KẾT THÚC PHẦN THÊM VÀO */}

        {/* 4. Nâng cấp nút: Thêm Link */}
        <div className="mt-4 space-y-2">
          <Link
            href={projectLink}
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-semibold shadow-lg shadow-blue-500/20"
          >
            Vào dự án
          </Link>

          {!isTrash && (
            <button
              onClick={() => onDelete(p.id)}
              className="w-full flex items-center justify-center gap-2 text-red-600 border border-red-200 py-2 rounded-lg hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Xóa dự án
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
