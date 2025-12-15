import { LucideIcon } from "lucide-react";

// =============================================================================
// 1. STYLES & CONSTANTS (Định nghĩa giao diện)
// =============================================================================

// Map màu sắc cho Icon và Background (Nền nhạt + Icon đậm)
const VARIANT_STYLES = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
  default: "bg-slate-100 text-slate-600",
};

// =============================================================================
// 2. INTERFACES (Định nghĩa kiểu dữ liệu)
// =============================================================================

export type StatsCardVariant = keyof typeof VARIANT_STYLES;

interface StatsCardProps {
  icon: LucideIcon;           // Icon từ thư viện Lucide
  value: string | number;     // Giá trị hiển thị chính (VD: 1,234)
  label: string;              // Nhãn mô tả (VD: Total Users)
  variant?: StatsCardVariant; // Màu sắc chủ đạo (Mặc định: default)
  trend?: string;             // (Tùy chọn) Chỉ số xu hướng (VD: +5%)
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function StatsCard({
  icon: Icon,
  value,
  label,
  variant = "default",
  trend
}: StatsCardProps) {
  
  // Lấy class màu dựa trên variant, fallback về default nếu không khớp
  const iconStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

  return (
    // Container chính: Card trắng, đổ bóng nhẹ, hiệu ứng hover
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-4">
        
        {/* Khu vực Icon */}
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${iconStyle}`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Khu vực Nội dung */}
        <div className="flex-1 min-w-0">
          {/* Label */}
          <p className="text-sm font-medium text-slate-500 truncate">
            {label}
          </p>
          
          {/* Value & Trend */}
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900">
              {value}
            </h3>
            
            {/* Hiển thị xu hướng nếu có (Mặc định style xanh lá theo code cũ) */}
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