"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertCircle, Building2, FolderKanban, ChevronRight } from "lucide-react";
import { MyTaskSummary } from "@/services/apiDashboard";
import { cn } from "@/lib/utils";

interface TaskCardSmallProps {
    task: MyTaskSummary;
    variant: "overdue" | "today" | "upcoming" | "noDueDate" | "other";
    onTaskClick: (task: MyTaskSummary) => void;
}

/**
 * Xac dinh kieu dang cho do uu tien (Priority)
 */
const getPriorityStyles = (priority: string) => {
    switch (priority?.toUpperCase()) {
        case "URGENT": return "text-[#BF2600] bg-[#FFEBE6] border-[#FFBDAD]";
        case "HIGH": return "text-[#FF8B00] bg-[#FFF0B3] border-[#FFE380]";
        case "MEDIUM": return "text-[#0052CC] bg-[#DEEBFF] border-[#B3D4FF]";
        case "LOW": return "text-[#006644] bg-[#E3FCEF] border-[#ABF5D1]";
        default: return "text-[#42526E] bg-[#F4F5F7] border-[#DFE1E6]";
    }
};

export const TaskCardSmall: React.FC<TaskCardSmallProps> = ({ task, variant, onTaskClick }) => {
    const router = useRouter();
    const isOverdue = variant === "overdue";
    const isToday = variant === "today";

    /**
     * Dieu huong den dung du an chua Task nay
     */
    const navigateToProject = (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngan chan viec bat Modal Task khi click vao link Project
        router.push(`/core/workspace/${task.workspaceId}/project/${task.projectId}`);
    };

    return (
        <div 
            onClick={() => onTaskClick(task)}
            className="group bg-white p-3.5 rounded-xl border border-[#DFE1E6] shadow-sm hover:shadow-md hover:border-[#0052CC] transition-all cursor-pointer relative overflow-hidden flex flex-col gap-2.5"
        >
            {/* Thanh mau the hien Status o vien ben trai */}
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: task.taskStatusColor || "#DFE1E6" }} />

            {/* BREADCRUMB: Workspace > Project (Co the click de chuyen trang) */}
            <div 
                onClick={navigateToProject}
                className="flex items-center gap-1 text-[#6B778C] hover:text-[#0052CC] transition-colors w-fit"
                title="Go to project board"
            >
                <Building2 className="w-3 h-3 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider truncate max-w-[100px]">
                    {task.workspaceName}
                </span>
                <ChevronRight className="w-3 h-3 opacity-50 shrink-0" />
                <FolderKanban className="w-3 h-3 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider truncate max-w-[100px]">
                    {task.projectName}
                </span>
            </div>

            {/* TASK TITLE & CODE */}
            <div>
                <span className="text-[11px] font-mono font-black text-[#6B778C] block mb-0.5">
                    {task.taskCode}
                </span>
                <h4 className="text-[13px] font-bold text-[#172B4D] leading-snug group-hover:text-[#0052CC] transition-colors line-clamp-2">
                    {task.taskTitle}
                </h4>
            </div>

            {/* META DATA: Priority, Status, Due Date */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
                {/* Priority */}
                <span className={cn("px-1.5 py-0.5 rounded-[3px] text-[9px] font-black uppercase tracking-widest border", getPriorityStyles(task.taskPriority))}>
                    {task.taskPriority || "NONE"}
                </span>

                {/* Status */}
                <span 
                    className="px-1.5 py-0.5 rounded-[3px] text-[9px] font-black uppercase tracking-widest border"
                    style={{ backgroundColor: `${task.taskStatusColor}15`, color: task.taskStatusColor, borderColor: `${task.taskStatusColor}40` }}
                >
                    {task.taskStatusName}
                </span>

                {/* Due Date */}
                {task.taskDueDate && (
                    <div className={cn(
                        "flex items-center gap-1 text-[11px] font-bold ml-auto",
                        isOverdue ? "text-[#BF2600] bg-[#FFEBE6] px-1.5 py-0.5 rounded-md" : isToday ? "text-[#FF8B00]" : "text-[#6B778C]"
                    )}>
                        {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        <span>
                            {new Date(task.taskDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};