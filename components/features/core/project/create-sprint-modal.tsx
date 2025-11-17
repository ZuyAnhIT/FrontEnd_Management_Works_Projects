'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sprint } from '@/lib/mock-data'

interface CreateSprintModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (sprint: Sprint) => void
}

export function CreateSprintModal({ isOpen, onClose, onCreate }: CreateSprintModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
  })

  const handleCreate = () => {
    if (formData.name.trim() && formData.startDate && formData.endDate) {
      const newSprint: Sprint = {
        id: `sprint-${Date.now()}`,
        name: formData.name,
        goal: formData.goal,
        status: 'backlog',
        startDate: formData.startDate,
        endDate: formData.endDate,
        tasks: [],
      }
      onCreate(newSprint)
      setFormData({ name: '', goal: '', startDate: '', endDate: '' })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Create New Sprint</CardTitle>
            <CardDescription>Create a new sprint for your project</CardDescription>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sprint Name */}
          <div>
            <label className="text-sm font-medium block mb-2">Sprint Name*</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Sprint 3 - Core Features"
              className="w-full"
            />
          </div>

          {/* Sprint Goal */}
          <div>
            <label className="text-sm font-medium block mb-2">Sprint Goal</label>
            <Textarea
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              placeholder="What is the main goal of this sprint?"
              rows={3}
              className="w-full"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Start Date*</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">End Date*</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
              Create Sprint
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
