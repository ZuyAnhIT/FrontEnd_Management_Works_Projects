'use client'

import { Task } from '@/lib/mock-data'
import { Card } from '@/components/ui/card'
import { AlertCircle, MessageSquare, Paperclip, CheckCircle2 } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onDragStart: () => void
}

const priorityColors = {
  low: 'border-l-4 border-l-gray-400',
  medium: 'border-l-4 border-l-blue-400',
  high: 'border-l-4 border-l-orange-400',
  critical: 'border-l-4 border-l-red-500',
}

export function TaskCard({ task, onDragStart }: TaskCardProps) {
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      className={`p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-card ${priorityColors[task.priority]}`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium flex-1 line-clamp-2">{task.title}</h3>
          {task.priority === 'critical' && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 ml-2" />}
        </div>

        {task.subtasks.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {completedSubtasks}/{task.subtasks.length} subtasks
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <div className="flex gap-1">
            {task.comments && (
              <span className="flex items-center gap-0.5 text-muted-foreground">
                <MessageSquare className="w-3 h-3" />
                {task.comments}
              </span>
            )}
            {task.attachments && (
              <span className="flex items-center gap-0.5 text-muted-foreground">
                <Paperclip className="w-3 h-3" />
                {task.attachments}
              </span>
            )}
          </div>
          {task.assignee && <span className="text-lg">{task.assignee.avatar}</span>}
        </div>
      </div>
    </Card>
  )
}
