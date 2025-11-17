'use client'

import { useState } from 'react'
import { Project, Task } from '@/lib/mock-data'
import { TaskCard } from './task-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface BoardProps {
  project: Project
}

const statuses: Array<Task['status']> = ['todo', 'in-progress', 'review', 'done']
const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
}

export function Board({ project }: BoardProps) {
  const [tasks, setTasks] = useState(project.allTasks)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: Task['status']) => {
    if (draggedTask) {
      setTasks(
        tasks.map((t) => (t.id === draggedTask.id ? { ...t, status } : t))
      )
      setDraggedTask(null)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Task Board</h1>
        <Button><Plus className="w-4 h-4 mr-2" />New Task</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statuses.map((status) => (
          <div
            key={status}
            className="bg-muted/30 rounded-lg p-4 min-h-96"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(status)}
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              {statusLabels[status]}
              <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                {tasks.filter((t) => t.status === status).length}
              </span>
            </h2>

            <div className="space-y-3">
              {tasks
                .filter((t) => t.status === status)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={() => handleDragStart(task)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
