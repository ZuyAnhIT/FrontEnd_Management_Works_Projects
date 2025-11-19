import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { TaskCard } from './task-card'
import { AddTaskForm } from './add-task-form'
import { ColumnContextMenu } from './column-context-menu'

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
  onChangeAssignee: (taskId: string, assigneeId?: string) => void
  onMoveColumn: (columnId: string, direction: 'left' | 'right') => void
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
  onChangeAssignee,
  onMoveColumn,
}: BoardColumnProps) {
  const columnTasks = tasks.filter((t) => t.status === column.id)
  const canDrop = draggedTask && draggedTask.status !== column.id
  const isColumnDragOver = draggedColumn?.id !== column.id

  return (
    <div
      className="flex-shrink-0 w-96 flex flex-col transition-all duration-200"
      style={{ animationDelay: `${(index + 2) * 50}ms` }}
      onDragOver={(e) => onColumnDragOver(e, index)}
      onDrop={() => onColumnDrop(index)}
    >
      <div
        className="bg-slate-100 rounded-lg p-4 mb-4 cursor-move transition-all duration-200 group/header border border-slate-200"
        draggable
        onDragStart={(e) => onColumnDragStart(e, column)}
        onDragEnd={onColumnDragEnd}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
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
                className="flex-1 min-w-0 bg-white text-slate-900 font-semibold text-sm px-3 py-1 rounded border border-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                {column.label}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-medium text-slate-600 bg-slate-200 px-2 py-1 rounded">
              {columnTasks.length}
            </span>
            <ColumnContextMenu
              columnId={column.id}
              columnLabel={column.label}
              onMoveColumn={onMoveColumn}
              onSetColumnLimit={() => {}}
              onDeleteColumn={onDeleteColumn}
            />
          </div>
        </div>
      </div>

      {/* Tasks Container */}
      <div
        className={`
          flex-1 bg-white rounded-lg border-2 transition-all duration-200 min-h-[500px]
          p-3 space-y-3 overflow-y-auto
          ${isDragOverColumn && canDrop ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}
          ${!canDrop && draggedTask ? 'opacity-50' : ''}
        `}
        onDragOver={onDragOver}
        onDragEnter={() => onTaskDragEnter(column.id)}
        onDragLeave={onTaskDragLeave}
        onDrop={() => onTaskDrop(column.id)}
      >
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-slate-500 font-medium">No tasks</p>
            <p className="text-xs text-slate-400 mt-1">
              {isDragOverColumn ? 'Drop task here' : 'Click "Add Task" to create one'}
            </p>
          </div>
        )}

        {/* Task Cards */}
        {columnTasks.map((task) => (
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
                onChangeAssignee={onChangeAssignee} animationDelay={0}          />
        ))}

        {/* Add Task Button */}
        {newTaskColumn !== column.id && (
          <button
            onClick={() => onToggleNewTask(column.id)}
            className="w-full flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 py-2 px-3 rounded text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add task
          </button>
        )}
      </div>
    </div>
  )
}
