'use client'

import { useState } from 'react'
import { Project } from '@/lib/mock-data'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, GitBranch, Sparkles, TrendingUp, ChevronDown, ChevronRight, Calendar, Target, CheckCircle2 } from 'lucide-react'

interface SprintsProps {
  project: Project
}

export function Sprints({ project }: SprintsProps) {
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set())

  const toggleExpand = (sprintId: string) => {
    const newExpanded = new Set(expandedSprints)
    newExpanded.has(sprintId) ? newExpanded.delete(sprintId) : newExpanded.add(sprintId)
    setExpandedSprints(newExpanded)
  }

  const activeSprints = project.sprints.filter(s => s.status === 'active')
  const completedSprints = project.sprints.filter(s => s.status === 'completed')

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
                <GitBranch className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-white">Sprints</h1>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <div className="flex items-center gap-4 text-white/80">
                  <span className="text-sm">{project.sprints.length} total sprints</span>
                  <span className="text-sm flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {activeSprints.length} active
                  </span>
                </div>
              </div>
            </div>

            <Button className="group bg-white text-purple-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 h-auto font-semibold">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              New Sprint
            </Button>
          </div>
        </div>

        {/* Sprint Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeInUp">

          {/* Active Sprint */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Sprints</p>
                  <p className="text-3xl font-bold text-purple-600">{activeSprints.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{completedSprints.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Planned */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Planned</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Sprint List */}
        <div className="space-y-6 animate-fadeInUp delay-100">
          {project.sprints.map((sprint, index) => {
            const isExpanded = expandedSprints.has(sprint.id)
            const completedTasks = sprint.tasks.filter(t => t.status === 'done').length
            const totalTasks = sprint.tasks.length
            const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

            const startDate = new Date(sprint.startDate)
            const endDate = new Date(sprint.endDate)

            return (
              <Card key={sprint.id} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] overflow-hidden animate-fadeInUp"
                style={{ animationDelay: `${index * 50}ms` }}>

                <CardContent className="p-0">

                  {/* Sprint Header */}
                  <div className={`bg-gradient-to-r p-6 ${
                    sprint.status === 'active'
                      ? 'from-purple-500 to-pink-500'
                      : sprint.status === 'completed'
                      ? 'from-green-500 to-emerald-500'
                      : 'from-blue-500 to-cyan-500'
                  }`}>

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-white">{sprint.name}</h2>

                          <span className="text-xs px-3 py-1.5 rounded-full font-semibold shadow-md bg-white/20 backdrop-blur-sm text-white">
                            {sprint.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-4 h-4 text-white/80" />
                          <p className="text-white/90 text-sm">{sprint.goal}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-white/70 text-xs mb-1">Start Date</p>
                            <p className="text-white font-semibold">{startDate.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-white/70 text-xs mb-1">End Date</p>
                            <p className="text-white font-semibold">{endDate.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-white/70 text-xs mb-1">Tasks</p>
                            <p className="text-white font-semibold">{totalTasks} tasks</p>
                          </div>
                          <div>
                            <p className="text-white/70 text-xs mb-1">Progress</p>
                            <p className="text-white font-semibold">{completionRate}% complete</p>
                          </div>
                        </div>
                      </div>

                      {/* Expand button */}
                      <button
                        onClick={() => toggleExpand(sprint.id)}
                        className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-2xl hover:bg-white/30 transition-all duration-300 group shadow-lg"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                        )}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-lg"
                        style={{ width: `${completionRate}%` }}>
                      </div>
                    </div>

                  </div>

                  {/* Sprint Tasks */}
                  {isExpanded && (
                    <div className="p-6 bg-gradient-to-b from-purple-50 to-pink-50">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{totalTasks}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Sprint Tasks</h3>
                        <span className="text-sm text-gray-500">({completedTasks} completed)</span>
                      </div>

                      <div className="space-y-3">
                        {sprint.tasks.map((task, taskIndex) => (
                          <div key={task.id}
                            className="p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-md transition-all duration-300 animate-fadeInUp"
                            style={{ animationDelay: `${taskIndex * 30}ms` }}>

                            <div className="flex items-start justify-between gap-4">

                              <div className="flex-1">

                                {/* Task Badges */}
                                <div className="flex flex-wrap items-center gap-2 mb-2">

                                  <h4 className="font-bold text-gray-900">{task.title}</h4>

                                  {/* Priority */}
                                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                    task.priority === 'critical'
                                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                                      : task.priority === 'high'
                                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                                      : task.priority === 'medium'
                                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                                  }`}>
                                    {task.priority}
                                  </span>

                                  {/* Status */}
                                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                    task.status === 'done'
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                      : task.status === 'review'
                                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                      : task.status === 'in-progress'
                                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                      : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                                  }`}>
                                    {task.status}
                                  </span>

                                </div>

                                <p className="text-sm text-gray-600">{task.description}</p>
                              </div>

                              {/* Avatar */}
                              {task.assignee && (
                                <div className="flex-shrink-0 group">
                                  <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                                    <div className="relative w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                      <span className="text-2xl">{task.assignee.avatar}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {project.sprints.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
              <GitBranch className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No sprints yet</h3>
            <p className="text-gray-500 mb-6">Create your first sprint to organize your work</p>
            <Button className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 h-auto font-semibold">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Create Your First Sprint
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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out; }
        .delay-100 { animation-delay: 100ms; }
      `}</style>
    </div>
  )
}
