"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DistributionStat } from "@/services/apiStatistics";
import { Loader2, PieChart as PieIcon } from "lucide-react";

interface StatusChartProps {
  data: DistributionStat[];
  loading: boolean;
}

export default function StatusChart({ data, loading }: StatusChartProps) {
  
  // Custom Tooltip: Hiển thị chi tiết khi hover
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
          <p className="font-bold text-sm text-slate-800 mb-1">{item.name}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
             <span className="font-medium text-slate-900">{item.taskCount} tasks</span>
             <span>|</span>
             <span className="font-medium text-slate-900">{item.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Màn hình Loading
  if (loading) return (
      <div className="h-[320px] bg-white rounded-xl border border-slate-200 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
  );

  // Màn hình Trống (Không có dữ liệu)
  if (!data || data.length === 0) return (
      <div className="h-[320px] bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
          <PieIcon className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm font-medium">No status data available</p>
      </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
         <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Status Overview</h3>
         {/* Tổng số task hiển thị nhỏ ở góc */}
         <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
            Total: {data.reduce((acc, cur) => acc + cur.taskCount, 0)}
         </span>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60} // Tạo hiệu ứng rỗng giữa (Donut)
              outerRadius={85}
              paddingAngle={5} // Khoảng cách giữa các miếng
              dataKey="taskCount"
              stroke="none"    // Bỏ viền trắng mặc định
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                iconSize={8}
                formatter={(value, entry: any) => (
                    <span className="text-xs text-slate-600 font-medium ml-1">
                        {value} <span className="text-slate-400 font-normal">({entry.payload.percentage}%)</span>
                    </span>
                )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}