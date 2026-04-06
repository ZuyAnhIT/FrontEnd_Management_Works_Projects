"use client";

import React from "react";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    growth?: number;
    isPositive?: boolean;
    loading?: boolean;
}

export const KpiCard = ({ title, value, icon: Icon, growth, isPositive, loading }: KpiCardProps) => (
    <div className="bg-white p-6 rounded-2xl border border-[#DFE1E6] shadow-sm flex items-start gap-4 h-full animate-in fade-in duration-500">
        <div className="p-3 bg-[#DEEBFF] rounded-xl text-[#0052CC] shrink-0">
            <Icon className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#6B778C] truncate">
                {title}
            </h3>
            {loading ? (
                <div className="h-8 w-32 bg-slate-100 animate-pulse rounded mt-2" />
            ) : (
                <p className="text-2xl font-black text-[#172B4D] mt-1 truncate">{value}</p>
            )}
            {growth !== undefined && !loading && (
                <div className={cn(
                    "flex items-center gap-1 mt-2 text-[12px] font-bold",
                    isPositive ? "text-[#006644]" : "text-[#BF2600]"
                )}>
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{growth}% vs last month</span>
                </div>
            )}
        </div>
    </div>
);