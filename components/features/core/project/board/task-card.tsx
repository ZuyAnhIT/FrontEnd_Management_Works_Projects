import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { SubtaskList } from './subtask-list'

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
  animationDelay,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0

  return (
    <div
      className={`
        group/task bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 
        border-l-4 cursor-move animate-fadeInUp relative
        ${
          task.priority === 'high'
            ? 'border-l-red-500'
            : task.priority === 'medium'
              ? 'border-l-yellow-500'
              : 'border-l-green-500'
        }
        ${isDragged ? 'opacity-40 scale-95' : 'hover:scale-102'}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
      draggable
      onDragStart={() => onDragStart(task)}
      onDragEnd={onDragEnd}
    >
      <button
        onClick={() => onDelete(task.id)}
        className="absolute top-2 right-2 w-6 h-6 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center opacity-0 group-hover/task:opacity-100 transition-opacity"
        title="Delete task"
      >
        <Trash2 className="w-3 h-3 text-red-600" />
      </button>

      <div className="flex items-start gap-2 mb-2">
        {totalSubtasks > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="mt-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        <div className="flex-1 pr-8">
          <h3 className="font-semibold text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mb-2">
        <span
          className={`px-2 py-1 rounded-full font-medium ${
            task.priority === 'high'
              ? 'bg-red-100 text-red-700'
              : task.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
          }`}
        >
          {task.priority}
        </span>
        {totalSubtasks > 0 && (
          <span className="text-gray-500 text-xs">
            {completedSubtasks}/{totalSubtasks} subtasks
          </span>
        )}
      </div>

      {isExpanded && (
        <SubtaskList
          subtasks={task.subtasks}
          taskId={task.id}
          onToggleSubtask={onToggleSubtask}
          onDeleteSubtask={onDeleteSubtask}
          onAddSubtask={onAddSubtask}
        />
      )}

      <style jsx>{`
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}
