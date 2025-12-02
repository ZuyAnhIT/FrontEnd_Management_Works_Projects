"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { WorkloadStat } from "@/services/apiStatistics";
import { Loader2, Users } from "lucide-react";

interface WorkloadChartProps {
  data: WorkloadStat[];
  loading: boolean;
  unit: string; // "POINTS" or "HOURS"
}

// --- CUSTOM AXIS TICK (HIỆN AVATAR TRÊN TRỤC X) ---
const CustomXAxisTick = ({ x, y, payload, data }: any) => {
    const user = data[payload.index];
    if (!user) return null;

    return (
        <g transform={`translate(${x},${y})`}>
            {/* Avatar Image (dùng foreignObject để nhúng HTML img vào SVG) */}
            <foreignObject x={-12} y={0} width={24} height={24}>
                <img 
                    src={user.avatarUrl || "https://ui-avatars.com/api/?name=" + user.userName} 
                    alt="" 
                    className="w-6 h-6 rounded-full border border-slate-200 object-cover"
                />
            </foreignObject>
            {/* Name Text (Chỉ lấy tên cuối để gọn) */}
            <text x={0} y={35} dy={0} textAnchor="middle" fill="#64748b" fontSize={10} fontWeight={500}>
                {user.userName.split(' ').pop()} 
            </text>
        </g>
    );
};

// --- CUSTOM TOOLTIP (POPUP CHI TIẾT) ---
const CustomTooltip = ({ active, payload, unit }: any) => {
    if (active && payload && payload.length) {
        const user = payload[0].payload;

        return (
            <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl z-50 min-w-[160px]">
                
                {/* Header Tooltip */}
                <div className="flex items-center gap-3 mb-3 border-b border-slate-50 pb-2">
                    <img 
                        src={user.avatarUrl || "https://ui-avatars.com/api/?name=" + user.userName} 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm" 
                        alt=""
                    />
                    <div>
                        <p className="font-bold text-xs text-slate-800">{user.userName}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">User Workload</p>
                    </div>
                </div>
                
                {/* List Breakdown */}
                <div className="space-y-1.5">
                    {payload.map((entry: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs items-center">
                            <div className="flex items-center gap-2 text-slate-500">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                <span>{entry.name}</span>
                            </div>
                            <span className="font-bold text-slate-700">
                                {entry.value}
                            </span>
                        </div>
                    ))}
                    
                    {/* Total Row */}
                    <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between font-bold text-xs text-blue-900">
                        <span className="uppercase">Total</span>
                        <span>{user.totalLoad} <span className="text-[9px] font-normal text-slate-400">{unit === 'HOURS' ? 'hrs' : 'pts'}</span></span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function WorkloadChart({ data, loading, unit }: WorkloadChartProps) {
  
  // Loading State
  if (loading) return (
      <div className="h-[450px] bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
  );

  // Empty State
  if (!data || data.length === 0) return (
      <div className="h-[450px] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 shadow-sm">
          <div className="p-4 bg-slate-50 rounded-full mb-3"><Users className="w-8 h-8 opacity-30" /></div>
          <p className="text-sm font-medium">No workload data available for this filter.</p>
      </div>
  );

  // 1. Chuẩn bị dữ liệu phẳng cho Recharts
  // Lấy tất cả các key stack (ví dụ: "In Progress", "Done", "To Do"...)
  const allStackKeys = Array.from(new Set(
      data.flatMap(u => u.breakdowns.map(b => b.stackName))
  ));

  // Map dữ liệu
  const chartData = data.map(user => {
      const flatUser: any = { ...user };
      user.breakdowns.forEach(b => {
          flatUser[b.stackName] = b.value;
          flatUser[`${b.stackName}_color`] = b.color; // Lưu màu sắc riêng
      });
      return flatUser;
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[500px] flex flex-col relative">
       
       {/* Chart Header */}
       <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-5 h-5" />
             </div>
             <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Resource Allocation</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Workload distribution per member</p>
             </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 uppercase">
             Unit: {unit}
          </span>
       </div>

       {/* Chart Body */}
       <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
             <BarChart 
                data={chartData} 
                margin={{ top: 20, right: 0, left: 0, bottom: 30 }}
                barSize={48} 
             >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                
                <XAxis 
                    dataKey="userName" 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0}
                    tick={(props) => <CustomXAxisTick {...props} data={data} />}
                    height={60} 
                />
                
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                />
                
                <Tooltip content={<CustomTooltip unit={unit} />} cursor={{fill: '#f8fafc', radius: 8}} />
                
                <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle" 
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}
                />
                
                {/* Render các Bar Chồng */}
                {allStackKeys.map((key, index) => {
                    // Lấy màu sắc từ dữ liệu mẫu đầu tiên có key này
                    const sampleItem = data.find(u => u.breakdowns.find(b => b.stackName === key));
                    const color = sampleItem?.breakdowns.find(b => b.stackName === key)?.color || "#cbd5e1";
                    
                    // Bo góc cho item trên cùng của cột (index cuối cùng)
                    const isLast = index === allStackKeys.length - 1;
                    const radius: [number, number, number, number] = isLast ? [6, 6, 0, 0] : [0, 0, 0, 0];

                    return (
                        <Bar 
                            key={key} 
                            dataKey={key} 
                            stackId="a" 
                            fill={color} 
                            radius={radius}
                            animationDuration={1000}
                        />
                    );
                })}
             </BarChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
}