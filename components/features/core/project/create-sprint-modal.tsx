'use client'

import { useState } from 'react'
import { X, Sparkles, Calendar, Target, Rocket } from 'lucide-react'
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
        taskIds: [] // sprint mới thường chưa có task
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <Card className="w-full max-w-2xl shadow-2xl border-0 animate-scaleIn overflow-hidden">

        {/* HEADER – THEME PURPLE → PINK */}
        <CardHeader className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 p-8">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl text-white">Create New Sprint</CardTitle>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-white/80 text-sm mt-1">Plan your next iteration</p>
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

        <CardContent className="p-8 space-y-6 bg-gradient-to-b from-purple-50/40 to-white">

          {/* ERROR MESSAGE */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Sprint Name */}
          <div className="group">
            <label className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              Sprint Name*
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Sprint 3 - Core Features"
              className="w-full border-2 border-gray-200 focus:border-purple-500 rounded-xl px-4 py-3 text-base transition-all duration-300 hover:border-purple-300 shadow-sm"
            />
          </div>

          {/* Sprint Goal */}
          <div className="group">
            <label className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                <Target className="w-4 h-4 text-white" />
              </div>
              Sprint Goal
            </label>
            <Textarea
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              placeholder="What is the main goal of this sprint?"
              rows={4}
              className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 text-base transition-all duration-300 hover:border-blue-300 shadow-sm resize-none"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">

            {/* Start Date */}
            <div className="group">
              <label className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                Start Date*
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all duration-300 hover:border-purple-300 shadow-sm text-base"
              />
            </div>

            {/* End Date */}
            <div className="group">
              <label className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                End Date*
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-all duration-300 hover:border-pink-300 shadow-sm text-base"
              />
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
              disabled={loading}
              className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl"
            >
              <Rocket className={`w-5 h-5 mr-2 transition-transform duration-300 ${loading ? '' : 'group-hover:translate-x-1'}`} />
              {loading ? 'Creating...' : 'Create Sprint'}
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
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
    </div>
  )
}
