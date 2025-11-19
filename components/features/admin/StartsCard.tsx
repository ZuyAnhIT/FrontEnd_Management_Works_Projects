import { LucideIcon } from "lucide-react";

// 1. Định nghĩa Style Map (Nền nhạt + Icon đậm)
const variantStyles = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600", // Thêm màu đỏ cho các chỉ số cảnh báo
  default: "bg-slate-100 text-slate-600",
};

export type StatsCardVariant = keyof typeof variantStyles;

interface StatsCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  variant?: StatsCardVariant; // Dùng variant thay vì color string tùy ý
  trend?: string; // (Optional) Thêm chỉ số tăng giảm nếu cần
}

export default function StatsCard({
  icon: Icon,
  value,
  label,
  variant = "default",
  trend
}: StatsCardProps) {
  
  return (
    // Container: Nền trắng, viền xám, shadow nhẹ, bo góc chuẩn
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-4">
        
        {/* Icon Wrapper: Hình vuông bo góc, màu pastel */}
        <div 
          className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${variantStyles[variant] || variantStyles.default}`}
        >
          <Icon className="w-6 h-6" />
        </div>

        {/* Info Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate">
            {label}
          </p>
          
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900">
              {value}
            </h3>
            
            {/* Trend (Optional) - Ví dụ: +5% */}
            {trend && (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}