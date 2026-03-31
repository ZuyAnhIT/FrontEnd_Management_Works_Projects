"use client";

// =============================================================================
// 1. IMPORT (Thu vien -> Noi bo -> Component con)
// =============================================================================

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

// Context & Services
import { useAuth } from "@/context/AuthContext";
import { getWorkspaceDetail } from "@/services/apiWorkspace";
import { useToast } from "@/components/ui/ToastProvider";

// UI Components
import { Button } from "@/components/ui/Buttons";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONFIGURATION & TYPES
// =============================================================================

/**
 * Cau hinh danh sach cac hanh dong nhanh trong Workspace
 */
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
        icon: Layout,
        title: "Reports (Coming Soon)",
        desc: "View detailed analytics and progress reports.",
        href: "#",
        variant: "orange",
        disabled: true,
    },
];

/**
 * Ban do mau sac Atlassian cho cac khoi hanh dong nhanh
 */
const VARIANT_STYLES: Record<string, string> = {
    blue: "bg-[#DEEBFF] text-[#0052CC] group-hover:bg-[#B3D4FF]",
    green: "bg-[#E3FCEF] text-[#006644] group-hover:bg-[#ABF5D1]",
    purple: "bg-[#EAE6FF] text-[#403294] group-hover:bg-[#C0B6F2]",
    orange: "bg-[#FFEBE6] text-[#BF2600] group-hover:bg-[#FFBDAD]",
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Trang tong quan cua Khong gian lam viec.
 * Hien thi thong tin co ban va cung cap cac loi tat dieu huong nhanh.
 */
export default function WorkspaceOverviewPage() {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const { showToast } = useToast();
    const params = useParams();
    const workspaceId = Number(params.workspaceId);

    const { isLoading: isAuthLoading, activeCompany } = useAuth();
    const companyId = activeCompany?.companyId || null;

    const [isLoading, setIsLoading] = useState(true);
    const [workspace, setWorkspace] = useState<any>(null);

    // ---------------------------------------------------------------------------
    // 5. DATA FETCHING
    // ---------------------------------------------------------------------------

    useEffect(() => {
        if (isAuthLoading) return;
        
        if (!companyId || !workspaceId) {
            setIsLoading(false);
            return;
        }

        const fetchWorkspaceDetails = async () => {
            try {
                setIsLoading(true);
                const data = await getWorkspaceDetail(companyId, workspaceId);
                setWorkspace(data);
            } catch (err: any) {
                const message = err.response?.data?.message || err.message || "Failed to retrieve workspace information.";
                showToast(message, "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkspaceDetails();
    }, [companyId, workspaceId, isAuthLoading, showToast]);

    // ---------------------------------------------------------------------------
    // 6. RENDER LOGIC
    // ---------------------------------------------------------------------------

    // MAN HINH: Dang tai du lieu
    if (isAuthLoading || isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] gap-3">
                <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80" />
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#6B778C]">Loading Environment...</p>
            </div>
        );
    }

    // MAN HINH: Khong tim thay du lieu
    if (!workspace) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] gap-4">
                <div className="w-16 h-16 bg-white border border-[#DFE1E6] rounded-full flex items-center justify-center shadow-sm">
                    <Briefcase className="w-8 h-8 text-[#6B778C]" />
                </div>
                <h2 className="text-lg font-black text-[#172B4D] uppercase tracking-tight">Workspace Not Found</h2>
                <p className="text-[#42526E] font-medium text-[14px]">The requested workspace could not be located or you lack permissions.</p>
            </div>
        );
    }

    const actionLinks = getActionLinks(workspaceId);

    // MAN HINH: Giao dien chinh
    return (
        <div className="min-h-screen bg-[#F4F5F7] p-6 sm:p-10 font-sans text-[#172B4D]">
            <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in duration-500">
                
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-[#0052CC] rounded-xl flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                            <Briefcase className="w-6 h-6 text-white stroke-[2.5]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase">
                                {workspace.workspaceName}
                            </h1>
                            <p className="text-[#42526E] text-[14px] font-medium mt-1">
                                {workspace.description || "Manage your operational environment and department projects here."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* CALL TO ACTION: INVITE MEMBERS */}
                <div className="bg-white border border-[#DFE1E6] rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8 transition-all hover:shadow-md">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-[#E3F2FD] rounded-2xl flex items-center justify-center shrink-0">
                            <UserPlus className="w-7 h-7 text-[#0052CC] stroke-[2.5]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[#172B4D] tracking-tight">
                                Expand Your Team
                            </h2>
                            <p className="text-[#42526E] text-[14px] font-medium mt-0.5 leading-relaxed">
                                Start collaborating seamlessly by inviting colleagues to this workspace.
                            </p>
                        </div>
                    </div>

                    <Link href={`/core/workspace/${workspaceId}/member`} passHref>
                        <Button className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-black text-[12px] uppercase tracking-widest h-11 px-8 rounded-lg shadow-md active:scale-95 transition-all w-full md:w-auto">
                            Invite Members
                        </Button>
                    </Link>
                </div>

                {/* QUICK ACTIONS GRID */}
                <div className="space-y-5">
                    <h3 className="text-[11px] font-black text-[#6B778C] uppercase tracking-[0.2em] px-1">
                        Administrative Shortcuts
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {actionLinks.map((item) => {
                            const styleClass = VARIANT_STYLES[item.variant] || VARIANT_STYLES.blue;
                            const isDisabled = item.disabled;

                            return (
                                <Link
                                    key={item.title}
                                    href={isDisabled ? "#" : item.href}
                                    className={cn(
                                        "group flex items-start gap-5 p-6 bg-white rounded-2xl border border-[#DFE1E6] transition-all duration-300",
                                        isDisabled 
                                            ? "opacity-50 pointer-events-none cursor-not-allowed" 
                                            : "hover:border-[#0052CC] hover:shadow-xl hover:shadow-blue-50"
                                    )}
                                    aria-disabled={isDisabled}
                                >
                                    {/* Icon Container */}
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors", styleClass)}>
                                        <item.icon className="w-5 h-5 stroke-[2.5]" />
                                    </div>

                                    {/* Content Container */}
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[15px] font-black text-[#172B4D] group-hover:text-[#0052CC] transition-colors tracking-tight">
                                                {item.title}
                                            </h3>
                                            {!isDisabled && (
                                                <ChevronRight className="w-4.5 h-4.5 text-slate-300 group-hover:text-[#0052CC] group-hover:translate-x-1 transition-all" />
                                            )}
                                        </div>
                                        <p className="text-[13px] text-[#42526E] font-medium mt-1.5 leading-relaxed line-clamp-2">
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