'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, LayoutGrid, Sparkles, TrendingUp, Zap, Filter, GripVertical, X, Edit2, Check, Trash2, ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react'

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
  type: 'confirm' | 'subtask' | null
  title: string
  message: string
  taskId?: string
  columnId?: string
  onConfirm?: () => void
}

const colorPalettes = [
  { 
    color: 'from-slate-500 to-slate-600', bgColor: 'from-slate-50 to-slate-100',
    borderColor: 'border-slate-300', hoverBorder: 'hover:border-slate-400',
    textColor: 'text-slate-700', lightColor: 'bg-slate-100'
  },
  { 
    color: 'from-amber-500 to-orange-500', bgColor: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-300', hoverBorder: 'hover:border-amber-400',
    textColor: 'text-amber-700', lightColor: 'bg-amber-100'
  },
  { 
    color: 'from-blue-500 to-cyan-500', bgColor: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-300', hoverBorder: 'hover:border-blue-400',
    textColor: 'text-blue-700', lightColor: 'bg-blue-100'
  },
  { 
    color: 'from-green-500 to-emerald-500', bgColor: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-300', hoverBorder: 'hover:border-green-400',
    textColor: 'text-green-700', lightColor: 'bg-green-100'
  },
  { 
    color: 'from-purple-500 to-indigo-500', bgColor: 'from-purple-50 to-indigo-50',
    borderColor: 'border-purple-300', hoverBorder: 'hover:border-purple-400',
    textColor: 'text-purple-700', lightColor: 'bg-purple-100'
  },
  { 
    color: 'from-pink-500 to-rose-500', bgColor: 'from-pink-50 to-rose-50',
    borderColor: 'border-pink-300', hoverBorder: 'hover:border-pink-400',
    textColor: 'text-pink-700', lightColor: 'bg-pink-100'
  },
  { 
    color: 'from-teal-500 to-cyan-500', bgColor: 'from-teal-50 to-cyan-50',
    borderColor: 'border-teal-300', hoverBorder: 'hover:border-teal-400',
    textColor: 'text-teal-700', lightColor: 'bg-teal-100'
  },
  { 
    color: 'from-red-500 to-orange-500', bgColor: 'from-red-50 to-orange-50',
    borderColor: 'border-red-300', hoverBorder: 'hover:border-red-400',
    textColor: 'text-red-700', lightColor: 'bg-red-100'
  },
]

const getRandomColorPalette = () => colorPalettes[Math.floor(Math.random() * colorPalettes.length)]

