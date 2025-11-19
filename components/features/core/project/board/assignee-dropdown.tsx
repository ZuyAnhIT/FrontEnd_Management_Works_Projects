'use client'

import { useState, useRef, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AssigneeDropdownProps {
  taskId: string
  currentAssignee?: string
  onAssigneeChange: (taskId: string, assigneeId?: string) => void
}

const mockUsers: User[] = [
  { id: 'unassigned', name: 'Unassigned', email: '' },
  { id: 'auto', name: 'Automatic', email: '' },
  { id: 'user1', name: 'Zill Đức', email: 'ducsmile111@gmail.com' },
  { id: 'user2', name: 'John Doe', email: 'john@example.com' },
  { id: 'user3', name: 'Jane Smith', email: 'jane@example.com' },
]

export function AssigneeDropdown({
  taskId,
  currentAssignee,
  onAssigneeChange,
}: AssigneeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentUser = mockUsers.find((u) => u.id === currentAssignee)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
  }

  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-orange-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-pink-500',
    ]
    return colors[id.charCodeAt(0) % colors.length]
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors"
      >
        {currentUser ? (
          <>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(currentUser.id)}`}
            >
              {getInitials(currentUser.name)}
            </div>
            <span>{currentUser.name}</span>
          </>
        ) : (
          <>
            <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-slate-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
            <span>Unassigned</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-slate-800 rounded shadow-lg z-50 border border-slate-700 max-h-64 overflow-y-auto">
          {mockUsers.map((user, index) => (
            <button
              key={user.id}
              onClick={() => {
                onAssigneeChange(taskId, user.id === 'unassigned' ? undefined : user.id)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-slate-700 last:border-b-0 ${
                currentAssignee === user.id
                  ? 'bg-blue-900/30 text-blue-300'
                  : 'text-slate-200 hover:bg-slate-700'
              }`}
            >
              {user.id === 'unassigned' ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded border-2 border-slate-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
              ) : user.id === 'auto' ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(user.id)}`}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-slate-400 truncate">{user.email}</div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
