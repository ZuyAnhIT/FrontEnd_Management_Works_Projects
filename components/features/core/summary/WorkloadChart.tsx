"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { WorkloadStat } from "@/services/apiStatistics";
import { Loader2, Users, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. HELPERS & SUB-COMPONENTS
// =============================================================================

interface CustomTickProps {
  x: number;
  y: number;
  payload: any;
  data: WorkloadStat[];
}

/**
 * Trục X tùy chỉnh hiển thị Avatar người dùng và Tên viết tắt.
 */
const CustomXAxisTick = ({ x, y, payload, data }: CustomTickProps) => {
  const user = data[payload.index];
  if (!user) return null;

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userName)}&background=0052CC&color=fff`;

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-14} y={8} width={28} height={28}>
        <div className="flex flex-col items-center justify-center overflow-visible">
          <img 
            src={user.avatarUrl || defaultAvatar} 
            alt={user.userName} 
            className="w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover ring-1 ring-slate-200"
          />
        </div>
      </foreignObject>
      <text 
        x={0} 
        y={48} 
        textAnchor="middle" 
        fill="#42526E" 
        fontSize={10} 
        fontWeight={700}
        className="uppercase tracking-tighter"
      >
        {user.userName.split(' ').pop()} 
      </text>
    </g>
  );
};

/**
 * Tooltip chi tiết hiển thị cơ cấu công việc của từng thành viên.
 */
const CustomTooltip = ({ active, payload, unit }: any) => {
  if (active && payload && payload.length) {
    const user = payload[0].payload;
    const breakdowns = user.breakdowns || [];

    return (
      <div className="bg-white p-4 border border-slate-200 shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200 min-w-[180px]">
        <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
          <img 
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userName)}`} 
            className="w-9 h-9 rounded-full border-2 border-white shadow-md ring-1 ring-slate-100" 
            alt={user.userName}
          />
          <div>
            <p className="font-bold text-[13px] text-[#172B4D] leading-tight">{user.userName}</p>
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Capacity Allocation</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {breakdowns.map((b: any, idx: number) => (
            <div key={idx} className="flex justify-between text-[11px] items-center">
              <div className="flex items-center gap-2 text-slate-500 font-semibold">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                <span>{b.stackName}</span>
              </div>
              <span className="font-black text-[#172B4D]">
                {b.value}
              </span>
            </div>
          ))}
          
          <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between font-black text-[11px] text-[#0052CC]">
            <span className="uppercase tracking-widest">Total Load</span>
            <span>
              {user.totalLoad} 
              <span className="text-[9px] font-bold text-slate-400 ml-1 uppercase">
                {unit === 'HOURS' ? 'hrs' : 'pts'}
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

interface WorkloadChartProps {
  data: WorkloadStat[];
  loading: boolean;
  unit: string; 
}

/**
 * Biểu đồ phân bổ nguồn lực (Resource Allocation Chart).
 * Trực quan hóa khối lượng công việc theo từng thành viên dưới dạng Stacked Bar Chart.
 */
export default function WorkloadChart({ data, loading, unit }: WorkloadChartProps) {
  
  // Tối ưu hóa dữ liệu cho Recharts (Flattening)
  const { chartData, allStackKeys } = useMemo(() => {
    if (!data) return { chartData: [], allStackKeys: [] };

    const keys = Array.from(new Set(data.flatMap(u => u.breakdowns.map(b => b.stackName))));
    const flattened = data.map(user => {
      const flatUser: any = { ...user };
      user.breakdowns.forEach(b => {
        flatUser[b.stackName] = b.value;
      });
      return flatUser;
    });

    return { chartData: flattened, allStackKeys: keys };
  }, [data]);

  // --- RENDER LOGIC ---

  if (loading) return (
    <div className="h-[500px] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3 shadow-sm">
      <Loader2 className="w-10 h-10 animate-spin text-[#0052CC] opacity-80" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculating workload...</span>
    </div>
  );

  if (!data || data.length === 0) return (
    <div className="h-[500px] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 shadow-sm">
      <div className="p-4 bg-slate-50 rounded-full mb-4">
        <Users className="w-8 h-8 opacity-20" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">No member data available</p>
    </div>
  );
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[520px] flex flex-col transition-all">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#E3F2FD] text-[#0052CC] rounded-xl border border-[#2684FF]/20">
            <Users className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Resource Workload</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase">Performance per member</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
            <div className="absolute right-0 bottom-full mb-2 w-56 p-2 bg-slate-800 text-[10px] text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
              Comparison of work volume assigned to each team member across various statuses.
            </div>
          </div>
          <span className="text-[10px] font-black text-[#0052CC] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wider">
            Unit: {unit}
          </span>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
            barSize={42} 
          >
            <CartesianGrid 
              strokeDasharray="4 4" 
              vertical={false} 
              stroke="#f1f5f9" 
            />
            
            <XAxis 
              dataKey="userName" 
              axisLine={false} 
              tickLine={false} 
              interval={0}
              tick={(props) => <CustomXAxisTick {...props} data={data} />}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} 
            />
            
            <Tooltip 
              content={<CustomTooltip unit={unit} />} 
              cursor={{ fill: '#091E420A', radius: 12 }} 
              animationDuration={200}
            />
            
            <Legend 
              verticalAlign="top" 
              align="center"
              height={50} 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ 
                fontSize: '10px', 
                fontWeight: 900, 
                color: '#42526E', 
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                paddingBottom: '20px'
              }}
            />
            
            {allStackKeys.map((key, index) => {
              const color = data.find(u => u.breakdowns.some(b => b.stackName === key))
                ?.breakdowns.find(b => b.stackName === key)?.color || "#cbd5e1";
              
              const isTop = index === allStackKeys.length - 1;

              return (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  stackId="workload" 
                  fill={color} 
                  radius={isTop ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                  animationDuration={1500}
                  className="hover:opacity-90 transition-opacity"
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}