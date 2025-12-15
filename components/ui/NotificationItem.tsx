"use client";

import { ActivityLog } from "@/services/apiActivity";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
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

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface NotificationItemProps {
  item: ActivityLog;
  onClick: () => void;
}

// =============================================================================
// 2. HELPER CONFIGS
// =============================================================================

// 1. Cấu hình hiển thị theo Hành động (Action)
const getActionConfig = (action: string) => {
  switch (action) {
    case "CREATE":
      return {
        icon: PlusCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        label: "created",
      };
    case "START":
      return {
        icon: PlayCircle,
        color: "text-blue-600",
        bg: "bg-blue-50",
        label: "started",
      };
    case "UPDATE":
      return {
        icon: FileEdit,
        color: "text-amber-600",
        bg: "bg-amber-50",
        label: "updated",
      };
    case "MOVE_STATUS":
      return {
        icon: ArrowRightCircle,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        label: "moved",
      };
    case "COMPLETE":
      return {
        icon: CheckCircle2,
        color: "text-purple-600",
        bg: "bg-purple-50",
        label: "completed",
      };
    case "DELETE":
      return {
        icon: Trash2,
        color: "text-red-600",
        bg: "bg-red-50",
        label: "deleted",
      };
    case "COMMENT":
      return {
        icon: MessageSquare,
        color: "text-sky-600",
        bg: "bg-sky-50",
        label: "commented on",
      };
    default:
      return {
        icon: GitCommit,
        color: "text-slate-500",
        bg: "bg-slate-50",
        label: "acted on",
      };
  }
};

// 2. Icon đại diện cho Đối tượng (Entity Type)
const getEntityIcon = (type: string) => {
  switch (type) {
    case "TASK":
      return <Layout className="w-3.5 h-3.5" />;
    case "SPRINT":
      return <Layers className="w-3.5 h-3.5" />;
    case "PROJECT":
      return <FolderKanban className="w-3.5 h-3.5" />;
    case "WORKSPACE":
      return <Briefcase className="w-3.5 h-3.5" />;
    default:
      return <GitCommit className="w-3.5 h-3.5" />;
  }
};

// 3. Xử lý HTML an toàn cho phần Description
const createMarkup = (htmlString: string) => {
  return { __html: htmlString };
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function NotificationItem({
  item,
  onClick,
}: NotificationItemProps) {
  const config = getActionConfig(item.action);
  const ActionIcon = config.icon;

  return (
    <div
      onClick={onClick}
      className="group relative flex gap-3 p-3 pl-4 hover:bg-slate-50 transition-all cursor-pointer border-l-[3px] border-transparent hover:border-blue-500 border-b border-slate-50 last:border-b-0"
    >
      {/* ================= CỘT TRÁI: AVATAR & ACTION ICON ================= */}
      <div className="relative shrink-0 mt-1">
        {/* Avatar người dùng */}
        <Avatar className="w-9 h-9 border border-slate-200 shadow-sm">
          <AvatarImage src={item.userAvatar} alt={item.userName} />
          <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600 font-bold">
            {item.userName ? item.userName.charAt(0).toUpperCase() : "?"}
          </AvatarFallback>
        </Avatar>

        {/* Icon hành động nhỏ đè lên góc avatar */}
        <div
          className={`absolute -bottom-1 -right-1 rounded-full p-0.5 shadow-sm border border-white ${config.bg}`}
        >
          <ActionIcon className={`w-3 h-3 ${config.color}`} />
        </div>
      </div>

      {/* ================= CỘT PHẢI: NỘI DUNG LOG ================= */}
      <div className="flex-1 min-w-0">
        {/* --- Dòng 1: Header (Người dùng + Hành động + Loại đối tượng + Thời gian) --- */}
        <div className="flex justify-between items-start mb-1 leading-tight">
          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1">
            <span className="font-bold text-slate-800">{item.userName}</span>
            <span>{config.label}</span>
            {/* Badge Loại đối tượng (TASK, PROJECT...) */}
            <span className="lowercase font-medium bg-slate-100 px-1.5 rounded text-[10px] text-slate-600 border border-slate-200">
              {item.entityType}
            </span>
          </div>

          {/* Thời gian */}
          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 shrink-0">
            {item.timeAgo}
          </span>
        </div>

        {/* --- Dòng 2: TÊN ĐỐI TƯỢNG (Điểm nhấn chính) --- */}
        {/* Hiển thị: [Icon] [Mã] Tên đối tượng */}
        <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 mb-1.5 group-hover:text-blue-600 transition-colors">
          {/* Icon loại đối tượng */}
          <span className="opacity-70 shrink-0">
            {getEntityIcon(item.entityType)}
          </span>

          <div className="truncate flex items-center gap-1.5 min-w-0">
            {/* Nếu có Entity Code (VD: ECOM-12), hiển thị dạng Badge */}
            {item.entityCode && (
              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded border border-slate-200 shrink-0">
                {item.entityCode}
              </span>
            )}

            {/* Tên đối tượng */}
            <span className="truncate" title={item.entityName}>
              {item.entityName}
            </span>
          </div>
        </div>

        {/* --- Dòng 3: CHI TIẾT THAY ĐỔI (Description HTML) --- */}
        {/* Style đặc biệt cho các thẻ <strong> bên trong HTML trả về từ API */}
        <div className="text-xs text-slate-600 leading-relaxed break-words bg-slate-50/60 p-2 rounded-md border border-slate-100">
          <span
            className="
                            [&>strong]:font-semibold 
                            [&>strong]:text-slate-700 
                            [&>strong]:bg-white 
                            [&>strong]:px-1 
                            [&>strong]:rounded-sm 
                            [&>strong]:border 
                            [&>strong]:border-slate-200 
                            [&>strong]:shadow-sm
                            [&>strong]:mx-0.5
                            [&>strong]:text-[11px]
                        "
            dangerouslySetInnerHTML={createMarkup(item.description)}
          />
        </div>
      </div>
    </div>
  );
}
