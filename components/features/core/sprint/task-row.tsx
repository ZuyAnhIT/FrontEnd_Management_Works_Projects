"use client"

import { MessageCircle, Calendar, GripVertical, CheckSquare } from "lucide-react" // Thêm GripVertical
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/lib/mock-projects"

interface TaskRowProps {
  task: Task
  onTaskSelect?: (task: Task) => void
  // Thêm prop hỗ trợ drag nếu cần tích hợp dnd-kit hoặc react-beautiful-dnd sau này
  dragHandleProps?: any 
}

export default function TaskRow({ task, onTaskSelect, dragHandleProps }: TaskRowProps) {
  
  const statusColor =
    task.status === "DONE"
      ? "bg-green-500/10 text-green-700 border-green-200"
      : "bg-slate-100 text-slate-700 border-slate-200"

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const reporter = task.reporter || { name: "Unassigned", color: "bg-gray-500" }

  return (
    <tr 
        className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group"
    >
      {/* 1. DRAG HANDLE & CHECKBOX */}
      <td className="w-12 px-4 py-4 text-center relative">
        {/* Nút kéo chỉ hiện khi hover vào hàng */}
        <div 
            className="absolute left-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            {...dragHandleProps} // Spread props drag nếu có
        >
            <GripVertical className="w-4 h-4" />
        </div>
        
        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" defaultChecked={task.checked} />
      </td>

      {/* 2. TYPE ICON */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 bg-blue-600 rounded-[3px] flex items-center justify-center text-white shadow-sm" title="Task">
            <CheckSquare className="w-3 h-3" />
          </div>
        </div>
      </td>

      {/* 3. KEY */}
      <td className="px-4 py-4 text-sm font-semibold text-slate-500 whitespace-nowrap min-w-fit">
        <button onClick={() => onTaskSelect?.(task)} className="hover:text-blue-600 hover:underline cursor-pointer transition-colors">
          {task.key}
        </button>
      </td>

      {/* 4. SUMMARY */}
      <td className="px-4 py-4 text-sm text-slate-900 font-medium max-w-sm">
        <div 
            className="truncate hover:text-blue-600 cursor-pointer transition-colors"
            onClick={() => onTaskSelect?.(task)}
        >
            {task.summary}
        </div>
      </td>

      {/* 5. STATUS */}
      <td className="px-4 py-4 whitespace-nowrap min-w-fit">
        <Badge variant="outline" className={`text-[10px] font-bold uppercase ${statusColor}`}>
          {task.status}
        </Badge>
      </td>

      {/* 6. COMMENTS */}
      <td className="px-4 py-4 whitespace-nowrap min-w-fit">
        <button
          onClick={() => onTaskSelect?.(task)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {task.comments > 0 ? task.comments : "Add"}
        </button>
      </td>

      {/* 7. SPRINT */}
      <td className="px-4 py-4 whitespace-nowrap min-w-fit">
        <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 font-normal">
          {task.sprint}
        </Badge>
      </td>

      {/* 8. ASSIGNEE */}
      <td className="px-4 py-4 whitespace-nowrap min-w-fit">
        <div className="flex items-center gap-1">
          {task.assignees.length > 0 ? (
            task.assignees.map((assignee) => (
              <Avatar key={assignee.name} className="w-6 h-6 border border-white shadow-sm">
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback className={`text-[9px] font-bold text-white ${assignee.color || "bg-slate-400"}`}>
                  {getInitials(assignee.name)}
                </AvatarFallback>
              </Avatar>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">Unassigned</span>
          )}
        </div>
      </td>

      {/* 9. DUE DATE */}
      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap min-w-fit">
        {task.dueDate ? (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {task.dueDate}
          </div>
        ) : (
          "-"
        )}
      </td>

      {/* 10. LABELS */}
      <td className="px-4 py-4 whitespace-nowrap min-w-fit">
        {task.labels.length > 0 ? (
          <div className="flex gap-1">
            {task.labels.map((label) => (
              <Badge key={label} variant="outline" className="text-[10px] px-1.5 py-0 text-slate-500 bg-white border-slate-200">
                {label}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-300">+</span>
        )}
      </td>

      {/* 11. CREATED */}
      <td className="px-4 py-4 whitespace-nowrap min-w-fit">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {task.created}
        </div>
      </td>

      {/* 12. UPDATED */}
      <td className="px-4 py-4 whitespace-nowrap min-w-fit">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {task.updated}
        </div>
      </td>

      {/* 13. REPORTER */}
      <td className="px-4 py-4 whitespace-nowrap min-w-fit">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={reporter.avatar} />
            <AvatarFallback className={`text-[9px] font-bold text-white ${reporter.color || "bg-slate-500"}`}>
              {getInitials(reporter.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-slate-600 line-clamp-1">{reporter.name}</span>
        </div>
      </td>

      {/* SPACER */}
      <td className="w-8 px-4 py-4" />
    </tr>
  )
}