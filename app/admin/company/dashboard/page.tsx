import { Users, FolderKanban, Briefcase, UserCheck } from "lucide-react";
import StatsCard from "@/components/features/admin/StartsCard";

export default function DashboardPage() {
  const stats = [
    { icon: Users, value: "48", label: "Tổng thành viên", color: "bg-blue-500" },
    { icon: FolderKanban, value: "6", label: "Phòng ban", color: "bg-green-500" },
    { icon: Briefcase, value: "23", label: "Dự án đang chạy", color: "bg-purple-500" },
    { icon: UserCheck, value: "187", label: "Công việc", color: "bg-orange-500" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Tổng quan Công ty</h1>
      <p className="text-gray-600 mb-6">Thống kê tổng thể về hoạt động công ty</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <StatsCard key={i} {...s} />
        ))}
      </div>
    </div>
  );
}
