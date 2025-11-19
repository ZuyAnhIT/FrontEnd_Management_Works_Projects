import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { SubtaskList } from './subtask-list'
import { TaskContextMenu } from './task-context-menu'
import { AssigneeDropdown } from './assignee-dropdown'

interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority?: 'low' | 'medium' | 'high'
  assignee?: string
  subtasks?: Subtask[]
}

interface TaskCardProps {
  task: Task
  isDragged: boolean
  onDragStart: (task: Task) => void
  onDragEnd: () => void
  onDelete: (taskId: string) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  onAddSubtask: (taskId: string, title: string) => void
  onChangeAssignee: (taskId: string, assigneeId?: string) => void
  animationDelay: number
}

export function TaskCard({
  task,
  isDragged,
  onDragStart,
  onDragEnd,
  onDelete,
  onToggleSubtask,
  onDeleteSubtask,
  onAddSubtask,
  onChangeAssignee,
  animationDelay,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0

  const priorityColor = {
    high: 'bg-red-50 border-l-red-500 text-red-700',
    medium: 'bg-amber-50 border-l-amber-500 text-amber-700',
    low: 'bg-green-50 border-l-green-500 text-green-700',
  }[task.priority || 'low']

  const handleTaskContextMenuAction = (action: string) => {
    switch (action) {
      case 'copy-link':
        navigator.clipboard.writeText(`task-${task.id}`)
        break
      case 'copy-key':
        navigator.clipboard.writeText(task.id)
        break
      default:
        break
    }
  }

  return (
    <div
      className={`
        group/task bg-white rounded border-l-4 p-3 shadow-sm hover:shadow-md transition-all duration-150
        cursor-move
        ${priorityColor}
        ${isDragged ? 'opacity-50 scale-95' : 'hover:shadow-md'}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
      draggable
      onDragStart={() => onDragStart(task)}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {totalSubtasks > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="mt-0.5 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm break-words">{task.title}</h3>
            {task.description && (
              <p className="text-xs text-slate-600 mt-1">{task.description}</p>
            )}
          </div>
        </div>

        <TaskContextMenu
          taskId={task.id}
          taskTitle={task.title}
          onChangeStatus={() => {}}
          onCopyLink={() => handleTaskContextMenuAction('copy-link')}
          onCopyKey={() => handleTaskContextMenuAction('copy-key')}
          onAddFlag={() => {}}
          onAddLabel={() => {}}
          onLinkWorkItem={() => {}}
          onChangeParent={() => {}}
          onArchive={() => {}}
          onDelete={onDelete}
        />
      </div>

      {totalSubtasks > 0 && (
        <div className="text-xs text-slate-600 mb-2 px-6">
          {completedSubtasks}/{totalSubtasks} subtasks
        </div>
      )}

      {isExpanded && (
        <SubtaskList
          subtasks={task.subtasks}
          taskId={task.id}
          onToggleSubtask={onToggleSubtask}
          onDeleteSubtask={onDeleteSubtask}
          onAddSubtask={onAddSubtask}
        />
      )}

      <div className="mt-2 pt-2 border-t border-slate-200">
        <AssigneeDropdown
          taskId={task.id}
          currentAssignee={task.assignee}
          onAssigneeChange={onChangeAssignee}
        />
      </div>
    </div>
  )
}
