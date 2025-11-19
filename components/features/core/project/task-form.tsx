'use client'

import { useState } from 'react'
import { Task, SubTask } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  X, 
  Plus, 
  AlignLeft, 
  Flag, 
  Activity, 
  CheckSquare, 
  Trash2, 
  LayoutList 
} from 'lucide-react'

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
    // Giả sử đây là nội dung bên trong Modal Overlay
    <Card className="w-full max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
      
      {/* HEADER */}
      <CardHeader className="px-6 py-4 border-b border-slate-100 flex flex-row items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900">
            {task ? 'Edit Issue' : 'Create Issue'}
          </CardTitle>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {task ? `Updating ${task.id}` : 'Add a new task to your project'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </CardHeader>

      {/* BODY */}
      <CardContent className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
        
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-900">
            Summary <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What needs to be done?"
            className="h-10 border-slate-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
            autoFocus={!task}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
             <AlignLeft className="w-4 h-4 text-slate-500" />
             Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add a more detailed description..."
            className="resize-none border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm min-h-[100px]"
          />
        </div>

        {/* Row: Priority & Status */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
               <Flag className="w-4 h-4 text-slate-500" />
               Priority
            </label>
            <div className="relative">
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 appearance-none cursor-pointer shadow-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              {/* Custom Arrow */}
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
               <Activity className="w-4 h-4 text-slate-500" />
               Status
            </label>
            <div className="relative">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 appearance-none cursor-pointer shadow-sm"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
               <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Subtasks Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-sm font-semibold text-slate-900 flex items-center gap-2 pt-2">
             <LayoutList className="w-4 h-4 text-slate-500" />
             Subtasks
          </label>
          
          {/* List Subtasks */}
          <div className="space-y-2">
            {formData.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200 group hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
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
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`text-sm truncate ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                    {subtask.title}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveSubtask(subtask.id)}
                  className="p-1.5 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask Input */}
          <div className="flex gap-2">
            <Input
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Add a subtask..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
              className="h-9 text-sm border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 flex-1"
            />
            <Button
              variant="outline"
              onClick={handleAddSubtask}
              className="h-9 px-3 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </CardContent>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
        <Button 
            variant="outline" 
            onClick={onClose}
            className="h-10 px-5 text-sm font-semibold text-slate-700 border-slate-300 hover:bg-white hover:text-slate-900 transition-colors"
        >
          Cancel
        </Button>
        <Button 
            onClick={handleSave}
            className="h-10 px-6 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          {task ? 'Save Changes' : 'Create Issue'}
        </Button>
      </div>

    </Card>
  )
}