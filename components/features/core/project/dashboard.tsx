'use client'

import { Project } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Sparkles, TrendingUp, CheckCircle, Clock, Target, Zap, LayoutGrid } from 'lucide-react'

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
    { name: 'To Do', value: tasksByStatus.todo, fill: '#6b7280' },
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
    { name: 'Low', value: tasksByPriority.low, fill: '#6b7280' },
    { name: 'Medium', value: tasksByPriority.medium, fill: '#3b82f6' },
    { name: 'High', value: tasksByPriority.high, fill: '#f59e0b' },
    { name: 'Critical', value: tasksByPriority.critical, fill: '#ef4444' },
  ]

  const completionRate = allTasks.length > 0 ? Math.round((tasksByStatus.done / allTasks.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl p-8 shadow-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <LayoutGrid className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-white/80 mt-1">{project.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeInUp">
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-10"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-600">Total Tasks</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {allTasks.length}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {activeSprint?.name || 'No active sprint'}
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-10"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-600">In Progress</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                {tasksByStatus['in-progress']}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {Math.round((tasksByStatus['in-progress'] / allTasks.length) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-10"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-600">Completed</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                {tasksByStatus.done}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {completionRate}% complete
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-600">Active Sprint</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {activeSprint?.tasks.length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {activeSprint?.name || 'No active sprint'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="border-0 shadow-xl overflow-hidden animate-fadeInUp delay-100">
          <div className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 p-6">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Overall Progress
                </h3>
                <p className="text-sm text-white/80 mt-1">
                  {tasksByStatus.done} of {allTasks.length} tasks completed
                </p>
              </div>
              <div className="text-4xl font-bold text-white">
                {completionRate}%
              </div>
            </div>
            <div className="relative h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeInUp delay-200">
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Task Status Distribution</CardTitle>
                  <p className="text-sm text-gray-500">Overview of tasks by status</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={statusData} 
                    cx="50%" 
                    cy="50%" 
                    labelLine={false} 
                    label={({ name, value }) => `${name}: ${value}`} 
                    outerRadius={100} 
                    fill="#8884d8" 
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Tasks by Priority</CardTitle>
                  <p className="text-sm text-gray-500">Distribution of task priorities</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Active Sprint Tasks */}
        {activeSprint && (
          <Card className="border-0 shadow-xl animate-fadeInUp delay-300">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>{activeSprint.name}</CardTitle>
                  <p className="text-sm text-gray-500">{activeSprint.goal}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {activeSprint.tasks.slice(0, 5).map((task, index) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-2xl hover:shadow-lg hover:border-gray-300 transition-all duration-300 bg-white animate-fadeInUp"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{task.title}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          task.priority === 'critical' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                          task.priority === 'high' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' :
                          task.priority === 'medium' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                          'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        }`}>
                          {task.priority}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          task.status === 'done' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                          task.status === 'review' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                          task.status === 'in-progress' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
                          'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                    {task.assignee && (
                      <div className="text-3xl ml-4">{task.assignee.avatar}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style jsx>{`
        .bg-grid-white\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
        
        .delay-100 {
          animation-delay: 100ms;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  )
}