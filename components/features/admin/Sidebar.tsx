"use client";
import {
  Home,
  UserCheck,
  Plus,
  ChevronRight,
  Building,
  ChevronLeft,
  Users,
  FolderKanban,
  CreditCard,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeMenu: string;
  setActiveMenu: (id: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  activeMenu,
  setActiveMenu,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Xác định sidebar kiểu nào hiển thị
  const isCompanyAdmin = pathname?.startsWith("/admin/company");
  const isUserAdmin = pathname?.startsWith("/admin") && !isCompanyAdmin;

  // 🧭 Sidebar mặc định cho user
  const defaultMenu = [
    { id: "home", icon: Home, label: "Trang chủ", path: "/admin/home" },
    { id: "tasks", icon: UserCheck, label: "Việc của tôi", path: "/admin/tasks" },
  ];

  // 🏢 Sidebar cho quản trị công ty
  const companyMenu = [
    { id: "dashboard", icon: LayoutDashboard, label: "Tổng quan", path: "/admin/company/dashboard" },
    { id: "members", icon: Users, label: "Thành viên", path: "/admin/company/members" },
    { id: "workspaces", icon: FolderKanban, label: "Không gian làm việc", path: "/admin/company/workspaces" },
    { id: "billing", icon: CreditCard, label: "Thanh toán", path: "/admin/company/billing" },
  ];

  const departments = [
    { id: "tech", label: "Phòng Kỹ thuật" },
    { id: "marketing", label: "Phòng Marketing" },
    { id: "hr", label: "Phòng Nhân sự" },
  ];

  // 🧩 Chọn danh sách menu dựa theo route
  const menuItems = isCompanyAdmin ? companyMenu : defaultMenu;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 
        ${collapsed ? "w-20" : "w-64"} 
        bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        flex flex-col`}
      >
        {/* ===== Header Công ty + Nút thu gọn ===== */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between relative">
          <div
            className={`flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg transition-all ${
              collapsed ? "justify-center w-full" : ""
            }`}
          >
            <Building className="w-5 h-5 text-blue-600" />
            {!collapsed && (
              <span className="font-medium">
                {isCompanyAdmin ? "Quản trị Công ty" : "WorkNet"}
              </span>
            )}
          </div>

          {/* 🔽 Nút thu gọn sidebar */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 absolute top-1/2 right-3 -translate-y-1/2"
            aria-label="Thu gọn / Mở rộng"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* ===== Menu chính ===== */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1 mb-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  router.push(item.path);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  pathname === item.path
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </div>

          {/* ===== Phòng ban chỉ hiện ở sidebar thường ===== */}
          {isUserAdmin && !collapsed && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Phòng ban
              </div>
              <div className="space-y-1">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => setActiveMenu(dept.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      activeMenu === dept.id
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span className="flex-1 text-left">{dept.label}</span>
                  </button>
                ))}
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
                  <Plus className="w-4 h-4" />
                  <span>Tạo phòng ban mới</span>
                </button>
              </div>
            </>
          )}
        </nav>

        {/* ===== Footer gói dịch vụ ===== */}
        <div className="p-4 border-t border-gray-200">
          {!collapsed ? (
            <div className="text-xs text-gray-500">
              <div>Gói VIP</div>
              <div className="text-blue-600 font-medium">
                {isCompanyAdmin ? "Quản trị nâng cao" : "Không giới hạn"}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="text-[10px] text-blue-600 font-semibold">
                VIP
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
