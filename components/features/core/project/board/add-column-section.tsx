import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

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
    <div className="flex-shrink-0 w-96">
      {isAdding ? (
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <input
            type="text"
            value={newColumnName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmit()
              if (e.key === 'Escape') onToggleAdding()
            }}
            placeholder="Enter column name..."
            className="w-full px-3 py-2 border border-slate-300 rounded text-sm mb-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              onClick={onSubmit}
              disabled={!newColumnName.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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
          className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-slate-100 transition-all text-slate-600 hover:text-slate-900 flex flex-col items-center justify-center gap-2 font-medium text-sm"
        >
          <Plus className="w-5 h-5" />
          Add column
        </button>
      )}
    </div>
  )
}
