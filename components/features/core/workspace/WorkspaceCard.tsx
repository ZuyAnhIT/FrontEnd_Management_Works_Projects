"use client";

import { FolderKanban, Users, Briefcase, Crown, ChevronRight, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardWorkspace } from "@/services/apiDashboard"; // Import type

interface WorkspaceCardProps {
    ws: DashboardWorkspace; // Dữ liệu workspace từ API
    isImpersonating: boolean; // Nếu user là Admin Cty, họ đang nhập vai
}

export default function WorkspaceCard({ ws, isImpersonating }: WorkspaceCardProps) {
    const router = useRouter();
    
    const roleColor = ws.roleCode?.includes('ADMIN') ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700';
    const bgColor = ws.workspaceColor || '#2980b9'; // Màu chính từ API
    
    // Hàm xử lý chuyển hướng khi click
    const handleGoToWorkspace = () => {
        // ✅ Luồng "Nhập vai": Chuyển đến trang tổng quan của workspace
        router.push(`/core/workspace/${ws.workspaceId}`);
    };

    return (
        <div 
            onClick={handleGoToWorkspace}
            className="group relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-1"
        >
            {/* 1. Header Card (Cover Image/Color) */}
            <div 
                className="h-32 p-4 flex flex-col justify-between"
                style={{ 
                    backgroundColor: bgColor, 
                    backgroundImage: ws.workspaceCoverImage ? `url(${ws.workspaceCoverImage})` : 'none',
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center'
                }}
            >
                {/* Overlay nếu có ảnh bìa */}
                {ws.workspaceCoverImage && <div className="absolute inset-0 bg-black/40"></div>}
                
                {/* Tên Workspace và Role */}
                <div className="relative z-10 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white truncate max-w-[80%]">
                        {ws.workspaceName}
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleColor} shadow-md`}>
                        {ws.roleName}
                    </span>
                </div>
            </div>

            {/* 2. Body Stats */}
            <div className="p-4 bg-white space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                    {ws.workspaceDescription || "Không có mô tả chi tiết."}
                </p>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span title="Thành viên">
                            <Users className="w-4 h-4 mr-1 inline" />
                            {ws.memberCount || 0}
                        </span>
                        <span title="Dự án">
                            <Briefcase className="w-4 h-4 mr-1 inline" />
                            {ws.projectCount || 0}
                        </span>
                    </div>

                    {/* Nút Xem chi tiết / Cài đặt */}
                    <div className="text-blue-600 font-medium flex items-center gap-1.5 transition-colors">
                        Xem chi tiết
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}