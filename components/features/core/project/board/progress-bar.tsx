interface ProgressBarProps {
  completedTasks: number
  totalTasks: number
  inProgressTasks: number
  completionRate: number
}

export function ProgressBar({
  completedTasks,
  totalTasks,
  inProgressTasks,
  completionRate,
}: ProgressBarProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 animate-fadeInUp delay-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Overall Progress</h3>
          <p className="text-sm text-gray-500 mt-1">
            {completedTasks} of {totalTasks} tasks completed • {inProgressTasks}{' '}
            in progress
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {completionRate}%
          </div>
          <p className="text-xs text-gray-500 mt-1">Completion Rate</p>
        </div>
      </div>
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
          style={{ width: `${completionRate}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>

      <style jsx>{`
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
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

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  )
}
