"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  Bug,
} from "lucide-react";
import { StatsTask } from "@/services/apiStatistics";

// =============================================================================
// 1. HELPERS & SUB-COMPONENTS
// =============================================================================

// Helper: Lấy chữ cái đầu cho Avatar
const getInitials = (name?: string) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

// Component Icon cho Task Type
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "BUG":
      return <Bug className="w-3.5 h-3.5 text-red-500" />;
    case "STORY":
      return <Bookmark className="w-3.5 h-3.5 text-green-600" />;
    default:
      return <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />;
  }
};

// Component Badge cho Priority
const PriorityBadge = ({ priority }: { priority: string }) => {
  let styleClass = "text-slate-500 bg-slate-50 border-slate-200";
  switch (priority) {
    case "URGENT":
      styleClass = "text-red-600 bg-red-50 border-red-100";
      break;
    case "HIGH":
      styleClass = "text-orange-600 bg-orange-50 border-orange-100";
      break;
    default:
      break;
  }

  return (
    <span
      className={`text-[9px] font-bold px-1.5 rounded border uppercase ${styleClass}`}
    >
      {priority}
    </span>
  );
};

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function StatsTaskItem({ task }: { task: StatsTask }) {
  // Format Date (DD Mon)
  const dateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      })
    : "";

  // Check if due date is in the past
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all group">
      {/* LEFT: Icon & Code */}
      <div className="flex flex-col items-center w-12 shrink-0 gap-1">
        <TypeIcon type={task.taskType} />
        <span className="text-[10px] font-mono font-bold text-slate-500">
          {task.taskCode}
        </span>
      </div>

      {/* MIDDLE: Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700 transition-colors">
          {task.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          {/* Priority Badge */}
          <PriorityBadge priority={task.priority} />

          {/* Status Text */}
          <span
            className="text-[10px] font-medium"
            style={{ color: task.status.color }}
          >
            {task.status.name}
          </span>

          {/* Epic (Optional) */}
          {task.epic && (
            <span className="text-[9px] px-1.5 rounded bg-slate-100 text-slate-500 border border-slate-200 truncate max-w-[80px]">
              {task.epic.name}
            </span>
          )}
        </div>
      </div>

      {/* RIGHT: Meta */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {/* Assignee Avatar */}
        {task.assignee ? (
          <Avatar
            className="w-5 h-5 border border-slate-200"
            title={task.assignee.name}
          >
            <AvatarImage src={task.assignee.avatarUrl} />
            <AvatarFallback className="text-[8px] bg-blue-600 text-white">
              {getInitials(task.assignee.name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div
            className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-400"
            title="Unassigned"
          >
            ?
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Calendar className="w-3 h-3" />
            <span className={isOverdue ? "text-red-500 font-bold" : ""}>
              {dateStr}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
