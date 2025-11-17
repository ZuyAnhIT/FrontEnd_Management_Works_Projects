'use client'

import { useState } from 'react'
import { Task, SubTask } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X, Plus } from 'lucide-react'

interface TaskFormProps {
  task?: Task
  onClose: () => void
  onSave: (task: Task) => void
}

export function TaskForm({ task, onClose, onSave }: TaskFormProps) {
  const [formData, setFormData] = useState<Task>(
    task || {
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      subtasks: [],
    }
  )

  const [newSubtask, setNewSubtask] = useState('')

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: SubTask = {
        id: `st-${Date.now()}`,
        title: newSubtask,
        completed: false,
      }
      setFormData({
        ...formData,
        subtasks: [...formData.subtasks, subtask],
      })
      setNewSubtask('')
    }
  }

  const handleRemoveSubtask = (id: string) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter(st => st.id !== id),
    })
  }

  const handleSave = () => {
    if (formData.title.trim()) {
      onSave(formData)
      onClose()
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{task ? 'Edit Task' : 'Create New Task'}</CardTitle>
          <CardDescription>Manage task details and subtasks</CardDescription>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Title */}
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Task title..."
            className="mt-2"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Task description..."
            className="mt-2"
            rows={3}
          />
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
              className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
              className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <label className="text-sm font-medium mb-3 block">Subtasks</label>
          <div className="space-y-2">
            {formData.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        subtasks: formData.subtasks.map(st =>
                          st.id === subtask.id ? { ...st, completed: e.target.checked } : st
                        ),
                      })
                    }}
                    className="w-4 h-4"
                  />
                  <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
                    {subtask.title}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveSubtask(subtask.id)}
                  className="p-1 hover:bg-destructive/10 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}

            {/* Add Subtask Input */}
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
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
