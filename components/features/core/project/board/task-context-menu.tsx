'use client'

import { useState, useRef, useEffect } from 'react'

interface TaskContextMenuProps {
  taskId: string
  taskTitle: string
  onChangeStatus: (taskId: string) => void
  onCopyLink: (taskId: string) => void
  onCopyKey: (taskId: string) => void
  onAddFlag: (taskId: string) => void
  onAddLabel: (taskId: string) => void
  onLinkWorkItem: (taskId: string) => void
  onChangeParent: (taskId: string) => void
  onArchive: (taskId: string) => void
  onDelete: (taskId: string) => void
}

export function TaskContextMenu({
  taskId,
  taskTitle,
  onChangeStatus,
  onCopyLink,
  onCopyKey,
  onAddFlag,
  onAddLabel,
  onLinkWorkItem,
  onChangeParent,
  onArchive,
  onDelete,
}: TaskContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMenuClick = (callback: () => void) => {
    callback()
    setIsOpen(false)
  }

  const menuItems = [
    { label: 'Change status', action: () => handleMenuClick(() => onChangeStatus(taskId)) },
    { label: 'Copy link', action: () => handleMenuClick(() => onCopyLink(taskId)) },
    { label: 'Copy key', action: () => handleMenuClick(() => onCopyKey(taskId)) },
    { label: 'Add flag', action: () => handleMenuClick(() => onAddFlag(taskId)) },
    { label: 'Add label', action: () => handleMenuClick(() => onAddLabel(taskId)) },
    { label: 'Link work item', action: () => handleMenuClick(() => onLinkWorkItem(taskId)) },
    { label: 'Change parent', action: () => handleMenuClick(() => onChangeParent(taskId)) },
    { label: 'Archive', action: () => handleMenuClick(() => onArchive(taskId)), isDangerous: false },
    { label: 'Delete', action: () => handleMenuClick(() => onDelete(taskId)), isDangerous: true },
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 opacity-0 group-hover/task:opacity-100 transition-all p-1 rounded hover:bg-slate-100"
        title="More actions"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-slate-800 rounded shadow-lg z-50 border border-slate-700">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                item.isDangerous
                  ? 'text-red-400 hover:bg-red-900/20'
                  : 'text-slate-200 hover:bg-slate-700'
              } ${index === 0 ? 'rounded-t' : ''} ${index === menuItems.length - 1 ? 'rounded-b' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
