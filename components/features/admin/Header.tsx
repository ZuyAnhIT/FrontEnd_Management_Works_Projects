"use client";

import { useState, useMemo } from "react";
import { 
  Menu, Bell, Crown, 
  LayoutGrid, Layers, FolderKanban 
} from "lucide-react";
import { usePathname, useRouter, useParams } from "next/navigation";
import UserMenu from "@/components/ui/UserMenu";
import { useAuth } from "@/context/AuthContext";
import NotificationPopover from "@/components/features/admin/NotificationPopover";

// =============================================================================
// 1. TYPES & INTERFACES
// =============================================================================

interface HeaderProps {
  onMenuToggle: () => void;
}

// Định nghĩa các chế độ hiển thị của Header
type HeaderMode = "PORTAL" | "PROJECT" | "WORKSPACE" | "ADMIN";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function AdminHeader({ onMenuToggle }: HeaderProps) {
  // --- STATE & HOOKS ---
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  
  const { user, logout, activeCompany } = useAuth();

  // =========================================================================
  // 3. LOGIC: CONTEXT DETECTION (XÁC ĐỊNH NGỮ CẢNH)
  // =========================================================================

  /**
   * Xác định xem người dùng đang ở đâu: Portal, Project, Workspace hay Admin
   */
  const currentMode: HeaderMode = useMemo(() => {
    if (pathname?.startsWith("/portal")) return "PORTAL";
    if (pathname?.includes("/project/") && params.projectId) return "PROJECT";
    if (pathname?.startsWith("/core") && !params.projectId) return "WORKSPACE";
    return "ADMIN";
  }, [pathname, params]);

  /**
   * Tìm dự án hiện tại từ danh sách membership của user (nếu đang ở chế độ Project)
   */
  const currentProject = useMemo(() => {
    if (currentMode !== "PROJECT" || !user?.projectMemberships) return null;
    const pId = Number(params.projectId);
    return user.projectMemberships.find((p) => p.projectId === pId);
  }, [currentMode, params.projectId, user?.projectMemberships]);

  // =========================================================================
  // 4. LOGIC: UI CONFIGURATION (CẤU HÌNH GIAO DIỆN)
  // =========================================================================

  /**
   * Cấu hình hiển thị (Icon, Màu, Text, Link) dựa trên `currentMode`
   * Giúp tách biệt logic render ra khỏi JSX
   */
  const headerConfig = useMemo(() => {
    switch (currentMode) {
      case "PORTAL":
        return {
          icon: <LayoutGrid className="w-4 h-4 text-white" />,
          label: "Member Portal",
          title: activeCompany ? activeCompany.companyName : "My Portal",
          bgColor: "bg-blue-600",
          href: "/portal",
        };

      case "PROJECT":
        return {
          icon: <FolderKanban className="w-4 h-4 text-white" />,
          label: "Project Workspace",
          title: currentProject?.projectName || "Project",
          bgColor: "bg-emerald-600", // Màu xanh lá đặc trưng cho Project
          href: `/core/workspace/${params.workspaceId}/project/${params.projectId}`,
        };

      case "WORKSPACE":
        return {
          icon: <Layers className="w-4 h-4 text-white" />,
          label: "Workspace Core",
          // Hiển thị tên công ty để giữ ngữ cảnh lớn (hoặc tên workspace nếu fetch được)
          title: activeCompany ? activeCompany.companyName : "Workspace",
          bgColor: "bg-indigo-600",
          href: `/core/workspace/${params.workspaceId}`,
        };

      case "ADMIN":
      default:
        return {
          icon: <Crown className="w-4 h-4 text-yellow-400" />,
          label: "Admin Panel",
          title: "WorkNet",
          bgColor: "bg-slate-900",
          href: "/admin",
        };
    }
  }, [currentMode, activeCompany, currentProject, params]);

  // Safe user data để tránh lỗi null
  const safeUser = {
    name: user?.fullName || "User",
    email: user?.email || "user@worknet.com",
  };

  // =========================================================================
  // 5. HANDLERS
  // =========================================================================

  const handleLogoClick = () => {
    router.push(headerConfig.href);
  };

  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserMenuOpen(!userMenuOpen);
    setNotifOpen(false);
  };

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifOpen(!notifOpen);
    setUserMenuOpen(false);
  };

  // =========================================================================
  // 6. RENDER
  // =========================================================================

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center shadow-sm">
      <div className="w-full px-4 flex items-center justify-between">
        
        {/* --- LEFT SECTION (Logo & Toggle) --- */}
        <div className="flex items-center gap-4">
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-slate-100 rounded-md transition-colors lg:hidden text-slate-500"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Context Logo Area */}
          <div
            className="flex items-center gap-2 cursor-pointer group select-none"
            onClick={handleLogoClick}
            title={`Go to ${headerConfig.label}`}
          >
            {/* Logo Icon Box */}
            <div
              className={`w-8 h-8 rounded-md flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${headerConfig.bgColor}`}
            >
              {headerConfig.icon}
            </div>

            {/* Text Info */}
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none max-w-[200px] truncate">
                {headerConfig.title}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {headerConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* --- RIGHT SECTION (User & Tools) --- */}
        <div className="flex items-center gap-2">
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className={`p-2 rounded-full transition-colors relative ${
                notifOpen
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <Bell className="w-5 h-5" />
              {/* Dot thông báo giả lập */}
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white pointer-events-none"></span>
            </button>

            <NotificationPopover
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
            />
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

          {/* User Menu */}
          <div className="relative ml-1">
            <button
              onClick={toggleUserMenu}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold hover:bg-slate-900 transition-colors ring-2 ring-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {safeUser.name.charAt(0).toUpperCase()}
            </button>

            {userMenuOpen && (
              <UserMenu
                user={safeUser}
                onClose={() => setUserMenuOpen(false)}
                onLogout={logout}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}