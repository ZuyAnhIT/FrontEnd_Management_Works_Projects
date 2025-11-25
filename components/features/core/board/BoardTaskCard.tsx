"use client";

import { Draggable } from "@hello-pangea/dnd";
import { TaskSummary } from "@/services/apiProject";
import { User, Bookmark, Bug, CheckCircle2, ArrowUp, ArrowDown, Minus } from "lucide-react";

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
    return <Minus className="w-3.5 h-3.5 text-yellow-500 rotate-90" />; // Medium
};

interface BoardTaskCardProps {
  task: TaskSummary;
  index: number;
}

export default function BoardTaskCard({ task, index }: BoardTaskCardProps) {
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => {
        
        // Fix lệch chuột khi kéo
        const style = {
            ...provided.draggableProps.style,
            transition: snapshot.isDragging ? 'none' : 'all 0.2s ease',
            cursor: snapshot.isDragging ? 'grabbing' : 'grab',
            zIndex: snapshot.isDragging ? 9999 : 'auto',
        };

        return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={style}
              className={`
                bg-white p-3 rounded-[3px] shadow-sm border-b border-slate-200 mb-2 group hover:bg-slate-50 transition-colors
                ${snapshot.isDragging ? "shadow-xl ring-2 ring-blue-500 rotate-2" : ""}
              `}
            >
              {/* 1. Title */}
              <div className="mb-2">
                 <p className="text-[14px] text-[#172B4D] leading-snug hover:underline cursor-pointer">
                    {task.title}
                 </p>
              </div>

              {/* 2. Footer Info */}
              <div className="flex items-center justify-between mt-3">
                 {/* Left: Type & Key */}
                 <div className="flex items-center gap-1.5">
                    <TypeIcon type={task.taskType} />
                    <span className="text-[11px] font-medium text-slate-500 hover:text-slate-700 cursor-pointer">
                        {task.taskCode}
                    </span>
                 </div>

                 {/* Right: Priority & Avatar */}
                 <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200" title={`Priority: ${task.priority}`}>
                        <PriorityIcon priority={task.priority} />
                    </div>
                    
                    {task.assigneeAvatarUrl ? (
                        <img src={task.assigneeAvatarUrl} className="w-6 h-6 rounded-full border border-white shadow-sm" alt="Assignee"/>
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 border border-white flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-slate-500"/>
                        </div>
                    )}
                 </div>
              </div>
            </div>
        );
      }}
    </Draggable>
  );
}