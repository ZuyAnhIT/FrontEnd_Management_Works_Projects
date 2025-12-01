"use client";

import { LucideIcon } from "lucide-react";

interface WeeklyStatCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  color: "blue" | "green" | "orange" | "red";
  onClick?: () => void;
  isActive?: boolean;
}

export default function WeeklyStatCard({ title, count, icon: Icon, color, onClick, isActive }: WeeklyStatCardProps) {
  const styles = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };

  const activeClass = isActive ? "ring-2 ring-offset-1 ring-slate-400" : "hover:shadow-md";

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-4 rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 ${activeClass}`}
    >
      <div className="flex items-start justify-between">
         <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{count}</h3>
         </div>
         <div className={`p-3 rounded-lg ${styles[color]}`}>
            <Icon className="w-6 h-6" />
         </div>
      </div>
    </div>
  );
}