"use client";
import {
  FolderKanban,
  Calendar,
  User,
  Flag,
  Target,
  BarChart,
  Trash2,
  ArrowRight,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";

const priorityColors: Record<string, string> = {
  HIGH: "bg-gradient-to-r from-red-500 to-rose-500",
  MEDIUM: "bg-gradient-to-r from-amber-500 to-orange-500",
  LOW: "bg-gradient-to-r from-gray-400 to-gray-500",
};

const priorityGlow: Record<string, string> = {
  HIGH: "shadow-red-500/20",
  MEDIUM: "shadow-amber-500/20",
  LOW: "shadow-gray-500/20",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-500 text-white",
  PLANNING: "bg-blue-500 text-white",
  ARCHIVED: "bg-gray-400 text-white",
};

export default function ProjectCard({
  p,
  onDelete,
  isTrash = false,
  workspaceId,
  viewMode = "grid",
}: any) {
  const projectLink = `/core/workspace/${workspaceId}/project/${p.id}`;

  const formatDate = (dateString: string) => {
    if (!dateString) return "--";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (e) {
      return "--";
    }
  };

  // List view
  if (viewMode === "list") {
    return (
      <div className="group bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-green-300">
        <div className="flex items-center gap-6 p-6">
          {/* Thumbnail */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
            {p.coverImageUrl ? (
              <img
                src={p.coverImageUrl}
                alt="cover"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <FolderKanban className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className={`absolute inset-x-0 bottom-0 h-1 ${priorityColors[p.priority] || "bg-gray-400"}`}></div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-green-600 transition-colors truncate">
                  {p.name}
                </h3>
                <p className="text-sm text-gray-500 font-mono">{p.projectCode}</p>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full font-bold shadow-md ${statusColors[p.status] || "bg-gray-400 text-white"}`}>
                {p.status || "UNKNOWN"}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-1">{p.description || "Không có mô tả"}</p>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-green-500" />
                {p.managerName || "Chưa có QL"}
              </div>
              <div className="flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-amber-500" />
                {p.priority}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-500" />
                {formatDate(p.startDate)} → {formatDate(p.dueDate)}
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart className="w-4 h-4 text-purple-500" />
                {p.progress || 0}%
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href={projectLink}
              className="group/btn flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              Mở
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
            {!isTrash && (
              <button
                onClick={() => onDelete(p.id)}
                className="p-2.5 text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view (enhanced)
  return (
    <div className="group relative bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-green-300 flex flex-col">
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-emerald-500/0 to-teal-500/0 group-hover:from-green-500/5 group-hover:via-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-500 pointer-events-none"></div>

      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        {p.coverImageUrl ? (
          <img
            src={p.coverImageUrl}
            alt="cover"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all duration-500"></div>
            <FolderKanban className="w-16 h-16 text-gray-400 relative z-10 group-hover:text-gray-500 group-hover:scale-110 transition-all duration-300" />
          </div>
        )}
        
        {/* Priority badge overlay */}
        <div className="absolute top-3 right-3">
          <div className={`px-3 py-1.5 ${priorityColors[p.priority] || "bg-gray-400"} text-white text-xs font-bold rounded-full shadow-lg ${priorityGlow[p.priority]} backdrop-blur-sm`}>
            <Flag className="w-3 h-3 inline mr-1" />
            {p.priority}
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1.5 text-xs rounded-full font-bold shadow-lg backdrop-blur-sm ${statusColors[p.status] || "bg-gray-400 text-white"}`}>
            {p.status || "UNKNOWN"}
          </span>
        </div>

        {/* Progress bar overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20 backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${p.progress || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col relative">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-green-100 to-emerald-100 group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300 flex-shrink-0">
            <FolderKanban className="w-7 h-7 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1 mb-1">
              {p.name}
            </h3>
            <p className="text-sm text-gray-500 font-mono">{p.projectCode}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px] flex-1">
          {p.description || "Không có mô tả"}
        </p>

        {/* Goal */}
        <div className="flex items-start gap-2 text-sm text-gray-700 mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <Target className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2 flex-1">{p.goal || "Không có mục tiêu"}</span>
        </div>

        {/* Metadata */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium">{p.managerName || "Chưa có QL"}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg">
              <BarChart className="w-3.5 h-3.5 text-purple-500" />
              <span className="font-bold">{p.progress || 0}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600 bg-amber-50 px-3 py-2 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span className="font-medium truncate">
              {formatDate(p.startDate)} → {formatDate(p.dueDate)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
          <Link
            href={projectLink}
            className="group/btn relative flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-all"></div>
            <Zap className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Vào dự án</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
          </Link>

          {!isTrash && (
            <button
              onClick={() => onDelete(p.id)}
              className="w-full flex items-center justify-center gap-2 text-red-600 border-2 border-red-200 py-2.5 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              Xóa dự án
            </button>
          )}
        </div>
      </div>
    </div>
  );
}