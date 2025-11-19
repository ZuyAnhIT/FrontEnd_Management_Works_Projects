import { Plus, X, CheckCircle2, Circle } from 'lucide-react'
import { useState } from 'react'

interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface SubtaskListProps {
  subtasks: Subtask[] | undefined
  taskId: string
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  onAddSubtask: (taskId: string, title: string) => void
}

export function SubtaskList({
  subtasks,
  taskId,
  onToggleSubtask,
  onDeleteSubtask,
  onAddSubtask,
}: SubtaskListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const handleAddSubtask = () => {
    if (newTitle.trim()) {
      onAddSubtask(taskId, newTitle.trim())
      setNewTitle('')
      setIsAdding(false)
    }
  }

  if (!subtasks || subtasks.length === 0) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 mt-2"
      >
        <Plus className="w-3 h-3" />
        Add subtask
      </button>
    )
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
      {subtasks.map((subtask) => (
        <div key={subtask.id} className="flex items-center gap-2 group/subtask">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleSubtask(taskId, subtask.id)
            }}
            className="flex-shrink-0"
          >
            {subtask.completed ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300 hover:text-gray-400" />
            )}
          </button>
          <span
            className={`text-sm flex-1 ${
              subtask.completed
                ? 'line-through text-gray-400'
                : 'text-gray-700'
            }`}
          >
            {subtask.title}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteSubtask(taskId, subtask.id)
            }}
            className="opacity-0 group-hover/subtask:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3 text-red-500 hover:text-red-700" />
          </button>
        </div>
      ))}

      {isAdding ? (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') handleAddSubtask()
              if (e.key === 'Escape') {
                setIsAdding(false)
                setNewTitle('')
              }
            }}
            placeholder="Subtask title..."
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded outline-none focus:border-purple-500"
            autoFocus
          />
          <button
            onClick={() => handleAddSubtask()}
            className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
          >
            Add
          </button>
          <button
            onClick={() => {
              setIsAdding(false)
              setNewTitle('')
            }}
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 mt-2"
        >
          <Plus className="w-3 h-3" />
          Add subtask
        </button>
      )}
    </div>
  )
}
