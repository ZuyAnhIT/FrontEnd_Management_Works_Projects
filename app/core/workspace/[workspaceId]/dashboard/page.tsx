'use client';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Chào mừng trở lại, {user?.name}! 👋</h1>
        <p className="mt-2 opacity-90">Tổng quan về Công ty ABC</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard icon="👥" title="Tổng thành viên" value="48" color="blue" />
        <DashboardCard icon="🗂️" title="Phòng ban" value="6" color="green" />
        <DashboardCard icon="📁" title="Dự án đang chạy" value="23" color="purple" />
        <DashboardCard icon="✅" title="Công việc" value="187" color="orange" />
      </div>

      {/* Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Dự án gần đây</h2>
          <div className="space-y-3">
            <ProjectItem name="Website Redesign" members={8} tasks={24} progress={65} />
            <ProjectItem name="Mobile App" members={12} tasks={45} progress={42} />
            <ProjectItem name="Marketing Campaign" members={5} tasks={18} progress={88} />
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Công việc của tôi</h2>
          <div className="space-y-3">
            <TaskItem title="Design homepage mockup" project="Website" priority="HIGH" />
            <TaskItem title="Fix login bug" project="Mobile App" priority="HIGHEST" />
            <TaskItem title="Review PR #123" project="Backend API" priority="MEDIUM" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ icon, title, value, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className={`w-12 h-12 ${colors[color]} rounded-lg flex items-center justify-center text-2xl mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function ProjectItem({ name, members, tasks, progress }: any) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
          📁
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{members} thành viên • {tasks} công việc</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">{progress}%</span>
          </div>
        </div>
      </div>
      <span className="text-gray-400">→</span>
    </div>
  );
}

function TaskItem({ title, project, priority }: any) {
  const priorityColors: Record<string, string> = {
    HIGHEST: 'bg-red-100 text-red-700',
    HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    LOW: 'bg-green-100 text-green-700'
  };
  
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex items-center gap-3">
        <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
        <div>
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{project}</p>
        </div>
      </div>
      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[priority]}`}>
        {priority}
      </span>
    </div>
  );
}