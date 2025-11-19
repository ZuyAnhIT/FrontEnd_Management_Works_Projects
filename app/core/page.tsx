"use client";

import { useEffect, useState } from "react";
import { 
  Users, FolderKanban, Briefcase, Target, 
  Clock, Layout, Loader2, CheckCircle, Zap 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { 
  getDashboardWorkspaces, 
  getDashboardMyTasks, 
  getDashboardMyProjects, 
  getDashboardCompanies, 
  DashboardMyTask, 
  DashboardWorkspace 
} from "@/services/apiDashboard"; 
import WorkspaceCard from "@/components/features/core/workspace/WorkspaceCard"; 
import DashboardTaskWidget from "@/components/features/dashboard/DashboardTaskWidget"; 
import DashboardProjectWidget from "@/components/features/dashboard/DashboardProjectWidget"; 
import StatsCard, { StatsCardVariant } from "@/components/features/admin/StartsCard"; // Giả sử đã có component này

interface DashboardData {
  workspaces: DashboardWorkspace[];
  tasks: DashboardMyTask[];
  projects: any[];
  company: any[];
}

export default function CoreDashboardPage() {
  const { showToast } = useToast();
  const { user, isLoading: isAuthLoading, role } = useAuth();

  const [data, setData] = useState<DashboardData>({
      workspaces: [], tasks: [], projects: [], company: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [workspacesRes, tasksRes, projectsRes, companyRes] = await Promise.all([
            getDashboardWorkspaces(),
            getDashboardMyTasks(),
            getDashboardMyProjects(),
            getDashboardCompanies(),
        ]);
        
        setData({
          workspaces: workspacesRes || [],
          tasks: tasksRes || [],
          projects: projectsRes || [],
          company: companyRes || [],
        });

      } catch (err: any) {
        showToast(err.message || "Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthLoading, showToast]); 

  const totalWorkspaces = data.workspaces.length;
  const totalProjects = data.projects.length; 
  const totalTasks = data.tasks.length;
  const company = data.company[0]; 

  if (isAuthLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
    
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* 1. Header Section */}
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Your Work
          </h1>
          <p className="text-slate-500 text-sm">
             Welcome back, <span className="font-semibold text-slate-700">{user?.fullName}</span>. Here's what's happening today.
          </p>
        </div>

        {/* 2. Stats Row (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
                icon={Clock} 
                label="My Open Tasks" 
                value={totalTasks} 
                variant="orange"
            />
            <StatsCard 
                icon={Briefcase} 
                label="Active Projects" 
                value={totalProjects} 
                variant="purple" 
            />
            <StatsCard 
                icon={FolderKanban} 
                label="Workspaces" 
                value={totalWorkspaces} 
                variant="blue" 
            />
            <StatsCard 
                icon={Layout} 
                label="Company" 
                value={company?.companyName || "N/A"} 
                variant="green" 
            />
        </div>
        
        {/* 3. Main Content Layout (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (Task & Projects) - Chiếm 2/3 */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* 3a. Tasks Widget */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Recent Tasks</h2>
                    </div>
                    <DashboardTaskWidget tasks={data.tasks} loading={loading} />
                </section>

                {/* 3b. Projects Widget */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Recent Projects</h2>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1">
                       <DashboardProjectWidget projects={data.projects} loading={loading} />
                    </div>
                </section>
            </div>

            {/* Right Column (Workspaces) - Chiếm 1/3 */}
            <div className="space-y-8">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Workspaces</h2>
                        <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{totalWorkspaces}</span>
                    </div>
                    
                    {data.workspaces.length === 0 ? (
                         <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                            <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 font-medium">No workspaces yet.</p>
                         </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {data.workspaces.map((ws) => (
                                <WorkspaceCard 
                                    key={ws.workspaceId}
                                    workspace={ws} 
                                    onNavigate={(id: number) => window.location.href = `/core/workspace/${id}`}
                                    viewMode="list" 
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>

        </div>
      </div>
    </div>
  );
}