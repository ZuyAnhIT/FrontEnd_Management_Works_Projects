"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

// Thư viện bên ngoài
import React, { useMemo, useCallback } from "react";
import { 
  Search, 
  Filter, 
  Users, 
  AlertCircle, 
  Layers, 
  X, 
  ChevronDown, 
  LucideIcon 
} from "lucide-react";

// Internal Services & Types
import { ProjectMember, ArchivedTaskParams } from "@/services/apiProject";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & CONFIG
// =============================================================================

const PRIORITY_OPTIONS = [
  { label: "Urgent", value: "URGENT" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
];

const TASK_TYPE_OPTIONS = [
  { label: "Task", value: "TASK" },
  { label: "Bug", value: "BUG" },
  { label: "Story", value: "STORY" },
];

// =============================================================================
// 3. SUB-COMPONENT: SELECT WRAPPER
// =============================================================================

interface SelectWrapperProps {
  icon: LucideIcon;
  value: string | number | undefined;
  onChange: (value: string) => void;
  options: React.ReactNode;
  placeholder: string;
  minWidth?: string;
}

/**
 * Thành phần bao bọc ô lựa chọn (Select Box) với icon tùy chỉnh.
 * Cung cấp giao diện nhất quán cho tất cả các bộ lọc dạng danh sách.
 */
const SelectWrapper = ({ 
  icon: Icon, 
  value, 
  onChange, 
  options, 
  placeholder, 
  minWidth = "min-w-[140px]" 
}: SelectWrapperProps) => (
  <div className="relative group">
    <Icon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 transition-colors z-10" />
    <select 
      className={cn(
        "h-9 pl-9 pr-8 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 uppercase tracking-tight",
        "appearance-none cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500",
        "transition-all shadow-sm",
        minWidth
      )}
      value={value || "ALL"}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="ALL">{placeholder}</option>
      {options}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none opacity-60" />
  </div>
);

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

interface ArchivedFilterBarProps {
  filters: ArchivedTaskParams;
  onFilterChange: (key: keyof ArchivedTaskParams, value: any) => void;
  onClear: () => void;
  members: ProjectMember[];
}

/**
 * Thanh công cụ tìm kiếm và lọc cho danh sách Công việc đã lưu trữ (Archived Tasks).
 * Hỗ trợ lọc theo từ khóa, người thực hiện, mức độ ưu tiên và loại công việc.
 */
export default function ArchivedFilterBar({ 
  filters, 
  onFilterChange, 
  onClear,
  members = [] 
}: ArchivedFilterBarProps) {

  // ---------------------------------------------------------------------------
  // 5. LOGIC & HANDLERS
  // ---------------------------------------------------------------------------
  
  /**
   * Xử lý cập nhật giá trị bộ lọc
   */
  const handleUpdateFilter = useCallback((key: keyof ArchivedTaskParams, val: string) => {
    // Nếu chọn giá trị mặc định, xóa tham số đó khỏi bộ lọc (undefined)
    onFilterChange(key, val === "ALL" ? undefined : val);
  }, [onFilterChange]);

  /**
   * Kiểm tra xem có bất kỳ bộ lọc nào đang được áp dụng hay không
   */
  const hasActiveFilters = useMemo(() => {
    return !!(filters.keyword || filters.assigneeId || filters.priority || filters.taskType);
  }, [filters]);

  // ---------------------------------------------------------------------------
  // 6. RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-6 bg-slate-50/50 p-2 rounded-xl border border-slate-200 shadow-sm backdrop-blur-sm">
      
      {/* KHỐI 1: Ô TÌM KIẾM TỪ KHÓA (KEYWORD SEARCH) */}
      <div className="relative flex-1 min-w-[240px] group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          type="text"
          placeholder="Search by title or task code..."
          className={cn(
            "w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700",
            "placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          )}
          value={filters.keyword || ""}
          onChange={(e) => handleUpdateFilter('keyword', e.target.value)}
        />
      </div>

      {/* Đường kẻ phân cách trên màn hình rộng */}
      <div className="h-10 w-px bg-slate-200 hidden xl:block mx-1" />

      {/* KHỐI 2: CÁC BỘ LỌC CHI TIẾT (DROP-DOWN FILTERS) */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-[10px] text-slate-400 mr-2 font-bold uppercase tracking-widest">
          <Filter className="w-3.5 h-3.5" />
          Quick Filters
        </div>
        
        {/* Bộ lọc: Người thực hiện (Assignee) */}
        <SelectWrapper 
          icon={Users}
          placeholder="All Assignees"
          value={filters.assigneeId}
          onChange={(val) => handleUpdateFilter('assigneeId', val)}
          minWidth="min-w-[170px]"
          options={members.map(m => (
            <option key={m.userId} value={m.userId}>{m.fullName}</option>
          ))}
        />

        {/* Bộ lọc: Mức độ ưu tiên (Priority) */}
        <SelectWrapper 
          icon={AlertCircle}
          placeholder="All Priorities"
          value={filters.priority}
          onChange={(val) => handleUpdateFilter('priority', val)}
          options={PRIORITY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        />

        {/* Bộ lọc: Loại công việc (Task Type) */}
        <SelectWrapper 
          icon={Layers}
          placeholder="All Types"
          value={filters.taskType}
          onChange={(val) => handleUpdateFilter('taskType', val)}
          options={TASK_TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        />

        {/* Nút xóa nhanh tất cả bộ lọc */}
        {hasActiveFilters && (
          <button 
            onClick={onClear}
            className={cn(
              "ml-auto flex items-center gap-2 text-[10px] font-black text-red-600 bg-red-50 hover:bg-red-100",
              "px-4 py-1.5 rounded-lg transition-all border border-red-100 h-9 uppercase tracking-widest shadow-sm"
            )}
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}