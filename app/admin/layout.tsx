"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/features/admin/Header"; 
import Sidebar from "@/components/features/admin/Sidebar"; 
import { useAuth } from "@/context/AuthContext";
import { getCompanyWorkspaces } from "@/services/apiWorkspace";
import { useToast } from "@/components/ui/ToastProvider";
import { Loader2, ShieldAlert } from "lucide-react";

// =================================================================
// 1. INTERFACES
// =================================================================

interface AdminLayoutProps {
    children: React.ReactNode;
}

interface SidebarWorkspace {
    id: number;
    name: string;
    // Thêm các field khác cần thiết cho Sidebar
    // roleCode?: string; 
}

// =================================================================
// 2. MAIN COMPONENT
// =================================================================

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState("home");

    // ✅ Lấy đầy đủ thông tin từ AuthContext
    const { user, isAuthenticated, activeCompany, isLoading, role } = useAuth();
    const { showToast } = useToast();

    const [workspaces, setWorkspaces] = useState<SidebarWorkspace[]>([]);
    const [loadingWs, setLoadingWs] = useState(false);
    
    // --- FETCH WORKSPACES LOGIC (Logic nghiệp vụ quan trọng) ---
    // Sử dụng useCallback để memoize hàm fetch
    const fetchWorkspaces = useCallback(async () => {
        if (!activeCompany?.companyId || !user) return;

        // 🟢 CASE 1: COMPANY_ADMIN -> Được phép gọi API lấy tất cả
        if (role === "COMPANY_ADMIN") {
            setLoadingWs(true);
            try {
                const response = await getCompanyWorkspaces(activeCompany.companyId, {
                    page: 0,
                    size: 50,
                    sortBy: "createdAt",
                    sortDir: "desc",
                });
                // Map data chuẩn bị cho Sidebar
                const mappedWorkspaces = response.content?.map(w => ({
                    id: w.workspaceId,
                    name: w.workspaceName,
                    roleCode: w.roleCode // Giả sử API trả về roleCode
                })) || [];
                setWorkspaces(mappedWorkspaces);
            } catch (err: any) {
                console.error("Fetch workspaces error:", err);
                // Giữ nguyên: Chỉ log lỗi 403, không show toast
            } finally {
                setLoadingWs(false);
            }
        } 
        // 🔵 CASE 2: MEMBER / WORKSPACE_MEMBER -> Lấy từ User Profile (Tránh lỗi 403)
        else if (role && (role.includes("MEMBER") || role.includes("GUEST"))) {
            const myWorkspaces = user.workspaceMemberships
                ?.filter(w => w.companyId === activeCompany.companyId)
                .map(w => ({
                    id: w.workspaceId,
                    name: w.workspaceName,
                    roleCode: w.roleCode, 
                })) || [];
            setWorkspaces(myWorkspaces as SidebarWorkspace[]);
        }
        
        // 🔴 CASE 3: Các trường hợp khác
        else {
            setWorkspaces([]);
        }
    }, [activeCompany, role, user]);

    // Gọi fetch khi Auth/Company thay đổi
    useEffect(() => {
        if (isAuthenticated && activeCompany?.companyId && user) {
            fetchWorkspaces();
        } else if (!isLoading) {
             setWorkspaces([]);
        }
    }, [isAuthenticated, activeCompany, user, isLoading, fetchWorkspaces]); 

    // --- RENDER SCREENS ---

    // 1. Loading Screen
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-3">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Authenticating...</p>
            </div>
        );
    }

    // 2. Fallback (Authentication Failed)
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500 gap-2">
                <ShieldAlert className="w-10 h-10 text-red-500" />
                <p>Session expired. Please log in again.</p>
            </div>
        );
    }

    // 3. Layout Full Screen
    return (
        <div className="h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">

            {/* Header */}
            <div className="flex-shrink-0 z-50">
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="flex-shrink-0 z-40">
                    <Sidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        workspaces={workspaces}
                        // Giả định component Sidebar có thể xử lý prop loadingWs để hiện Skeleton
                        loadingWs={loadingWs} 
                    />
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto scroll-smooth relative custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}