"use client";

import { Users, FolderKanban, Briefcase, CheckSquare, Clock } from "lucide-react";
import StatsCard, { StatsCardVariant } from "@/components/features/admin/StartsCard"; // Đã sửa tên file từ StartsCard thành StatsCard cho đúng chính tả

export default function DashboardPage() {
  // 1. Cấu trúc dữ liệu mới khớp với StatsCard tối ưu
  const stats = [
    {
      icon: Users,
      value: "48",
      label: "Tổng thành viên",
      variant: "blue" as StatsCardVariant,
      trend: "+12% tháng này",
    },
    {
      icon: FolderKanban,
      value: "6",
      label: "Phòng ban",
      variant: "purple" as StatsCardVariant,
      trend: "Ổn định",
    },
    {
      icon: Briefcase,
      value: "23",
      label: "Dự án đang chạy",
      variant: "green" as StatsCardVariant,
      trend: "+3 dự án mới",
    },
    {
      icon: CheckSquare, // Đổi icon cho hợp ngữ cảnh Task
      value: "187",
      label: "Công việc hoàn thành",
      variant: "orange" as StatsCardVariant,
      trend: "+24 tuần này",
    },
  ];

  return (
    // 2. Nền xám nhạt toàn màn hình
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-900">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Tổng quan
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Chào mừng trở lại, <span className="text-slate-800">Nguyễn Văn Admin</span>!
          </p>
        </div>

        {/* Date Indicator (Optional) */}
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard 
            key={index} 
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            variant={stat.variant}
            trend={stat.trend}
          />
        ))}
      </div>
      
      {/* Khu vực này có thể thêm các Chart hoặc Table sau này */}
      {/* <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"> ... </div> */}

    </div>
  );
}