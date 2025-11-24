"use client";

import { Plus, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BacklogHeaderProps {
  totalTasks: number;
  onCreateClick: () => void;
}

export default function BacklogHeader({ totalTasks, onCreateClick }: BacklogHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
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
             <span>•</span>
             <span>Updated recently</span>
          </div>
        </div>
      </div>

      <Button 
        onClick={onCreateClick}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 px-5 font-semibold flex items-center gap-2 rounded-lg transition-all active:scale-95"
      >
        <Plus className="w-4 h-4" /> Create Issue
      </Button>
    </div>
  );
}