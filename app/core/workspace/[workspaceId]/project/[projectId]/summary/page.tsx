"use client";

import { useParams } from "next/navigation";
import { 
  LayoutDashboard, 
  BarChart3, 
  PieChart, 
  ArrowUpRight 
} from "lucide-react";

// Component chính vừa làm
import WeeklyOverview from "@/components/features/core/summary/WeeklyOverview";

export default function ProjectSummaryPage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  if (!projectId) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8 font-sans text-slate-900">
       <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* --- 1. HEADER --- */}
          <div className="flex items-center justify-between">
             <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                   <LayoutDashboard className="w-6 h-6 text-blue-600" />
                   Project Summary
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                   Real-time overview of project performance and health.
                </p>
             </div>
             
             {/* Nút hành động phụ (Ví dụ: Export báo cáo) */}
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm">
                <ArrowUpRight className="w-4 h-4" /> Export Report
             </button>
          </div>

          {/* --- 2. SECTION CHÍNH: WEEKLY OVERVIEW (Đã hoàn thiện) --- */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <WeeklyOverview projectId={projectId} />
          </section>

          <hr className="border-slate-200" />

          {/* --- 3. SECTION: CHARTS (Placeholder - Sẽ làm sau) --- */}
          <section>
             <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-800">Analytics & Distribution</h2>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Placeholder: Status Distribution */}
                <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 h-[300px]">
                   <PieChart className="w-10 h-10 mb-3 opacity-20" />
                   <p className="font-medium">Status Distribution Chart</p>
                   <p className="text-xs mt-1">Coming soon</p>
                </div>

                {/* Placeholder: Priority Distribution */}
                <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 h-[300px]">
                   <BarChart3 className="w-10 h-10 mb-3 opacity-20" />
                   <p className="font-medium">Priority Breakdown Chart</p>
                   <p className="text-xs mt-1">Coming soon</p>
                </div>
             </div>
          </section>
       </div>
    </div>
  );
}