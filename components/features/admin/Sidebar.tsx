"use client";

import {
  Home,
  UserCheck,
  Plus,
  ChevronRight,
  ChevronLeft,
  Building,
  Users,
  FolderKanban,
  CreditCard,
  LayoutDashboard,
  Crown,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCompanyWorkspaces } from "@/app/api/apiWorkspace";
import { getCurrentUser } from "@/app/api/apiUser";
import { useToast } from "@/components/ui/ToastProvider";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeMenu: string;
  setActiveMenu: (id: string) => void;
}

export default function AdminSidebar({
  isOpen,
  onClose,
  activeMenu,
  setActiveMenu,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loadingWs, setLoadingWs] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  const isCompanyAdmin = pathname?.startsWith("/admin/company");
  const isUserAdmin = pathname?.startsWith("/admin") && !isCompanyAdmin;

  // 🧭 Menu chính cho Admin
  const defaultMenu = [
    { id: "home", icon: Home, label: "Trang chủ", path: "/admin/home" },
    { id: "tasks", icon: UserCheck, label: "Việc của tôi", path: "/admin/tasks" },
  ];

  const companyMenu = [
    { id: "dashboard", icon: LayoutDashboard, label: "Tổng quan", path: "/admin/company/dashboard" },
    { id: "info", icon: CreditCard, label: "Thông tin", path: "/admin/company/companyinfo" },
    { id: "members", icon: Users, label: "Thành viên", path: "/admin/company/members" },
    { id: "workspaces", icon: FolderKanban, label: "Phòng ban", path: "/admin/company/workspaces" },
    { id: "billing", icon: CreditCard, label: "Thanh toán", path: "/admin/company/billing" },
  ];

  const menuItems = isCompanyAdmin ? companyMenu : defaultMenu;

  // 🧩 1️⃣ Lấy thông tin công ty
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user?.company?.companyId) setCompanyId(user.company.companyId);
      } catch (err: any) {
        showToast(err.message || "Không thể lấy thông tin người dùng.", "error");
      }
    };
    fetchUser();
  }, [showToast]);

  // 🧩 2️⃣ Lấy danh sách workspace theo công ty
  useEffect(() => {
    if (!isUserAdmin || !companyId) return;
    const fetchWorkspaces = async () => {
      try {
        setLoadingWs(true);
        const data = await getCompanyWorkspaces(companyId);
        setWorkspaces(data || []);
      } catch (err: any) {
        showToast(err.message || "Không thể tải danh sách phòng ban", "error");
      } finally {
        setLoadingWs(false);
      }
    };
    fetchWorkspaces();
  }, [isUserAdmin, companyId, showToast]);

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
        bg-gradient-to-b from-white via-blue-50/30 to-white
        border-r border-gray-200/80 shadow-xl lg:shadow-none
        transition-all duration-300 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* ===== Header with Gradient ===== */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 p-4 shadow-lg">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex items-center justify-between">
            {/* Logo & Title */}
            <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Building className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {isCompanyAdmin && <Crown className="w-3.5 h-3.5 text-yellow-300" />}
                    <span className="font-bold text-white text-sm">
                      {isCompanyAdmin ? "Admin Panel" : "WorkNet"}
                    </span>
                  </div>
                  <span className="text-white/80 text-xs">
                    {isCompanyAdmin ? "Quản trị công ty" : "Dashboard"}
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
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Menu chính
              </div>
            )}
            
            {menuItems.map((item, index) => {
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
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                      : "text-gray-700 hover:bg-white hover:shadow-md"
                  } ${collapsed ? "justify-center" : ""}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <item.icon className={`w-5 h-5 transition-transform ${!isActive && "group-hover:scale-110"}`} />
                  {!collapsed && (
                    <span className={`flex-1 text-left font-medium ${isActive ? "font-semibold" : ""}`}>
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

          {/* ===== Danh sách Workspace ===== */}
          {isUserAdmin && !isCompanyAdmin && (
            <div className="space-y-2">
              {!collapsed && (
                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <FolderKanban className="w-3 h-3" />
                  Phòng ban
                </div>
              )}

              {loadingWs ? (
                !collapsed && (
                  <div className="flex items-center gap-2 px-3 py-2 text-gray-400 text-sm">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Đang tải...
                  </div>
                )
              ) : workspaces.length > 0 ? (
                <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                  {workspaces.map((ws, index) => {
                    const isActive = pathname === `/admin/workspaces/${ws.workspaceId}`;
                    return (
                      <button
                        key={ws.workspaceId}
                        onClick={() => {
                          router.push(`/admin/workspaces/${ws.workspaceId}`);
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-green-50 text-green-600 border border-green-200 shadow-sm"
                            : "hover:bg-gray-50 text-gray-700 border border-transparent"
                        } ${collapsed ? "justify-center" : ""}`}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className={`w-2 h-2 rounded-full transition-all ${
                          isActive 
                            ? "bg-green-500 shadow-lg shadow-green-500/50" 
                            : "bg-gray-300 group-hover:bg-gray-400"
                        }`}></div>
                        {!collapsed && (
                          <span className={`flex-1 text-left text-sm truncate ${
                            isActive ? "font-semibold" : ""
                          }`}>
                            {ws.workspaceName}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                !collapsed && (
                  <div className="px-3 py-2 text-gray-400 text-sm">
                    Chưa có phòng ban nào
                  </div>
                )
              )}

              {/* Create new workspace button */}
              <button
                onClick={() => {
                  router.push("/admin/company/workspaces");
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                {!collapsed && <span className="text-sm font-medium">Tạo phòng ban</span>}
              </button>
            </div>
          )}
        </nav>

        {/* ===== Footer - VIP Badge ===== */}
        <div className="p-4 border-t border-gray-200/50">
          {!collapsed ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-xl p-4 shadow-lg">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"></div>
              
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white text-xs font-medium mb-0.5">Gói hiện tại</div>
                  <div className="text-white font-bold text-sm flex items-center gap-1">
                    {isCompanyAdmin ? "Admin Pro" : "VIP Premium"}
                    <Sparkles className="w-3 h-3 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
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