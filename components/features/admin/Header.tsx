"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { 
  Menu, Bell, Crown, 
  LayoutGrid, Layers, FolderKanban 
} from "lucide-react";
import { usePathname, useRouter, useParams } from "next/navigation";

// Internal Components & Contexts
import UserMenu from "@/components/ui/UserMenu";
import NotificationPopover from "@/components/features/admin/NotificationPopover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface HeaderProps {
  onMenuToggle: () => void;
}

type HeaderMode = "PORTAL" | "PROJECT" | "WORKSPACE" | "ADMIN";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AdminHeader({ onMenuToggle }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  
  const { user, logout, activeCompany } = useAuth();

  // ---------------------------------------------------------------------------
  // CONTEXT DETECTION
  // ---------------------------------------------------------------------------

  const currentMode: HeaderMode = useMemo(() => {
    if (pathname?.startsWith("/portal")) return "PORTAL";
    if (pathname?.includes("/project/") && params.projectId) return "PROJECT";
    if (pathname?.startsWith("/core") && !params.projectId) return "WORKSPACE";
    return "ADMIN";
  }, [pathname, params]);

  const currentProject = useMemo(() => {
    if (currentMode !== "PROJECT" || !user?.projectMemberships) return null;
    const pId = Number(params.projectId);
    return user.projectMemberships.find((p) => p.projectId === pId);
  }, [currentMode, params.projectId, user?.projectMemberships]);

  // ---------------------------------------------------------------------------
  // UI CONFIGURATION
  // ---------------------------------------------------------------------------

  const headerConfig = useMemo(() => {
    const configs = {
      PORTAL: {
        icon: <LayoutGrid className="w-4 h-4 text-white" />,
        label: "Member Portal",
        title: activeCompany?.companyName || "My Portal",
        bgColor: "bg-blue-600",
        href: "/portal",
      },
      PROJECT: {
        icon: <FolderKanban className="w-4 h-4 text-white" />,
        label: "Project Workspace",
        title: currentProject?.projectName || "Project",
        bgColor: "bg-emerald-600",
        href: `/core/workspace/${params.workspaceId}/project/${params.projectId}`,
      },
      WORKSPACE: {
        icon: <Layers className="w-4 h-4 text-white" />,
        label: "Workspace Core",
        title: activeCompany?.companyName || "Workspace",
        bgColor: "bg-indigo-600",
        href: `/core/workspace/${params.workspaceId}`,
      },
      ADMIN: {
        icon: <Crown className="w-4 h-4 text-yellow-400" />,
        label: "Admin Panel",
        title: "WorkNet",
        bgColor: "bg-slate-900",
        href: "/admin",
      }
    };
    return configs[currentMode];
  }, [currentMode, activeCompany, currentProject, params]);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  const toggleUserMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setUserMenuOpen((prev) => !prev);
    setNotifOpen(false);
  }, []);

  const toggleNotifications = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifOpen((prev) => !prev);
    setUserMenuOpen(false);
  }, []);

  useEffect(() => {
    setUserMenuOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center shadow-sm shrink-0">
      <div className="w-full px-4 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-slate-100 rounded-md transition-colors lg:hidden text-slate-500"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => router.push(headerConfig.href)}
          >
            <div className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center shadow-sm transition-all group-hover:scale-105",
              headerConfig.bgColor
            )}>
              {headerConfig.icon}
            </div>

            <div className="hidden sm:block">
              <span className="font-bold text-base text-slate-900 tracking-tight block leading-none max-w-[220px] truncate">
                {headerConfig.title}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
                {headerConfig.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className={cn(
                "p-2 rounded-full transition-all relative",
                notifOpen 
                  ? "bg-blue-50 text-blue-600 shadow-inner" 
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              )}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <NotificationPopover
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
            />
          </div>

          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

          <div className="relative ml-1">
            <button
              onClick={toggleUserMenu}
              className="focus:outline-none transition-transform active:scale-95"
            >
              <Avatar className="w-8 h-8 border-2 border-white shadow-sm ring-1 ring-slate-200 hover:ring-blue-400 transition-all">
                {/* FIX: Chuyển null thành undefined cho prop src */}
                <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.fullName || "User"} />
                <AvatarFallback className="bg-slate-800 text-white text-[10px] font-bold uppercase">
                  {user?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </button>

            {userMenuOpen && (
              <UserMenu
                user={{
                  name: user?.fullName || "User",
                  email: user?.email || "user@worknet.com",
                  // FIX: Chuyển null thành undefined cho prop avatarUrl
                  avatarUrl: user?.avatarUrl ?? undefined
                }}
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