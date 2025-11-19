'use client'

import { Task } from '@/lib/mock-data' // Đảm bảo đường dẫn import đúng với project của bạn
import { Card } from '@/components/ui/card'
import { 
  AlertCircle, 
  MessageSquare, 
  Paperclip, 
  CheckSquare, 
  MoreHorizontal 
} from 'lucide-react'

interface TaskCardProps {
  task: Task
  onDragStart: (e: React.DragEvent) => void // Cập nhật type chính xác cho event
}

// Hệ màu chuẩn Jira/Modern
const priorityStyles: Record<string, string> = {
  critical: 'border-l-red-500 hover:border-l-red-600',
  high: 'border-l-orange-500 hover:border-l-orange-600',
  medium: 'border-l-blue-500 hover:border-l-blue-600',
  low: 'border-l-slate-400 hover:border-l-slate-500',
}

export function TaskCard({ task, onDragStart }: TaskCardProps) {
  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`
        group relative p-3 bg-white rounded-lg border border-slate-200 
        shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing
        border-l-[3px] ${priorityStyles[task.priority] || priorityStyles.low}
      `}
    >
      {/* Context Menu Trigger (Hiện khi hover) */}
      <button className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreHorizontal className="w-4 h-4" />
      </button>

      <div className="space-y-3">
        {/* Header: Title & Priority Icon */}
        <div className="pr-6"> {/* Padding right để tránh nút More */}
          <div className="flex items-start gap-2">
             {task.priority === 'critical' && (
               <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
             )}
             <h3 className="text-sm font-medium text-slate-800 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
               {task.title}
             </h3>
          </div>
        </div>

        {/* Subtasks Progress */}
        {totalSubtasks > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium uppercase tracking-wide">
               <div className="flex items-center gap-1">
                 <CheckSquare className="w-3 h-3" />
                 <span>{completedSubtasks}/{totalSubtasks}</span>
               </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-500 ${
                   progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer: Meta Info & Avatar */}
        <div className="flex items-end justify-between pt-1">
          {/* Left: Meta Icons */}
          <div className="flex gap-3">
            {task.comments && (
              <div className="flex items-center gap-1 text-slate-400" title={`${task.comments} comments`}>
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{task.comments}</span>
              </div>
            )}
            {task.attachments && (
              <div className="flex items-center gap-1 text-slate-400" title={`${task.attachments} attachments`}>
                <Paperclip className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{task.attachments}</span>
              </div>
            )}
          </div>

          {/* Right: Assignee Avatar */}
          {task.assignee && (
            <div 
               className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs shadow-sm"
               title={task.assignee.name || 'Assignee'}
            >
               {task.assignee.avatar || task.assignee.name?.charAt(0) || '?'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}