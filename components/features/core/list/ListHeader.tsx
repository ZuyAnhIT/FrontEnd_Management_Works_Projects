"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo, useCallback, Dispatch, SetStateAction } from "react";
import { Search, X, Layers, ChevronDown } from "lucide-react";

// Internal Services & Types
import { ProjectTaskFilterParams } from "@/services/apiTask";
import { ProjectMember } from "@/services/apiProject";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & INTERFACES
// =============================================================================

const GROUP_BY_OPTIONS = [
  { value: "none", label: "No Grouping" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "assignee", label: "Assignee" },
];

interface ListHeaderProps {
  filters: ProjectTaskFilterParams;
  // Khai báo kiểu Dispatch chuẩn để hỗ trợ update theo callback state (prev) => newState
  setFilters: Dispatch<SetStateAction<ProjectTaskFilterParams>>;
  groupBy: string;
  setGroupBy: (g: string) => void;
  members: ProjectMember[]; 
  totalTasks: number;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thanh tiêu đề và bộ điều khiển dành riêng cho giao diện List View.
 * Quản lý tính năng nhóm dữ liệu (Group By), tìm kiếm công việc và lọc theo người thực hiện.
 */
export default function ListHeader({ 
  filters, 
  setFilters, 
  groupBy,
  setGroupBy,
  members = [],
  totalTasks = 0 
}: ListHeaderProps) {

  // ---------------------------------------------------------------------------
  // 4. LOGIC & HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Cập nhật tham số bộ lọc an toàn thông qua callback state
   */
  const updateFilter = useCallback((key: keyof ProjectTaskFilterParams, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      
      if (value === "" || value === undefined || value === null) {
        delete newFilters[key as keyof typeof newFilters];
      } else {
        newFilters[key] = value as never;
      }
      
      return newFilters;
    });
  }, [setFilters]);

  /**
   * Bật/tắt trạng thái lọc theo một thành viên (Assignee)
   */
  const toggleAssignee = useCallback((memberId: number | string) => {
    const isCurrentlyActive = filters.assigneeId === memberId;
    const newValue = isCurrentlyActive ? undefined : memberId;
    updateFilter("assigneeId", newValue);
  }, [filters.assigneeId, updateFilter]);

  /**
   * Xóa tất cả các thiết lập tùy biến (Bảo lưu sprintId)
   */
  const clearFiltersAndGrouping = useCallback(() => {
    setFilters({ 
        search: "", 
        sprintId: filters.sprintId // Sprint ID thuộc về ngữ cảnh trang, không được xoá
    });
    setGroupBy("none");
  }, [filters.sprintId, setFilters, setGroupBy]);

  /**
   * Xác định xem thanh công cụ có đang ở trạng thái bị "modify" hay không
   */
  const hasActiveModifiers = useMemo(() => {
    return !!filters.search || !!filters.assigneeId || groupBy !== "none";
  }, [filters.search, filters.assigneeId, groupBy]);

  // ---------------------------------------------------------------------------
  // 5. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm relative z-20">
        
        {/* KHỐI TRÁI: TIÊU ĐỀ VÀ THÔNG SỐ (TITLE & STATS) */}
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">List View</h1>
            <div className="h-6 w-px bg-slate-200" />
            <span className="bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-slate-200 uppercase tracking-widest">
                {totalTasks} Issues
            </span>
        </div>

        {/* KHỐI PHẢI: THANH CÔNG CỤ (FILTERS & GROUPING) */}
        <div className="flex items-center gap-4">
            
            {/* 1. Ô tìm kiếm từ khóa (Search Box) */}
            <div className="relative group hidden md:block">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"/>
                <input 
                    className={cn(
                      "h-9 pl-9 pr-8 text-sm border border-slate-200 rounded-lg w-48 transition-all outline-none bg-slate-50 shadow-sm",
                      "focus:w-64 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white placeholder:text-slate-400"
                    )}
                    placeholder="Search issues..."
                    value={filters.search || ""}
                    onChange={(e) => updateFilter("search", e.target.value)}
                />
                {filters.search && (
                    <button 
                        onClick={() => updateFilter("search", "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 p-0.5 rounded-full transition-colors"
                        title="Clear search"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* 2. Lọc nhanh theo thành viên (Avatar Stack) */}
            <div className="flex items-center -space-x-2.5 mr-2">
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

            {/* 3. Tùy chọn nhóm dữ liệu (Group By Dropdown) */}
            <div className="relative group">
                <select 
                    className={cn(
                      "h-9 pl-9 pr-8 text-[11px] font-bold uppercase tracking-widest border rounded-lg appearance-none cursor-pointer outline-none transition-all shadow-sm",
                      groupBy !== "none" 
                        ? "bg-blue-50 border-blue-200 text-blue-700" 
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 focus:border-blue-500"
                    )}
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                >
                    {GROUP_BY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <Layers className={cn(
                  "w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
                  groupBy !== "none" ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"
                )} />
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
                  groupBy !== "none" ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"
                )} />
            </div>

            {/* 4. Vạch ngăn cách và Nút xóa (Separator & Clear Button) */}
            <div className="h-6 w-px bg-slate-200 mx-1" />

            <button 
                onClick={clearFiltersAndGrouping}
                disabled={!hasActiveModifiers}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all",
                  hasActiveModifiers 
                    ? "text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer active:scale-95 shadow-sm border border-red-100" 
                    : "text-slate-300 bg-transparent cursor-not-allowed"
                )}
                title="Clear all active modifiers"
            >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
            </button>
        </div>
    </div>
  );
}