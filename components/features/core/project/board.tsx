'use client'

import { useState } from 'react'
import { BoardHeader } from '@/components/features/core/project/board/board-header'
import { BoardColumn } from '@/components/features/core/project/board/board-column'
import { AddColumnSection } from '@/components/features/core/project/board/add-column-section'
import { ProgressBar } from '@/components/features/core/project/board/progress-bar'
import { ConfirmModal } from '@/components/features/core/project/board/confirm-modal'

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

interface Modal {
  type: 'confirm' | null
  title: string
  message: string
  taskId?: string
  columnId?: string
  onConfirm?: () => void
}

const colorPalettes = [
  {
    color: 'from-slate-500 to-slate-600',
    bgColor: 'from-slate-50 to-slate-100',
    borderColor: 'border-slate-300',
    hoverBorder: 'hover:border-slate-400',
    textColor: 'text-slate-700',
    lightColor: 'bg-slate-100',
  },
  {
    color: 'from-amber-500 to-orange-500',
    bgColor: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-300',
    hoverBorder: 'hover:border-amber-400',
    textColor: 'text-amber-700',
    lightColor: 'bg-amber-100',
  },
  {
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-300',
    hoverBorder: 'hover:border-blue-400',
    textColor: 'text-blue-700',
    lightColor: 'bg-blue-100',
  },
  {
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-300',
    hoverBorder: 'hover:border-green-400',
    textColor: 'text-green-700',
    lightColor: 'bg-green-100',
  },
  {
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'from-purple-50 to-indigo-50',
    borderColor: 'border-purple-300',
    hoverBorder: 'hover:border-purple-400',
    textColor: 'text-purple-700',
    lightColor: 'bg-purple-100',
  },
  {
    color: 'from-pink-500 to-rose-500',
    bgColor: 'from-pink-50 to-rose-50',
    borderColor: 'border-pink-300',
    hoverBorder: 'hover:border-pink-400',
    textColor: 'text-pink-700',
    lightColor: 'bg-pink-100',
  },
  {
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'from-teal-50 to-cyan-50',
    borderColor: 'border-teal-300',
    hoverBorder: 'hover:border-teal-400',
    textColor: 'text-teal-700',
    lightColor: 'bg-teal-100',
  },
  {
    color: 'from-red-500 to-orange-500',
    bgColor: 'from-red-50 to-orange-50',
    borderColor: 'border-red-300',
    hoverBorder: 'hover:border-red-400',
    textColor: 'text-red-700',
    lightColor: 'bg-red-100',
  },
]

const getRandomColorPalette = () =>
  colorPalettes[Math.floor(Math.random() * colorPalettes.length)]

