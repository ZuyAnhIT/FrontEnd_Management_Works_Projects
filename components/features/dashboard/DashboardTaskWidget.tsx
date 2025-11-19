"use client";
import { ListChecks, Clock, Target, Loader2, ChevronRight, Briefcase, CheckSquare } from 'lucide-react';
import { DashboardMyTask } from '@/services/apiDashboard';
import Link from 'next/link';

interface TaskWidgetProps {
    tasks: DashboardMyTask[];
    loading: boolean;
}

// Hệ màu Minimalist (Jira Style): Text đậm, background nhạt, border rõ
const priorityStyles: Record<string, string> = {
    HIGHEST: 'text-red-700 bg-red-50 border-red-200',
    HIGH: 'text-orange-700 bg-orange-50 border-orange-200',
    MEDIUM: 'text-blue-700 bg-blue-50 border-blue-200',
    LOW: 'text-slate-600 bg-slate-100 border-slate-200',
};

export default function DashboardTaskWidget({ tasks, loading }: TaskWidgetProps) {
    // Lọc và sắp xếp task
    const urgentTasks = tasks
        .filter(t => t.taskStatus !== 'DONE')
        .sort((a, b) => {
            const priorityOrder: Record<string, number> = { 'HIGHEST': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 };
            return (priorityOrder[a.taskPriority] || 5) - (priorityOrder[b.taskPriority] || 5);
        })
        .slice(0, 8);

    return (
        // Container: Nền trắng, viền xám, shadow nhẹ
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-slate-500" />
                    Urgent Tasks
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {urgentTasks.length}
                    </span>
                </h2>
                <Link href="/core/my-tasks" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center transition-colors">
                    View all <ChevronRight className="w-3 h-3 ml-0.5" />
                </Link>
            </div>

            {/* Content List */}
            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                {loading ? (
                    <div className="py-12 flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                ) : urgentTasks.length === 0 ? (
                    <div className="py-16 text-center px-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                            <Target className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">No urgent tasks pending.</p>
                        <p className="text-xs text-slate-400 mt-1">Great job! You're all caught up.</p>
                    </div>
                ) : (
                    urgentTasks.map((task) => (
                        <Link 
                            href={`/core/workspace/${task.workspaceId}/project/${task.projectId}/board`} // Giả sử link tới board
                            key={task.taskId} 
                            className="group block p-4 hover:bg-slate-50 transition-all cursor-pointer relative"
                        >
                            <div className="flex items-start justify-between gap-4">
                                
                                {/* Left: Checkbox & Info */}
                                <div className="flex items-start gap-3 min-w-0">
                                    {/* Fake Checkbox Icon */}
                                    <div className="mt-0.5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0">
                                        <CheckSquare className="w-4 h-4" />
                                    </div>
                                    
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors truncate pr-2 leading-tight">
                                            {task.taskTitle}
                                        </p>
                                        
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                                            <div className="flex items-center gap-1 hover:text-slate-700 transition-colors" title="Project">
                                                <Briefcase className="w-3 h-3" />
                                                <span className="truncate max-w-[120px]">{task.projectName}</span>
                                            </div>
                                            
                                            {/* Priority Badge (Mobile/Compact) */}
                                            <span className={`inline-flex sm:hidden px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase ${priorityStyles[task.taskPriority]}`}>
                                                {task.taskPriority.slice(0, 1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Meta Data (Desktop) */}
                                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${priorityStyles[task.taskPriority]}`}>
                                        {task.taskPriority}
                                    </span>
                                    
                                    <div className={`flex items-center gap-1 text-xs font-medium ${
                                        new Date(task.taskDueDate).getTime() < Date.now() ? 'text-red-600' : 'text-slate-400'
                                    }`}>
                                        <Clock className="w-3 h-3" />
                                        {task.taskDueDate}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}