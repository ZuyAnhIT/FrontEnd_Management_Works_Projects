"use client";

import {
  Home,
  UserCheck,
  FolderKanban,
  ClipboardCheck,
  Settings,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Crown,
  Sparkles,
  X,
  Building2,
  Layers,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import { getCompanyWorkspaces } from "@/services/apiWorkspace";
import { getCurrentUser } from "@/services/apiUser";
import { useToast } from "@/components/ui/ToastProvider";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeMenu: string;
  setActiveMenu: (id: string) => void;
}

export default function MemberSidebar({
  isOpen,
  onClose,
  activeMenu,
  setActiveMenu,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjects, setShowProjects] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const workspaceId = params.workspaceId;
  const { showToast } = useToast();

  // Kiểm tra đang ở workspace nào
  const isWorkspaceView = pathname?.startsWith("/member/workspace/");

  // 🧩 Lấy companyId
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setCompanyId(user.company?.companyId || null);
      } catch (err: any) {
        showToast("Không thể tải thông tin người dùng", "error");
      }
    };
    fetchUser();
  }, [showToast]);

  // 🧩 Lấy danh sách workspace (khi ở core)
  useEffect(() => {
    if (!companyId) return;
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        const data = await getCompanyWorkspaces(companyId);
        setWorkspaces(data || []);
      } catch (err: any) {
        showToast(err.message || "Không thể tải phòng ban", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, [companyId, showToast]);

  // 🔹 Menu tổng quan (khi chưa chọn workspace)
  const memberMenu = [
    { id: "home", icon: Home, label: "Phòng ban", path: "/member" },
    { id: "home", icon: Home, label: "Công ty", path: "/member/company" },
    {
      id: "tasks",
      icon: UserCheck,
      label: "Việc của tôi",
      path: "/member/tasks",
    },
  ];

  // 🔹 Menu khi đã vào 1 workspace
  const workspaceMenu = [
    {
      id: "overview",
      icon: Home,
      label: "Tổng quan",
      path: `/member/workspace/`,
    },

    {
      id: "projects",
      icon: FolderKanban,
      label: "Dự án",
      children: [
        { name: "Dự án A", path: `/member/workspace/${workspaceId}/project-a` },
        { name: "Dự án B", path: `/member/workspace/${workspaceId}/project-b` },
      ],
    },
    {
      id: "create",
      icon: PlusCircle,
      label: "Tạo dự án",
      path: `/member/workspace/${workspaceId}/create-project`,
    },
    {
      id: "members",
      icon: ClipboardCheck,
      label: "Thành viên",
      path: `/member/workspace/${workspaceId}/members`,
    },
    {
      id: "settings",
      icon: Settings,
      label: "Cài đặt",
      path: `/member/workspace/${workspaceId}/settings`,
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 
        ${collapsed ? "w-20" : "w-72"} 
        bg-gradient-to-b from-white via-green-50/30 to-white
        border-r border-gray-200/80 shadow-xl lg:shadow-none
        transform transition-all duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        flex flex-col`}
      >
        {/* ===== Header with Gradient ===== */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-cyan-500 p-4 shadow-lg">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex items-center justify-between">
            {/* Logo & Title */}
            <div
              className={`flex items-center gap-3 ${
                collapsed ? "justify-center w-full" : ""
              }`}
            >
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                {isWorkspaceView ? (
                  <Briefcase className="w-5 h-5 text-white" />
                ) : (
                  <Building2 className="w-5 h-5 text-white" />
                )}
              </div>
              {!collapsed && (
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span className="font-bold text-white text-sm">
                      {isWorkspaceView ? "Workspace" : "WorkNet"}
                    </span>
                  </div>
                  <span className="text-white/80 text-xs">
                    {isWorkspaceView ? "Phòng ban" : "Công ty"}
                  </span>
                </div>
              )}
            </div>

            {/* Collapse button */}
            {!collapsed && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          {/* Expand button when collapsed */}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </button>
          )}

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* ===== Menu chính ===== */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* 🔸 Nếu đang ở core (chưa vào workspace) */}
          {!isWorkspaceView && (
            <>
              {/* Main Navigation */}
              <div className="space-y-1">
                {!collapsed && (
                  <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Menu chính
                  </div>
                )}

                {memberMenu.map((item, index) => {
                  const isActive = pathname === item.path;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveMenu(item.id);
                        router.push(item.path);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 animate-fadeInUp ${
                        isActive
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 scale-[1.02]"
                          : "text-gray-700 hover:bg-white hover:shadow-md"
                      } ${collapsed ? "justify-center" : ""}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <item.icon
                        className={`w-5 h-5 transition-transform ${
                          !isActive && "group-hover:scale-110"
                        }`}
                      />
                      {!collapsed && (
                        <span
                          className={`flex-1 text-left font-medium ${
                            isActive ? "font-semibold" : ""
                          }`}
                        >
                          {item.label}
                        </span>
                      )}
                      {!collapsed && isActive && (
                        <ChevronRight className="w-4 h-4 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Danh sách phòng ban */}
              {!collapsed && (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3 h-3" />
                    Phòng ban
                  </div>

                  {loading ? (
                    <div className="flex items-center gap-2 px-3 py-2 text-gray-400 text-sm">
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      Đang tải...
                    </div>
                  ) : workspaces.length > 0 ? (
                    <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                      {workspaces.map((ws, index) => {
                        const isActive =
                          pathname === `/member/workspace/${ws.workspaceId}`;
                        const isAdmin = ws.roleCode?.includes("ADMIN");
                        return (
                          <button
                            key={ws.workspaceId}
                            onClick={() => {
                              router.push(
                                `/member/workspace/${ws.workspaceId}`
                              );
                              if (window.innerWidth < 1024) onClose();
                            }}
                            className={`group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-green-50 text-green-600 border border-green-200 shadow-sm"
                                : "hover:bg-gray-50 text-gray-700 border border-transparent"
                            }`}
                            style={{ animationDelay: `${index * 30}ms` }}
                          >
                            <FolderKanban className="w-4 h-4 flex-shrink-0" />
                            <span
                              className={`flex-1 text-left text-sm truncate ${
                                isActive ? "font-semibold" : ""
                              }`}
                            >
                              {ws.workspaceName}
                            </span>
                            {isAdmin && (
                              <span className="flex-shrink-0 text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm flex items-center gap-1">
                                <Crown className="w-3 h-3" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-gray-400 text-sm">
                      Chưa có phòng ban nào
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* 🔹 Nếu đang ở trong workspace */}
          {isWorkspaceView && (
            <div className="space-y-1">
              {!collapsed && (
                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Workspace Menu
                </div>
              )}

              {workspaceMenu.map((item, index) => {
                const isActive = pathname === item.path;
                const hasChildren = !!item.children;

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        if (hasChildren) {
                          setShowProjects(!showProjects);
                        } else if (item.path) {
                          router.push(item.path);
                          if (window.innerWidth < 1024) onClose();
                        }
                      }}
                      className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 animate-fadeInUp ${
                        isActive
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 scale-[1.02]"
                          : "text-gray-700 hover:bg-white hover:shadow-md"
                      } ${collapsed ? "justify-center" : ""}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <item.icon
                        className={`w-5 h-5 transition-transform ${
                          !isActive && "group-hover:scale-110"
                        }`}
                      />
                      {!collapsed && (
                        <span
                          className={`flex-1 text-left font-medium ${
                            isActive ? "font-semibold" : ""
                          }`}
                        >
                          {item.label}
                        </span>
                      )}
                      {!collapsed &&
                        hasChildren &&
                        (showProjects ? (
                          <ChevronUp className="w-4 h-4 transition-transform" />
                        ) : (
                          <ChevronDown className="w-4 h-4 transition-transform" />
                        ))}
                    </button>

                    {/* Submenu dự án */}
                    {!collapsed && hasChildren && showProjects && (
                      <div className="ml-9 mt-1 space-y-1 animate-fadeInUp">
                        {item.children?.map((sub, subIndex) => {
                          const isSubActive = pathname === sub.path;
                          return (
                            <button
                              key={sub.path}
                              onClick={() => {
                                router.push(sub.path);
                                if (window.innerWidth < 1024) onClose();
                              }}
                              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                                isSubActive
                                  ? "bg-green-100 text-green-700 font-semibold shadow-sm"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                              style={{ animationDelay: `${subIndex * 30}ms` }}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isSubActive ? "bg-green-500" : "bg-gray-400"
                                  }`}
                                ></div>
                                {sub.name}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        {/* ===== Footer - Status Badge ===== */}
        <div className="p-4 border-t border-gray-200/50">
          {!collapsed ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-green-400 via-emerald-400 to-cyan-500 rounded-xl p-4 shadow-lg">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"></div>

              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  {isWorkspaceView ? (
                    <Crown className="w-5 h-5 text-white" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <div className="text-white text-xs font-medium mb-0.5">
                    {isWorkspaceView ? "Quyền hạn" : "Trạng thái"}
                  </div>
                  <div className="text-white font-bold text-sm flex items-center gap-1">
                    {isWorkspaceView ? "Workspace Admin" : "Người dùng VIP"}
                    <Sparkles className="w-3 h-3 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                {isWorkspaceView ? (
                  <Crown className="w-6 h-6 text-white" />
                ) : (
                  <Sparkles className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .bg-grid-white\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        .animate-shine {
          animation: shine 3s infinite;
        }
      `}</style>
    </>
  );
}
