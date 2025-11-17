'use client'

import { Project } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TimelineProps {
  project: Project
}

export function Timeline({ project }: TimelineProps) {
  const sortedTasks = [...project.allTasks].sort(
    (a, b) => new Date(a.dueDate || '2099-01-01').getTime() - new Date(b.dueDate || '2099-01-01').getTime()
  )

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Timeline</h1>

      <div className="space-y-4">
        {sortedTasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-24 flex-shrink-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  </p>
                </div>

                <div className="flex-1">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>

                  <div className="flex gap-2 mt-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'done' ? 'bg-green-100 text-green-700' :
                      task.status === 'review' ? 'bg-blue-100 text-blue-700' :
                      task.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      task.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                {task.assignee && <span className="text-2xl">{task.assignee.avatar}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
