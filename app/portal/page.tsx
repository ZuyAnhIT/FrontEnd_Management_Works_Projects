"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Utils)
// =============================================================================

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
    FolderKanban, 
    ArrowRight, 
    ExternalLink, 
    ShieldCheck, 
    User, 
    Search, 
    LayoutGrid
} from "lucide-react";

// Context
import { useAuth } from "@/context/AuthContext";

// Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. HELPER FUNCTIONS
// =============================================================================

/**
 * Xac dinh loi chao dua vao thoi gian thuc he thong
 */
const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

/**
 * Render the hien thi vai tro cua nguoi dung trong du an
 */
const renderRoleBadge = (roleCode: string) => {
    switch (roleCode) {
        case "PROJECT_ADMIN":
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border bg-blue-50 text-[#0052CC] border-blue-100 shadow-sm">
                    <ShieldCheck className="w-3 h-3 stroke-[2.5]" /> Admin
                </span>
            );
        case "GUEST_PROJECT":
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border bg-amber-50 text-[#FF8B00] border-amber-200 shadow-sm">
                    <ExternalLink className="w-3 h-3 stroke-[2.5]" /> Guest
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border bg-slate-50 text-[#42526E] border-slate-200 shadow-sm">
                    <User className="w-3 h-3 stroke-[2.5]" /> Member
                </span>
            );
    }
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function GuestPortalPage() {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [isMounted, setIsMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // ---------------------------------------------------------------------------
    // 5. SIDE EFFECTS
    // ---------------------------------------------------------------------------

    // Dam bao client-side rendering de tranh loi Hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    // ---------------------------------------------------------------------------
    // 6. CALCULATIONS (Data Preparation)
    // ---------------------------------------------------------------------------

    // Lay ID workspace can loc tu thanh URL
    const targetWorkspaceId = searchParams.get("workspaceId") ? Number(searchParams.get("workspaceId")) : null;

    // Tim kiem ten cua workspace tuong ung de hien thi len Header
    const currentWorkspaceName = useMemo(() => {
        if (!targetWorkspaceId) return null;
        return user?.workspaceMemberships?.find(w => w.workspaceId === targetWorkspaceId)?.workspaceName;
    }, [user, targetWorkspaceId]);

    // Loc danh sach du an dua tren tham so URL va tu khoa tim kiem
    const displayProjects = useMemo(() => {
        if (!user?.projectMemberships) return [];

        let projects = user.projectMemberships;

        if (targetWorkspaceId) {
            projects = projects.filter(p => p.workspaceId === targetWorkspaceId);
        } 
        
        if (searchTerm.trim()) {
            projects = projects.filter(p => p.projectName.toLowerCase().includes(searchTerm.trim().toLowerCase()));
        }

        return projects;
    }, [user, targetWorkspaceId, searchTerm]);

    // ---------------------------------------------------------------------------
    // 7. EVENT HANDLERS
    // ---------------------------------------------------------------------------

    const handleEnterProject = useCallback((workspaceId: number, projectId: number) => {
        router.push(`/core/workspace/${workspaceId}/project/${projectId}/board`);
    }, [router]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm("");
        if (targetWorkspaceId) {
            router.push("/core");
        }
    }, [targetWorkspaceId, router]);

    // ---------------------------------------------------------------------------
    // 8. RENDER LOGIC
    // ---------------------------------------------------------------------------

    // Cho trang mount hoac check auth xong de tranh nhay layout
    if (isLoading || !isMounted) return null;

    return (
        <div className="min-h-screen bg-[#F4F5F7] p-6 sm:p-10 font-sans text-[#172B4D]">
            <div className="max-w-[1400px] mx-auto space-y-10">
                
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-black text-[#172B4D] tracking-tight uppercase">
                            {targetWorkspaceId ? "Workspace Projects" : "Portal Hub"}
                        </h1>
                        <p className="text-[#42526E] mt-2 text-[15px] font-medium">
                            {targetWorkspaceId 
                                ? <span>Viewing assignments in <span className="font-bold text-[#0052CC]">{currentWorkspaceName}</span></span>
                                : `${getGreeting()}, ${user?.fullName?.split(" ").pop()}! Access your work environments here.`
                            }
                        </p>
                    </div>

                    {/* SEARCH BAR */}
                    <div className="relative flex-1 md:w-80 md:flex-none group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#0052CC] transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search projects..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={cn(
                                "w-full md:w-80 pl-11 pr-4 h-12 bg-white border border-[#DFE1E6] rounded-xl shadow-sm text-[14px] font-medium transition-all placeholder:text-slate-400",
                                "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0052CC]"
                            )}
                        />
                    </div>
                </div>

                {/* CONTENT SECTION */}
                {displayProjects.length > 0 ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* TOOLBAR */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                <LayoutGrid className="w-4 h-4 opacity-70" />
                                Available Projects 
                                <span className="bg-[#DFE1E6] text-[#172B4D] px-2 py-0.5 rounded-md ml-1">{displayProjects.length}</span>
                            </div>
                            
                            {targetWorkspaceId && (
                                <button 
                                    onClick={() => router.push("/core")}
                                    className="text-[12px] font-black uppercase tracking-widest text-[#6B778C] hover:text-[#0052CC] transition-colors active:scale-95"
                                >
                                    &larr; Back to Workspaces
                                </button>
                            )}
                        </div>

                        {/* PROJECTS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                            {displayProjects.map((project) => {
                                const isGuest = project.roleCode === "GUEST_PROJECT";
                                
                                return (
                                    <div 
                                        key={project.projectId}
                                        onClick={() => handleEnterProject(project.workspaceId, project.projectId)}
                                        className={cn(
                                            "group relative bg-white p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-[200px]",
                                            isGuest 
                                                ? "border-amber-200/60 hover:border-[#FF8B00] hover:shadow-xl hover:shadow-amber-100/50" 
                                                : "border-[#DFE1E6] hover:border-[#0052CC] hover:shadow-xl hover:shadow-blue-100/50"
                                        )}
                                    >
                                        {/* Card Top */}
                                        <div className="flex justify-between items-start">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105 duration-300",
                                                isGuest ? "bg-[#FF8B00]" : "bg-[#0052CC]"
                                            )}>
                                                <FolderKanban className="w-6 h-6 stroke-[2.5]" />
                                            </div>
                                            {renderRoleBadge(project.roleCode)}
                                        </div>

                                        {/* Card Middle */}
                                        <div className="mt-4">
                                            <h3 className="text-lg font-black text-[#172B4D] group-hover:text-[#0052CC] transition-colors line-clamp-2 tracking-tight">
                                                {project.projectName}
                                            </h3>
                                        </div>

                                        {/* Card Bottom */}
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                            <span className="text-[12px] font-bold text-[#6B778C] uppercase tracking-widest group-hover:text-[#172B4D] transition-colors">
                                                Open Board
                                            </span>
                                            <div className={cn(
                                                "flex items-center gap-1.5 text-[12px] font-black uppercase tracking-widest opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300",
                                                isGuest ? "text-[#FF8B00]" : "text-[#0052CC]"
                                            )}>
                                                Access <ArrowRight className="w-4 h-4 stroke-[3]" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    // EMPTY STATE
                    <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-[#DFE1E6] shadow-sm text-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-[#F4F5F7] border border-slate-200 rounded-full flex items-center justify-center mb-6">
                            <FolderKanban className="w-10 h-10 text-[#6B778C] stroke-[1.5]" />
                        </div>
                        <h3 className="text-xl font-black text-[#172B4D] tracking-tight uppercase mb-2">
                            No Projects Found
                        </h3>
                        <p className="text-[#42526E] font-medium max-w-sm mx-auto mb-8 leading-relaxed">
                            {targetWorkspaceId 
                                ? "You have not been assigned to any projects within this workspace."
                                : `We couldn't find any projects matching "${searchTerm}".`
                            }
                        </p>
                        
                        {(targetWorkspaceId || searchTerm) && (
                            <button 
                                onClick={handleClearFilters}
                                className="text-[#0052CC] font-bold text-[13px] uppercase tracking-widest hover:underline active:scale-95 transition-all"
                            >
                                Clear filters / Return
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}