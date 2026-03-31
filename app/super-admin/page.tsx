"use client";

// =============================================================================
// 1. IMPORT (Thu vien -> Noi bo -> Utils)
// =============================================================================

import React, { useMemo } from "react";
import { Building2, Users, DollarSign, Activity } from "lucide-react";

// Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & TYPES
// =============================================================================

interface StatCard {
    id: string;
    title: string;
    value: string | number;
    icon: React.ElementType;
    colorClass: string;
    bgClass: string;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Trang chu quan tri he thong cap cao (Super Admin Dashboard).
 * Hien thi cac chi so tong quan nhat cua toan bo nen tang.
 */
export default function SuperAdminDashboard() {
    
    // ---------------------------------------------------------------------------
    // 4. DATA PREPARATION (Du lieu thong ke hien tai dang la Mock)
    // ---------------------------------------------------------------------------
    
    // Su dung useMemo de tranh tao lai mang du lieu trong cac lan render sau
    const statCards: StatCard[] = useMemo(() => [
        {
            id: "companies",
            title: "Total Companies",
            value: "0",
            icon: Building2,
            colorClass: "text-[#0052CC]", // Xanh Atlassian
            bgClass: "bg-[#E3F2FD]"
        },
        {
            id: "users",
            title: "Total Users",
            value: "0",
            icon: Users,
            colorClass: "text-[#36B37E]", // Xanh la thanh cong
            bgClass: "bg-[#E3FCEF]"
        },
        {
            id: "revenue",
            title: "Monthly Revenue",
            value: "$0",
            icon: DollarSign,
            colorClass: "text-[#6554C0]", // Tim dam
            bgClass: "bg-[#EAE6FF]"
        }
    ], []);

    // ---------------------------------------------------------------------------
    // 5. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* KHOI TIEU DE (Page Header) */}
            <div>
                <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase flex items-center gap-3">
                    <div className="p-2 bg-white border border-[#DFE1E6] rounded-lg shadow-sm">
                        <Activity className="w-5 h-5 text-[#0052CC] stroke-[2.5]" />
                    </div>
                    Platform Overview
                </h1>
                <p className="text-[14px] text-[#42526E] font-medium mt-2">
                    High-level metrics and performance indicators of the entire system.
                </p>
            </div>

            {/* KHOI THONG KE (Statistics Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat) => (
                    <div 
                        key={stat.id} 
                        className="p-6 bg-white rounded-2xl border border-[#DFE1E6] shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[11px] font-black text-[#6B778C] uppercase tracking-[0.15em]">
                                {stat.title}
                            </h3>
                            <div className={cn("p-2.5 rounded-xl shadow-sm", stat.bgClass)}>
                                <stat.icon className={cn("w-5 h-5 stroke-[2.5]", stat.colorClass)} />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-[#172B4D] tracking-tighter">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>
            
            {/* Cac phan tu khac cua Dashboard (Bieu do, Danh sach hoat dong moi nhat) 
              co the duoc mo rong va them vao duoi khu vuc nay sau.
            */}
        </div>
    );
}