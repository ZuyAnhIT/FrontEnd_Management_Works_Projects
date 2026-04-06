"use client";

import React from "react";
import { DollarSign } from "lucide-react";
import { FinancialData } from "@/services/apiSuperAdminAnalytics";
import { KpiCard } from "./Shared/KpiCard";
import { cn } from "@/lib/utils";

interface Props {
    data: FinancialData | null;
    loading: boolean;
}

export const FinancialSection = ({ data, loading }: Props) => {
    const formatVND = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
                <DollarSign className="w-5 h-5 text-[#0052CC]" />
                <h2 className="text-[12px] font-black text-[#172B4D] uppercase tracking-[0.2em]">Financial Performance</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* KPI Card */}
                <div className="lg:col-span-1">
                    <KpiCard 
                        title="Monthly Recurring Revenue"
                        value={formatVND(data?.mrr.currentMonthRevenue || 0)}
                        icon={DollarSign}
                        growth={data?.mrr.growthPercentage}
                        isPositive={data?.mrr.isPositiveGrowth}
                        loading={loading}
                    />
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#DFE1E6] p-6 shadow-sm overflow-hidden">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[#6B778C] mb-4">Latest Transactions</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[13px]">
                            <thead className="bg-[#FAFBFC] text-[#6B778C] text-[10px] font-black uppercase tracking-widest border-b border-[#DFE1E6]">
                                <tr>
                                    <th className="p-3">TXN CODE</th>
                                    <th className="p-3">TENANT</th>
                                    <th className="p-3">AMOUNT</th>
                                    <th className="p-3 text-right">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F4F5F7]">
                                {loading ? [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse"><td colSpan={4} className="p-3 h-10 bg-slate-50/50"></td></tr>
                                )) : data?.recentTransactions.map((tx) => (
                                    <tr key={tx.transactionCode} className="hover:bg-[#FAFBFC] transition-colors">
                                        <td className="p-3 font-mono font-bold text-[#0052CC]">{tx.transactionCode}</td>
                                        <td className="p-3 font-bold text-[#172B4D]">{tx.companyName}</td>
                                        <td className="p-3 font-bold">{formatVND(tx.amount)}</td>
                                        <td className="p-3 text-right">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-black uppercase border",
                                                tx.status === "SUCCESS" ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]" : "bg-[#FFEBE6] text-[#BF2600] border-[#FFBDAD]"
                                            )}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
};