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
import { Loader2, PieChart as PieIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface StatusChartProps {
  data: DistributionStat[];
  loading: boolean;
}

// =============================================================================
// 3. SUB-COMPONENT: Custom Tooltip
// =============================================================================

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <p className="font-bold text-[13px] text-slate-800 uppercase tracking-wide">
            {item.name}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-6 text-[12px]">
            <span className="text-slate-500 font-medium">Quantity:</span>
            <span className="font-bold text-slate-900">{item.taskCount} issues</span>
          </div>
          <div className="flex justify-between gap-6 text-[12px]">
            <span className="text-slate-500 font-medium">Ratio:</span>
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
 * Biểu đồ phân bổ trạng thái công việc (Work Status Distribution).
 * Hiển thị dưới dạng Donut Chart giúp trực quan hóa tỉ lệ phần trăm các giai đoạn dự án.
 */
export default function StatusChart({ data, loading }: StatusChartProps) {
    
  // Tối ưu hiệu năng tính toán tổng
  const totalTasks = useMemo(() => 
    data.reduce((acc, cur) => acc + cur.taskCount, 0), 
  [data]);

  // --- RENDER: LOADING STATE ---
  if (loading) return (
    <div className="h-[350px] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3 shadow-sm">
      <Loader2 className="w-8 h-8 animate-spin text-[#0052CC] opacity-80" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generating report...</span>
    </div>
  );

  // --- RENDER: EMPTY STATE ---
  if (!data || data.length === 0) return (
    <div className="h-[350px] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 shadow-sm">
      <div className="p-4 bg-slate-50 rounded-full mb-4">
        <PieIcon className="w-8 h-8 opacity-20" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">No status data found</p>
    </div>
  );

  // --- RENDER: MAIN CHART ---
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[350px] flex flex-col transition-all">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Work Distribution</h3>
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-[10px] text-white rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Overview of issue counts across different workflow statuses.
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
              // Hiệu ứng phóng nhẹ khi hover vào slice
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
            
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'transparent' }} 
            />
            
            <Legend 
              verticalAlign="bottom" 
              height={40} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: '20px' }}
              // Formatter hiển thị Tên chuyên nghiệp + Highlight phần trăm
              formatter={(value, entry: any) => (
                <span className="text-[11px] font-bold uppercase tracking-tight text-slate-600 hover:text-slate-900 transition-colors ml-1">
                  {value} 
                  <span className="text-[#0052CC] font-black ml-1.5 opacity-80">
                    {entry.payload.percentage}%
                  </span>
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}