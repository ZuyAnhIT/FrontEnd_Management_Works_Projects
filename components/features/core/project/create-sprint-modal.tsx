'use client'

import { useState } from 'react'
import { X, Calendar, Target, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createSprint } from '@/services/apiSprint'

interface CreateSprintModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  onCreated: () => void
}

export function CreateSprintModal({
  isOpen,
  onClose,
  projectId,
  onCreated
}: CreateSprintModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setError(null)

    if (!formData.name.trim()) return setError('Tên Sprint không được để trống.')
    if (!formData.startDate || !formData.endDate)
      return setError('Bạn phải chọn ngày bắt đầu và kết thúc.')

    try {
      setLoading(true)

      await createSprint(projectId, {
        name: formData.name,
        goal: formData.goal,
        startDate: formData.startDate,
        endDate: formData.endDate,
        taskIds: []
      })

      onCreated()
      onClose()

      setFormData({
        name: '',
        goal: '',
        startDate: '',
        endDate: ''
      })
    } catch (err: any) {
      setError(err.message || 'Không thể tạo Sprint.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    // 1. Backdrop: Giảm độ đậm (bg-black/40) để nhạt hơn, thoáng hơn
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      <Card className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* HEADER */}
        <CardHeader className="bg-white border-b border-slate-100 px-6 py-5 flex flex-row items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
              <Rocket className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              {/* Chữ tiêu đề đậm hơn (slate-900) */}
              <CardTitle className="text-xl text-slate-900 font-bold">Create Sprint</CardTitle>
              <p className="text-slate-500 text-xs font-medium mt-0.5">Plan your next iteration</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        {/* BODY */}
        <CardContent className="p-6 space-y-5">

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              {error}
            </div>
          )}

          {/* Sprint Name */}
          <div className="space-y-1.5">
            {/* Label: Chữ đen (slate-900) và đậm (font-semibold) */}
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              Sprint Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Sprint 3 - Core Features"
              // Input Text: Chữ đen rõ ràng
              className="h-10 border-slate-300 rounded-md text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>

          {/* Sprint Goal */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-500" />
              Sprint Goal
            </label>
            <Textarea
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              placeholder="What do you want to achieve in this sprint?"
              rows={3}
              className="resize-none border-slate-300 rounded-md text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-10 px-5 text-sm font-semibold text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Cancel
            </Button>

            <Button
              onClick={handleCreate}
              disabled={loading}
              className="h-10 px-6 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Rocket className="w-4 h-4" />
                  Create Sprint
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}