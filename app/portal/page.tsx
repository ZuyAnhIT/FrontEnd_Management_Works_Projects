"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { 
    FolderKanban, 
    ArrowRight, 
    ExternalLink, 
    ShieldCheck, 
    User, 
    Search, 
    LayoutGrid,
    Briefcase 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useMemo, useEffect } from "react";

// =================================================================
// 1. HELPER FUNCTIONS
// =================================================================

// Helper Greeting (Giữ nguyên logic giờ)
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

// Helper Badge Role (Chuyển sang Tiếng Anh)
const renderRoleBadge = (roleCode: string) => {
    switch (roleCode) {
        case "PROJECT_ADMIN":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-blue-50 text-blue-700 border-blue-200">
                    <ShieldCheck className="w-3 h-3" /> Admin
                </span>
            );
        case "GUEST_PROJECT":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-amber-50 text-amber-700 border-amber-200">
                    <ExternalLink className="w-3 h-3" /> Guest
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-slate-50 text-slate-600 border-slate-200">
                    <User className="w-3 h-3" /> Member
                </span>
            );
    }
};

// =================================================================
// 2. MAIN COMPONENT
// =================================================================

export default function GuestPortalPage() {
    const { user, activeCompany, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    // State cho tìm kiếm
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => setMounted(true), []);
    
    // Lấy workspaceId từ URL
    const targetWorkspaceId = searchParams.get("workspaceId") ? Number(searchParams.get("workspaceId")) : null;

    // Helper tìm tên Workspace hiện tại
    const currentWorkspaceName = useMemo(() => {
        if (!targetWorkspaceId) return null;
        return user?.workspaceMemberships?.find(w => w.workspaceId === targetWorkspaceId)?.workspaceName;
    }, [user, targetWorkspaceId]);

    // Logic lọc dự án (Logic nghiệp vụ quan trọng)
    const displayProjects = useMemo(() => {
        if (!user?.projectMemberships) return [];

        let projects = user.projectMemberships;

        // 1. Lọc theo Workspace ID từ URL
        if (targetWorkspaceId) {
            projects = projects.filter(p => p.workspaceId === targetWorkspaceId);
        } 
        // 2. Lọc theo Search Term
        if (searchTerm) {
            projects = projects.filter(p => p.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return projects;
    }, [user, targetWorkspaceId, searchTerm, activeCompany]);

    // Handler điều hướng
    const handleEnterProject = (project: (typeof displayProjects)[0]) => {
        // Điều hướng đến Board
        router.push(`/core/workspace/${project.workspaceId}/project/${project.projectId}/board`);
    };

    if (isLoading || !mounted) return null;

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* --- HEADER SECTION --- */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {targetWorkspaceId ? "Workspace Projects" : "Portal Hub"}
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            {targetWorkspaceId 
                                ? <span>Viewing projects in <span className="font-semibold text-slate-700">{currentWorkspaceName}</span></span>
                                : `${getGreeting()}, ${user?.fullName?.split(" ").pop()}! Access your projects here.`
                            }
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative flex-1 md:w-80 md:flex-none group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search projects..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 pl-10 pr-4 h-11 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* --- CONTENT SECTION --- */}
                {displayProjects.length > 0 ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <LayoutGrid className="w-4 h-4" />
                                Available Projects ({displayProjects.length})
                            </div>
                            {/* Nút quay lại nếu đang lọc theo workspace */}
                            {targetWorkspaceId && (
                                <button 
                                    onClick={() => router.push("/core")}
                                    className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                                >
                                    ← Back to Workspaces
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                            {displayProjects.map((project) => {
                                const isGuest = project.roleCode === "GUEST_PROJECT";
                                
                                return (
                                    <div 
                                        key={project.projectId}
                                        onClick={() => handleEnterProject(project)}
                                        className={`
                                            group relative bg-white p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-[200px]
                                            ${isGuest 
                                                ? 'border-amber-200/60 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-100/50' 
                                                : 'border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100/50'
                                            }
                                        `}
                                    >
                                        {/* Top Section */}
                                        <div className="flex justify-between items-start">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105 duration-300
                                                ${isGuest 
                                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                                                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                                }`}
                                            >
                                                <FolderKanban className="w-7 h-7" />
                                            </div>
                                            {renderRoleBadge(project.roleCode)}
                                        </div>

                                        {/* Middle Section */}
                                        <div className="mt-4">
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                                                {project.projectName}
                                            </h3>
                                        </div>

                                        {/* Bottom Section */}
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                            <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                                                Open Board
                                            </span>
                                            
                                            <div className={`flex items-center gap-1 text-sm font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${isGuest ? 'text-amber-600' : 'text-blue-600'}`}>
                                                Access <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    // --- EMPTY STATE ---
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm text-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <FolderKanban className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Projects Found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-6">
                            {targetWorkspaceId 
                                ? "You are not a member of any project in this workspace."
                                : `We couldn't find any projects matching "${searchTerm}".`
                            }
                        </p>
                        {/* Nút quay lại nếu đang lọc */}
                        {(targetWorkspaceId || searchTerm) && (
                            <button 
                                onClick={() => {
                                    setSearchTerm("");
                                    if(targetWorkspaceId) router.push("/core");
                                }}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                Clear filters / Go back
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}