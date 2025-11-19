"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getWorkspaceDetail } from "@/services/apiWorkspace";
import {
  Settings,
  FolderKanban,
  Users,
  Clock,
  Target,
  Loader2,
  TrendingUp,
  BarChart3,
  Briefcase,
  Layout,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Giả sử có

export default function WorkspaceOverviewPage() {
  const { showToast } = useToast();
  const params = useParams();
  const workspaceId = Number(params.workspaceId);

  const { user, isLoading: isAuthLoading } = useAuth();
  const companyId = user?.company?.companyId || null;

  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<any>(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!companyId || !workspaceId) {
      if (!isAuthLoading)
        showToast("Workspace not found", "error");
      setLoading(false);
      return;
    }

    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        const data = await getWorkspaceDetail(companyId, workspaceId);
        setWorkspace(data); // data thực tế từ API
      } catch (err: any) {
        showToast(err.message || "Failed to load workspace info", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [companyId, workspaceId, isAuthLoading, showToast]);

  if (isAuthLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );

  if (!workspace)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500">
        Workspace data unavailable.
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        
        {/* 1. HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-start gap-5">
              {/* Workspace Icon */}
              <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
                 <FolderKanban className="w-8 h-8 text-white" />
              </div>
              
              {/* Title & Meta */}
              <div>
                 <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                    {workspace.workspaceName}
                 </h1>
                 <p className="text-sm text-slate-500 mt-1 font-mono">
                    /{workspace.workspaceName.toLowerCase().replace(/\s/g, "-")}
                 </p>
                 <p className="text-sm text-slate-500 mt-2 max-w-2xl line-clamp-2">
                    {workspace.description || "No description provided for this workspace."}
                 </p>
              </div>
           </div>

           {/* Actions */}
           <div className="flex gap-3">
              <button
                 onClick={() => showToast("Settings feature coming soon", "info")}
                 className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-md text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              >
                 <Settings className="w-4 h-4" />
                 Settings
              </button>
           </div>
        </div>

        {/* 2. STATS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           
           {/* Projects Card */}
           <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                       <p className="text-sm font-medium text-slate-500">Active Projects</p>
                       <h3 className="text-3xl font-bold text-slate-900 mt-1">
                          {workspace.projectCount || 0}
                       </h3>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                       <Briefcase className="w-5 h-5" />
                    </div>
                 </div>
                 <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>+2 new this week</span>
                 </div>
              </CardContent>
           </Card>

           {/* Members Card */}
           <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                       <p className="text-sm font-medium text-slate-500">Team Members</p>
                       <h3 className="text-3xl font-bold text-slate-900 mt-1">
                          {workspace.memberCount || 0}
                       </h3>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                       <Users className="w-5 h-5" />
                    </div>
                 </div>
                 <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>Growing team</span>
                 </div>
              </CardContent>
           </Card>

           {/* Tasks Card */}
           <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                       <p className="text-sm font-medium text-slate-500">Total Tasks</p>
                       <h3 className="text-3xl font-bold text-slate-900 mt-1">
                          {workspace.taskCount || 0}
                       </h3>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                       <Layout className="w-5 h-5" />
                    </div>
                 </div>
                 <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Updated just now</span>
                 </div>
              </CardContent>
           </Card>

           {/* Completion Rate Card */}
           <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                       <p className="text-sm font-medium text-slate-500">Completion Rate</p>
                       <h3 className="text-3xl font-bold text-slate-900 mt-1">
                          {workspace.completionRate || 0}%
                       </h3>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                       <Target className="w-5 h-5" />
                    </div>
                 </div>
                 <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div 
                       className="h-full bg-orange-500 rounded-full" 
                       style={{ width: `${workspace.completionRate || 0}%` }}
                    ></div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* 3. QUICK ACTIONS GRID */}
        <div>
           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Manage Members */}
              <div 
                 onClick={() => showToast("Coming soon", "info")}
                 className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-start gap-4"
              >
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Users className="w-6 h-6" />
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center justify-between">
                       Manage Members <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">Add, remove or update member roles.</p>
                 </div>
              </div>

              {/* Reports */}
              <div 
                 onClick={() => showToast("Coming soon", "info")}
                 className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all cursor-pointer flex items-start gap-4"
              >
                 <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                    <BarChart3 className="w-6 h-6" />
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-green-700 transition-colors flex items-center justify-between">
                       Reports & Analytics <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">View detailed progress and performance stats.</p>
                 </div>
              </div>

              {/* Configuration */}
              <div 
                 onClick={() => showToast("Coming soon", "info")}
                 className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex items-start gap-4"
              >
                 <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                    <Settings className="w-6 h-6" />
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors flex items-center justify-between">
                       Workspace Settings <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">Configure workflows, permissions and more.</p>
                 </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}