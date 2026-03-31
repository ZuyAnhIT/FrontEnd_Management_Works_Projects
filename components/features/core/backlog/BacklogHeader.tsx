"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo, useCallback, Dispatch, SetStateAction } from "react";
import { 
  Search, 
  X, 
  ChevronDown, 
  Filter, 
  LayoutList, 
  LucideIcon 
} from "lucide-react";

// Internal Services & Types
import { BacklogQueryParams, ProjectMember } from "@/services/apiProject";
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

const TYPE_OPTIONS = [
  { label: "Story", value: "STORY" },
  { label: "Task", value: "TASK" },
  { label: "Bug", value: "BUG" },
];

// =============================================================================
// 3. INTERFACES
// =============================================================================

interface BacklogHeaderProps {
  totalTasks: number;
  projectId: number;
  filters: BacklogQueryParams;
  // CẬP NHẬT Ở ĐÂY: Sử dụng Dispatch<SetStateAction<T>> chuẩn của React
  setFilters: Dispatch<SetStateAction<BacklogQueryParams>>;
  members: ProjectMember[];
  onCreateClick?: () => void;
  onRefresh?: () => void;
}

interface FilterDropdownProps {
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  icon: LucideIcon;
  activeColorClass?: string;
}

// =============================================================================
// 4. SUB-COMPONENT: FILTER DROPDOWN
// =============================================================================

/**
 * Thành phần hiển thị ô chọn lọc dữ liệu (Dropdown Select).
 * Tự động thay đổi màu sắc khi có giá trị được chọn để người dùng dễ nhận biết.
 */
const FilterDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  icon: Icon, 
  activeColorClass = "text-blue-600" 
}: FilterDropdownProps) => (
  <div className="relative group">
    <select
      className={cn(
        "h-9 pl-3 pr-8 text-[11px] font-bold uppercase tracking-widest border rounded-lg appearance-none cursor-pointer outline-none transition-all",
        value 
          ? "bg-blue-50 border-blue-200 text-blue-700" 
          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 focus:border-blue-500"
      )}
      value={value || ""}
      onChange={onChange}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <Icon className={cn(
      "w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
      value ? activeColorClass : "text-slate-400 group-hover:text-slate-500"
    )} />
  </div>
);

// =============================================================================
// 5. MAIN COMPONENT
// =============================================================================

/**
 * Thanh tiêu đề và bộ lọc cho trang danh sách tồn đọng (Backlog Header).
 * Hỗ trợ tìm kiếm, lọc theo người thực hiện (Avatar), mức độ ưu tiên và loại công việc.
 */
export default function BacklogHeader({
  totalTasks,
  projectId,
  filters,
  setFilters,
  members = [],
}: BacklogHeaderProps) {

  // ---------------------------------------------------------------------------
  // 6. LOGIC & HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Cập nhật giá trị bộ lọc và đưa trang về trang đầu (0)
   */
  const updateFilter = useCallback((key: keyof BacklogQueryParams, value: any) => {
    // Bây giờ TypeScript sẽ hiểu `prev` ở đây là an toàn
    setFilters((prev) => {
      const newFilters = { ...prev };
      
      // Xử lý loại bỏ key nếu giá trị rỗng/null/undefined
      if (value === "" || value === null || value === undefined) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      
      return { ...newFilters, page: 0 };
    });
  }, [setFilters]);

  /**
   * Xử lý bật/tắt lọc theo người thực hiện
   */
  const toggleAssignee = useCallback((memberId: number) => {
    const newValue = filters.assigneeId === memberId ? undefined : memberId;
    updateFilter("assigneeId", newValue);
  }, [filters.assigneeId, updateFilter]);

  /**
   * Xóa tất cả các bộ lọc đang áp dụng
   */
  const clearFilters = useCallback(() => {
    setFilters({
      keyword: "",
      page: 0,
      size: filters.size,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir
    });
  }, [filters.size, filters.sortBy, filters.sortDir, setFilters]);

  /**
   * Kiểm tra sự tồn tại của bất kỳ bộ lọc tích cực nào
   */
  const hasActiveFilters = useMemo(() => {
    return !!(filters.keyword || filters.assigneeId || filters.priority || filters.taskType);
  }, [filters]);

  // ---------------------------------------------------------------------------
  // 7. RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-0 shadow-sm z-20">
        
        {/* KHỐI TRÁI: TIÊU ĐỀ VÀ THÔNG SỐ (TITLE & STATS) */}
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 shadow-sm shrink-0">
              <LayoutList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Backlog</h1>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">
                  <span className="opacity-70">Project #{projectId}</span>
                  <span className="text-slate-200">•</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {totalTasks} issues
                  </span>
              </div>
            </div>
        </div>

        {/* KHỐI PHẢI: BỘ LỌC VÀ CÔNG CỤ (FILTERS & TOOLS) */}
        <div className="flex items-center gap-4">
            
            {/* 1. Ô tìm kiếm (Search Input) */}
            <div className="relative group hidden lg:block">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"/>
                <input
                    className={cn(
                      "h-9 pl-9 pr-8 text-sm border border-slate-200 rounded-lg w-40 transition-all outline-none bg-slate-50",
                      "focus:w-60 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white placeholder:text-slate-400"
                    )}
                    placeholder="Search issues..."
                    value={filters.keyword || ""}
                    onChange={(e) => updateFilter("keyword", e.target.value)}
                />
                {filters.keyword && (
                    <button
                        onClick={() => updateFilter("keyword", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 p-0.5 rounded-full transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* 2. Lọc nhanh theo thành viên (Member Avatars) */}
            <div className="flex items-center -space-x-2.5">
                {members.slice(0, 4).map((member) => {
                    const idToUse = member.userId || member.memberId;
                    const isActive = filters.assigneeId === idToUse;
                    
                    return (
                        <div
                            key={idToUse || Math.random()}
                            onClick={() => idToUse && toggleAssignee(idToUse)}
                            className={cn(
                              "relative w-8 h-8 rounded-full border-2 cursor-pointer transition-all hover:z-20 hover:scale-110 shadow-sm",
                              isActive ? "border-blue-500 z-10 ring-2 ring-blue-100" : "border-white"
                            )}
                            title={member.fullName}
                        >
                            {member.avatarUrl ? (
                                <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className={cn(
                                  "w-full h-full rounded-full flex items-center justify-center text-[10px] font-bold",
                                  isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                                )}>
                                    {member.fullName?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 3. Các bộ lọc danh sách (Dropdown Filters) */}
            <div className="flex items-center gap-2">
                <FilterDropdown 
                    value={filters.priority}
                    onChange={(e) => updateFilter("priority", e.target.value)}
                    options={PRIORITY_OPTIONS}
                    placeholder="Priority"
                    icon={ChevronDown}
                />
                
                <FilterDropdown 
                    value={filters.taskType}
                    onChange={(e) => updateFilter("taskType", e.target.value)}
                    options={TYPE_OPTIONS}
                    placeholder="Task Type"
                    icon={Filter}
                />
            </div>

            {/* 4. Nút xóa nhanh tất cả bộ lọc */}
            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-95 shadow-sm border border-red-50"
                    title="Clear all filters"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    </div>
  );
}