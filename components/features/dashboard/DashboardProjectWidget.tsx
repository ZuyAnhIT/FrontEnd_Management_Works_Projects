// components/features/dashboard/DashboardProjectWidget.tsx
"use client";
import { DashboardMyProject } from '@/services/apiDashboard';
import { Briefcase, FolderKanban, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ProjectWidgetProps {
    projects: DashboardMyProject[];
    loading: boolean;
}

export default function DashboardProjectWidget({ projects, loading }: ProjectWidgetProps) {
    
    if (loading) {
        return <div className="p-6 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
    }

    if (projects.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-md border text-center text-gray-500">
                <Briefcase className="w-8 h-8 mx-auto mb-3" />
                <p>Bạn chưa tham gia dự án nào.</p>
            </div>
        );
    }
    
    // Chỉ hiển thị tối đa 5 dự án gần đây
    const recentProjects = projects.slice(0, 5);

    return (
        <div className="space-y-3">
            {recentProjects.map((p) => (
                <Link
                    key={p.projectId}
                    href={`/core/workspace/${p.workspaceId}/project/${p.projectId}/board`}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FolderKanban className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{p.projectName}</p>
                            <p className="text-xs text-gray-500">{p.workspaceName}</p>
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </Link>
            ))}
        </div>
    );
}