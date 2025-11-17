'use client'

import { useState } from 'react'
import { X, Plus, Sparkles, FileText, Flag, Activity, CheckSquare, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Task, SubTask } from '@/lib/mock-data'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (task: Task) => void
}

const priorityConfig = {
  low: { color: 'from-gray-400 to-gray-500', icon: '🔵' },
  medium: { color: 'from-blue-400 to-blue-500', icon: '🟡' },
  high: { color: 'from-orange-400 to-orange-500', icon: '🟠' },
  critical: { color: 'from-red-500 to-red-600', icon: '🔴' },
}

const statusConfig = {
  todo: { color: 'from-gray-400 to-gray-500', icon: '📋' },
  'in-progress': { color: 'from-amber-400 to-orange-500', icon: '⚡' },
  review: { color: 'from-blue-400 to-cyan-500', icon: '👀' },
  done: { color: 'from-green-400 to-emerald-500', icon: '✅' },
}

export function CreateTaskModal({ isOpen, onClose, onCreate }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    status: 'todo' as Task['status'],
    subtasks: [] as SubTask[],
  })
  const [newSubtask, setNewSubtask] = useState('')

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: SubTask = {
        id: `st-${Date.now()}`,
        title: newSubtask,
        completed: false,
      }
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, subtask],
      }))
      setNewSubtask('')
    }
  }

  const handleRemoveSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== id),
    }))
  }

  const handleCreate = () => {
    if (formData.title.trim()) {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...formData,
      }
      onCreate(newTask)
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        subtasks: [],
      })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border-0 animate-scaleIn flex flex-col">
        {/* Header with Gradient */}
        <CardHeader className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 p-8 flex-shrink-0">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl text-white">Create New Task</CardTitle>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-white/80 text-sm mt-1">Add a new task to your project</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-90 backdrop-blur-sm"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6 bg-gradient-to-b from-blue-50/30 to-white overflow-y-auto flex-1">
          {/* Title */}
          <div className="group">
            <label className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              Task Title*
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title..."
              className="w-full border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 text-base transition-all duration-300 hover:border-purple-300 shadow-sm"
            />
          </div>

          {/* Description */}
          <div className="group">
            <label className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description..."
              rows={3}
              className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 text-base transition-all duration-300 hover:border-blue-300 shadow-sm resize-none"
            />
          </div>

          {/* Priority & Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <label className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                  <Flag className="w-4 h-4 text-white" />
                </div>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-all duration-300 hover:border-orange-300 shadow-sm text-base bg-white"
              >
                <option value="low">🔵 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="critical">🔴 Critical</option>
              </select>
            </div>
            <div className="group">
              <label className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-all duration-300 hover:border-green-300 shadow-sm text-base bg-white"
              >
                <option value="todo">📋 To Do</option>
                <option value="in-progress">⚡ In Progress</option>
                <option value="review">👀 Review</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="group">
            <label className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                <CheckSquare className="w-4 h-4 text-white" />
              </div>
              Subtasks
              {formData.subtasks.length > 0 && (
                <span className="text-xs bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-2 py-1 rounded-full">
                  {formData.subtasks.length}
                </span>
              )}
            </label>
            
            <div className="space-y-3 mb-3">
              {formData.subtasks.map((subtask, index) => (
                <div
                  key={subtask.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-200 shadow-sm hover:shadow-md transition-all duration-300 group animate-fadeInUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{subtask.title}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-all duration-300 hover:scale-110 group"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 group-hover:animate-pulse" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add subtask..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                className="flex-1 border-2 border-gray-200 focus:border-teal-500 rounded-xl px-4 py-3 text-base transition-all duration-300 hover:border-teal-300 shadow-sm"
              />
              <Button
                variant="outline"
                onClick={handleAddSubtask}
                className="px-4 py-3 h-auto border-2 border-teal-500 text-teal-600 hover:bg-teal-50 transition-all duration-300 hover:scale-105 rounded-xl"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t-2 border-gray-200">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-3 h-auto font-semibold border-2 hover:bg-gray-50 transition-all duration-300 hover:scale-105 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              className="group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-6 py-3 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Create Task
            </Button>
          </div>
        </CardContent>
      </Card>

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
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}