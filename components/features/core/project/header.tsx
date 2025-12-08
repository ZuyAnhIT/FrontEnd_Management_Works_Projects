"use client";

import {
  Menu,
  Bell,
  Search,
  Settings,
  Plus,
  HelpCircle
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
  const params = useParams();
  const projectId = Number(params.projectId);
  const workspaceId = Number(params.workspaceId);

  const { user, logout } = useAuth();

  const safeUser = {
    name: user?.fullName || "User",
    email: user?.email || "user@example.com",
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname?.includes("/board")) return "Board";
    if (pathname?.includes("/backlog")) return "Backlog";
    if (pathname?.includes("/sprints")) return "Sprints";
    if (pathname?.includes("/timeline")) return "Timeline";
    if (pathname?.includes("/calendar")) return "Calendar"; 
    if (pathname?.includes("/archived")) return "Archived Items"; 
    return "Dashboard";
  };

  const getCreateButtonLabel = () =>
    pathname.includes("/sprints") ? "Create sprint" : "Create";

  const handleCreateClick = () => {
    pathname.includes("/sprints")
      ? setShowSprintModal(true)
      : setShowTaskModal(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Header Container */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center">
        <div className="w-full px-4 flex items-center justify-between">
          
          {/* LEFT: Breadcrumbs / Title */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={onMenuToggle}
              className="p-2 hover:bg-slate-100 rounded-md transition-colors lg:hidden text-slate-500"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden md:flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium text-slate-600">
                 {projectName}
                 <span className="text-slate-300">/</span>
              </div>
              <h1 className="font-semibold text-slate-900">{getPageTitle()}</h1>
            </div>
          </div>

          {/* CENTER: Search Bar + Create Button */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl mx-6">
            {/* Search Input */}
            <div className="w-full relative group flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-8 bg-white border-2 border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded-[3px] text-sm text-slate-700 placeholder:text-slate-500 transition-all outline-none shadow-[inset_0_0_0_1px_#e2e8f0] focus:shadow-none"
              />
            </div>

            {/* Create Button (Đã di chuyển sang đây) */}
            <Button
              onClick={handleCreateClick}
              className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-[3px] shadow-sm transition-colors shrink-0"
            >
              <span className="hidden lg:inline mr-1">{getCreateButtonLabel()}</span>
              <Plus className="w-4 h-4 lg:hidden" /> {/* Icon only on smaller screens */}
            </Button>
          </div>

          {/* RIGHT: Actions & User */}
          <div className="flex items-center gap-1 shrink-0">
            
            {/* Icon Actions */}
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
               <HelpCircle className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-slate-200 mx-2 hidden md:block"></div>

            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserMenuOpen(!userMenuOpen);
                }}
                className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold hover:bg-slate-800 transition-colors ring-2 ring-white shadow-sm"
              >
                {safeUser.name.charAt(0).toUpperCase()}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2">
                    <UserMenu
                    user={safeUser}
                    onClose={() => setUserMenuOpen(false)}
                    onLogout={handleLogout}
                    />
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* MODALS */}
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