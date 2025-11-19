import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'

interface AddTaskFormProps {
  columnId: string
  isOpen: boolean
  onToggle: () => void
  onSubmit: (title: string, description: string) => void
}

export function AddTaskForm({
  columnId,
  isOpen,
  onToggle,
  onSubmit,
}: AddTaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title, description)
      setTitle('')
      setDescription('')
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="bg-white rounded-xl p-3 shadow-lg border-2 border-purple-300 animate-fadeInUp">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
          }
          if (e.key === 'Escape') {
            onToggle()
            setTitle('')
            setDescription('')
          }
        }}
        placeholder="Task title..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-medium"
        autoFocus
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit()
          }
          if (e.key === 'Escape') {
            onToggle()
            setTitle('')
            setDescription('')
          }
        }}
        placeholder="Description (optional)..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm resize-none"
        rows={2}
      />
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-8 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
        <Button
          onClick={() => {
            onToggle()
            setTitle('')
            setDescription('')
          }}
          variant="outline"
          className="h-8 text-sm"
        >
          Cancel
        </Button>
      </div>

      <style jsx>{`
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
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
      `}</style>
    </div>
  )
}
