"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DistributionStat } from "@/services/apiStatistics";
import { Loader2, PieChart as PieIcon, Bug, Bookmark, CheckSquare, Layers } from "lucide-react";

interface TypeChartProps {
  data: DistributionStat[];
  loading: boolean;
}

// Helper chọn icon theo Type Code
const getTypeIcon = (code?: string) => {
    switch (code) {
        case 'BUG': return <Bug className="w-3 h-3 text-red-500 inline mr-1" />;
        case 'STORY': return <Bookmark className="w-3 h-3 text-green-600 inline mr-1" />;
        case 'TASK': return <CheckSquare className="w-3 h-3 text-blue-500 inline mr-1" />;
        default: return <Layers className="w-3 h-3 text-slate-500 inline mr-1" />;
    }
};

export default function TypeChart({ data, loading }: TypeChartProps) {
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg z-50">
          <div className="flex items-center gap-2 mb-1">
             {getTypeIcon(item.code)}
             <p className="font-bold text-sm text-slate-800">{item.name}</p>
          </div>
          <div className="text-xs text-slate-500">
             <span className="font-medium text-slate-900">{item.taskCount} tasks</span>
             <span className="mx-1">•</span>
             <span>{item.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) return (
      <div className="h-[350px] bg-white rounded-xl border border-slate-200 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
  );

  if (!data || data.length === 0) return (
      <div className="h-[350px] bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
          <PieIcon className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm font-medium">No type data available</p>
      </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
         <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Task Types</h3>
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
              innerRadius={60}
              outerRadius={85}
              paddingAngle={5}
              dataKey="taskCount"
              stroke="none"
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