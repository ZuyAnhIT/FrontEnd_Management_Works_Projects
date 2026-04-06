"use client";

import React from "react";
import { HardDrive, Activity, Users } from "lucide-react";
import { SystemUsageData } from "@/services/apiSuperAdminAnalytics";
import { cn } from "@/lib/utils";

interface Props {
    data: SystemUsageData | null;
    loading: boolean;
}

export const SystemUsageSection = ({ data, loading }: Props) => {
    const bytesToGB = (b: number) => (b / (1024 ** 3)).toFixed(2);

    return (
        <div className="bg-white p-6 rounded-2xl border border-[#DFE1E6] shadow-sm space-y-6 flex flex-col h-full">
            <h2 className="text-[12px] font-black text-[#172B4D] uppercase tracking-[0.2em] border-b border-[#F4F5F7] pb-4">Infrastructure & Activity</h2>

            {/* Storage Usage */}
            <div className="p-5 bg-[#FAFBFC] rounded-xl border border-[#DFE1E6] space-y-4">
                <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-[#0052CC]" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#172B4D]">Cloud Storage</span>
                </div>
                {loading ? (
                    <div className="h-10 w-full bg-slate-100 animate-pulse rounded" />
                ) : (
                    <div className="space-y-2">
                        <div className="flex justify-between text-[13px] font-bold text-[#42526E]">
                            <span>{bytesToGB(data?.storageUsage.totalUsedBytes || 0)} GB Used</span>
                            <span className="opacity-50">{bytesToGB(data?.storageUsage.totalCapacityBytes || 0)} GB Capacity</span>
                        </div>
                        <div className="h-3 bg-[#DFE1E6] rounded-full overflow-hidden">
                            <div 
                                className={cn(
                                    "h-full transition-all duration-1000",
                                    (data?.storageUsage.usagePercentage || 0) > 80 ? "bg-[#FF5630]" : "bg-[#36B37E]"
                                )}
                                style={{ width: `${data?.storageUsage.usagePercentage || 0}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Engagement Stats */}
            <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="p-5 border border-[#F4F5F7] bg-[#FAFBFC]/50 rounded-xl flex flex-col justify-center items-center text-center">
                    <span className="text-3xl font-black text-[#0052CC]">{data?.engagementStats.newProjectsCreated || 0}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#6B778C] mt-1">New Projects</span>
                </div>
                <div className="p-5 border border-[#F4F5F7] bg-[#FAFBFC]/50 rounded-xl flex flex-col justify-center items-center text-center">
                    <span className="text-3xl font-black text-[#0052CC]">{data?.engagementStats.newTasksCreated || 0}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#6B778C] mt-1">New Tasks</span>
                </div>
            </div>
        </div>
    );
};