'use client'

import { Project } from '@/lib/mock-data'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Sparkles, Clock, TrendingUp } from 'lucide-react'

interface TimelineProps {
  project: Project
}

export function Timeline({ project }: TimelineProps) {
  const sortedTasks = [...project.allTasks].sort(
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
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl p-8 shadow-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-white">Timeline</h1>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <div className="flex items-center gap-4 text-white/80">
                  <span className="text-sm">{sortedTasks.length} tasks scheduled</span>
                  <span className="text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {upcomingTasks.length} due this week
                  </span>
                </div>
              </div>
            </div>
            
            <Button className="group bg-white text-purple-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 h-auto font-semibold">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Upcoming Tasks Alert */}
        {upcomingTasks.length > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500 animate-fadeInUp">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900 text-lg mb-1">Upcoming Deadlines</h3>
                  <p className="text-amber-700 text-sm">
                    {upcomingTasks.length} task{upcomingTasks.length > 1 ? 's' : ''} due in the next 7 days
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {upcomingTasks.slice(0, 3).map((task) => (
                      <span key={task.id} className="text-xs bg-white px-3 py-1.5 rounded-full text-amber-700 font-medium shadow-sm">
                        {task.title}
                      </span>
                    ))}
                    {upcomingTasks.length > 3 && (
                      <span className="text-xs bg-white px-3 py-1.5 rounded-full text-amber-700 font-medium shadow-sm">
                        +{upcomingTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline by Month */}
        <div className="space-y-8 animate-fadeInUp delay-100">
          {Object.entries(groupedByMonth).map(([month, tasks], monthIndex) => (
            <div key={month} className="space-y-4 animate-fadeInUp" style={{ animationDelay: `${monthIndex * 100}ms` }}>
              {/* Month Header */}
              <div className="sticky top-4 z-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-purple-900">{month}</h2>
                    <p className="text-sm text-purple-600">{tasks.length} task{tasks.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              {/* Tasks for this month */}
              <div className="space-y-4 ml-0 relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-pink-300 to-purple-300"></div>

                {tasks.map((task, taskIndex) => {
                  const daysUntilDue = task.dueDate 
                    ? Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null
                  const isOverdue = daysUntilDue !== null && daysUntilDue < 0
                  const isUpcoming = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7

                  return (
                    <Card 
                      key={task.id} 
                      className={`ml-16 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-fadeInUp ${
                        isOverdue ? 'ring-2 ring-red-500' : isUpcoming ? 'ring-2 ring-amber-500' : ''
                      }`}
                      style={{ animationDelay: `${taskIndex * 50}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Date Badge */}
                          <div className="flex-shrink-0">
                            <div className={`relative w-20 rounded-2xl p-3 text-center shadow-lg ${
                              isOverdue 
                                ? 'bg-gradient-to-br from-red-500 to-red-600' 
                                : isUpcoming
                                ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                                : 'bg-gradient-to-br from-purple-500 to-pink-500'
                            }`}>
                              {task.dueDate ? (
                                <>
                                  <div className="text-white text-xs font-bold uppercase">
                                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short' })}
                                  </div>
                                  <div className="text-white text-2xl font-bold">
                                    {new Date(task.dueDate).getDate()}
                                  </div>
                                  {daysUntilDue !== null && (
                                    <div className="text-white text-xs mt-1 font-medium">
                                      {isOverdue ? `${Math.abs(daysUntilDue)}d ago` : `${daysUntilDue}d left`}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-white text-xs font-bold">No Date</div>
                              )}
                            </div>
                          </div>

                          {/* Task Content */}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <h3 className="font-bold text-gray-900 text-lg">{task.title}</h3>
                              
                              <span className={`text-xs px-3 py-1.5 rounded-full font-semibold shadow-md ${
                                task.priority === 'critical' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                                task.priority === 'high' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' :
                                task.priority === 'medium' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                                'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              }`}>
                                {task.priority}
                              </span>
                              
                              <span className={`text-xs px-3 py-1.5 rounded-full font-semibold shadow-md ${
                                task.status === 'done' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                                task.status === 'review' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                                task.status === 'in-progress' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
                                'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              }`}>
                                {task.status}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed mb-3">
                              {task.description}
                            </p>

                            {/* Subtasks Preview */}
                            {task.subtasks.length > 0 && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                                    <span className="text-xs text-purple-600">✓</span>
                                  </div>
                                  <span className="font-medium">
                                    {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Assignee Avatar */}
                          {task.assignee && (
                            <div className="flex-shrink-0 group">
                              <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                                <div className="relative w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  <span className="text-3xl">{task.assignee.avatar}</span>
                                </div>
                              </div>
                            </div>
                          )}
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
          <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
              <Calendar className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No scheduled tasks</h3>
            <p className="text-gray-500 mb-6">Add due dates to your tasks to see them here</p>
            <Button className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 h-auto font-semibold">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Add Your First Task
            </Button>
          </div>
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
      `}</style>
    </div>
  )
}