const defaultColumns: Column[] = [
  {
    id: 'todo',
    label: 'To Do',
    ...colorPalettes[0],
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    ...colorPalettes[1],
  },
  {
    id: 'review',
    label: 'Review',
    ...colorPalettes[2],
  },
  {
    id: 'done',
    label: 'Done',
    ...colorPalettes[3],
  },
]

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design landing page',
    status: 'todo',
    priority: 'high',
    description: 'Create mockups for new landing page',
    subtasks: [
      { id: 'st1', title: 'Create wireframes', completed: true },
      { id: 'st2', title: 'Design hero section', completed: false },
      { id: 'st3', title: 'Design features section', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Setup database',
    status: 'in-progress',
    priority: 'medium',
    description: 'Configure PostgreSQL',
    subtasks: [
      { id: 'st4', title: 'Install PostgreSQL', completed: true },
      { id: 'st5', title: 'Create schema', completed: true },
      { id: 'st6', title: 'Seed data', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Code review PR #123',
    status: 'review',
    priority: 'high',
    description: 'Review authentication changes',
  },
  {
    id: '4',
    title: 'Deploy to production',
    status: 'done',
    priority: 'low',
    description: 'Deploy v2.0 to prod',
  },
]

interface BoardProps {
  project?: any
}

export default function Board({ project }: BoardProps) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [columns, setColumns] = useState<Column[]>(defaultColumns)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [draggedColumn, setDraggedColumn] = useState<Column | null>(null)
  const [dragOverColumnIndex, setDragOverColumnIndex] = useState<number | null>(
    null
  )
  const [newTaskColumn, setNewTaskColumn] = useState<string | null>(null)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [editingColumn, setEditingColumn] = useState<string | null>(null)
  const [editColumnName, setEditColumnName] = useState('')
  const [modal, setModal] = useState<Modal>({ type: null, title: '', message: '' })

  // Task drag handlers
  const handleTaskDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleTaskDragEnter = (columnId: string) => {
    if (draggedTask && draggedTask.status !== columnId) {
      setDragOverColumn(columnId)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOverColumn(null)
    }
  }

  const handleTaskDrop = (columnId: string) => {
    if (draggedTask && draggedTask.status !== columnId) {
      setTasks(
        tasks.map((t) =>
          t.id === draggedTask.id ? { ...t, status: columnId } : t
        )
      )
    }
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleTaskDragEnd = () => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  // Column drag handlers
  const handleColumnDragStart = (e: React.DragEvent, column: Column) => {
    setDraggedColumn(column)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleColumnDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedColumn) {
      setDragOverColumnIndex(index)
    }
  }

  const handleColumnDrop = (targetIndex: number) => {
    if (draggedColumn) {
      const currentIndex = columns.findIndex((c) => c.id === draggedColumn.id)
      if (currentIndex !== targetIndex && currentIndex !== -1) {
        const newColumns = [...columns]
        newColumns.splice(currentIndex, 1)
        newColumns.splice(targetIndex, 0, draggedColumn)
        setColumns(newColumns)
      }
    }
    setDraggedColumn(null)
    setDragOverColumnIndex(null)
  }

  const handleColumnDragEnd = () => {
    setDraggedColumn(null)
    setDragOverColumnIndex(null)
  }

  // Add new task
  const handleAddTask = (
    columnId: string,
    title: string,
    description: string
  ) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description: description || undefined,
      status: columnId,
      priority: 'medium',
      subtasks: [],
    }
    setTasks([...tasks, newTask])
  }

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      setModal({
        type: 'confirm',
        title: 'Delete Task',
        message: `Delete "${task.title}"?`,
        taskId,
        onConfirm: () => {
          setTasks(tasks.filter((t) => t.id !== taskId))
          setModal({ type: null, title: '', message: '' })
        },
      })
    }
  }

  // Toggle subtask completion
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId && t.subtasks) {
          return {
            ...t,
            subtasks: t.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ),
          }
        }
        return t
      })
    )
  }

  // Delete subtask
  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId && t.subtasks) {
          return {
            ...t,
            subtasks: t.subtasks.filter((st) => st.id !== subtaskId),
          }
        }
        return t
      })
    )
  }

  // Add subtask
  const handleAddSubtask = (taskId: string, title: string) => {
    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}`,
      title,
      completed: false,
    }
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: [...(t.subtasks || []), newSubtask],
          }
        }
        return t
      })
    )
  }

  // Add new column
  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      const palette = getRandomColorPalette()
      const newColumn: Column = {
        id: `col-${Date.now()}`,
        label: newColumnName.trim(),
        ...palette,
      }
      setColumns([...columns, newColumn])
      setNewColumnName('')
      setIsAddingColumn(false)
    }
  }

  // Delete column
  const handleDeleteColumn = (columnId: string) => {
    if (columns.length > 1) {
      const columnToDelete = columns.find((c) => c.id === columnId)
      if (columnToDelete) {
        setModal({
          type: 'confirm',
          title: 'Delete Column',
          message: `Delete "${columnToDelete.label}" column? All tasks will be moved to the first column.`,
          columnId,
          onConfirm: () => {
            setColumns(columns.filter((c) => c.id !== columnId))
            const firstColumnId = columns.find((c) => c.id !== columnId)?.id
            if (firstColumnId) {
              setTasks(
                tasks.map((t) =>
                  t.status === columnId ? { ...t, status: firstColumnId } : t
                )
              )
            }
            setModal({ type: null, title: '', message: '' })
          },
        })
      }
    }
  }

  // Edit column name
  const handleEditColumn = (columnId: string) => {
    const column = columns.find((c) => c.id === columnId)
    if (column) {
      setEditingColumn(columnId)
      setEditColumnName(column.label)
    }
  }

  const handleSaveColumnName = (columnId: string) => {
    if (editColumnName.trim()) {
      setColumns(
        columns.map((c) =>
          c.id === columnId ? { ...c, label: editColumnName.trim() } : c
        )
      )
    }
    setEditingColumn(null)
    setEditColumnName('')
  }

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => {
    const col = columns.find((c) => c.id === t.status)
    return (
      col?.label.toLowerCase().includes('done') ||
      col?.label.toLowerCase().includes('complete')
    )
  }).length
  const inProgressTasks = tasks.filter((t) => {
    const col = columns.find((c) => c.id === t.status)
    return (
      col?.label.toLowerCase().includes('progress') ||
      col?.label.toLowerCase().includes('doing')
    )
  }).length
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/40 to-pink-50/30">
      <div className="p-6 max-w-[2000px] mx-auto space-y-6">
        {/* Header */}
        <BoardHeader
          totalTasks={totalTasks}
          completionRate={completionRate}
          inProgressTasks={inProgressTasks}
          columnsCount={columns.length}
        />

        {/* Board Columns */}
        <div className="flex gap-4 overflow-x-auto pb-4 animate-fadeInUp delay-100">
          {columns.map((column, index) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={tasks}
              index={index}
              isDragOverColumn={dragOverColumn === column.id}
              draggedColumn={draggedColumn}
              draggedTask={draggedTask}
              onColumnDragStart={handleColumnDragStart}
              onColumnDragOver={handleColumnDragOver}
              onColumnDrop={handleColumnDrop}
              onColumnDragEnd={handleColumnDragEnd}
              onDeleteColumn={handleDeleteColumn}
              onEditColumn={handleEditColumn}
              onDeleteTask={handleDeleteTask}
              onTaskDragStart={handleTaskDragStart}
              onTaskDragEnd={handleTaskDragEnd}
              onTaskDragEnter={handleTaskDragEnter}
              onTaskDragLeave={handleDragLeave}
              onTaskDrop={handleTaskDrop}
              onDragOver={handleDragOver}
              onToggleSubtask={toggleSubtask}
              onDeleteSubtask={deleteSubtask}
              onAddSubtask={handleAddSubtask}
              onAddTask={handleAddTask}
              editingColumn={editingColumn}
              editColumnName={editColumnName}
              onEditColumnNameChange={setEditColumnName}
              onSaveColumnName={handleSaveColumnName}
              newTaskColumn={newTaskColumn}
              onToggleNewTask={setNewTaskColumn}
            />
          ))}

          {/* Add Column Button */}
          <AddColumnSection
            isAdding={isAddingColumn}
            onToggleAdding={() => setIsAddingColumn(!isAddingColumn)}
            newColumnName={newColumnName}
            onNameChange={setNewColumnName}
            onSubmit={handleAddColumn}
          />
        </div>

        {/* Progress Bar */}
        <ProgressBar
          completedTasks={completedTasks}
          totalTasks={totalTasks}
          inProgressTasks={inProgressTasks}
          completionRate={completionRate}
        />
      </div>

      {/* Modal */}
      <ConfirmModal
        isOpen={modal.type === 'confirm'}
        title={modal.title}
        message={modal.message}
        onConfirm={() => modal.onConfirm?.()}
        onCancel={() => setModal({ type: null, title: '', message: '' })}
      />

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

        .delay-100 {
          animation-delay: 100ms;
        }
      `}</style>
    </div>
  )
}
