"use client";

// =============================================================================
// 1. IMPORT (Thu vien -> Noi bo -> Utils)
// =============================================================================

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
    ArrowRight, 
    ShieldCheck, 
    User, 
    Loader2,
    ExternalLink,
    Briefcase,
    Search,
    LayoutGrid
} from "lucide-react";

// Context & Utils
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & TYPES
// =============================================================================

interface WorkspaceMembership {
    workspaceId: number;
    workspaceName: string;
    companyId: number;
    roleCode: string; 
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Trang danh sach khong gian lam viec (Core Dashboard).
 * Hien thi cac workspace ma nguoi dung duoc phep truy cap trong cong ty hien tai.
 */
export default function CoreDashboardPage() {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & CONTEXT
    // ---------------------------------------------------------------------------
    
    const router = useRouter();
    const { user, activeCompany, isLoading } = useAuth();
    
    // ---------------------------------------------------------------------------
    // 5. STATE MANAGEMENT
    // ---------------------------------------------------------------------------

    const [isMounted, setIsMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // ---------------------------------------------------------------------------
    // 6. SIDE EFFECTS
    // ---------------------------------------------------------------------------

    // Dam bao giao dien chi render tren client de tranh loi hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // ---------------------------------------------------------------------------
    // 7. CALCULATIONS (Data Prep)
    // ---------------------------------------------------------------------------

    // Loc danh sach cac workspace thuoc ve cong ty dang hoat dong
    const myWorkspaces = useMemo(() => {
        if (!user?.workspaceMemberships || !activeCompany?.companyId) return [];
        return user.workspaceMemberships.filter(
            (ws) => ws.companyId === activeCompany.companyId
        );
    }, [user, activeCompany]);

    // Loc danh sach workspace dua theo tu khoa tim kiem
    const filteredWorkspaces = useMemo(() => {
        if (!searchTerm.trim()) return myWorkspaces;
        return myWorkspaces.filter((ws) =>
            ws.workspaceName.toLowerCase().includes(searchTerm.trim().toLowerCase())
        );
    }, [myWorkspaces, searchTerm]);

    // ---------------------------------------------------------------------------
    // 8. EVENT HANDLERS
    // ---------------------------------------------------------------------------

    /**
     * Xu ly dieu huong khi nguoi dung chon mot workspace.
     * Phan nhanh logic: Admin vao trang quan tri, Member/Guest vao cong du an.
     */
    const handleEnterWorkspace = useCallback((ws: WorkspaceMembership) => {
        if (ws.roleCode === "WORKSPACE_ADMIN") {
            router.push(`/core/workspace/${ws.workspaceId}`);
        } else {
            router.push(`/portal?workspaceId=${ws.workspaceId}`);
        }
    }, [router]);

    const handleClearSearch = useCallback(() => {
        setSearchTerm("");
    }, []);

    // ---------------------------------------------------------------------------
    // 9. UI HELPERS
    // ---------------------------------------------------------------------------

    /**
     * Render nhan the hien thi vai tro (Role Badge) theo chuan mau Atlassian
     */
    const renderRoleBadge = (roleCode: string) => {
        switch (roleCode) {
            case "WORKSPACE_ADMIN":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-[#EAE6FF] text-[#403294] shadow-sm">
                        <ShieldCheck className="w-3 h-3 stroke-[2.5]" /> Admin
                    </span>
                );
            case "GUEST":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-[#FFF0B3] text-[#FF8B00] shadow-sm">
                        <ExternalLink className="w-3 h-3 stroke-[2.5]" /> Guest
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-[#DFE1E6] text-[#42526E] shadow-sm">
                        <User className="w-3 h-3 stroke-[2.5]" /> Member
                    </span>
                );
        }
    };

    // ---------------------------------------------------------------------------
    // 10. RENDER LOGIC
    // ---------------------------------------------------------------------------

    // MAN HINH CHO (Loading State)
    if (isLoading || !isMounted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] gap-3">
                <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80" />
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#6B778C]">Loading Workspaces...</p>
            </div>
        );
    }

    // MAN HINH CHINH (Main Render)
    return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans text-[#172B4D] p-6 sm:p-10">
            <div className="max-w-[1400px] mx-auto space-y-10">
                
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-black text-[#172B4D] tracking-tight uppercase">
                            My Workspaces
                        </h1>
                        <p className="text-[#42526E] mt-2 text-[15px] font-medium">
                            Select a workspace in <span className="font-bold text-[#0052CC]">{activeCompany?.companyName}</span> to start working.
                        </p>
                    </div>

                    {/* THANH TIM KIEM (Search Bar) */}
                    {myWorkspaces.length > 0 && (
                        <div className="relative flex-1 md:w-80 md:flex-none group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#0052CC] transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search workspaces..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={cn(
                                    "w-full md:w-80 pl-11 pr-4 h-12 bg-white border border-[#DFE1E6] rounded-xl shadow-sm text-[14px] font-medium transition-all placeholder:text-slate-400",
                                    "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0052CC]"
                                )}
                            />
                        </div>
                    )}
                </div>

                {/* CONTENT SECTION */}
                <div className="relative min-h-[400px]">
                    {myWorkspaces.length > 0 ? (
                        
                        filteredWorkspaces.length > 0 ? (
                            // DANH SACH KET QUA
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-2 mb-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    <LayoutGrid className="w-4 h-4 opacity-70" />
                                    Available Workspaces 
                                    <span className="bg-[#DFE1E6] text-[#172B4D] px-2 py-0.5 rounded-md ml-1">{filteredWorkspaces.length}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                                    {filteredWorkspaces.map((ws: WorkspaceMembership) => {
                                        const isAdmin = ws.roleCode === "WORKSPACE_ADMIN";
                                        const isGuest = ws.roleCode === "GUEST";
                                        
                                        return (
                                            <div 
                                                key={ws.workspaceId}
                                                onClick={() => handleEnterWorkspace(ws)}
                                                className={cn(
                                                    "group relative bg-white p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-[200px]",
                                                    isGuest 
                                                        ? "border-amber-200/60 hover:border-[#FF8B00] hover:shadow-xl hover:shadow-amber-100/50" 
                                                        : "border-[#DFE1E6] hover:border-[#0052CC] hover:shadow-xl hover:shadow-blue-100/50"
                                                )}
                                                title={isAdmin ? "Go to Management Dashboard" : "Go to Project Portal"}
                                            >
                                                {/* Card Header */}
                                                <div className="flex justify-between items-start">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center text-[20px] font-black shadow-sm transition-transform group-hover:scale-105 duration-300 uppercase",
                                                        isAdmin ? "bg-[#EAE6FF] text-[#403294]" : isGuest ? "bg-[#FFF0B3] text-[#FF8B00]" : "bg-[#F4F5F7] text-[#42526E]"
                                                    )}>
                                                        {ws.workspaceName.charAt(0)}
                                                    </div>
                                                    {renderRoleBadge(ws.roleCode)}
                                                </div>

                                                {/* Card Body */}
                                                <div className="mt-4">
                                                    <h3 className="text-lg font-black text-[#172B4D] group-hover:text-[#0052CC] transition-colors line-clamp-2 tracking-tight">
                                                        {ws.workspaceName}
                                                    </h3>
                                                </div>

                                                {/* Card Footer */}
                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                                    <span className="text-[12px] font-bold text-[#6B778C] uppercase tracking-widest group-hover:text-[#172B4D] transition-colors">
                                                        Action
                                                    </span>
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 text-[12px] font-black uppercase tracking-widest opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300",
                                                        isGuest ? "text-[#FF8B00]" : "text-[#0052CC]"
                                                    )}>
                                                        {isAdmin ? "Manage" : "View Projects"}
                                                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            // TRONG KHI TIM KIEM (Search Empty State)
                            <div className="flex flex-col items-center justify-center py-28 text-center bg-white border border-[#DFE1E6] rounded-3xl shadow-sm">
                                <div className="w-20 h-20 bg-[#F4F5F7] border border-slate-200 rounded-full flex items-center justify-center mb-5">
                                    <Search className="w-10 h-10 text-[#6B778C] stroke-[1.5]" />
                                </div>
                                <h3 className="text-xl font-black text-[#172B4D] tracking-tight mb-2">No Workspaces Found</h3>
                                <p className="text-[#42526E] font-medium max-w-sm mx-auto leading-relaxed">
                                    We couldn't find any workspace matching "{searchTerm}".
                                </p>
                                <button 
                                    onClick={handleClearSearch}
                                    className="mt-6 text-[#0052CC] font-bold text-[13px] uppercase tracking-widest hover:underline active:scale-95 transition-all"
                                >
                                    Clear Search
                                </button>
                            </div>
                        )

                    ) : (
                        // TRONG KHI CHUA CO WORKSPACE NAO (Initial Empty State)
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-[#DFE1E6] shadow-sm text-center animate-in zoom-in-95 duration-500">
                             <div className="w-24 h-24 bg-[#F4F5F7] rounded-full flex items-center justify-center mb-6 border border-[#DFE1E6]">
                                <Briefcase className="w-12 h-12 text-[#6B778C] stroke-[1.5]" />
                             </div>
                             <h2 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase mb-3">No Workspaces Yet</h2>
                             <p className="text-[#42526E] font-medium max-w-md text-[15px] leading-relaxed mb-6">
                                You haven't been assigned to any workspaces in this organization yet.
                             </p>
                             <div className="text-[#6B778C] text-[11px] font-black uppercase tracking-widest bg-[#F4F5F7] px-4 py-2 rounded-md border border-[#DFE1E6]">
                                Contact your Company Admin for access
                             </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}