'use client'

import { useState } from 'react'
import { Project } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'

interface BacklogProps {
  project: Project
}

export function Backlog({ project }: BacklogProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Backlog</h1>
        <Button><Plus className="w-4 h-4 mr-2" />Add Task</Button>
      </div>

      <div className="space-y-3">
        {project.allTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleExpand(task.id)}
                  className="mt-1 text-muted-foreground hover:text-foreground"
                >
                  {expandedTasks.has(task.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{task.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      task.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'done' ? 'bg-green-100 text-green-700' :
                      task.status === 'review' ? 'bg-blue-100 text-blue-700' :
                      task.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>

                  {expandedTasks.has(task.id) && task.subtasks.length > 0 && (
                    <div className="mt-4 ml-4 space-y-2 border-l border-border pl-4">
                      <p className="text-xs font-semibold text-muted-foreground">Subtasks</p>
                      {task.subtasks.map((subtask) => (
                        <div key={subtask.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={subtask.completed}
                            className="w-4 h-4"
                            readOnly
                          />
                          <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
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
