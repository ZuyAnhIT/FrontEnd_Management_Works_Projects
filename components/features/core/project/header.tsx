"use client";

import {
  Menu,
  Bell,
  Search,
  Settings,
  Plus,
  Filter,
  Share2,
} from "lucide-react";

import { useState } from "react";
import { usePathname, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CreateTaskModal } from "./create-task-modal";
import { CreateSprintModal } from "./create-sprint-modal";
import UserMenu from "@/components/ui/UserMenu";
import { useAuth } from "@/context/AuthContext";

interface ProjectHeaderProps {
  projectName?: string;
  onMenuToggle: () => void;
  onTaskCreate?: () => void;
  onSprintCreate?: () => void;
}

export default function ProjectHeader({
  projectName = "Project",
  onMenuToggle,
  onTaskCreate,
  onSprintCreate,
}: ProjectHeaderProps) {
  // =============================================
  // 📌 Lấy workspaceId & projectId từ URL
  // =============================================
  const params = useParams();
  const projectId = Number(params.projectId);
  const workspaceId = Number(params.workspaceId);

  // =============================================
  // 📌 Auth
  // =============================================
  const { user, logout } = useAuth();

  const safeUser = {
    name: user?.fullName || "User",
    email: user?.email || "user@example.com",
  };

  // =============================================
  // 📌 State
  // =============================================
  const [searchQuery, setSearchQuery] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const pathname = usePathname();

  // =============================================
  // 📌 Dynamic Title
  // =============================================
  const getPageTitle = () => {
    if (pathname?.includes("/board")) return "Board";
    if (pathname?.includes("/backlog")) return "Backlog";
    if (pathname?.includes("/sprints")) return "Sprints";
    if (pathname?.includes("/timeline")) return "Timeline";
    if (pathname?.includes("/summary")) return "Summary";
    return "Dashboard";
  };

  const getCreateButtonLabel = () =>
    pathname.includes("/sprints") ? "New Sprint" : "New Task";

  const handleCreateClick = () => {
    pathname.includes("/sprints")
      ? setShowSprintModal(true)
      : setShowTaskModal(true);
  };

  // =============================================
  // 📌 Logout
  // =============================================
  const handleLogout = async () => {
    await logout();
  };

  // =============================================
  // 📌 UI
  // =============================================
  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
        <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="p-2.5 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 rounded-xl transition-all duration-300 lg:hidden group"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden md:flex flex-col">
              <h1 className="text-sm font-semibold text-gray-900">{projectName}</h1>
              <p className="text-xs text-gray-500">{getPageTitle()}</p>
            </div>
          </div>

          {/* CENTER */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm 
                focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 lg:gap-3">
            <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-all hidden md:inline-flex">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>

            <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-all hidden md:inline-flex">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>

            {/* CREATE BUTTON */}
            <Button
              onClick={handleCreateClick}
              className="hidden md:flex gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{getCreateButtonLabel()}</span>
            </Button>

            <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-all">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-all relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* USER */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserMenuOpen(!userMenuOpen);
                }}
                className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl 
                flex items-center justify-center text-white font-bold hover:scale-110 transition-all shadow-lg"
              >
                {safeUser.name.charAt(0).toUpperCase()}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </button>

              {userMenuOpen && (
                <UserMenu
                  user={safeUser}
                  onClose={() => setUserMenuOpen(false)}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =============================================
          🔥 TASK MODAL — truyền params đúng
      ============================================= */}
      <CreateTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        projectId={projectId}
        workspaceId={workspaceId}
        onCreated={() => {
          onTaskCreate?.();
          setShowTaskModal(false);
        }}
      />

      {/* =============================================
          🔥 SPRINT MODAL
      ============================================= */}
      <CreateSprintModal
        isOpen={showSprintModal}
        onClose={() => setShowSprintModal(false)}
        projectId={projectId}
        onCreated={() => {
          onSprintCreate?.();
          setShowSprintModal(false);
        }}
      />
    </>
  );
}