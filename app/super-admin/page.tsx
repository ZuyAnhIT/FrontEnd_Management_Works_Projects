"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Activity, Calendar } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { 
    getFinancialOverview, getCustomerHealthOverview, getSystemUsageOverview,
    FinancialData, CustomerHealthData, SystemUsageData 
} from "@/services/apiSuperAdminAnalytics";

// Feature Components
import { FinancialSection } from "@/components/features/super-admin/dashboard/FinancialSection";
import { CustomerHealthSection } from "@/components/features/super-admin/dashboard/CustomerHealthSection";
import { SystemUsageSection } from "@/components/features/super-admin/dashboard/SystemUsageSection";

export default function SuperAdminDashboardPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    // ---------------------------------------------------------------------------
    // STATE
    // ---------------------------------------------------------------------------
    const [isLoading, setIsLoading] = useState(true);
    const currentDate = new Date();
    const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);

    const [analytics, setAnalytics] = useState<{
        fin: FinancialData | null;
        cus: CustomerHealthData | null;
        sys: SystemUsageData | null;
    }>({ fin: null, cus: null, sys: null });

    // ---------------------------------------------------------------------------
    // LOGIC TẢI DỮ LIỆU
    // ---------------------------------------------------------------------------
    const fetchAllAnalytics = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fin, cus, sys] = await Promise.all([
                getFinancialOverview(selectedYear, selectedMonth),
                getCustomerHealthOverview(selectedYear, selectedMonth),
                getSystemUsageOverview(selectedYear, selectedMonth)
            ]);
            setAnalytics({ fin, cus, sys });
        } catch (error: any) {
            showToast("Failed to sync system intelligence data.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [selectedYear, selectedMonth, showToast]);

    // Bảo vệ tuyến đường & Khởi tạo
    useEffect(() => {
        if (!isAuthLoading) {
            if (!user?.systemRoles?.includes("SYSTEM_ADMIN")) {
                router.replace("/admin");
                return;
            }
            fetchAllAnalytics();
        }
    }, [isAuthLoading, user, fetchAllAnalytics, router]);

    // ---------------------------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------------------------
    if (isAuthLoading || (isLoading && !analytics.fin)) {
        return (
            <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin" />
                <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#6B778C]">Loading Analytics...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F5F7] p-8 font-sans text-[#172B4D]">
            <div className="max-w-[1500px] mx-auto space-y-10">
                
                {/* 1. HEADER & FILTER BAR */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-[#DFE1E6]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#DEEBFF] rounded-xl">
                            <Activity className="w-7 h-7 text-[#0052CC]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight text-[#172B4D]">Platform Oversight</h1>
                            <p className="text-[14px] text-[#6B778C] font-medium">Global intelligence for system health and financial growth.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-[#F4F5F7] p-2.5 rounded-xl border border-[#DFE1E6]">
                        <Calendar className="w-4 h-4 text-[#6B778C] ml-2" />
                        <input 
                            type="month" 
                            value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
                            onChange={(e) => {
                                const [y, m] = e.target.value.split('-');
                                if (y && m) { setSelectedYear(Number(y)); setSelectedMonth(Number(m)); }
                            }}
                            className="bg-transparent border-none text-[13px] font-black text-[#172B4D] outline-none cursor-pointer uppercase tracking-wider"
                        />
                    </div>
                </header>

                {/* 2. FINANCIAL SECTION */}
                <FinancialSection data={analytics.fin} loading={isLoading} />

                {/* 3. DOUBLE BLOCKS: CUSTOMER & SYSTEM */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <CustomerHealthSection data={analytics.cus} loading={isLoading} />
                    <SystemUsageSection data={analytics.sys} loading={isLoading} />
                </div>
            </div>
        </div>
    );
}