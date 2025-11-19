'use client'

import { useState, useRef, useEffect } from 'react'

interface ColumnContextMenuProps {
  columnId: string
  columnLabel: string
  onMoveColumn: (columnId: string, direction: 'left' | 'right') => void
  onSetColumnLimit: (columnId: string) => void
  onDeleteColumn: (columnId: string) => void
}

export function ColumnContextMenu({
  columnId,
  columnLabel,
  onMoveColumn,
  onSetColumnLimit,
  onDeleteColumn,
}: ColumnContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showMoreActions, setShowMoreActions] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowMoreActions(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 opacity-0 group-hover/header:opacity-100 transition-all p-1 rounded hover:bg-slate-200"
        title="Column actions"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-slate-800 rounded shadow-lg z-50 border border-slate-700">
          {!showMoreActions ? (
            <>
              <button
                onClick={() => {
                  onMoveColumn(columnId, 'left')
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors rounded-t"
              >
                Move column
              </button>
              <button
                onClick={() => {
                  onSetColumnLimit(columnId)
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Set column limit
              </button>
              <button
                onClick={() => {
                  onDeleteColumn(columnId)
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowMoreActions(true)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-700 transition-colors flex items-center justify-between rounded-b"
              >
                More actions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowMoreActions(false)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-700 transition-colors flex items-center gap-2 rounded-t"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