const defaultColumns: Column[] = [
  { 
    id: 'todo',
    label: 'To Do', 
    
    ...colorPalettes[0]
  },
  { 
    id: 'in-progress',
    label: 'In Progress', 
    
    ...colorPalettes[1]
  },
  { 
    id: 'review',
    label: 'Review', 
    
    ...colorPalettes[2]
  },
  { 
    id: 'done',
    label: 'Done', 
    ...colorPalettes[3]
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
      { id: 'st3', title: 'Design features section', completed: false }
    ]
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
      { id: 'st6', title: 'Seed data', completed: false }
    ]
  },
  { id: '3', title: 'Code review PR #123', status: 'review', priority: 'high', description: 'Review authentication changes' },
  { id: '4', title: 'Deploy to production', status: 'done', priority: 'low', description: 'Deploy v2.0 to prod' },
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
  const [dragOverColumnIndex, setDragOverColumnIndex] = useState<number | null>(null)
  const [newTaskColumn, setNewTaskColumn] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [editingColumn, setEditingColumn] = useState<string | null>(null)
  const [editColumnName, setEditColumnName] = useState('')
  const [modal, setModal] = useState<Modal>({ type: null, title: '', message: '' })
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [addingSubtaskTo, setAddingSubtaskTo] = useState<string | null>(null)

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
        tasks.map((t) => (t.id === draggedTask.id ? { ...t, status: columnId } : t))
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
      const currentIndex = columns.findIndex(c => c.id === draggedColumn.id)
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
  const handleAddTask = (columnId: string) => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        status: columnId,
        priority: 'medium',
        subtasks: []
      }
      setTasks([...tasks, newTask])
      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskColumn(null)
    }
  }

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setModal({
        type: 'confirm',
        title: 'Delete Task',
        message: `Delete "${task.title}"?`,
        taskId,
        onConfirm: () => {
          setTasks(tasks.filter(t => t.id !== taskId))
          setModal({ type: null, title: '', message: '' })
        }
      })
    }
  }

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  // Add subtask
  const handleAddSubtask = (taskId: string) => {
    if (newSubtaskTitle.trim()) {
      const newSubtask: Subtask = {
        id: `subtask-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        completed: false
      }
      setTasks(tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: [...(t.subtasks || []), newSubtask]
          }
        }
        return t
      }))
      setNewSubtaskTitle('')
      setAddingSubtaskTo(null)
    }
  }

  // Toggle subtask completion
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId && t.subtasks) {
        return {
          ...t,
          subtasks: t.subtasks.map(st => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          )
        }
      }
      return t
    }))
  }

  // Delete subtask
  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId && t.subtasks) {
        return {
          ...t,
          subtasks: t.subtasks.filter(st => st.id !== subtaskId)
        }
      }
      return t
    }))
  }

  // Add new column
  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      const palette = getRandomColorPalette()
      const newColumn: Column = {
        id: `col-${Date.now()}`,
        label: newColumnName.trim(),
        ...palette
      }
      setColumns([...columns, newColumn])
      setNewColumnName('')
      setIsAddingColumn(false)
    }
  }

  // Delete column
  const handleDeleteColumn = (columnId: string) => {
    if (columns.length > 1) {
      const columnToDelete = columns.find(c => c.id === columnId)
      if (columnToDelete) {
        setModal({
          type: 'confirm',
          title: 'Delete Column',
          message: `Delete "${columnToDelete.label}" column? All tasks will be moved to the first column.`,
          columnId,
          onConfirm: () => {
            setColumns(columns.filter(c => c.id !== columnId))
            const firstColumnId = columns.find(c => c.id !== columnId)?.id
            if (firstColumnId) {
              setTasks(tasks.map(t => t.status === columnId ? { ...t, status: firstColumnId } : t))
            }
            setModal({ type: null, title: '', message: '' })
          }
        })
      }
    }
  }

  // Edit column name
  const handleEditColumn = (columnId: string) => {
    const column = columns.find(c => c.id === columnId)
    if (column) {
      setEditingColumn(columnId)
      setEditColumnName(column.label)
    }
  }

  const handleSaveColumnName = (columnId: string) => {
    if (editColumnName.trim()) {
      setColumns(columns.map(c => 
        c.id === columnId ? { ...c, label: editColumnName.trim() } : c
      ))
    }
    setEditingColumn(null)
    setEditColumnName('')
  }

  

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => {
    const col = columns.find(c => c.id === t.status)
    return col?.label.toLowerCase().includes('done') || col?.label.toLowerCase().includes('complete')
  }).length
  const inProgressTasks = tasks.filter(t => {
    const col = columns.find(c => c.id === t.status)
    return col?.label.toLowerCase().includes('progress') || col?.label.toLowerCase().includes('doing')
  }).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/40 to-pink-50/30">
      <div className="p-6 max-w-[2000px] mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl p-8 shadow-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                  <LayoutGrid className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-white">Task Board</h1>
                    <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-white/90">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      {totalTasks} total tasks
                    </span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {completionRate}% complete
                    </span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {inProgressTasks} active
                    </span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <LayoutGrid className="w-4 h-4" />
                      {columns.length} columns
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-pink-200/20 shadow-lg px-4 py-2 h-auto font-medium"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Board Columns */}
        <div className="flex gap-4 overflow-x-auto pb-4 animate-fadeInUp delay-100">
          {columns.map((column, index) => {
            const columnTasks = tasks.filter((t) => t.status === column.id)
            const isDragOver = dragOverColumn === column.id
            const canDrop = draggedTask && draggedTask.status !== column.id
            const isColumnDragOver = dragOverColumnIndex === index && draggedColumn?.id !== column.id

            return (
              <div
                key={column.id}
                className={`flex-shrink-0 w-80 flex flex-col animate-fadeInUp transition-all duration-300 ${
                  isColumnDragOver ? 'scale-105 ml-4' : ''
                } ${draggedColumn?.id === column.id ? 'opacity-50 scale-95' : ''}`}
                style={{ animationDelay: `${(index + 2) * 50}ms` }}
                onDragOver={(e) => handleColumnDragOver(e, index)}
                onDrop={() => handleColumnDrop(index)}
              >
                {/* Column Header */}
                <div 
                  className={`
                    bg-gradient-to-r ${column.color} 
                    rounded-2xl p-4 mb-3 shadow-lg cursor-move
                    transition-all duration-300 group/header
                    ${isDragOver ? 'scale-[1.02] shadow-2xl ring-4 ring-white/50' : ''}
                    ${isColumnDragOver ? 'ring-4 ring-purple-400' : ''}
                  `}
                  draggable
                  onDragStart={(e) => handleColumnDragStart(e, column)}
                  onDragEnd={handleColumnDragEnd}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <GripVertical className="w-5 h-5 text-white/70 flex-shrink-0" />
                      
                      {editingColumn === column.id ? (
                        <input
                          type="text"
                          value={editColumnName}
                          onChange={(e) => setEditColumnName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveColumnName(column.id)
                            if (e.key === 'Escape') setEditingColumn(null)
                          }}
                          onBlur={() => handleSaveColumnName(column.id)}
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
                          onClick={() => handleSaveColumnName(column.id)}
                          className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditColumn(column.id)}
                          className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors opacity-0 group-hover/header:opacity-100"
                        >
                          <Edit2 className="w-4 h-4 text-white" />
                        </button>
                      )}
                      {columns.length > 1 && (
                        <button
                          onClick={() => handleDeleteColumn(column.id)}
                          className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-500/50 transition-colors opacity-0 group-hover/header:opacity-100"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      )}
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
                        {columnTasks.length}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setNewTaskColumn(newTaskColumn === column.id ? null : column.id)}
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
                    transition-all duration-300
                    ${isDragOver && canDrop
                      ? `${column.borderColor} shadow-2xl scale-[1.01] bg-gradient-to-b ${column.bgColor}` 
                      : 'border-gray-200 shadow-md'
                    }
                    ${!canDrop && draggedTask ? 'opacity-50' : ''}
                  `}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleTaskDragEnter(column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleTaskDrop(column.id)}
                >
                  <div className="space-y-3">
                    {/* Add Task Form */}
                    {newTaskColumn === column.id && (
                      <div className="bg-white rounded-xl p-3 shadow-lg border-2 border-purple-300 animate-fadeInUp">
                        <input
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleAddTask(column.id)
                            }
                            if (e.key === 'Escape') {
                              setNewTaskColumn(null)
                              setNewTaskTitle('')
                              setNewTaskDescription('')
                            }
                          }}
                          placeholder="Task title..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-medium"
                          autoFocus
                        />
                        <textarea
                          value={newTaskDescription}
                          onChange={(e) => setNewTaskDescription(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              handleAddTask(column.id)
                            }
                            if (e.key === 'Escape') {
                              setNewTaskColumn(null)
                              setNewTaskTitle('')
                              setNewTaskDescription('')
                            }
                          }}
                          placeholder="Description (optional)..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAddTask(column.id)}
                            disabled={!newTaskTitle.trim()}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-8 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                          <Button
                            onClick={() => {
                              setNewTaskColumn(null)
                              setNewTaskTitle('')
                              setNewTaskDescription('')
                            }}
                            variant="outline"
                            className="h-8 text-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {columnTasks.length === 0 && newTaskColumn !== column.id ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className={`w-20 h-20 mb-4 rounded-2xl flex items-center justify-center ${column.lightColor} shadow-lg`}>
                          <div className="w-10 h-10 rounded-lg bg-gray-200" />

                        </div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">
                          No tasks here
                        </p>
                        <p className="text-xs text-gray-400">
                          {isDragOver ? 'Drop task here' : 'Click "Add Task" to create one'}
                        </p>
                      </div>
                    ) : (
                      columnTasks.map((task, taskIndex) => {
                        const isExpanded = expandedTasks.has(task.id)
                        const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0
                        const totalSubtasks = task.subtasks?.length || 0
                        
                        return (
                          <div
                            key={task.id}
                            className={`
                              group/task bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 
                              border-l-4 cursor-move animate-fadeInUp relative
                              ${task.priority === 'high' ? 'border-l-red-500' : 
                                task.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'}
                              ${draggedTask?.id === task.id ? 'opacity-40 scale-95' : 'hover:scale-102'}
                            `}
                            style={{ animationDelay: `${taskIndex * 30}ms` }}
                            draggable
                            onDragStart={() => handleTaskDragStart(task)}
                            onDragEnd={handleTaskDragEnd}
                          >
                            <button
                              onClick={() => handleDeleteTask(task.id)}
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
                                    toggleTaskExpansion(task.id)
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
                              <span className={`px-2 py-1 rounded-full font-medium ${
                                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {task.priority}
                              </span>
                              {totalSubtasks > 0 && (
                                <span className="text-gray-500 text-xs">
                                  {completedSubtasks}/{totalSubtasks} subtasks
                                </span>
                              )}
                            </div>

                            {/* Subtasks */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                                {task.subtasks?.map((subtask) => (
                                  <div
                                    key={subtask.id}
                                    className="flex items-center gap-2 group/subtask"
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleSubtask(task.id, subtask.id)
                                      }}
                                      className="flex-shrink-0"
                                    >
                                      {subtask.completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-gray-300 hover:text-gray-400" />
                                      )}
                                    </button>
                                    <span className={`text-sm flex-1 ${
                                      subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'
                                    }`}>
                                      {subtask.title}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteSubtask(task.id, subtask.id)
                                      }}
                                      className="opacity-0 group-hover/subtask:opacity-100 transition-opacity"
                                    >
                                      <X className="w-3 h-3 text-red-500 hover:text-red-700" />
                                    </button>
                                  </div>
                                ))}
                                
                                {/* Add Subtask */}
                                {addingSubtaskTo === task.id ? (
                                  <div className="flex gap-2 mt-2">
                                    <input
                                      type="text"
                                      value={newSubtaskTitle}
                                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                      onKeyDown={(e) => {
                                        e.stopPropagation()
                                        if (e.key === 'Enter') {
                                          handleAddSubtask(task.id)
                                        }
                                        if (e.key === 'Escape') {
                                          setAddingSubtaskTo(null)
                                          setNewSubtaskTitle('')
                                        }
                                      }}
                                      placeholder="Subtask title..."
                                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded outline-none focus:border-purple-500"
                                      autoFocus
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleAddSubtask(task.id)
                                      }}
                                      className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                                    >
                                      Add
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setAddingSubtaskTo(null)
                                        setNewSubtaskTitle('')
                                      }}
                                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setAddingSubtaskTo(task.id)
                                    }}
                                    className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 mt-2"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add subtask
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Drop Zone Indicator */}
                  {isDragOver && canDrop && (
                    <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-pink-500/20 opacity-10 animate-pulse"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`${column.lightColor} px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-sm border-2 ${column.borderColor}`}>
                          <p className={`text-sm font-bold ${column.textColor} flex items-center gap-2`}>
                            <div className="w-10 h-10 rounded-lg bg-gray-200" />

                            Drop task here
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Add Column Button */}
          <div className="flex-shrink-0 w-80 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
            {isAddingColumn ? (
              <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-purple-300">
                <div className="mb-3 text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">New Column</p>
                </div>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn()
                    if (e.key === 'Escape') {
                      setIsAddingColumn(false)
                      setNewColumnName('')
                    }
                  }}
                  placeholder="Enter column name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddColumn}
                    disabled={!newColumnName.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAddingColumn(false)
                      setNewColumnName('')
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="w-full h-full min-h-[160px] bg-white/60 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-gray-600 font-semibold group-hover:text-purple-600 transition-colors">
                    Add New Column
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Organize your workflow
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 animate-fadeInUp delay-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Overall Progress</h3>
              <p className="text-sm text-gray-500 mt-1">
                {completedTasks} of {totalTasks} tasks completed • {inProgressTasks} in progress
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {completionRate}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Completion Rate</p>
            </div>
          </div>
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
              style={{ width: `${completionRate}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.type && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-fadeInUp">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modal.title}</h3>
            <p className="text-gray-600 mb-6">{modal.message}</p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setModal({ type: null, title: '', message: '' })}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => modal.onConfirm?.()}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .bg-grid-white\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .delay-100 { animation-delay: 100ms; }
        .delay-300 { animation-delay: 300ms; }
        
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}