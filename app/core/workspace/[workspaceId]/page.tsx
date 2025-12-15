"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getWorkspaceDetail } from "@/services/apiWorkspace";
import Link from "next/link";
import {
  Settings,
  FolderKanban,
  Users,
  Loader2,
  Briefcase,
  UserPlus,
  ChevronRight,
  Layout,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Buttons";

// =================================================================
// 1. CONFIG & STYLES
// =================================================================

// 2. Action Links Config
const getActionLinks = (workspaceId: number) => [
  {
    icon: FolderKanban,
    title: "Projects",
    desc: "Manage projects, tasks, and sprints within this workspace.",
    href: `/core/workspace/${workspaceId}/project`,
    variant: "blue",
  },
  {
    icon: Users,
    title: "Members",
    desc: "Invite team members and manage permissions.",
    href: `/core/workspace/${workspaceId}/members`,
    variant: "green",
  },
  {
    icon: Settings,
    title: "Settings",
    desc: "Update workspace details and configurations.",
    href: `/core/workspace/${workspaceId}/settings`,
    variant: "purple",
  },
  {
    icon: Layout, // Hoặc icon khác phù hợp
    title: "Reports (Coming Soon)",
    desc: "View detailed analytics and progress reports.",
    href: "#", // Placeholder
    variant: "orange",
    disabled: true,
  },
];

const variantStyles: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
  green: "bg-green-50 text-green-600 group-hover:bg-green-100",
  purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
  orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-100",
};

// =================================================================
// 2. MAIN COMPONENT
// =================================================================

export default function WorkspaceOverviewPage() {
  const { showToast } = useToast();
  const params = useParams();
  const workspaceId = Number(params.workspaceId);

  const { user, isLoading: isAuthLoading, activeCompany } = useAuth();
  const companyId = activeCompany?.companyId || null;

  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<any>(null);

  // 1. Fetch Workspace Data (Logic nghiệp vụ quan trọng)
  useEffect(() => {
    if (isAuthLoading) return;
    if (!companyId || !workspaceId) {
      setLoading(false);
      return;
    }

    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        const data = await getWorkspaceDetail(companyId, workspaceId);
        setWorkspace(data);
      } catch (err: any) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load workspace info";
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [companyId, workspaceId, isAuthLoading, showToast]);

  // 3. Loading State
  if (isAuthLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Workspace not found.
      </div>
    );
  }

  const actionLinks = getActionLinks(workspaceId);

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-900">
      {/* --- HEADER SECTION --- */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              {workspace.workspaceName}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {workspace.description || "Manage your department projects here."}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* --- CTA BANNER (Invite Members) --- */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Grow your team
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Start collaborating by inviting new members to this workspace.
              </p>
            </div>
          </div>

          <Link href={`/core/workspace/${workspaceId}/member`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-5 shadow-sm rounded-[3px]">
              Invite Members
            </Button>
          </Link>
        </div>

        {/* --- QUICK ACTIONS GRID --- */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actionLinks.map((item) => {
              const styleClass =
                variantStyles[item.variant] || variantStyles.blue;
              const isDisabled = item.disabled;

              return (
                <Link
                  key={item.title}
                  href={isDisabled ? "#" : item.href}
                  className={`group flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 
                                                ${
                                                  isDisabled
                                                    ? "opacity-60 pointer-events-none cursor-not-allowed"
                                                    : ""
                                                }`}
                >
                  {/* Icon Box */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${styleClass}`}
                  >
                    <item.icon className="w-6 h-6" />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
