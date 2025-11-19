import { Button } from '@/components/ui/button'
import { Filter, LayoutGrid, Sparkles, TrendingUp, Zap } from 'lucide-react'

interface BoardHeaderProps {
  totalTasks: number
  completionRate: number
  inProgressTasks: number
  columnsCount: number
}

export function BoardHeader({
  totalTasks,
  completionRate,
  inProgressTasks,
  columnsCount,
}: BoardHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl p-8 shadow-2xl animate-fadeIn">
      <div className="absolute inset-0 bg-grid-white/10"></div>
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -left-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
              <LayoutGrid className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-white">Task Board</h1>
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <span className="text-sm font-medium flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  {totalTasks} total tasks
                </span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {completionRate}% complete
                </span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {inProgressTasks} active
                </span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <LayoutGrid className="w-4 h-4" />
                  {columnsCount} columns
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-pink-200/20 shadow-lg px-4 py-2 h-auto font-medium"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-white\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }
      `}</style>
    </div>
  )
}
