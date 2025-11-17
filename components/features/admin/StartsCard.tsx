import { LucideIcon } from "lucide-react";

// 1. Định nghĩa màu ngữ nghĩa
type CardColor = "blue" | "green" | "purple" | "orange" | string;

interface StatsCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  color: CardColor; // 2. Dùng kiểu an toàn
}

// 3. Tạo một Map để Tailwind "thấy" được các class này
const colorMap: Record<CardColor, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
};

export default function StatsCard({
  icon: Icon,
  value,
  label,
  color,
}: StatsCardProps) {
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-6 
                    transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div
        // 4. Dùng Map để lấy class
        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
          colorMap[color] || "bg-gray-500"
        } transition-all duration-300 group-hover:scale-110`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
}