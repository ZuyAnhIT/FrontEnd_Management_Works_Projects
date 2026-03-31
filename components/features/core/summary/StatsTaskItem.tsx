"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo } from "react";
import { 
  Calendar, 
  CheckCircle2, 
  Bookmark, 
  Bug, 
  User, 
  AlertCircle 
} from "lucide-react";

// Internal Components & Utils
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { StatsTask } from "@/services/apiStatistics";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. HELPERS & SUB-COMPONENTS
// =============================================================================

/**
 * Lấy chữ cái đầu đại diện cho người dùng
 */
const getInitials = (name?: string) =>
  name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

/**
 * Biểu tượng phân loại công việc chuẩn Jira
 */
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "BUG":
      return <Bug className="w-3.5 h-3.5 text-[#E54937]" />; // Red color
    case "STORY":
      return <Bookmark className="w-3.5 h-3.5 text-[#63BA3C]" />; // Green color
    default:
      return <CheckCircle2 className="w-3.5 h-3.5 text-[#4C9AFF]" />; // Blue color (Task)
  }
};

/**
 * Nhãn độ ưu tiên với màu sắc phản xạ mức độ nghiêm trọng
 */
const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles: Record<string, string> = {
    URGENT: "text-red-700 bg-red-50 border-red-200",
    HIGH: "text-orange-700 bg-orange-50 border-orange-200",
    MEDIUM: "text-blue-700 bg-blue-50 border-blue-200",
    LOW: "text-slate-500 bg-slate-50 border-slate-200",
  };

  return (
    <span className={cn(
      "text-[9px] font-black px-1.5 py-0.5 rounded-[3px] border uppercase tracking-wider",
      styles[priority] || styles.LOW
    )}>
      {priority}
    </span>
  );
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần hiển thị một dòng công việc trong danh sách thống kê.
 * Thiết kế gọn nhẹ (Compact) giúp hiển thị được nhiều item trên dashboard.
 */
export default function StatsTaskItem({ task }: { task: StatsTask }) {
  
  // Logic xử lý ngày tháng
  const { dateDisplay, isOverdue } = useMemo(() => {
    if (!task.dueDate) return { dateDisplay: null, isOverdue: false };
    
    const dueDate = new Date(task.dueDate);
    return {
      dateDisplay: dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      isOverdue: dueDate < new Date() && task.status.name.toUpperCase() !== "DONE"
    };
  }, [task.dueDate, task.status.name]);

  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-[#2684FF] hover:bg-slate-50/30 transition-all group cursor-pointer">
      
      {/* KHỐI TRÁI: ĐỊNH DANH (Type & Key) */}
      <div className="flex flex-col items-center w-12 shrink-0 gap-1 border-r border-slate-100 pr-2">
        <TypeIcon type={task.taskType} />
        <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">
          {task.taskCode}
        </span>
      </div>

      {/* KHỐI GIỮA: NỘI DUNG CHÍNH (Title & Meta) */}
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-semibold text-[#172B4D] truncate group-hover:text-[#0052CC] transition-colors leading-tight">
          {task.title}
        </h4>
        
        <div className="flex items-center gap-2 mt-1.5">
          <PriorityBadge priority={task.priority} />

          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.status.color }} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {task.status.name}
            </span>
          </div>

          {task.epic && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] bg-[#091E420A] text-[#42526E] border border-transparent truncate max-w-[100px]">
              {task.epic.name}
            </span>
          )}
        </div>
      </div>

      {/* KHỐI PHẢI: THÔNG TIN PHỤ (Assignee & Due Date) */}
      <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
        {/* Người thực hiện */}
        <div className="relative">
            {task.assignee ? (
              <Avatar className="w-5 h-5 border border-white shadow-sm" title={task.assignee.name}>
                <AvatarImage src={task.assignee.avatarUrl} />
                <AvatarFallback className="text-[8px] bg-[#0052CC] text-white font-bold">
                  {getInitials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div 
                className="w-5 h-5 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400" 
                title="Unassigned"
              >
                <User className="w-3 h-3 opacity-40" />
              </div>
            )}
        </div>

        {/* Hạn chót */}
        {dateDisplay && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-bold tracking-tight",
            isOverdue ? "text-red-600 bg-red-50 px-1.5 rounded" : "text-slate-400"
          )}>
            {isOverdue && <AlertCircle className="w-2.5 h-2.5" />}
            {!isOverdue && <Calendar className="w-3 h-3 opacity-60" />}
            <span>{dateDisplay}</span>
          </div>
        )}
      </div>

    </div>
  );
}