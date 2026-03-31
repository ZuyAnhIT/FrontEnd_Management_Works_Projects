"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, X } from "lucide-react";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

/**
 * Định nghĩa cấu trúc cho một tùy chọn lọc
 */
export interface FilterOption {
  label: string;      // Tên hiển thị của lựa chọn
  value: string | number; // Giá trị định danh dùng để lọc
  icon?: React.ReactNode; // Biểu tượng hoặc ảnh đại diện đi kèm
  color?: string;     // Màu sắc nhận diện (thường dùng cho nhãn trạng thái)
}

/**
 * Thuộc tính đầu vào của thành phần bộ lọc nhanh (Popover)
 */
export interface FilterPopoverProps {
  label: string;       // Nhãn của bộ lọc (ví dụ: Người thực hiện)
  icon: React.ReactNode; // Biểu tượng đại diện cho loại bộ lọc
  options: FilterOption[];
  value?: string | number;
  onChange: (val: any) => void;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần bộ lọc thả xuống (Popover Filter).
 * Cho phép người dùng chọn một giá trị từ danh sách để lọc dữ liệu.
 */
export default function FilterPopover({ 
  label, 
  icon, 
  options, 
  value, 
  onChange 
}: FilterPopoverProps) {
  // ---------------------------------------------------------------------------
  // 1. STATE & REFS
  // ---------------------------------------------------------------------------
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // 2. LOGIC HANDLERS
  // ---------------------------------------------------------------------------

  // Xử lý đóng menu khi người dùng nhấn chuột ra ngoài vùng điều khiển
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * Xóa bộ lọc hiện tại và đặt về trạng thái mặc định
   */
  const handleClearFilter = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn hành vi mở menu khi xóa
    onChange(undefined);
  }, [onChange]);

  // Xác định tùy chọn hiện đang được chọn và trạng thái hoạt động của bộ lọc
  const selectedOption = options.find((opt) => opt.value === value);
  const isActive = value !== undefined && value !== "ALL";

  // ---------------------------------------------------------------------------
  // 3. RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="relative" ref={containerRef}>
      {/* Nút kích hoạt bộ lọc */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 shrink-0",
          isActive
            ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
        )}
        title={isActive ? `Filter by: ${selectedOption?.label}` : `Filter by ${label}`}
      >
        {/* Biểu tượng phân loại */}
        <span className={cn(isActive ? "text-blue-600" : "text-slate-400")}>
          {icon}
        </span>

        {/* Nội dung hiển thị */}
        <span className="truncate max-w-[100px]">
          {isActive ? selectedOption?.label : label}
        </span>

        {/* Nút điều hướng hoặc nút xóa nhanh */}
        {isActive ? (
          <span
            onClick={handleClearFilter}
            className="p-0.5 hover:bg-blue-200 rounded-full cursor-pointer transition-colors"
            title="Clear Filter"
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        )}
      </button>

      {/* Menu danh sách các lựa chọn */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 overflow-hidden origin-top-left">
          <div className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
            
            {/* Lựa chọn mặc định (Tất cả) */}
            <button
              onClick={() => { onChange("ALL"); setIsOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-600 flex items-center justify-between group transition-colors"
            >
              <span>All {label}s</span>
              {(!isActive || value === "ALL") && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>

            <div className="h-px bg-slate-100 my-1" />

            {/* Danh sách các lựa chọn cụ thể */}
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Hiển thị Icon, Avatar hoặc chỉ dấu màu sắc nếu có */}
                  {opt.icon ? (
                    <span className="shrink-0">{opt.icon}</span>
                  ) : opt.color ? (
                    <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", opt.color)} />
                  ) : null}

                  <span className="truncate">{opt.label}</span>
                </div>

                {/* Đánh dấu lựa chọn hiện tại */}
                {value === opt.value && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}