"use client";

import { Users, FolderKanban, Briefcase, CheckSquare, Clock } from "lucide-react";
import StatsCard, { StatsCardVariant } from "@/components/features/admin/StartsCard"; 

export default function DashboardPage() {
  // 1. Updated data structure to match optimized StatsCard
  const stats = [
    {
      icon: Users,
      value: "48",
      label: "Total Members",
      variant: "blue" as StatsCardVariant,
      trend: "+12% from last month",
    },
    {
      icon: FolderKanban,
      value: "6",
      label: "Departments",
      variant: "purple" as StatsCardVariant,
      trend: "Stable",
    },
    {
      icon: Briefcase,
      value: "23",
      label: "Active Projects",
      variant: "green" as StatsCardVariant,
      trend: "+3 new projects",
    },
    {
      icon: CheckSquare, 
      value: "187",
      label: "Tasks Completed",
      variant: "orange" as StatsCardVariant,
      trend: "+24 this week",
    },
  ];

  return (
    // 2. Light gray background for full screen
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-900">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Overview
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Welcome back, <span className="text-slate-800">Admin User</span>!
          </p>
        </div>

        {/* Date Indicator (Optional) */}
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard 
            key={index} 
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            variant={stat.variant}
            trend={stat.trend}
          />
        ))}
      </div>
      
      {/* This area can accommodate Charts or Tables later */}
      {/* <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"> ... </div> */}

    </div>
  );
}