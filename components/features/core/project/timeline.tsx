'use client'

import { Project } from '@/lib/mock-data'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Clock, AlertTriangle, ChevronRight } from 'lucide-react'

interface TimelineProps {
  project: Project
}

export function Timeline({ project }: TimelineProps) {
  const sortedTasks = [...(project.allTasks || [])].sort(
    (a, b) => new Date(a.dueDate || '2099-01-01').getTime() - new Date(b.dueDate || '2099-01-01').getTime()
  )

  const groupedByMonth = sortedTasks.reduce((acc, task) => {
    if (!task.dueDate) {
      if (!acc['No Date']) acc['No Date'] = []
      acc['No Date'].push(task)
      return acc
    }
    
    const date = new Date(task.dueDate)
    const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    
    if (!acc[monthKey]) acc[monthKey] = []
    acc[monthKey].push(task)
    return acc
  }, {} as Record<string, typeof sortedTasks>)

  const upcomingTasks = sortedTasks.filter(t => {
    if (!t.dueDate) return false
    const daysUntilDue = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilDue >= 0 && daysUntilDue <= 7
  })

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans pb-10">
      <div className="p-8 max-w-[2400px] mx-auto space-y-8">
        
        {/* =====================================================
            HEADER: Clean & Minimalist
        ===================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  Timeline
                </h1>
                <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                    <span>{sortedTasks.length} tasks scheduled</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {upcomingTasks.length} due this week
                    </span>
                </div>
              </div>
           </div>
           
           <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 px-5 font-medium rounded-[3px]">
              <Plus className="w-4 h-4 mr-2" /> Add Task
           </Button>
        </div>

        {/* =====================================================
            UPCOMING ALERT: Flat Design
        ===================================================== */}
        {upcomingTasks.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 border-l-4 border-l-orange-500 rounded-r-lg p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center animate-in fade-in slide-in-from-top-2">
              <div className="p-2 bg-orange-100 rounded-full shrink-0 text-orange-600">
                  <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                  <h3 className="font-bold text-orange-900 text-sm mb-1">Upcoming Deadlines</h3>
                  <p className="text-orange-700 text-sm">
                    You have {upcomingTasks.length} task{upcomingTasks.length > 1 ? 's' : ''} due in the next 7 days.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {upcomingTasks.slice(0, 3).map((task) => (
                      <span key={task.id} className="text-xs bg-white border border-orange-200 px-2 py-1 rounded-md text-orange-800 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.title}
                      </span>
                    ))}
                    {upcomingTasks.length > 3 && (
                      <span className="text-xs text-orange-700 font-medium pt-1 pl-1">
                        +{upcomingTasks.length - 3} more
                      </span>
                    )}
                  </div>
              </div>
          </div>
        )}

        {/* =====================================================
            TIMELINE: Minimalist Vertical Line
        ===================================================== */}
        <div className="space-y-10 pl-2">
          {Object.entries(groupedByMonth).map(([month, tasks]) => (
            <div key={month} className="relative">
              
              {/* Month Header */}
              <div className="sticky top-20 z-10 mb-6 flex items-center gap-4">
                 <div className="w-3 h-3 bg-purple-600 rounded-full ring-4 ring-purple-50 shadow-sm"></div>
                 <h2 className="text-lg font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-md inline-block border border-slate-200/50">
                    {month}
                 </h2>
              </div>

              {/* Timeline Line */}
              <div className="absolute left-1.5 top-3 bottom-0 w-[2px] bg-slate-200 -z-10"></div>

              {/* Tasks List */}
              <div className="space-y-4 pl-8">
                {tasks.map((task) => {
                  const daysUntilDue = task.dueDate 
                    ? Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null
                  const isOverdue = daysUntilDue !== null && daysUntilDue < 0
                  const isUpcoming = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7

                  return (
                    <Card 
                      key={task.id} 
                      className={`
                        border-l-[3px] shadow-sm hover:shadow-md transition-all duration-200 bg-white group cursor-pointer
                        ${isOverdue ? 'border-l-red-500' : isUpcoming ? 'border-l-orange-500' : 'border-l-slate-300'}
                        border-t border-r border-b border-slate-200
                      `}
                    >
                      <CardContent className="p-4 flex items-center gap-6">
                        
                        {/* Date Box */}
                        <div className={`
                            flex flex-col items-center justify-center w-16 h-16 rounded-lg border shrink-0
                            ${isOverdue ? 'bg-red-50 border-red-100 text-red-700' : 
                              isUpcoming ? 'bg-orange-50 border-orange-100 text-orange-700' : 
                              'bg-slate-50 border-slate-200 text-slate-600'}
                        `}>
                             {task.dueDate ? (
                                <>
                                   <span className="text-[10px] font-bold uppercase leading-none">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                                   <span className="text-xl font-bold leading-tight">{new Date(task.dueDate).getDate()}</span>
                                </>
                             ) : (
                                <span className="text-[10px] font-bold">No Date</span>
                             )}
                        </div>

                        {/* Task Info */}
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-blue-600 transition-colors">{task.title}</h3>
                              {daysUntilDue !== null && (
                                 <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    isOverdue ? 'bg-red-100 text-red-700' : 
                                    isUpcoming ? 'bg-orange-100 text-orange-700' : 
                                    'bg-slate-100 text-slate-500'
                                 }`}>
                                    {isOverdue ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d left`}
                                 </span>
                              )}
                           </div>

                           <p className="text-sm text-slate-500 truncate mb-2">{task.description || "No description provided"}</p>

                           {/* Meta Badges */}
                           <div className="flex items-center gap-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold uppercase tracking-wide
                                 ${task.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
                                   task.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                   task.priority === 'medium' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                   'bg-slate-50 text-slate-600 border-slate-200'}
                              `}>
                                 {task.priority}
                              </span>

                              <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold uppercase tracking-wide
                                 ${task.status === 'done' ? 'bg-green-50 text-green-700 border-green-200' :
                                   task.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                   'bg-slate-50 text-slate-600 border-slate-200'}
                              `}>
                                 {task.status}
                              </span>
                           </div>
                        </div>

                        {/* Assignee & Chevron */}
                        <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-slate-100">
                           {task.assignee && (
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm" title={task.assignee.name}>
                                 {task.assignee.avatar}
                              </div>
                           )}
                           <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>

                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 rounded-xl bg-white">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No scheduled tasks</h3>
            <p className="text-slate-500 text-sm mb-6">Add due dates to your tasks to see them on the timeline</p>
            <Button variant="outline" className="border-slate-300 text-slate-700">
              <Plus className="w-4 h-4 mr-2" /> Create Task
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}