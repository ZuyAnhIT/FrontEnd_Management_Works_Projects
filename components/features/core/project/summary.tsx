'use client'

import { Project } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Sparkles, TrendingUp, CheckCircle2, Clock, Target, Zap, BarChart3, AlertCircle, Users, LayoutGrid, Layers } from 'lucide-react'

interface SummaryProps {
  project: Project
}

export function Summary({ project }: SummaryProps) {
  const allTasks = project.allTasks || []

  // Sprint completion data
  const sprintData = project.sprints.map((sprint) => ({
    name: sprint.name,
    completed: sprint.tasks.filter((t) => t.status === 'done').length,
    inProgress: sprint.tasks.filter((t) => t.status === 'in-progress').length,
    todo: sprint.tasks.filter((t) => t.status === 'todo').length,
    total: sprint.tasks.length,
  }))

  // Task status distribution
  const tasksByStatus = {
    todo: allTasks.filter((t) => ['todo', 'to do'].includes(t.status.toLowerCase())).length,
    'in-progress': allTasks.filter((t) => ['in-progress', 'in progress', 'doing'].includes(t.status.toLowerCase())).length,
    review: allTasks.filter((t) => t.status.toLowerCase() === 'review').length,
    done: allTasks.filter((t) => ['done', 'completed'].includes(t.status.toLowerCase())).length,
  }

  const statusData = [
    { name: 'Done', value: tasksByStatus.done, color: '#10b981' },
    { name: 'In Progress', value: tasksByStatus['in-progress'], color: '#3b82f6' }, // Changed to Blue
    { name: 'Review', value: tasksByStatus.review, color: '#f59e0b' }, // Changed to Amber
    { name: 'To Do', value: tasksByStatus.todo, color: '#94a3b8' }, // Changed to Slate
  ].filter(item => item.value > 0)

  // Priority distribution
  const tasksByPriority = {
    low: allTasks.filter((t) => t.priority.toLowerCase() === 'low').length,
    medium: allTasks.filter((t) => t.priority.toLowerCase() === 'medium').length,
    high: allTasks.filter((t) => t.priority.toLowerCase() === 'high').length,
    critical: allTasks.filter((t) => t.priority.toLowerCase() === 'critical').length,
  }

  const priorityData = [
    { name: 'Critical', value: tasksByPriority.critical, color: '#ef4444' },
    { name: 'High', value: tasksByPriority.high, color: '#f97316' },
    { name: 'Medium', value: tasksByPriority.medium, color: '#3b82f6' },
    { name: 'Low', value: tasksByPriority.low, color: '#94a3b8' },
  ]

  // Team workload
  const assigneeStats = allTasks.reduce((acc, task) => {
    if (task.assignee) {
      const existing = acc.find((a) => a.id === task.assignee!.id)
      if (existing) {
        existing.tasks++
        if (['done', 'completed'].includes(task.status.toLowerCase())) existing.completed++
      } else {
        acc.push({ 
          id: task.assignee.id, 
          name: task.assignee.name, 
          avatar: task.assignee.avatar, 
          tasks: 1,
          completed: ['done', 'completed'].includes(task.status.toLowerCase()) ? 1 : 0
        })
      }
    }
    return acc
  }, [] as Array<{ id: string; name: string; avatar: string; tasks: number; completed: number }>)

  const completionRate = allTasks.length > 0 
    ? Math.round((tasksByStatus.done / allTasks.length) * 100) 
    : 0
  
  const activeSprint = project.sprints.find((s) => s.status === 'active')

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans pb-10">
      <div className="p-8 max-w-[2400px] mx-auto space-y-8">

        {/* Header - Clean & Minimalist */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  Summary & Analytics
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">Project performance and team insights</p>
              </div>
           </div>
           
           {/* Quick info tag */}
           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md border border-slate-200">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">Last updated: Just now</span>
           </div>
        </div>

        {/* Key Metrics - Flat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Total Tasks */}
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white">
            <CardContent className="p-6 flex items-center justify-between">
               <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Tasks</p>
                  <h3 className="text-3xl font-bold text-slate-900">{allTasks.length}</h3>
               </div>
               <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                  <Target className="w-6 h-6 text-blue-600" />
               </div>
            </CardContent>
             <div className="px-6 pb-4">
               <div className="text-xs text-slate-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-blue-500" />
                  Across all sprints
               </div>
            </div>
          </Card>

          {/* Completed */}
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white">
            <CardContent className="p-6 flex items-center justify-between">
               <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Completed</p>
                  <h3 className="text-3xl font-bold text-slate-900">{tasksByStatus.done}</h3>
               </div>
               <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
               </div>
            </CardContent>
             <div className="px-6 pb-4">
               <div className="text-xs text-slate-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  Tasks finished
               </div>
            </div>
          </Card>

          {/* In Progress */}
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white">
            <CardContent className="p-6 flex items-center justify-between">
               <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">In Progress</p>
                  <h3 className="text-3xl font-bold text-slate-900">{tasksByStatus['in-progress']}</h3>
               </div>
               <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                  <Clock className="w-6 h-6 text-amber-500" />
               </div>
            </CardContent>
             <div className="px-6 pb-4">
               <div className="text-xs text-slate-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-500" />
                  {Math.round((tasksByStatus['in-progress'] / (allTasks.length || 1)) * 100)}% of total
               </div>
            </div>
          </Card>

          {/* Completion Rate */}
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white">
            <CardContent className="p-6 flex items-center justify-between">
               <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Completion Rate</p>
                  <h3 className="text-3xl font-bold text-slate-900">{completionRate}%</h3>
               </div>
               <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
               </div>
            </CardContent>
             <div className="px-6 pb-4">
               <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${completionRate}%` }}></div>
               </div>
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Sprint Progress - Bar Chart */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
               <div className="flex items-center justify-between">
                   <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-slate-500" />
                      Sprint Progress
                   </CardTitle>
               </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sprintData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle"/>
                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="todo" fill="#94a3b8" name="To Do" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Task Status - Pie Chart */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
               <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-500" />
                  Task Status Distribution
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                  />
                   <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span className="text-xs text-slate-600 font-medium ml-1">{value}</span>}
                    />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        {/* Workload & Priority */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Team Workload */}
            <Card className="border border-slate-200 shadow-sm lg:col-span-2">
                <CardHeader className="border-b border-slate-100 pb-4">
                   <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      Team Workload
                   </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                    {assigneeStats.sort((a, b) => b.tasks - a.tasks).map((assignee) => {
                        const completionRate = Math.round((assignee.completed / assignee.tasks) * 100) || 0
                        const maxTasks = Math.max(...assigneeStats.map(a => a.tasks)) || 1

                        return (
                            <div key={assignee.id} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg shrink-0 border border-slate-200">
                                    {assignee.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="font-semibold text-sm text-slate-900 truncate">{assignee.name}</span>
                                        <span className="text-xs text-slate-500 font-medium">{assignee.completed}/{assignee.tasks} tasks</span>
                                    </div>
                                    <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        {/* Total Load Bar */}
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-blue-200 rounded-full" 
                                            style={{ width: `${(assignee.tasks / maxTasks) * 100}%` }}
                                        ></div>
                                        {/* Completed Load Bar */}
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-blue-600 rounded-full" 
                                            style={{ width: `${(assignee.completed / maxTasks) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="w-12 text-right shrink-0">
                                    <span className="text-sm font-bold text-slate-700">{completionRate}%</span>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* Priority Stats */}
            <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-4">
                   <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-slate-500" />
                      Task Priority
                   </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {priorityData.map((priority) => (
                            <div key={priority.name} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: priority.color }}></div>
                                    <span className="text-sm font-medium text-slate-700">{priority.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400">
                                        {Math.round((priority.value / (allTasks.length || 1)) * 100)}%
                                    </span>
                                    <span className="text-sm font-bold text-slate-900">{priority.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  )
}