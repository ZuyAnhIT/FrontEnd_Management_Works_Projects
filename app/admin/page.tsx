import { Users, FolderKanban, Briefcase, UserCheck } from "lucide-react";
import StatsCard from "@/components/features/admin/StartsCard";

export default function DashboardPage() {
  const stats = [
    {
      icon: Users,
      value: "48",
      label: "Tổng thành viên",
      color: "bg-blue-500",
    },
    {
      icon: FolderKanban,
      value: "6",
      label: "Phòng ban",
      color: "bg-green-500",
    },
    {
      icon: Briefcase,
      value: "23",
      label: "Dự án đang chạy",
      color: "bg-purple-500",
    },
    {
      icon: UserCheck,
      value: "187",
      label: "Công việc",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Chào mừng trở lại, Nguyễn Văn Admin!
        </h1>
        <p className="text-gray-600">Tổng quan về Công ty ABC</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
}