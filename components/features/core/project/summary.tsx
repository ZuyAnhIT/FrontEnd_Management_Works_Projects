'use client'

import { Project } from '@/lib/mock-data'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, Sparkles, TrendingUp, Users, Target, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface SummaryProps {
  project: Project
}

export function Summary({ project }: SummaryProps) {
  const allTasks = project.allTasks
  
  // Sprint completion data
  const sprintData = project.sprints.map((sprint) => ({
    name: sprint.name,
    completed: sprint.tasks.filter((t) => t.status === 'done').length,
    inProgress: sprint.tasks.filter((t) => t.status === 'in-progress').length,
    todo: sprint.tasks.filter((t) => t.status === 'todo').length,
    total: sprint.tasks.length,
  }))

  // Task status distribution
  const statusData = [
    { name: 'Done', value: allTasks.filter(t => t.status === 'done').length, color: '#10b981' },
    { name: 'In Progress', value: allTasks.filter(t => t.status === 'in-progress').length, color: '#f59e0b' },
    { name: 'Review', value: allTasks.filter(t => t.status === 'review').length, color: '#3b82f6' },
    { name: 'To Do', value: allTasks.filter(t => t.status === 'todo').length, color: '#6b7280' },
  ]

  // Priority distribution
  const priorityData = [
    { name: 'Critical', value: allTasks.filter(t => t.priority === 'critical').length, color: '#ef4444' },
    { name: 'High', value: allTasks.filter(t => t.priority === 'high').length, color: '#f97316' },
    { name: 'Medium', value: allTasks.filter(t => t.priority === 'medium').length, color: '#3b82f6' },
    { name: 'Low', value: allTasks.filter(t => t.priority === 'low').length, color: '#6b7280' },
  ]

  // Team workload
  const assigneeStats = allTasks.reduce((acc, task) => {
    if (task.assignee) {
      const existing = acc.find((a) => a.id === task.assignee!.id)
      if (existing) {
        existing.tasks++
        if (task.status === 'done') existing.completed++
      } else {
        acc.push({ 
          id: task.assignee.id, 
          name: task.assignee.name, 
          avatar: task.assignee.avatar, 
          tasks: 1,
          completed: task.status === 'done' ? 1 : 0
        })
      }
    }
    return acc
  }, [] as Array<{ id: string; name: string; avatar: string; tasks: number; completed: number }>)

  const completionRate = allTasks.length > 0 
    ? Math.round((allTasks.filter(t => t.status === 'done').length / allTasks.length) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl p-8 shadow-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-white">Summary & Analytics</h1>
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-white/80 text-sm">Project performance and team insights</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeInUp">

          {/* Total Tasks */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-blue-600">{allTasks.length}</p>
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">{allTasks.filter(t => t.status === 'done').length}</p>
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">In Progress</p>
              <p className="text-3xl font-bold text-amber-600">{allTasks.filter(t => t.status === 'in-progress').length}</p>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Completion Rate</p>
              <p className="text-3xl font-bold text-purple-600">{completionRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeInUp delay-100">

          {/* Sprint Progress */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Sprint Progress</h3>
                  <p className="text-sm text-gray-500">Task completion by sprint</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sprintData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ background: "white", borderRadius: "12px", border: "none" }} />
                  <Legend />

                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="todo" fill="#6b7280" name="To Do" radius={[8, 8, 0, 0]} />

                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Task Status */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Task Status</h3>
                  <p className="text-sm text-gray-500">Distribution by status</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "white", borderRadius: "12px", border: "none" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        {/* Team Workload */}
        <Card className="border-0 shadow-xl animate-fadeInUp delay-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Team Workload</h3>
                <p className="text-sm text-gray-500">Task distribution across team members</p>
              </div>
            </div>

            <div className="space-y-4">

              {assigneeStats.sort((a, b) => b.tasks - a.tasks).map((assignee, index) => {
                const completionRate = Math.round((assignee.completed / assignee.tasks) * 100)
                
                return (
                  <div 
                    key={assignee.id} 
                    className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300 animate-fadeInUp"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">

                      {/* Avatar */}
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity" />
                        <div className="relative w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-3xl">{assignee.avatar}</span>
                        </div>
                      </div>

                      {/* User Stats */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">{assignee.name}</span>

                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                              {assignee.completed}/{assignee.tasks} completed
                            </span>
                            <span className="text-sm font-bold text-purple-600">
                              {completionRate}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                          {/* workload max */}
                          <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${(assignee.tasks / Math.max(...assigneeStats.map(a => a.tasks))) * 100}%` }}
                          />
                          {/* completed */}
                          <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            style={{ width: `${(assignee.completed / Math.max(...assigneeStats.map(a => a.tasks))) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Task Count Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">{assignee.tasks}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                )
              })}

            </div>
          </CardContent>
        </Card>

        {/* Priority Overview */}
        <Card className="border-0 shadow-xl animate-fadeInUp delay-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Priority Distribution</h3>
                <p className="text-sm text-gray-500">Tasks organized by priority level</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {priorityData.map((priority, index) => (
                <div 
                  key={priority.name}
                  className="p-4 rounded-xl border-2 border-gray-100 hover:shadow-lg transition-all duration-300 animate-fadeInUp"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    backgroundColor: `${priority.color}10`
                  }}
                >
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: priority.color }}
                    >
                      <span className="text-white font-bold text-xl">{priority.value}</span>
                    </div>
                    <p className="font-bold text-gray-900">{priority.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((priority.value / allTasks.length) * 100)}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>

      </div>

      <style jsx>{`
        .bg-grid-white\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out; }
      `}</style>
    </div>
  )
}
