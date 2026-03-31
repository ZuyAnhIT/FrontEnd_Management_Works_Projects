"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { DistributionStat } from "@/services/apiStatistics";
import { 
  Loader2, 
  PieChart as PieIcon, 
  Bug, 
  Bookmark, 
  CheckSquare, 
  Layers, 
  Info 
} from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & HELPERS
// =============================================================================

interface TypeChartProps {
  data: DistributionStat[];
  loading: boolean;
}

/**
 * Lấy biểu tượng tương ứng với mã loại công việc (Task Type)
 */
const getTypeIcon = (code?: string, className?: string) => {
  switch (code) {
    case 'BUG': 
      return <Bug className={cn("w-3.5 h-3.5 text-[#E54937]", className)} />;
    case 'STORY': 
      return <Bookmark className={cn("w-3.5 h-3.5 text-[#63BA3C]", className)} />;
    case 'TASK': 
      return <CheckSquare className={cn("w-3.5 h-3.5 text-[#4C9AFF]", className)} />;
    default: 
      return <Layers className={cn("w-3.5 h-3.5 text-slate-400", className)} />;
  }
};

// =============================================================================
// 3. SUB-COMPONENT: Custom Tooltip
// =============================================================================

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-2 mb-2">
          {getTypeIcon(item.code)}
          <p className="font-bold text-[13px] text-slate-800 uppercase tracking-wide">
            {item.name}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-6 text-[12px]">
            <span className="text-slate-500 font-medium">Quantity:</span>
            <span className="font-bold text-slate-900">{item.taskCount}</span>
          </div>
          <div className="flex justify-between gap-6 text-[12px]">
            <span className="text-slate-500 font-medium">Percentage:</span>
            <span className="font-bold text-[#0052CC]">{item.percentage}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

/**
 * Biểu đồ phân bổ loại công việc (Task Type Distribution).
 * Trực quan hóa tỉ lệ giữa Stories, Bugs và Tasks trong dự án.
 */
export default function TypeChart({ data, loading }: TypeChartProps) {

  // Tối ưu hiệu năng tính toán tổng số task
  const totalTasks = useMemo(() => 
    data.reduce((acc, cur) => acc + cur.taskCount, 0), 
  [data]);

  // --- RENDER: LOADING STATE ---
  if (loading) return (
    <div className="h-[350px] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3 shadow-sm">
      <Loader2 className="w-8 h-8 animate-spin text-[#0052CC] opacity-80" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sorting issues...</span>
    </div>
  );

  // --- RENDER: EMPTY STATE ---
  if (!data || data.length === 0) return (
    <div className="h-[350px] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 shadow-sm">
      <div className="p-4 bg-slate-50 rounded-full mb-4">
        <PieIcon className="w-8 h-8 opacity-20" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">No data for task types</p>
    </div>
  );

  // --- RENDER: MAIN CHART ---
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[350px] flex flex-col transition-all">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Issue Type Mix</h3>
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-[10px] text-white rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Breakdown of issue types to monitor project composition.
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 shadow-sm">
          Total: <span className="text-slate-700">{totalTasks}</span>
        </span>
      </div>
      
      {/* CHART CONTENT */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={4}
              dataKey="taskCount"
              stroke="none"
              animationBegin={0}
              animationDuration={1200}
              activeShape={{ stroke: '#fff', strokeWidth: 2 }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="hover:opacity-85 transition-opacity outline-none" 
                />
              ))}
            </Pie>
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            
            <Legend 
              verticalAlign="bottom" 
              height={45} 
              iconType="circle"
              iconSize={0} // Ẩn icon mặc định để dùng icon tùy chỉnh qua formatter
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value, entry: any) => (
                <div className="inline-flex items-center gap-2 ml-1">
                  {getTypeIcon(entry.payload.code)}
                  <span className="text-[11px] font-bold uppercase tracking-tight text-slate-600 hover:text-slate-900 transition-colors">
                    {value} 
                    <span className="text-slate-400 font-black ml-1.5 opacity-80">
                      {entry.payload.percentage}%
                    </span>
                  </span>
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}