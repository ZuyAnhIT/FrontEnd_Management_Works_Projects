"use client";

import React from "react";
import { Building2, AlertTriangle, Users } from "lucide-react";
import { CustomerHealthData } from "@/services/apiSuperAdminAnalytics";
import { KpiCard } from "./Shared/KpiCard";
import { cn } from "@/lib/utils";

interface Props {
    data: CustomerHealthData | null;
    loading: boolean;
}

export const CustomerHealthSection = ({ data, loading }: Props) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-[#DFE1E6] shadow-sm space-y-6 flex flex-col h-full">
            <h2 className="text-[12px] font-black text-[#172B4D] uppercase tracking-[0.2em] border-b border-[#F4F5F7] pb-4">Customer Ecosystem</h2>
            
            <KpiCard 
                title="Active Tenants"
                value={data?.activeTenants.currentActiveCount || 0}
                icon={Building2}
                growth={data?.activeTenants.growthPercentage}
                isPositive={data?.activeTenants.isPositiveGrowth}
                loading={loading}
            />

            {data && data.newVsChurn.netRetention < 0 && (
                <div className="p-4 bg-[#FFEBE6] border border-[#FFBDAD] rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#BF2600] shrink-0" />
                    <p className="text-[13px] font-bold text-[#DE350B]">Churn alert: Negative net retention detected this period.</p>
                </div>
            )}

            <div className="pt-4 flex-1">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#6B778C] mb-4">Plan Distribution</h3>
                <div className="space-y-4">
                    {data?.tenantsByPlan.map(plan => (
                        <div key={plan.planName} className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                                <span className="text-[#42526E]">{plan.planName}</span>
                                <span className="text-[#172B4D]">{plan.tenantCount} ({plan.percentage}%)</span>
                            </div>
                            <div className="h-2 bg-[#F4F5F7] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#0052CC] rounded-full transition-all duration-1000" 
                                    style={{ width: `${plan.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};