'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Task, SubTask } from '@/lib/mock-data'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (task: Task) => void
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
      // Reset form
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white/95 backdrop-blur">
          <div>
            <CardTitle>Create New Task</CardTitle>
            <CardDescription>Add a new task to your project</CardDescription>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-sm font-medium block mb-2">Task Title*</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title..."
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium block mb-2">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description..."
              rows={3}
              className="w-full"
            />
          </div>

          {/* Priority & Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Subtasks Section */}
          <div>
            <label className="text-sm font-medium block mb-3">Subtasks</label>
            <div className="space-y-2 mb-3">
              {formData.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm">{subtask.title}</span>
                  <button
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-red-600" />
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
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSubtask}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              Create Task
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
