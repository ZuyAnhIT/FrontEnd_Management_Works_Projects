"use client";

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
import { Loader2, BarChart3 } from "lucide-react";

interface PriorityChartProps {
  data: DistributionStat[];
  loading: boolean;
}

// Thứ tự ưu tiên hiển thị (từ trên xuống dưới)
const PRIORITY_ORDER = ["URGENT", "HIGH", "MEDIUM", "LOW"];

export default function PriorityChart({ data, loading }: PriorityChartProps) {
  
  // Sắp xếp dữ liệu để URGENT luôn nằm trên cùng trong biểu đồ
  const sortedData = [...data].sort((a, b) => {
     const indexA = PRIORITY_ORDER.indexOf(a.code || "");
     const indexB = PRIORITY_ORDER.indexOf(b.code || "");
     return indexB - indexA; // Đảo ngược vì Recharts vẽ từ dưới lên
  });

  // Tooltip tùy chỉnh
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg z-50">
          <p className="font-bold text-sm text-slate-800 mb-1" style={{ color: item.color }}>
            {item.name}
          </p>
          <div className="text-xs text-slate-500 flex gap-2">
             <span className="font-medium text-slate-900">{item.taskCount} tasks</span>
             <span>•</span>
             <span>{item.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Loading State
  if (loading) return (
      <div className="h-[350px] bg-white rounded-xl border border-slate-200 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
  );

  // Empty State
  if (!data || data.length === 0) return (
      <div className="h-[350px] bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
          <BarChart3 className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm font-medium">No priority data available</p>
      </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
         <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Risk Assessment</h3>
          <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
            Total: {data.reduce((acc, cur) => acc + cur.taskCount, 0)}
         </span>
      </div>
      
      <div className="flex-1 w-full min-h-0 -ml-4"> 
        {/* -ml-4 để căn lề trục Y sát hơn */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical" // Biểu đồ ngang
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barSize={24}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            
            {/* Trục Y: Tên Priority */}
            <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                width={70}
                axisLine={false}
                tickLine={false}
            />

            {/* Trục X: Số lượng (Ẩn số) */}
            <XAxis type="number" hide />

            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
            
            <Bar dataKey="taskCount" radius={[0, 4, 4, 0]} background={{ fill: '#f8fafc' }}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}