import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'

interface AddColumnSectionProps {
  isAdding: boolean
  onToggleAdding: () => void
  newColumnName: string
  onNameChange: (name: string) => void
  onSubmit: () => void
}

export function AddColumnSection({
  isAdding,
  onToggleAdding,
  newColumnName,
  onNameChange,
  onSubmit,
}: AddColumnSectionProps) {
  return (
    <div className="flex-shrink-0 w-80 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
      {isAdding ? (
        <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-purple-300">
          <div className="mb-3 text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">New Column</p>
          </div>
          <input
            type="text"
            value={newColumnName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmit()
              if (e.key === 'Escape') onToggleAdding()
            }}
            placeholder="Enter column name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              onClick={onSubmit}
              disabled={!newColumnName.trim()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
            <Button onClick={onToggleAdding} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={onToggleAdding}
          className="w-full h-full min-h-[160px] bg-white/60 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-semibold group-hover:text-purple-600 transition-colors">
              Add New Column
            </p>
            <p className="text-xs text-gray-400 mt-1">Organize your workflow</p>
          </div>
        </button>
      )}

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
