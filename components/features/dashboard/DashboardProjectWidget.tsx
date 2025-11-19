"use client";
import { DashboardMyProject } from '@/services/apiDashboard';
import { Briefcase, FolderKanban, Loader2, ArrowRight, Layout } from 'lucide-react';
import Link from 'next/link';

interface ProjectWidgetProps {
    projects: DashboardMyProject[];
    loading: boolean;
}

export default function DashboardProjectWidget({ projects, loading }: ProjectWidgetProps) {
    
    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 border border-slate-100">
                    <Briefcase className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Bạn chưa tham gia dự án nào.</p>
            </div>
        );
    }
    
    // Chỉ hiển thị tối đa 5 dự án gần đây
    const recentProjects = projects.slice(0, 5);

    return (
        <div className="flex flex-col space-y-1">
            {recentProjects.map((p) => (
                <Link
                    key={p.projectId}
                    href={`/core/workspace/${p.workspaceId}/project/${p.projectId}/board`}
                    className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
                >
                    <div className="flex items-center gap-3.5">
                        {/* Project Avatar Style */}
                        <div className="w-9 h-9 bg-blue-600 rounded-md flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                            <FolderKanban className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                                {p.projectName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">
                                {p.workspaceName}
                            </span>
                        </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>
            ))}
        </div>
    );
}