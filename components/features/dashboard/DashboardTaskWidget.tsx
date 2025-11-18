// components/features/dashboard/DashboardTaskWidget.tsx
"use client";
import { ListChecks, Clock, Target, Loader2, ChevronRight, Briefcase } from 'lucide-react';
import { DashboardMyTask } from '@/services/apiDashboard';
import Link from 'next/link';

interface TaskWidgetProps {
    tasks: DashboardMyTask[];
    loading: boolean;
}

const priorityColors: Record<string, string> = {
    HIGHEST: 'text-red-600 bg-red-100 border-red-300',
    HIGH: 'text-orange-600 bg-orange-100 border-orange-300',
    MEDIUM: 'text-yellow-600 bg-yellow-100 border-yellow-300',
    LOW: 'text-green-600 bg-green-100 border-green-300',
};

export default function DashboardTaskWidget({ tasks, loading }: TaskWidgetProps) {
    // Chỉ hiển thị tối đa 8 task có độ ưu tiên cao nhất, chưa hoàn thành
    const urgentTasks = tasks
        .filter(t => t.taskStatus !== 'DONE') // Lọc task chưa hoàn thành
        .sort((a, b) => { // Sắp xếp theo mức độ ưu tiên (tùy chọn)
            const priorityOrder = { 'HIGHEST': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 };
            return (priorityOrder[a.taskPriority as keyof typeof priorityOrder] || 5) - 
                   (priorityOrder[b.taskPriority as keyof typeof priorityOrder] || 5);
        })
        .slice(0, 8); // Giới hạn 8 mục

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ListChecks className="w-6 h-6 text-orange-600" />
                    Tasks Khẩn cấp ({urgentTasks.length})
                </h2>
                <Link href="/core/my-tasks" className="text-sm font-medium text-blue-600 hover:underline flex items-center">
                    Xem tất cả
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
            </div>

            {/* ✅ Loại bỏ min-height, để chiều cao tự động co giãn theo nội dung */}
            <div className="divide-y divide-gray-100">
                {loading ? (
                    <div className="py-12 text-center text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </div>
                ) : urgentTasks.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        <Target className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                        <p>Không có công việc khẩn cấp nào cần xử lý.</p>
                    </div>
                ) : (
                    urgentTasks.map((task) => (
                        // ✅ Tối ưu hóa UI cho gọn hơn
                        <div key={task.taskId} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer space-y-2 sm:space-y-0">
                            
                            {/* Title và Context */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex-shrink-0"></div>
                                <div>
                                    <p className="font-medium text-gray-900 line-clamp-1">{task.taskTitle}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Briefcase className="w-3 h-3"/>
                                        {task.projectName}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Priority và Due Date */}
                            <div className="flex flex-shrink-0 items-center gap-3 text-right w-full sm:w-auto sm:justify-end">
                                <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${priorityColors[task.taskPriority]}`}>
                                    {task.taskPriority}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" /> {task.taskDueDate}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}