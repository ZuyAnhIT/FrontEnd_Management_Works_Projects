'use client'

import { Project } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

interface SummaryProps {
  project: Project
}

export function Summary({ project }: SummaryProps) {
  const allTasks = project.allTasks
  
  // Task completion over sprints
  const sprintData = project.sprints.map((sprint) => ({
    name: sprint.name,
    completed: sprint.tasks.filter((t) => t.status === 'done').length,
    total: sprint.tasks.length,
    percentage: Math.round((sprint.tasks.filter((t) => t.status === 'done').length / sprint.tasks.length) * 100),
  }))

  // Tasks by assignee
  const assigneeStats = allTasks.reduce((acc, task) => {
    if (task.assignee) {
      const existing = acc.find((a) => a.id === task.assignee!.id)
      if (existing) {
        existing.tasks++
      } else {
        acc.push({ id: task.assignee.id, name: task.assignee.name, avatar: task.assignee.avatar, tasks: 1 })
      }
    }
    return acc
  }, [] as Array<{ id: string; name: string; avatar: string; tasks: number }>)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Summary & Analytics</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{allTasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{allTasks.filter((t) => t.status === 'done').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{allTasks.filter((t) => t.status === 'in-progress').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Completion %</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Math.round((allTasks.filter((t) => t.status === 'done').length / allTasks.length) * 100)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sprint Completion Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sprint Completion Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sprintData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="total" fill="#e5e7eb" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Team Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Team Workload Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assigneeStats.map((assignee) => (
              <div key={assignee.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{assignee.avatar}</span>
                  <span className="font-medium">{assignee.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(assignee.tasks / Math.max(...assigneeStats.map((a) => a.tasks))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{assignee.tasks}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
