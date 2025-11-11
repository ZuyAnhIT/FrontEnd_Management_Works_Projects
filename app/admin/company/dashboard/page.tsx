"use client";

import {
  Users,
  FolderKanban,
  CreditCard,
  Building2,
  UserPlus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

// 1. Định nghĩa các thẻ hành động
const actionLinks = [
  {
    icon: Building2,
    title: "Thông tin Công ty",
    desc: "Cập nhật tên, logo và địa chỉ.",
    href: "/admin/company/companyinfo",
    color: "blue",
  },
  {
    icon: Users,
    title: "Quản lý Thành viên",
    desc: "Mời, xóa hoặc thay đổi vai trò.",
    href: "/admin/company/members",
    color: "green",
  },
  {
    icon: FolderKanban,
    title: "Quản lý Phòng ban",
    desc: "Tạo, sửa đổi các workspace.",
    href: "/admin/company/workspaces",
    color: "purple",
  },
  {
    icon: CreditCard,
    title: "Thanh toán & Gói",
    desc: "Xem lịch sử và quản lý gói VIP.",
    href: "/admin/company/billing",
    color: "orange",
  },
];

// 2. Map màu (Sửa lỗi Tailwind Purge)
const colorMap = {
  icon: {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  },
  bg: {
    blue: "bg-blue-50",
    green: "bg-green-50",
    purple: "bg-purple-50",
    orange: "bg-orange-50",
  },
  hover: {
    blue: "hover:border-blue-300 hover:bg-blue-50/50",
    green: "hover:border-green-300 hover:bg-green-50/50",
    purple: "hover:border-purple-300 hover:bg-purple-50/50",
    orange: "hover:border-orange-300 hover:bg-orange-50/50",
  },
};

export default function CompanyDashboardPage() {
  const { user } = useAuth(); // Lấy thông tin user

  return (
    <div className="p-6">
      {/* 3. Header Chào mừng */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Chào mừng, {user?.fullName || "Admin"}!
        </h1>
        <p className="text-gray-600 text-lg">
          Đây là trung tâm quản lý của công ty bạn.
        </p>
      </div>

      {/* 4. Thẻ CTA mời thành viên */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl p-8 mb-8 shadow-2xl animate-fadeIn">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Bắt đầu xây dựng đội ngũ
              </h2>
              <p className="text-white/80">
                Mời thành viên mới để cùng nhau cộng tác.
              </p>
            </div>
          </div>
          <Link
            href="/admin/company/members"
            className="group flex-shrink-0 items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold hover:scale-105"
          >
            Mời thành viên
          </Link>
        </div>
      </div>

      {/* 5. Grid các Lối tắt (Shortcuts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actionLinks.map((item) => {
          const iconColor =
            colorMap.icon[item.color as keyof typeof colorMap.icon];
          const bgColor = colorMap.bg[item.color as keyof typeof colorMap.bg];
          const hoverStyle =
            colorMap.hover[item.color as keyof typeof colorMap.hover];

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`group flex items-start gap-5 p-6 bg-white rounded-2xl border-2 border-gray-200 
                          shadow-xl shadow-gray-500/5 
                          transition-all duration-300
                          ${hoverStyle} hover:scale-[1.02]`}
            >
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${bgColor} transition-all duration-300 group-hover:scale-110`}
              >
                <item.icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{item.desc}</p>
                <div className="font-medium text-sm text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Đi đến
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
