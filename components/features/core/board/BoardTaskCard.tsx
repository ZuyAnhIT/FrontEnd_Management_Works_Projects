"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskSummary } from "@/services/apiProject";
import { User, Bookmark, Bug, CheckCircle2, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useMemo } from "react";

// --- CONFIG ---
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "BUG": return <Bug className="w-3.5 h-3.5 text-red-500 fill-red-50" />;
    case "STORY": return <Bookmark className="w-3.5 h-3.5 text-green-600 fill-green-50" />;
    default: return <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />;
  }
};

const PriorityIcon = ({ priority }: { priority: string }) => {
  if (priority === 'URGENT') return <ArrowUp className="w-3.5 h-3.5 text-red-600" />;
  if (priority === 'HIGH') return <ArrowUp className="w-3.5 h-3.5 text-orange-500" />;
  if (priority === 'LOW') return <ArrowDown className="w-3.5 h-3.5 text-slate-400" />;
  return <Minus className="w-3.5 h-3.5 text-yellow-500 rotate-90" />;
};

interface BoardTaskCardProps {
  task: TaskSummary;
  index: number;
}

export default function BoardTaskCard({ task }: BoardTaskCardProps) {
  const sortableId = useMemo(() => task.id.toString(), [task.id]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    // 👇 QUAN TRỌNG: Nếu đang kéo thì ẩn hoàn toàn item gốc đi (opacity: 0)
    // Item bay theo chuột (Overlay) sẽ được hiển thị riêng ở BoardPage
    opacity: isDragging ? 0 : 1,
  };

  // Nếu đang kéo, trả về một div trống với chiều cao tương tự để giữ chỗ (tùy chọn),
  // hoặc chỉ cần ẩn đi bằng style opacity: 0 như trên là đủ.
  // Ở đây tôi dùng cách opacity: 0 kết hợp xóa class hiển thị để không bị lộ viền.

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        rounded-[3px] mb-2 transition-colors
        ${isDragging 
            ? "h-[100px] bg-slate-50 border border-dashed border-slate-300" // Style cho phần Placeholder (vùng giữ chỗ)
            : "bg-white p-3 shadow-sm border-b border-slate-200 group hover:bg-slate-50" // Style bình thường
        }
      `}
    >
      {/* Nội dung bên trong chỉ hiện khi KHÔNG kéo. 
          Khi kéo, ta chỉ hiện cái khung giữ chỗ (hoặc ẩn hoàn toàn nội dung để opacity 0 lo liệu) */}
      <div className={isDragging ? "opacity-0" : "opacity-100"}>
          {/* 1. Title */}
          <div className="mb-2">
            <p className="text-[14px] text-[#172B4D] leading-snug hover:underline cursor-pointer">
              {task.title}
            </p>
          </div>

          {/* 2. Footer Info */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5">
              <TypeIcon type={task.taskType} />
              <span className="text-[11px] font-medium text-slate-500 hover:text-slate-700 cursor-pointer">
                {task.taskCode}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200" title={`Priority: ${task.priority}`}>
                <PriorityIcon priority={task.priority} />
              </div>

              {task.assigneeAvatarUrl ? (
                <img src={task.assigneeAvatarUrl} className="w-6 h-6 rounded-full border border-white shadow-sm" alt="Assignee" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-200 border border-white flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}