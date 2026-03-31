"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { DistributionStat } from "@/services/apiStatistics";
import { Loader2, BarChart3, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & INTERFACES
// =============================================================================

interface PriorityChartProps {
  data: DistributionStat[];
  loading: boolean;
}

/**
 * Thứ tự ưu tiên chuẩn Agile. 
 * Recharts vẽ từ dưới lên trên, nên mảng này sẽ được đảo ngược khi render.
 */
const PRIORITY_ORDER = ["URGENT", "HIGH", "MEDIUM", "LOW"];

// =============================================================================
// 3. SUB-COMPONENT: Custom Tooltip
// =============================================================================

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
          <p className="font-bold text-[13px] text-slate-800 uppercase tracking-wide">
            {item.name}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-4 text-[12px]">
            <span className="text-slate-500 font-medium">Issues:</span>
            <span className="font-bold text-slate-900">{item.taskCount}</span>
          </div>
          <div className="flex justify-between gap-4 text-[12px]">
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
 * Biểu đồ phân bổ mức độ ưu tiên (Priority Distribution Chart).
 * Giúp người quản trị đánh giá rủi ro (Risk Assessment) của dự án dựa trên số lượng Issue.
 */
export default function PriorityChart({ data, loading }: PriorityChartProps) {
  
  // ---------------------------------------------------------------------------
  // 5. DATA PREPARATION
  // ---------------------------------------------------------------------------

  // Sắp xếp dữ liệu theo thứ tự ưu tiên logic
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const indexA = PRIORITY_ORDER.indexOf(a.code || "");
      const indexB = PRIORITY_ORDER.indexOf(b.code || "");
      // Đảo ngược để URGENT nằm ở trên cùng của biểu đồ ngang
      return indexB - indexA;
    });
  }, [data]);

  const totalTasks = useMemo(() => 
    data.reduce((acc, cur) => acc + cur.taskCount, 0), 
  [data]);

  // ---------------------------------------------------------------------------
  // 6. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (loading) return (
    <div className="h-[350px] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3 shadow-sm">
      <Loader2 className="w-8 h-8 animate-spin text-[#0052CC] opacity-80" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analyzing priorities...</span>
    </div>
  );

  if (!data || data.length === 0) return (
    <div className="h-[350px] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 shadow-sm">
      <div className="p-4 bg-slate-50 rounded-full mb-4">
        <BarChart3 className="w-8 h-8 opacity-20" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">No priority data found</p>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[350px] flex flex-col transition-all">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Risk Assessment</h3>
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-[10px] text-white rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Distribution of issues based on their critical priority level.
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 shadow-sm">
          Total: <span className="text-slate-700">{totalTasks}</span>
        </span>
      </div>
      
      {/* CHART SECTION */}
      <div className="flex-1 w-full min-h-0 -ml-6"> 
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            barSize={20}
            barGap={8}
          >
            <CartesianGrid 
              strokeDasharray="4 4" 
              horizontal={false} 
              stroke="#f1f5f9" 
            />
            
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 800 }} 
              width={85}
              axisLine={false}
              tickLine={false}
              // Chuyển label sang uppercase cho chuẩn Jira style
              tickFormatter={(value) => value.toUpperCase()}
            />

            <XAxis type="number" hide />

            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: '#f8fafc', radius: 4 }} 
              animationDuration={200}
            />
            
            <Bar 
              dataKey="taskCount" 
              radius={[0, 4, 4, 0]} 
              background={{ fill: '#f8fafc', radius: 4 }}
              animationBegin={200}
              animationDuration={1000}
            >
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}