'use client'

import { Project } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Sparkles, TrendingUp, CheckCircle, Clock, Target, Zap, LayoutGrid, Layers, AlertCircle } from 'lucide-react'

interface DashboardProps {
  project: Project
}

export function Dashboard({ project }: DashboardProps) {
  const activeSprint = project.sprints.find((s) => s.status === 'active')
  const allTasks = project.allTasks || [] // Fallback empty array

  // Thống kê theo trạng thái
  const tasksByStatus = {
    todo: allTasks.filter((t) => ['todo', 'to do'].includes(t.status.toLowerCase())).length,
    'in-progress': allTasks.filter((t) => ['in-progress', 'in progress', 'doing'].includes(t.status.toLowerCase())).length,
    review: allTasks.filter((t) => t.status.toLowerCase() === 'review').length,
    done: allTasks.filter((t) => ['done', 'completed'].includes(t.status.toLowerCase())).length,
  }

  const statusData = [
    { name: 'To Do', value: tasksByStatus.todo, fill: '#94a3b8' }, // Slate-400
    { name: 'In Progress', value: tasksByStatus['in-progress'], fill: '#3b82f6' }, // Blue-500
    { name: 'Review', value: tasksByStatus.review, fill: '#f59e0b' }, // Amber-500
    { name: 'Done', value: tasksByStatus.done, fill: '#10b981' }, // Emerald-500
  ].filter(item => item.value > 0); // Chỉ hiện trạng thái có dữ liệu

  // Thống kê theo độ ưu tiên
  const tasksByPriority = {
    low: allTasks.filter((t) => t.priority.toLowerCase() === 'low').length,
    medium: allTasks.filter((t) => t.priority.toLowerCase() === 'medium').length,
    high: allTasks.filter((t) => t.priority.toLowerCase() === 'high').length,
    critical: allTasks.filter((t) => t.priority.toLowerCase() === 'critical').length,
  }

  const priorityData = [
    { name: 'Low', value: tasksByPriority.low, fill: '#94a3b8' },
    { name: 'Medium', value: tasksByPriority.medium, fill: '#3b82f6' },
    { name: 'High', value: tasksByPriority.high, fill: '#f97316' },
    { name: 'Critical', value: tasksByPriority.critical, fill: '#ef4444' },
  ]

  const completionRate = allTasks.length > 0 ? Math.round((tasksByStatus.done / allTasks.length) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans pb-10">
      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* =====================================================
            HEADER: Clean & Minimalist
        ===================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <LayoutGrid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  {project.name}
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">{project.description || "Project Overview & Statistics"}</p>
              </div>
           </div>
           
           {/* Quick info tag */}
           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md border border-slate-200">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">Last updated: Just now</span>
           </div>
        </div>

        {/* =====================================================
            QUICK STATS: Flat Cards
        ===================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Tasks */}
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center justify-between">
               <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Tasks</p>
                  <h3 className="text-3xl font-bold text-slate-900">{allTasks.length}</h3>
               </div>
               <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                  <Layers className="w-6 h-6 text-blue-600" />
               </div>
            </CardContent>
            <div className="px-6 pb-4">
               <div className="text-xs text-slate-500 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Across all sprints
               </div>
            </div>
          </Card>

          {/* In Progress */}
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center justify-between">
               <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">In Progress</p>
                  <h3 className="text-3xl font-bold text-slate-900">{tasksByStatus['in-progress']}</h3>
               </div>
               <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                  <Zap className="w-6 h-6 text-amber-500" />
               </div>
            </CardContent>
             <div className="px-6 pb-4">
               <div className="text-xs text-slate-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-500" />
                  Active work items
               </div>
            </div>
          </Card>

          {/* Completed */}
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center justify-between">
               <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Done</p>
                  <h3 className="text-3xl font-bold text-slate-900">{tasksByStatus.done}</h3>
               </div>
               <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600" />
               </div>
            </CardContent>
            <div className="px-6 pb-4">
               <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: `${completionRate}%` }}></div>
               </div>
               <p className="text-xs text-slate-500 mt-2">{completionRate}% completion rate</p>
            </div>
          </Card>

          {/* Active Sprint */}
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-slate-50/50">
            <CardContent className="p-6 flex items-center justify-between">
               <div className="overflow-hidden">
                  <p className="text-sm font-medium text-slate-500 mb-1">Active Sprint</p>
                  <h3 className="text-xl font-bold text-slate-900 truncate" title={activeSprint?.name}>
                     {activeSprint?.name || 'No Active Sprint'}
                  </h3>
               </div>
               <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100 shrink-0">
                  <Target className="w-6 h-6 text-purple-600" />
               </div>
            </CardContent>
            <div className="px-6 pb-4">
               {activeSprint ? (
                   <p className="text-xs text-slate-500 flex items-center gap-1">
                       <Clock className="w-3 h-3" />
                       Ends in {Math.max(0, Math.ceil((new Date(activeSprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                   </p>
               ) : (
                   <p className="text-xs text-slate-400 italic">Start a sprint to see details</p>
               )}
            </div>
          </Card>
        </div>

        {/* =====================================================
            CHARTS SECTION
        ===================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Status Distribution (Pie Chart) */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
               <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  Task Status
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 min-h-[300px]">
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
                        <Cell key={`cell-${index}`} fill={entry.fill} />
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

          {/* Priority Distribution (Bar Chart) */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
               <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                  Task Priority
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 min-h-[300px]">
               <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#64748b' }} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#64748b' }} 
                    />
                    <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* =====================================================
            ACTIVE SPRINT TASKS (List)
        ===================================================== */}
        {activeSprint && activeSprint.tasks.length > 0 && (
           <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-slate-800">
                       Work in Progress (Active Sprint)
                    </CardTitle>
                    <span className="text-xs font-medium px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                       {activeSprint.tasks.length} issues
                    </span>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-slate-100">
                    {activeSprint.tasks.slice(0, 5).map((task) => (
                       <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                             {/* Status Icon */}
                             {task.status === 'done' ? (
                                <div className="w-5 h-5 rounded bg-green-100 flex items-center justify-center shrink-0">
                                   <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                </div>
                             ) : task.status === 'in-progress' ? (
                                <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center shrink-0">
                                   <Clock className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                             ) : (
                                <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center shrink-0">
                                   <div className="w-2.5 h-2.5 rounded-sm border border-slate-400"></div>
                                </div>
                             )}
                             
                             <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{task.id}</p>
                             </div>
                          </div>

                          {/* Priority Badge */}
                          <span className={`
                             px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border shrink-0
                             ${task.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : 
                               task.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                               task.priority === 'medium' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                               'bg-slate-100 text-slate-600 border-slate-200'}
                          `}>
                             {task.priority}
                          </span>
                       </div>
                    ))}
                 </div>
                 {activeSprint.tasks.length > 5 && (
                    <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                       <button className="text-xs font-medium text-blue-600 hover:underline">View all tasks</button>
                    </div>
                 )}
              </CardContent>
           </Card>
        )}

      </div>
    </div>
  )
}