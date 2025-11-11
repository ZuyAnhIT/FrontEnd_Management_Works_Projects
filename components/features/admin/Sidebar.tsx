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
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // 1. Import useAuth

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeMenu: string;
  setActiveMenu: (id: string) => void;
  workspaces: any[]; // 2. Nhận props
  loadingWs: boolean; // 2. Nhận props
}

export default function AdminSidebar({
  isOpen,
  onClose,
  activeMenu,
  setActiveMenu,
  workspaces, // 3. Dùng props
  loadingWs, // 3. Dùng props
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // 4. Lấy role từ Context để kiểm tra
  const { role } = useAuth();

  // 5. Logic kiểm tra trang (đã đúng)
  const isCompanyAdminPage = pathname?.startsWith("/admin/company");
  const isUserAdminPage = pathname?.startsWith("/admin") && !isCompanyAdminPage;

  // 6. Logic kiểm tra vai trò
  const isCompanyAdminRole = role === "COMPANY_ADMIN";

  // 7. Menu (đã đúng)
  const defaultMenu = [
    { id: "home", icon: Home, label: "Trang chủ", path: "/admin" }, // Sửa path
    {
      id: "tasks",
      icon: UserCheck,
      label: "Việc của tôi",
      path: "/admin/tasks",
    },
  ];
  const companyMenu = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Tổng quan",
      path: "/admin/company/dashboard",
    },
    {
      id: "info",
      icon: CreditCard,
      label: "Thông tin",
      path: "/admin/company/companyinfo",
    },
    {
      id: "members",
      icon: Users,
      label: "Thành viên",
      path: "/admin/company/members",
    },
    {
      id: "workspaces",
      icon: FolderKanban,
      label: "Phòng ban",
      path: "/admin/company/workspaces",
    },
    {
      id: "project",
      icon: FolderKanban,
      label: "Dự án",
      path: "/admin/company/project",
    },
    {
      id: "billing",
      icon: CreditCard,
      label: "Thanh toán",
      path: "/admin/company/billing",
    },
  ];

  const menuItems = isCompanyAdminPage ? companyMenu : defaultMenu;

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
          {/* ... (Code UI Header của Sidebar) ... */}
          <div className="relative z-10 flex items-center justify-between">
            <div
              className={`flex items-center gap-3 ${
                collapsed ? "justify-center w-full" : ""
              }`}
            >
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Building className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {isCompanyAdminRole && (
                      <Crown className="w-3.5 h-3.5 text-yellow-300" />
                    )}
                    <span className="font-bold text-white text-sm">
                      {isCompanyAdminPage ? "Admin Panel" : "WorkNet"}
                    </span>
                  </div>
                  <span className="text-white/80 text-xs">
                    {isCompanyAdminPage ? "Quản trị công ty" : "Dashboard"}
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

          {/* ===== Danh sách Workspace ===== */}
          {isUserAdminPage && isCompanyAdminRole && (
            <div className="space-y-2">
              {!collapsed && (
                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <FolderKanban className="w-3 h-3" />
                  Phòng ban
                </div>
              )}

              {/* 11. Dùng state từ props */}
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
                    const isActive =
                      pathname === `/admin/workspaces/${ws.workspaceId}`; // Tạm giữ link admin này
                    return (
                      <button
                        key={ws.workspaceId}
                        onClick={() => {
                          // TỐI ƯU "NHẬP VAI": Chuyển sang /core/
                          router.push(`/core/workspace/${ws.workspaceId}`);
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-green-50 text-green-600 border border-green-200 shadow-sm"
                            : "hover:bg-gray-50 text-gray-700 border border-transparent"
                        } ${collapsed ? "justify-center" : ""}`}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div
                          className={`w-2 h-2 rounded-full transition-all ${
                            isActive
                              ? "bg-green-500 shadow-lg shadow-green-500/50"
                              : "bg-gray-300 group-hover:bg-gray-400"
                          }`}
                        ></div>
                        {!collapsed && (
                          <span
                            className={`flex-1 text-left text-sm truncate ${
                              isActive ? "font-semibold" : ""
                            }`}
                          >
                            {ws.workspaceName}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                // ✅ ĐÂY LÀ PHẦN SỬA LỖI (Dòng 177 cũ)
                // Thêm lại code hiển thị "Chưa có phòng ban"
                !collapsed && (
                  <div className="px-3 py-2 text-gray-400 text-sm">
                    Chưa có phòng ban nào
                  </div>
                )
              )}

              {/* Create new workspace button */}
              <button
                onClick={() => {
                  router.push("/admin/company/workspaces"); // Link này đúng
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                {!collapsed && (
                  <span className="text-sm font-medium">Tạo phòng ban</span>
                )}
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
                  <div className="text-white text-xs font-medium mb-0.5">
                    Gói hiện tại
                  </div>
                  <div className="text-white font-bold text-sm flex items-center gap-1">
                    {isCompanyAdminRole ? "Admin Pro" : "VIP Premium"}
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

      {/* Style (giữ nguyên) */}
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
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
