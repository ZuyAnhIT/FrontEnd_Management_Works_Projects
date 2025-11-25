"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { LayoutList, Plus, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import Modal tạo Sprint chi tiết
import CreateSprintModal from "../sprint/CreateSprintModal";

interface BacklogHeaderProps {
  totalTasks: number;
  onCreateClick: () => void;    // Callback mở modal tạo Task
  onRefresh?: () => void;       // Callback reload list khi tạo Sprint xong
}

export default function BacklogHeader({ totalTasks, onCreateClick, onRefresh }: BacklogHeaderProps) {
  // 1. Lấy thông tin ID từ URL
  // Chỉ cần projectId vì API tạo Sprint mới đã được tối ưu
  const params = useParams();
  const projectId = Number(params.projectId);

  // 2. State quản lý Modal tạo Sprint
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm shrink-0">
        
        {/* LEFT: Title & Info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
            <LayoutList className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Backlog</h1>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
               <span className="bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 border border-slate-200">
                  {totalTasks} Issues
               </span>
               <span className="text-slate-300">•</span>
               <span>Project {projectId}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Action Buttons */}
        <div className="flex items-center gap-3">
          
          {/* Nút 1: Create Sprint (Mở Modal chi tiết) */}
          <Button 
             variant="outline"
             onClick={() => setIsSprintModalOpen(true)}
             className="h-10 px-4 text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium shadow-sm"
          >
             <CalendarPlus className="w-4 h-4 mr-2" />
             Create Sprint
          </Button>

          {/* Nút 2: Create Issue (Mở Modal tạo task) */}
          <Button 
            onClick={onCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 px-5 font-semibold flex items-center gap-2 rounded-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create Issue
          </Button>
        </div>
      </div>

      {/* MODAL: Create Sprint (Hidden by default) */}
      <CreateSprintModal 
         isOpen={isSprintModalOpen}
         onClose={() => setIsSprintModalOpen(false)}
         onSuccess={() => onRefresh && onRefresh()} // Reload list khi tạo xong
         projectId={projectId} // ✅ Chỉ cần truyền projectId
      />
    </>
  );
}