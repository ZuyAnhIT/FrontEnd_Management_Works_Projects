"use client";

import { Loader2, Layers, CheckCircle2, Flame } from "lucide-react";
import { EpicProgressStat } from "@/services/apiStatistics";

interface EpicProgressCardProps {
  data: EpicProgressStat[];
  loading: boolean;
}

export default function EpicProgressCard({ data, loading }: EpicProgressCardProps) {
  
  if (loading) return (
      <div className="h-[400px] bg-white rounded-xl border border-slate-200 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
  );

  if (!data || data.length === 0) return (
      <div className="h-[400px] bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
          <Layers className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm font-medium">No epic data available</p>
      </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
         <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Epic Progress</h3>
         <span className="text-xs font-medium text-slate-500">{data.length} Epics found</span>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar">
         {data.map((epic) => (
            <div key={epic.epicId} className="p-6 hover:bg-slate-50 transition-colors group">
               
               {/* Title Row */}
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                     <div 
                        className="w-2 h-8 rounded-full" 
                        style={{ backgroundColor: epic.color || '#cbd5e1' }}
                     ></div>
                     <div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors cursor-pointer">
                           {epic.epicName}
                        </h4>
                        <span className="text-xs font-mono text-slate-400 font-medium">
                           {epic.epicCode}
                        </span>
                     </div>
                  </div>
                  <div className="text-right">
                     <span className="text-2xl font-bold text-slate-700">{Math.round(epic.taskProgressPercent)}%</span>
                     <p className="text-[10px] text-slate-400 font-medium uppercase">Completion</p>
                  </div>
               </div>

               {/* Progress Bars */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  
                  {/* 1. Task Progress */}
                  <div>
                     <div className="flex justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                           <CheckCircle2 className="w-3.5 h-3.5" /> Tasks
                        </span>
                        <span className="text-slate-700">
                           <b>{epic.completedTasks}</b> / {epic.totalTasks}
                        </span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-green-500 rounded-full transition-all duration-500" 
                           style={{ width: `${epic.taskProgressPercent}%` }}
                        />
                     </div>
                  </div>

                  {/* 2. Points Progress */}
                  <div>
                     <div className="flex justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                           <Flame className="w-3.5 h-3.5" /> Story Points
                        </span>
                        <span className="text-slate-700">
                           <b>{epic.completedPoints}</b> / {epic.totalPoints}
                        </span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                           style={{ width: `${epic.pointProgressPercent}%` }}
                        />
                     </div>
                  </div>

               </div>
            </div>
         ))}
      </div>
    </div>
  );
}