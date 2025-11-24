"use client";

import { Search, User, AlertCircle, Bookmark, Bug, Layers, FilterX } from "lucide-react";
import { BacklogQueryParams, ProjectMember } from "@/services/apiProject";
import FilterPopover from "@/components/ui/FilterPopover"; // Import component vừa tạo

interface BacklogToolbarProps {
  filters: BacklogQueryParams;
  setFilters: (filters: BacklogQueryParams) => void;
  members: ProjectMember[]; 
}

export default function BacklogToolbar({ filters, setFilters, members }: BacklogToolbarProps) {
  
  const handleChange = (key: keyof BacklogQueryParams, value: any) => {
    setFilters({ 
        ...filters, 
        [key]: value === "ALL" ? undefined : value, 
        page: 0 
    });
  };

  // 1. Cấu hình Options cho Task Type
  const typeOptions = [
    { label: "Story", value: "STORY", icon: <Bookmark className="w-4 h-4 text-green-600" /> },
    { label: "Task", value: "TASK", icon: <Layers className="w-4 h-4 text-blue-500" /> },
    { label: "Bug", value: "BUG", icon: <Bug className="w-4 h-4 text-red-500" /> },
  ];

  // 2. Cấu hình Options cho Priority
  const priorityOptions = [
    { label: "Urgent", value: "URGENT", color: "bg-red-500" },
    { label: "High", value: "HIGH", color: "bg-orange-500" },
    { label: "Medium", value: "MEDIUM", color: "bg-blue-500" },
    { label: "Low", value: "LOW", color: "bg-slate-400" },
  ];

  // 3. Cấu hình Options cho Assignee (Map từ danh sách thành viên)
  const assigneeOptions = members.map(m => ({
      label: m.fullName,
      value: m.userId,
      icon: m.avatarUrl ? (
        <img src={m.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
      ) : (
        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
            {m.fullName.charAt(0)}
        </div>
      )
  }));

  // Kiểm tra xem có filter nào đang active không
  const hasActiveFilters = filters.keyword || filters.taskType || filters.priority || filters.assigneeId;

  return (
    <div className="flex flex-col space-y-4 mb-6">
      
      {/* Hàng 1: Thanh tìm kiếm lớn, đẹp */}
      <div className="relative shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
           <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={filters.keyword || ""}
          onChange={(e) => handleChange("keyword", e.target.value)}
          className="block w-full pl-10 pr-4 py-3 border-none rounded-xl bg-white shadow ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 sm:text-sm transition-all"
          placeholder="Search backlog by title, code, or description..."
        />
      </div>

      {/* Hàng 2: Các bộ lọc hiện đại */}
      <div className="flex flex-wrap items-center gap-3">
         
         {/* Filter: Type */}
         <FilterPopover 
            label="Type"
            icon={<Layers className="w-4 h-4" />}
            options={typeOptions}
            value={filters.taskType}
            onChange={(val) => handleChange("taskType", val)}
         />

         {/* Filter: Priority */}
         <FilterPopover 
            label="Priority"
            icon={<AlertCircle className="w-4 h-4" />}
            options={priorityOptions}
            value={filters.priority}
            onChange={(val) => handleChange("priority", val)}
         />

         {/* Filter: Assignee */}
         <FilterPopover 
            label="Assignee"
            icon={<User className="w-4 h-4" />}
            options={assigneeOptions}
            value={filters.assigneeId}
            onChange={(val) => handleChange("assigneeId", val)}
         />

         {/* Nút Clear Filters */}
         {hasActiveFilters && (
             <button 
                onClick={() => setFilters({ page: 0, size: 20 })}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors ml-auto sm:ml-0"
             >
                <FilterX className="w-4 h-4" />
                Clear filters
             </button>
         )}
      </div>
    </div>
  );
}