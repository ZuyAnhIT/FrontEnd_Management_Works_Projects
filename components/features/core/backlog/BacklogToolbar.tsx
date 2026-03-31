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

interface BacklogToolbarProps {
  filters: BacklogQueryParams;
  // Cập nhật Type an toàn để sử dụng dạng callback (prev) => newState
  setFilters: Dispatch<SetStateAction<BacklogQueryParams>>;
  members: ProjectMember[];
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
// 4. SUB-COMPONENTS
// =============================================================================

/**
 * Thành phần ô chọn lọc dữ liệu (Dropdown Select) dùng chung.
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
        "h-9 pl-3 pr-8 text-[11px] font-bold uppercase tracking-widest border rounded-lg appearance-none cursor-pointer outline-none transition-all shadow-sm",
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
 * Thanh công cụ bộ lọc nâng cao dành riêng cho danh sách công việc (Backlog Toolbar).
 * Cung cấp khả năng lọc theo từ khóa, thành viên thực hiện, mức độ ưu tiên và loại công việc.
 */
export default function BacklogToolbar({
  filters,
  setFilters,
  members = [],
}: BacklogToolbarProps) {

  // ---------------------------------------------------------------------------
  // 6. LOGIC & HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Cập nhật tham số bộ lọc và đưa trang hiện tại về 0
   */
  const updateFilter = useCallback((key: keyof BacklogQueryParams, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      
      if (!value) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      
      return { ...newFilters, page: 0 };
    });
  }, [setFilters]);

  /**
   * Bật/tắt trạng thái lọc theo một thành viên dự án
   */
  const toggleAssignee = useCallback((memberId: number) => {
    const newValue = filters.assigneeId === memberId ? undefined : memberId;
    updateFilter("assigneeId", newValue);
  }, [filters.assigneeId, updateFilter]);

  /**
   * Xóa toàn bộ các tham số lọc đang áp dụng
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
   * Kiểm tra xem người dùng có đang áp dụng bất kỳ bộ lọc nào không
   */
  const hasActiveFilters = useMemo(() => {
    return !!(filters.keyword || filters.assigneeId || filters.priority || filters.taskType);
  }, [filters]);

  // ---------------------------------------------------------------------------
  // 7. RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="h-14 mb-4 flex items-center justify-between shrink-0 z-20 relative px-1">
        
        <div className="flex items-center gap-4">
            
            {/* 1. Ô tìm kiếm từ khóa (Search Box) */}
            <div className="relative group hidden lg:block">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"/>
                <input
                    className={cn(
                      "h-9 pl-9 pr-8 text-sm border border-slate-200 rounded-lg w-48 transition-all outline-none bg-white shadow-sm",
                      "focus:w-64 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                    )}
                    placeholder="Search backlog..."
                    value={filters.keyword || ""}
                    onChange={(e) => updateFilter("keyword", e.target.value)}
                />
                {filters.keyword && (
                    <button
                        onClick={() => updateFilter("keyword", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 p-0.5 rounded-full transition-colors"
                        title="Clear search"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* 2. Lọc nhanh theo thành viên (Avatar Stack) */}
            <div className="flex items-center -space-x-2 mr-2">
                {members.slice(0, 5).map((member) => {
                    const idToUse = member.userId || member.memberId;
                    const isActive = filters.assigneeId === idToUse;
                    
                    return (
                        <div
                            key={idToUse || Math.random()}
                            onClick={() => idToUse && toggleAssignee(idToUse)}
                            className={cn(
                              "relative w-8 h-8 rounded-full border-2 cursor-pointer transition-all hover:z-20 hover:scale-110 shadow-sm",
                              isActive ? "border-blue-500 z-10 ring-2 ring-blue-100" : "border-white",
                              !member.avatarUrl ? "bg-slate-100" : ""
                            )}
                            title={member.fullName}
                        >
                            {member.avatarUrl ? (
                                <img
                                    src={member.avatarUrl}
                                    alt={member.fullName}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className={cn(
                                  "w-full h-full rounded-full flex items-center justify-center text-[10px] font-bold",
                                  isActive ? "text-blue-700 bg-blue-50" : "text-slate-500"
                                )}>
                                    {member.fullName?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {/* Hiển thị số lượng thành viên ẩn nếu tổng số lượng > 5 */}
                {members.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm cursor-default z-0">
                        +{members.length - 5}
                    </div>
                )}
            </div>

            {/* 3. Dropdown Lọc Mức độ ưu tiên (Priority) */}
            <FilterDropdown 
                value={filters.priority}
                onChange={(e) => updateFilter("priority", e.target.value)}
                options={PRIORITY_OPTIONS}
                placeholder="Priority"
                icon={ChevronDown}
            />

            {/* 4. Dropdown Lọc Loại công việc (Task Type) */}
            <FilterDropdown 
                value={filters.taskType}
                onChange={(e) => updateFilter("taskType", e.target.value)}
                options={TYPE_OPTIONS}
                placeholder="Task Type"
                icon={Filter}
            />

            {/* 5. Vạch ngăn cách và Nút xóa bộ lọc (Separator & Clear Button) */}
            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <button
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all",
                  hasActiveFilters
                    ? "text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer active:scale-95 shadow-sm border border-red-100"
                    : "text-slate-300 bg-transparent cursor-not-allowed"
                )}
                title="Clear all active filters"
            >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
            </button>
        </div>
    </div>
  );
}