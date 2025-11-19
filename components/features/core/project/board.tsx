'use client'

import { useState } from 'react'
import { BoardHeader } from '@/components/features/core/project/board/board-header'
import { BoardColumn } from '@/components/features/core/project/board/board-column'
import { AddColumnSection } from '@/components/features/core/project/board/add-column-section'
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
}

interface Modal {
  type: 'confirm' | null
  title: string
  message: string
  taskId?: string
  columnId?: string
  onConfirm?: () => void
}

const defaultColumns: Column[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
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
      const newColumn: Column = {
        id: `col-${Date.now()}`,
        label: newColumnName.trim(),
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

  // Change assignee
  const handleChangeAssignee = (taskId: string, assigneeId?: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, assignee: assigneeId } : t
      )
    )
  }

  // Move column
  const handleMoveColumn = (columnId: string, direction: 'left' | 'right') => {
    const currentIndex = columns.findIndex((c) => c.id === columnId)
    if (currentIndex === -1) return

    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex >= 0 && targetIndex < columns.length) {
      const newColumns = [...columns]
      ;[newColumns[currentIndex], newColumns[targetIndex]] = [
        newColumns[targetIndex],
        newColumns[currentIndex],
      ]
      setColumns(newColumns)
    }
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
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-[2000px] mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <BoardHeader
            totalTasks={totalTasks}
            completionRate={completionRate}
            inProgressTasks={inProgressTasks}
            columnsCount={columns.length}
          />
        </div>

        {/* Board Columns */}
        <div className="flex gap-6 overflow-x-auto pb-4">
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
              onChangeAssignee={handleChangeAssignee}
              onMoveColumn={handleMoveColumn}
            />
          ))}

          <AddColumnSection
            isAdding={isAddingColumn}
            onToggleAdding={() => setIsAddingColumn(!isAddingColumn)}
            newColumnName={newColumnName}
            onNameChange={setNewColumnName}
            onSubmit={handleAddColumn}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={modal.type === 'confirm'}
        title={modal.title}
        message={modal.message}
        onConfirm={() => modal.onConfirm?.()}
        onCancel={() => setModal({ type: null, title: '', message: '' })}
      />
    </div>
  )
}
