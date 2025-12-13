"use client";

import { useState, useMemo } from "react";
import { 
  Menu, Bell, Crown, ArrowLeft, 
  LayoutGrid, Layers, FolderKanban 
} from "lucide-react";
import { usePathname, useRouter, useParams } from "next/navigation";
import UserMenu from "@/components/ui/UserMenu";
import { useAuth } from "@/context/AuthContext";
import NotificationPopover from "@/components/features/admin/NotificationPopover";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function AdminHeader({ onMenuToggle }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const params = useParams(); // ✅ Lấy params để check ID
  
  const { user, logout, activeCompany } = useAuth();

  // --- 1. DETECT CONTEXT ---
  const isPortal = pathname?.startsWith("/portal");
  
  // Kiểm tra Project trước (vì đường dẫn project cũng chứa /core)
  const isProject = pathname?.includes("/project/") && !!params.projectId;
  
  // Core là các trang workspace nhưng không phải project
  const isCore = pathname?.startsWith("/core") && !isProject; 
  
  // const isCompanyAdminPage = pathname?.startsWith("/admin/company");

  // --- 2. DATA LOOKUP (Tìm tên dự án hiện tại) ---
  const currentProject = useMemo(() => {
    if (!isProject || !user?.projectMemberships) return null;
    const pId = Number(params.projectId);
    return user.projectMemberships.find((p) => p.projectId === pId);
  }, [isProject, params.projectId, user?.projectMemberships]);

  // --- 3. HANDLERS ---
  const handleLogoClick = () => {
    if (isPortal) {
      router.push("/portal");
    } else if (isProject) {
      // Nếu đang ở Project -> Click về trang tổng quan Project đó
      router.push(`/core/workspace/${params.workspaceId}/project/${params.projectId}`);
    } else if (isCore) {
      // Nếu đang ở Workspace -> Click về trang tổng quan Workspace
      router.push(`/core/workspace/${params.workspaceId}`);
    } else {
      // Mặc định về Admin
      router.push("/admin");
    }
  };

  const safeUser = {
    name: user?.fullName || "User",
    email: user?.email || "user@worknet.com",
  };

  // --- 4. RENDER HELPERS (Logo, Text, Color) ---

  // Helper render Logo Icon
  const renderLogoIcon = () => {
    if (isPortal) return <LayoutGrid className="w-4 h-4 text-white" />;
    if (isProject) return <FolderKanban className="w-4 h-4 text-white" />; // ✅ Icon Project
    if (isCore) return <Layers className="w-4 h-4 text-white" />;
    return <Crown className="w-4 h-4 text-yellow-400" />; // Admin
  };

  // Helper render Logo Text
  const renderLogoText = () => {
    if (isProject) return currentProject?.projectName || "Project"; // ✅ Tên Dự án
    if (isCore) {
        // Tìm tên Workspace trong list (nếu cần chính xác), hoặc hiển thị tên Cty
        // Ở đây hiển thị tên Cty để giữ ngữ cảnh lớn, hoặc có thể fetch workspaceName
        return activeCompany ? activeCompany.companyName : "Workspace"; 
    }
    if (isPortal) return activeCompany ? activeCompany.companyName : "My Portal";
    return "WorkNet";
  };

  // Helper render Label (Sub-text)
  const renderLogoLabel = () => {
    if (isPortal) return "Member Portal";
    if (isProject) return "Project "; // ✅ Label Project
    if (isCore) return "Workspace Core";
    return "Admin Panel";
  };

  // Helper Background Color
  const getLogoBg = () => {
    if (isPortal) return "bg-blue-600";
    if (isProject) return "bg-emerald-600"; // ✅ Màu xanh lá cho Project
    if (isCore) return "bg-indigo-600";     // Màu tím cho Workspace
    return "bg-slate-900";                  // Màu đen cho Admin
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center shadow-sm">
      <div className="w-full px-4 flex items-center justify-between">
        
        {/* LEFT SECTION */}
        <div className="flex items-center gap-4">
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-slate-100 rounded-md transition-colors lg:hidden text-slate-500"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo / Context Name Area */}
          <div
            className="flex items-center gap-2 cursor-pointer group select-none"
            onClick={handleLogoClick}
          >
            {/* Logo Icon */}
            <div
              className={`w-8 h-8 rounded-md flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${getLogoBg()}`}
            >
              {renderLogoIcon()}
            </div>

            {/* Text Info */}
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none max-w-[200px] truncate">
                {renderLogoText()}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {renderLogoLabel()}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2">
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNotifOpen(!notifOpen);
                setUserMenuOpen(false);
              }}
              className={`p-2 rounded-full transition-colors relative ${
                notifOpen
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white pointer-events-none"></span>
            </button>

            <NotificationPopover
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
            />
          </div>

          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

          {/* User Menu */}
          <div className="relative ml-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuOpen(!userMenuOpen);
                setNotifOpen(false);
              }}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold hover:bg-slate-900 transition-colors ring-2 ring-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {safeUser.name?.charAt(0)?.toUpperCase() || "U"}
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