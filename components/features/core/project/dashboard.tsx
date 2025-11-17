'use client'

import { Project } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface DashboardProps {
  project: Project
}

export function Dashboard({ project }: DashboardProps) {
  const activeSprint = project.sprints.find((s) => s.status === 'active')
  const allTasks = project.allTasks
  const tasksByStatus = {
    todo: allTasks.filter((t) => t.status === 'todo').length,
    'in-progress': allTasks.filter((t) => t.status === 'in-progress').length,
    review: allTasks.filter((t) => t.status === 'review').length,
    done: allTasks.filter((t) => t.status === 'done').length,
  }

  const statusData = [
    { name: 'To Do', value: tasksByStatus.todo, fill: '#ef4444' },
    { name: 'In Progress', value: tasksByStatus['in-progress'], fill: '#f59e0b' },
    { name: 'Review', value: tasksByStatus.review, fill: '#3b82f6' },
    { name: 'Done', value: tasksByStatus.done, fill: '#10b981' },
  ]

  const tasksByPriority = {
    low: allTasks.filter((t) => t.priority === 'low').length,
    medium: allTasks.filter((t) => t.priority === 'medium').length,
    high: allTasks.filter((t) => t.priority === 'high').length,
    critical: allTasks.filter((t) => t.priority === 'critical').length,
  }

  const priorityData = [
    { name: 'Low', value: tasksByPriority.low },
    { name: 'Medium', value: tasksByPriority.medium },
    { name: 'High', value: tasksByPriority.high },
    { name: 'Critical', value: tasksByPriority.critical },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-muted-foreground">{project.description}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allTasks.length}</div>
            <p className="text-xs text-muted-foreground">{activeSprint?.name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{tasksByStatus['in-progress']}</div>
            <p className="text-xs text-muted-foreground">{Math.round((tasksByStatus['in-progress'] / allTasks.length) * 100)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{tasksByStatus.done}</div>
            <p className="text-xs text-muted-foreground">{Math.round((tasksByStatus.done / allTasks.length) * 100)}% complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Sprint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSprint?.tasks.length || 0}</div>
            <p className="text-xs text-muted-foreground">{activeSprint?.name}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Overview of tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
            <CardDescription>Distribution of task priorities</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Sprint Tasks */}
      {activeSprint && (
        <Card>
          <CardHeader>
            <CardTitle>{activeSprint.name}</CardTitle>
            <CardDescription>{activeSprint.goal}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSprint.tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex gap-2 mt-1">
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
                  </div>
                  {task.assignee && <span className="text-2xl">{task.assignee.avatar}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
