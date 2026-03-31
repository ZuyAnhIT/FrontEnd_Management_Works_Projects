"use client";

// =============================================================================
// 1. IMPORTS (Thư viện -> Internal -> Styles)
// =============================================================================

import React from "react";
import { useRouter } from "next/navigation";
import { 
    Users, Briefcase, ChevronRight, Crown, 
    Shield, Layout, Trash2 
} from "lucide-react";

import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

/**
 * Định nghĩa cấu trúc dữ liệu cho Workspace dựa trên các trường được sử dụng.
 * Giúp loại bỏ 'any' để TypeScript hỗ trợ tốt hơn.
 */
interface WorkspaceData {
    workspaceId: number;
    workspaceName: string;
    description?: string;
    workspaceDescription?: string;
    roleCode?: string;
    roleName?: string;
    coverImage?: string;
    color?: string;
    memberCount?: number;
    projectCount?: number;
}

interface WorkspaceCardProps {
    workspace: WorkspaceData;
    isImpersonating?: boolean;
    onNavigate?: (id: number) => void; 
    onDelete?: (id: number) => void;
    viewMode?: "grid" | "list";
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần thẻ hiển thị Workspace.
 * Hỗ trợ chế độ xem dạng lưới (Grid) hoặc danh sách (List).
 */
export default function WorkspaceCard({ 
    workspace, 
    isImpersonating, 
    onNavigate,
    onDelete,
    viewMode = "grid" 
}: WorkspaceCardProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS
    // ---------------------------------------------------------------------------
    
    const router = useRouter();

    // Kiểm tra an toàn dữ liệu
    if (!workspace) return null;

    // ---------------------------------------------------------------------------
    // 5. CALCULATIONS (Xử lý logic giao diện)
    // ---------------------------------------------------------------------------
    
    const isAdmin = workspace.roleCode?.includes("ADMIN");
    const roleName = workspace.roleName || (isAdmin ? "Admin" : "Member");
    const RoleIcon = isAdmin ? Crown : Shield;

    // ---------------------------------------------------------------------------
    // 6. HANDLERS (Các hàm xử lý sự kiện)
    // ---------------------------------------------------------------------------

    /**
     * Xử lý điều hướng khi người dùng nhấp vào thẻ Workspace
     */
    const handleNavigate = () => {
        if (onNavigate) {
            onNavigate(workspace.workspaceId);
        } else {
            router.push(`/core/workspace/${workspace.workspaceId}`);
        }
    };

    /**
     * Xử lý sự kiện xóa Workspace
     */
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(workspace.workspaceId);
        }
    };

    // ---------------------------------------------------------------------------
    // 7. RENDER: LIST VIEW
    // ---------------------------------------------------------------------------
    
    if (viewMode === "list") {
        return (
            <div 
                onClick={handleNavigate}
                className={cn(
                    "group flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl transition-all duration-200 cursor-pointer shadow-sm",
                    "hover:border-[#2684FF] hover:shadow-md active:scale-[0.99]"
                )}
            >
                {/* Khối Hình ảnh (Thumbnail) */}
                <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center relative">
                    {workspace.coverImage ? (
                        <img src={workspace.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: `${workspace.color || '#0052CC'}15` }}
                        >
                            <Layout className="w-4 h-4" style={{ color: workspace.color || "#0052CC" }} />
                        </div>
                    )}
                </div>

                {/* Khối Nội dung (Content) */}
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#172B4D] text-[14px] truncate group-hover:text-[#0052CC] transition-colors leading-tight">
                        {workspace.workspaceName}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm border",
                            isAdmin ? "text-amber-700 bg-amber-50 border-amber-200" : "text-[#0052CC] bg-blue-50 border-blue-200"
                        )}>
                            <RoleIcon className="w-3 h-3" />
                            {roleName}
                        </span>
                    </div>
                </div>

                {/* Biểu tượng điều hướng */}
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0052CC] group-hover:translate-x-1 transition-transform" />
            </div>
        );
    }

    // ---------------------------------------------------------------------------
    // 8. RENDER: GRID VIEW (Default)
    // ---------------------------------------------------------------------------
    
    return (
        <div 
            onClick={handleNavigate}
            className={cn(
                "group relative bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full",
                "hover:shadow-xl hover:border-[#2684FF] hover:-translate-y-1 active:scale-[0.98]"
            )}
        >
            {/* Khối nền tiêu đề (Header Background) */}
            <div 
                className="h-24 w-full relative border-b border-slate-100"
                style={{ backgroundColor: workspace.color ? `${workspace.color}15` : '#E3F2FD' }}
            >
                {/* Logo Workspace */}
                <div className="absolute bottom-0 left-6 translate-y-1/2 w-14 h-14 rounded-xl shadow-sm border-4 border-white flex items-center justify-center overflow-hidden bg-white">
                    {workspace.coverImage ? (
                        <img src={workspace.coverImage} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: workspace.color || '#0052CC' }}>
                            <span className="text-white font-black text-xl uppercase tracking-widest">
                                {workspace.workspaceName.charAt(0)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Nhãn vai trò (Role Badge) */}
                <div className="absolute top-3 right-3">
                    <span className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase tracking-widest border rounded shadow-sm",
                        isAdmin ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-[#0052CC] border-blue-200"
                    )}>
                        <RoleIcon className="w-3 h-3 stroke-[2.5]" />
                        {roleName}
                    </span>
                </div>
            </div>

            {/* Khối Nội dung chính (Body) */}
            <div className="px-6 pt-10 pb-5 flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-[16px] font-bold text-[#172B4D] truncate group-hover:text-[#0052CC] transition-colors">
                        {workspace.workspaceName}
                    </h3>
                    <p className="text-[13px] text-slate-500 line-clamp-2 mt-1.5 min-h-[40px] leading-relaxed">
                        {workspace.description || workspace.workspaceDescription || "No description provided."}
                    </p>
                </div>

                {/* Thống kê (Stats Footer) */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[12px] font-bold text-slate-500">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md border border-slate-100" title="Total Members">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {workspace.memberCount || 0}
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md border border-slate-100" title="Total Projects">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            {workspace.projectCount || 0}
                        </div>
                    </div>

                    {/* Hiệu ứng khi hover (Hover Action) */}
                    <div className="flex items-center gap-1 text-[#0052CC] text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        Open <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                </div>
            </div>
            
            {/* Nút Xóa (Chỉ hiển thị nếu có truyền prop onDelete) */}
            {onDelete && (
                <button 
                    onClick={handleDelete}
                    className={cn(
                        "absolute top-3 left-3 p-1.5 rounded-lg text-slate-400 bg-white/80 backdrop-blur-sm border border-transparent shadow-sm transition-all",
                        "hover:text-red-600 hover:bg-red-50 hover:border-red-100 opacity-0 group-hover:opacity-100 active:scale-95"
                    )}
                    title="Delete Workspace"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}