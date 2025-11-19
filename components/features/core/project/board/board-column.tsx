import { Button } from '@/components/ui/button'
import { Plus, GripVertical, Edit2, Check, X } from 'lucide-react'
import { useState } from 'react'
import { TaskCard } from './task-card'
import { AddTaskForm } from './add-task-form'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority?: 'low' | 'medium' | 'high'
  assignee?: string
  subtasks?: Subtask[]
}

interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface Column {
  id: string
  label: string
  color: string
  bgColor: string
  borderColor: string
  hoverBorder: string
  textColor: string
  lightColor: string
}

interface BoardColumnProps {
  column: Column
  tasks: Task[]
  index: number
  isDragOverColumn: boolean
  draggedColumn: Column | null
  draggedTask: Task | null
  onColumnDragStart: (e: React.DragEvent, column: Column) => void
  onColumnDragOver: (e: React.DragEvent, index: number) => void
  onColumnDrop: (index: number) => void
  onColumnDragEnd: () => void
  onDeleteColumn: (columnId: string) => void
  onEditColumn: (columnId: string) => void
  onDeleteTask: (taskId: string) => void
  onTaskDragStart: (task: Task) => void
  onTaskDragEnd: () => void
  onTaskDragEnter: (columnId: string) => void
  onTaskDragLeave: (e: React.DragEvent) => void
  onTaskDrop: (columnId: string) => void
  onDragOver: (e: React.DragEvent) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  onAddSubtask: (taskId: string, title: string) => void
  onAddTask: (columnId: string, title: string, description: string) => void
  editingColumn: string | null
  editColumnName: string
  onEditColumnNameChange: (name: string) => void
  onSaveColumnName: (columnId: string) => void
  newTaskColumn: string | null
  onToggleNewTask: (columnId: string | null) => void
}

export function BoardColumn({
  column,
  tasks,
  index,
  isDragOverColumn,
  draggedColumn,
  draggedTask,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
  onColumnDragEnd,
  onDeleteColumn,
  onEditColumn,
  onDeleteTask,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskDragEnter,
  onTaskDragLeave,
  onTaskDrop,
  onDragOver,
  onToggleSubtask,
  onDeleteSubtask,
  onAddSubtask,
  onAddTask,
  editingColumn,
  editColumnName,
  onEditColumnNameChange,
  onSaveColumnName,
  newTaskColumn,
  onToggleNewTask,
}: BoardColumnProps) {
  const columnTasks = tasks.filter((t) => t.status === column.id)
  const canDrop = draggedTask && draggedTask.status !== column.id
  const isColumnDragOver = draggedColumn?.id !== column.id

  return (
    <div
      className={`flex-shrink-0 w-80 flex flex-col animate-fadeInUp transition-all duration-300 ${
        isColumnDragOver ? 'scale-105 ml-4' : ''
      } ${draggedColumn?.id === column.id ? 'opacity-50 scale-95' : ''}`}
      style={{ animationDelay: `${(index + 2) * 50}ms` }}
      onDragOver={(e) => onColumnDragOver(e, index)}
      onDrop={() => onColumnDrop(index)}
    >
      {/* Column Header */}
      <div
        className={`
          bg-gradient-to-r ${column.color} 
          rounded-2xl p-4 mb-3 shadow-lg cursor-move
          transition-all duration-300 group/header
          ${isDragOverColumn ? 'scale-[1.02] shadow-2xl ring-4 ring-white/50' : ''}
          ${isColumnDragOver ? 'ring-4 ring-purple-400' : ''}
        `}
        draggable
        onDragStart={(e) => onColumnDragStart(e, column)}
        onDragEnd={onColumnDragEnd}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <GripVertical className="w-5 h-5 text-white/70 flex-shrink-0" />

            {editingColumn === column.id ? (
              <input
                type="text"
                value={editColumnName}
                onChange={(e) => onEditColumnNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSaveColumnName(column.id)
                  if (e.key === 'Escape') onSaveColumnName(column.id)
                }}
                onBlur={() => onSaveColumnName(column.id)}
                className="flex-1 min-w-0 bg-white/20 backdrop-blur-sm text-white font-bold text-lg px-2 py-1 rounded outline-none"
                autoFocus
              />
            ) : (
              <h2 className="font-bold text-white text-lg flex-1 min-w-0 truncate">
                {column.label}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {editingColumn === column.id ? (
              <button
                onClick={() => onSaveColumnName(column.id)}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Check className="w-4 h-4 text-white" />
              </button>
            ) : (
              <button
                onClick={() => onEditColumn(column.id)}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors opacity-0 group-hover/header:opacity-100"
              >
                <Edit2 className="w-4 h-4 text-white" />
              </button>
            )}
            <button
              onClick={() => onDeleteColumn(column.id)}
              className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-500/50 transition-colors opacity-0 group-hover/header:opacity-100"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
              {columnTasks.length}
            </div>
          </div>
        </div>

        <Button
          onClick={() =>
            onToggleNewTask(
              newTaskColumn === column.id ? null : column.id
            )
          }
          className="w-full bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 transition-all h-8 text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Task
        </Button>
      </div>

      {/* Tasks Container */}
      <div
        className={`
          flex-1 bg-white/60 backdrop-blur-sm
          rounded-2xl p-3 min-h-[500px] border-2 border-dashed
          transition-all duration-300 relative
          ${
            isDragOverColumn && canDrop
              ? `${column.borderColor} shadow-2xl scale-[1.01] bg-gradient-to-b ${column.bgColor}`
              : 'border-gray-200 shadow-md'
          }
          ${!canDrop && draggedTask ? 'opacity-50' : ''}
        `}
        onDragOver={onDragOver}
        onDragEnter={() => onTaskDragEnter(column.id)}
        onDragLeave={onTaskDragLeave}
        onDrop={() => onTaskDrop(column.id)}
      >
        <div className="space-y-3">
          {/* Add Task Form */}
          <AddTaskForm
            columnId={column.id}
            isOpen={newTaskColumn === column.id}
            onToggle={() => onToggleNewTask(null)}
            onSubmit={(title, description) => {
              onAddTask(column.id, title, description)
              onToggleNewTask(null)
            }}
          />

          {/* Empty State */}
          {columnTasks.length === 0 && newTaskColumn !== column.id && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className={`w-20 h-20 mb-4 rounded-2xl flex items-center justify-center ${column.lightColor} shadow-lg`}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-200" />
              </div>
              <p className="text-sm text-gray-600 font-semibold mb-1">
                No tasks here
              </p>
              <p className="text-xs text-gray-400">
                {isDragOverColumn ? 'Drop task here' : 'Click "Add Task" to create one'}
              </p>
            </div>
          )}

          {/* Task Cards */}
          {columnTasks.map((task, taskIndex) => (
            <TaskCard
              key={task.id}
              task={task}
              isDragged={draggedTask?.id === task.id}
              onDragStart={onTaskDragStart}
              onDragEnd={onTaskDragEnd}
              onDelete={onDeleteTask}
              onToggleSubtask={onToggleSubtask}
              onDeleteSubtask={onDeleteSubtask}
              onAddSubtask={onAddSubtask}
              animationDelay={taskIndex * 30}
            />
          ))}
        </div>

        {/* Drop Zone Indicator */}
        {isDragOverColumn && canDrop && (
          <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-pink-500/20 opacity-10 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`${column.lightColor} px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-sm border-2 ${column.borderColor}`}
              >
                <p
                  className={`text-sm font-bold ${column.textColor} flex items-center gap-2`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-200" />
                  Drop task here
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

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
      `}</style>
    </div>
  )
}
