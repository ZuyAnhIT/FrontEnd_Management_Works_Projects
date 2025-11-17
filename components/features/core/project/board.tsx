'use client'

import { useState } from 'react'
import { Project, Task } from '@/lib/mock-data'
import { TaskCard } from './task-card'
import { Button } from '@/components/ui/button'
import { Plus, LayoutGrid, Sparkles, TrendingUp, Zap, Filter } from 'lucide-react'

interface BoardProps {
  project: Project
}

const statuses: Array<Task['status']> = ['todo', 'in-progress', 'review', 'done']
const statusConfig = {
  todo: { 
    label: 'To Do', 
    color: 'from-slate-500 to-slate-600',
    bgColor: 'from-slate-50 to-slate-100',
    borderColor: 'border-slate-300',
    hoverBorder: 'hover:border-slate-400',
    textColor: 'text-slate-700',
    icon: '📋',
    lightColor: 'bg-slate-100'
  },
  'in-progress': { 
    label: 'In Progress', 
    color: 'from-amber-500 to-orange-500',
    bgColor: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-300',
    hoverBorder: 'hover:border-amber-400',
    textColor: 'text-amber-700',
    icon: '⚡',
    lightColor: 'bg-amber-100'
  },
  review: { 
    label: 'Review', 
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-300',
    hoverBorder: 'hover:border-blue-400',
    textColor: 'text-blue-700',
    icon: '👀',
    lightColor: 'bg-blue-100'
  },
  done: { 
    label: 'Done', 
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-300',
    hoverBorder: 'hover:border-green-400',
    textColor: 'text-green-700',
    icon: '✅',
    lightColor: 'bg-green-100'
  },
}

export function Board({ project }: BoardProps) {
  const [tasks, setTasks] = useState(project.allTasks)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<Task['status'] | null>(null)

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragEnter = (status: Task['status']) => {
    if (draggedTask && draggedTask.status !== status) {
      setDragOverColumn(status)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the column
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (status: Task['status']) => {
    if (draggedTask && draggedTask.status !== status) {
      setTasks(
        tasks.map((t) => (t.id === draggedTask.id ? { ...t, status } : t))
      )
    }
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length
  const reviewTasks = tasks.filter(t => t.status === 'review').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/40 to-pink-50/30">

      <div className="p-6 max-w-[1800px] mx-auto space-y-6">
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
                <Button className="group bg-white text-purple-600 hover:bg-pink-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-6 py-3 h-auto font-semibold">
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  New Task
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeInUp">
          {Object.entries(statusConfig).map(([status, config], index) => {
            const count = tasks.filter(t => t.status === status).length
            return (
              <div 
                key={status}
                className="relative group animate-fadeInUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl -z-10" 
                  style={{ background: `linear-gradient(to right, rgba(168, 85, 247,0.3), rgba(236, 72, 153,0.3))` }}
                ></div>
                <div className={`bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${config.borderColor} hover:scale-105`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${config.lightColor}`}>
                        <span className="text-2xl">{config.icon}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">{config.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Board Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-fadeInUp delay-100">
          {statuses.map((status, index) => {
            const config = statusConfig[status]
            const columnTasks = tasks.filter((t) => t.status === status)
            const isDragOver = dragOverColumn === status
            const canDrop = draggedTask && draggedTask.status !== status

            return (
              <div
                key={status}
                className="flex flex-col animate-fadeInUp"
                style={{ animationDelay: `${(index + 2) * 50}ms` }}
              >
                {/* Column Header */}
                <div className={`
                  bg-gradient-to-r ${config.color} 
                  rounded-2xl p-4 mb-3 shadow-lg
                  transition-all duration-300
                  ${isDragOver ? 'scale-[1.02] shadow-2xl ring-4 ring-white/50' : ''}
                `}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl drop-shadow-lg">{config.icon}</span>
                      <div>
                        <h2 className="font-bold text-white text-lg">
                          {config.label}
                        </h2>
                        <p className="text-white/90 text-xs font-medium">
                          {columnTasks.length} {columnTasks.length === 1 ? 'task' : 'tasks'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
                      {columnTasks.length}
                    </div>
                  </div>
                </div>

                {/* Tasks Container */}
                <div 
                  className={`
                    flex-1 bg-white/60 backdrop-blur-sm
                    rounded-2xl p-3 min-h-[600px] border-2 border-dashed
                    transition-all duration-300
                    ${isDragOver && canDrop
                      ? `${config.borderColor} shadow-2xl scale-[1.01] bg-gradient-to-b ${config.bgColor}` 
                      : 'border-gray-200 shadow-md'
                    }
                    ${!canDrop && draggedTask ? 'opacity-50' : ''}
                  `}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(status)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(status)}
                >
                  <div className="space-y-3">
                    {columnTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className={`w-20 h-20 mb-4 rounded-2xl flex items-center justify-center ${config.lightColor} shadow-lg`}>
                          <span className="text-4xl">{config.icon}</span>
                        </div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">
                          No tasks here
                        </p>
                        <p className="text-xs text-gray-400">
                          {isDragOver ? 'Drop task here' : 'Drag tasks here or create new ones'}
                        </p>
                      </div>
                    ) : (
                      columnTasks.map((task, taskIndex) => (
                        <div
                          key={task.id}
                          className={`animate-fadeInUp ${
                            draggedTask?.id === task.id ? 'opacity-40 scale-95' : ''
                          }`}
                          style={{ animationDelay: `${taskIndex * 30}ms` }}
                        >
                          <TaskCard
                            task={task}
                            onDragStart={() => handleDragStart(task)}
                            
                          />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Drop Zone Indicator */}
                  {isDragOver && canDrop && (
                    <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
                      <div className={`
                        absolute inset-0 bg-gradient-to-b from-purple-500/20 to-pink-500/20

                        opacity-10 animate-pulse
                      `}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`${config.lightColor} px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-sm border-2 ${config.borderColor}`}>
                          <p className={`text-sm font-bold ${config.textColor} flex items-center gap-2`}>
                            <span className="text-2xl">{config.icon}</span>
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
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 animate-fadeInUp delay-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Overall Progress</h3>
              <p className="text-sm text-gray-500 mt-1">
                {completedTasks} of {totalTasks} tasks completed • {inProgressTasks} in progress • {reviewTasks} in review
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
      `}</style>
    </div>
  )
}