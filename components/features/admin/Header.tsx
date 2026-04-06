"use client";

// =============================================================================
// 1. IMPORTS
// =============================================================================

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Menu,
  Bell,
  Crown,
  LayoutGrid,
  Layers,
  FolderKanban,
} from "lucide-react";
import { usePathname, useRouter, useParams } from "next/navigation";

import UserMenu from "@/components/ui/UserMenu";
import NotificationPopover from "@/components/features/admin/NotificationPopover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import GlobalSearch from "@/components/features/core/search/GlobalSearch";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface HeaderProps {
  onMenuToggle: () => void;
}

type HeaderMode = "PORTAL" | "PROJECT" | "WORKSPACE" | "ADMIN";

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function AdminHeader({ onMenuToggle }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const { user, logout, activeCompany } = useAuth();

  // ---------------------------------------------------------------------------
  // 4. CONTEXT DETECTION
  // ---------------------------------------------------------------------------

  const determineMode = useMemo<HeaderMode>(() => {
    if (pathname?.startsWith("/portal")) return "PORTAL";
    if (pathname?.includes("/project/") && params.projectId) return "PROJECT";
    if (pathname?.startsWith("/core") && !params.projectId) return "WORKSPACE";
    return "ADMIN";
  }, [pathname, params]);

  const activeProject = useMemo(() => {
    if (determineMode !== "PROJECT" || !user?.projectMemberships) return null;
    const targetId = Number(params.projectId);
    return user.projectMemberships.find((p) => p.projectId === targetId);
  }, [determineMode, params.projectId, user?.projectMemberships]);

  const uiConfig = useMemo(() => {
    const configs = {
      PORTAL: {
        icon: <LayoutGrid className="w-4 h-4 text-white" />,
        label: "Member Portal",
        title: activeCompany?.companyName || "My Portal",
        bgColor: "bg-[#0052CC]", // Atlassian Blue
        href: "/portal",
      },
      PROJECT: {
        icon: <FolderKanban className="w-4 h-4 text-white" />,
        label: "Project Context",
        title: activeProject?.projectName || "Active Project",
        bgColor: "bg-[#006644]", // Atlassian Green
        href: `/core/workspace/${params.workspaceId}/project/${params.projectId}`,
      },
      WORKSPACE: {
        icon: <Layers className="w-4 h-4 text-white" />,
        label: "Department",
        title: activeCompany?.companyName || "Workspace",
        bgColor: "bg-[#403294]", // Atlassian Purple
        href: `/core/workspace/${params.workspaceId}`,
      },
      ADMIN: {
        icon: <Crown className="w-4 h-4 text-[#FF8B00]" />, // Atlassian Orange
        label: "Administration",
        title: "WorkNet Platform",
        bgColor: "bg-[#172B4D]", // Atlassian Dark Slate
        href: "/admin",
      },
    };
    return configs[determineMode];
  }, [determineMode, activeCompany, activeProject, params]);

  // ---------------------------------------------------------------------------
  // 5. EVENT HANDLERS
  // ---------------------------------------------------------------------------

  const handleUserMenuToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUserMenuOpen((prev) => !prev);
    setIsNotificationOpen(false);
  }, []);

  const handleNotificationToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNotificationOpen((prev) => !prev);
    setIsUserMenuOpen(false);
  }, []);

  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsNotificationOpen(false);
  }, [pathname]);

  // ---------------------------------------------------------------------------
  // 6. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#DFE1E6] h-16 flex items-center shadow-sm shrink-0">
      <div className="w-full px-5 flex items-center justify-between">
        {/* LEFT: Context Information */}
        <div className="flex items-center gap-5">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-[#F4F5F7] rounded-md transition-colors lg:hidden text-[#42526E]"
            title="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => router.push(uiConfig.href)}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105",
                uiConfig.bgColor,
              )}
            >
              {uiConfig.icon}
            </div>
            <div className="hidden sm:flex flex-col justify-center">
              <span className="font-black text-[15px] text-[#172B4D] tracking-tight block leading-tight max-w-[220px] truncate uppercase">
                {uiConfig.title}
              </span>
              <span className="text-[10px] font-black text-[#6B778C] uppercase tracking-[0.2em] block leading-none">
                {uiConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: Global Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-6">
          <GlobalSearch />
        </div>

        {/* RIGHT: User Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={handleNotificationToggle}
              className={cn(
                "p-2 rounded-full transition-all relative outline-none",
                isNotificationOpen
                  ? "bg-[#DEEBFF] text-[#0052CC]"
                  : "text-[#42526E] hover:bg-[#F4F5F7] hover:text-[#172B4D]",
              )}
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#FF5630] rounded-full border-2 border-white shadow-sm" />
            </button>
            <NotificationPopover
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
            />
          </div>

          <div className="w-px h-6 bg-[#DFE1E6] mx-2 hidden sm:block" />

          {/* User Profile */}
          <div className="relative ml-1">
            <button
              onClick={handleUserMenuToggle}
              className="focus:outline-none transition-transform active:scale-95"
            >
              <Avatar className="w-9 h-9 border-2 border-white shadow-sm ring-1 ring-[#DFE1E6] hover:ring-[#0052CC] transition-all">
                <AvatarImage
                  src={user?.avatarUrl ?? undefined}
                  alt={user?.fullName || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-[#172B4D] text-white text-[11px] font-black uppercase tracking-wider">
                  {user?.fullName?.substring(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>
            </button>

            {isUserMenuOpen && (
              <UserMenu
                user={{
                  name: user?.fullName || "User",
                  email: user?.email || "user@worknet.com",
                  avatarUrl: user?.avatarUrl ?? undefined,
                }}
                onClose={() => setIsUserMenuOpen(false)}
                onLogout={logout}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
