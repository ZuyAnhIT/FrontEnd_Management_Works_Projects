"use client";

import React, { useMemo } from "react";
import {
  CheckCircle2,
  FileEdit,
  PlusCircle,
  Trash2,
  GitCommit,
  ArrowRightCircle,
  PlayCircle,
  Layout,
  Layers,
  FolderKanban,
  Briefcase,
  MessageSquare,
} from "lucide-react";

// Internal Components & Services
import { ActivityLog } from "@/services/apiActivity";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES
// =============================================================================

interface NotificationItemProps {
  item: ActivityLog;
  onClick: () => void;
}

// =============================================================================
// HELPER CONFIGURATIONS (MAPPINGS)
// =============================================================================

/**
 * Cấu hình hiển thị dựa trên mã hành động (Action Code)
 */
const ACTION_CONFIG = {
  CREATE: {
    icon: PlusCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "created",
  },
  START: {
    icon: PlayCircle,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "started",
  },
  UPDATE: {
    icon: FileEdit,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "updated",
  },
  MOVE_STATUS: {
    icon: ArrowRightCircle,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    label: "moved",
  },
  COMPLETE: {
    icon: CheckCircle2,
    color: "text-purple-600",
    bg: "bg-purple-50",
    label: "completed",
  },
  DELETE: {
    icon: Trash2,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "deleted",
  },
  COMMENT: {
    icon: MessageSquare,
    color: "text-sky-600",
    bg: "bg-sky-50",
    label: "commented on",
  },
  DEFAULT: {
    icon: GitCommit,
    color: "text-slate-500",
    bg: "bg-slate-50",
    label: "acted on",
  },
};

/**
 * Ánh xạ biểu tượng dựa trên loại đối tượng (Entity Type)
 */
const ENTITY_ICON_MAP: Record<string, React.ReactNode> = {
  TASK: <Layout className="w-3.5 h-3.5" />,
  SPRINT: <Layers className="w-3.5 h-3.5" />,
  PROJECT: <FolderKanban className="w-3.5 h-3.5" />,
  WORKSPACE: <Briefcase className="w-3.5 h-3.5" />,
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần hiển thị một mục thông báo hoạt động.
 * Kết hợp thông tin người dùng, hành động và chi tiết thay đổi dữ liệu.
 */
export default function NotificationItem({
  item,
  onClick,
}: NotificationItemProps) {
  // ---------------------------------------------------------------------------
  // 1. LOGIC HANDLERS
  // ---------------------------------------------------------------------------

  // Lấy cấu hình hành động hoặc sử dụng cấu hình mặc định nếu không tìm thấy
  const config = useMemo(() => 
    ACTION_CONFIG[item.action as keyof typeof ACTION_CONFIG] || ACTION_CONFIG.DEFAULT,
  [item.action]);

  const ActionIcon = config.icon;

  /**
   * Xử lý nội dung HTML an toàn từ API để hiển thị chi tiết thay đổi
   */
  const renderDescription = () => {
    return { __html: item.description };
  };

  // ---------------------------------------------------------------------------
  // 2. RENDER
  // ---------------------------------------------------------------------------
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex gap-3 p-3 pl-4 transition-all cursor-pointer border-l-[3px] border-transparent border-b border-slate-50 last:border-b-0",
        "hover:bg-slate-50 hover:border-blue-500"
      )}
    >
      {/* CỘT TRÁI: ẢNH ĐẠI DIỆN VÀ BIỂU TƯỢNG HÀNH ĐỘNG */}
      <div className="relative shrink-0 mt-1">
        <Avatar className="w-9 h-9 border border-slate-200 shadow-sm">
          <AvatarImage src={item.userAvatar} alt={item.userName} />
          <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600 font-bold uppercase">
            {item.userName?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>

        {/* Biểu tượng hành động nhỏ đính kèm góc ảnh đại diện */}
        <div
          className={cn(
            "absolute -bottom-1 -right-1 rounded-full p-0.5 shadow-sm border border-white",
            config.bg
          )}
        >
          <ActionIcon className={cn("w-3 h-3", config.color)} />
        </div>
      </div>

      {/* CỘT PHẢI: CHI TIẾT HOẠT ĐỘNG */}
      <div className="flex-1 min-w-0">
        {/* Dòng 1: Thông tin người thực hiện và thời gian */}
        <div className="flex justify-between items-start mb-1 leading-tight">
          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1">
            <span className="font-bold text-slate-800">{item.userName}</span>
            <span>{config.label}</span>
            {/* Nhãn loại thực thể (Ví dụ: TASK, PROJECT) */}
            <span className="lowercase font-medium bg-slate-50 px-1.5 rounded text-[10px] text-slate-500 border border-slate-200">
              {item.entityType}
            </span>
          </div>

          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 shrink-0">
            {item.timeAgo}
          </span>
        </div>

        {/* Dòng 2: Tên đối tượng và mã định danh (Entity Code) */}
        <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 mb-1.5 group-hover:text-blue-600 transition-colors">
          <span className="opacity-70 shrink-0">
            {ENTITY_ICON_MAP[item.entityType] || <GitCommit className="w-3.5 h-3.5" />}
          </span>

          <div className="truncate flex items-center gap-1.5 min-w-0">
            {item.entityCode && (
              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded border border-slate-200 shrink-0">
                {item.entityCode}
              </span>
            )}
            <span className="truncate" title={item.entityName}>
              {item.entityName}
            </span>
          </div>
        </div>

        {/* Dòng 3: Mô tả chi tiết thay đổi (Hỗ trợ định dạng HTML từ Backend) */}
        <div className="text-xs text-slate-600 leading-relaxed break-words bg-slate-50/60 p-2 rounded-md border border-slate-100">
          <div
            className={cn(
              "text-[11px]",
              "[&>strong]:font-semibold [&>strong]:text-slate-700 [&>strong]:bg-white",
              "[&>strong]:px-1 [&>strong]:rounded-sm [&>strong]:border [&>strong]:border-slate-200",
              "[&>strong]:shadow-sm [&>strong]:mx-0.5 [&>strong]:text-[11px]"
            )}
            dangerouslySetInnerHTML={renderDescription()}
          />
        </div>
      </div>
    </div>
  );
}