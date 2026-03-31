"use client";

// =============================================================================
// 1. IMPORT (Thư viện -> Internal -> Types)
// =============================================================================

import React from "react";
import {
    ChevronUp,
    ChevronDown,
    Package,
    Edit,
    Trash2,
    Eye,
    SearchX,
} from "lucide-react";

// Types & Utils
import { SystemPlan } from "@/services/apiPlanSystem";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface PlanTableProps {
    plans: SystemPlan[];
    renderStatus: (isActive: boolean) => React.ReactNode;
    onViewDetail?: (plan: SystemPlan) => void;
    onEdit?: (plan: SystemPlan) => void;
    onSort?: (field: string) => void;
    currentSortBy?: string;
    currentSortDir?: "asc" | "desc";
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần bảng hiển thị danh sách các gói dịch vụ hệ thống.
 * Hỗ trợ các tính năng sắp xếp dữ liệu và điều khiển hành động của quản trị viên.
 */
export default function PlanTable({
    plans,
    renderStatus,
    onViewDetail,
    onEdit,
    onSort,
    currentSortBy,
    currentSortDir,
}: PlanTableProps) {

    // ---------------------------------------------------------------------------
    // 4. HELPERS (Các hàm hỗ trợ định dạng và hiển thị)
    // ---------------------------------------------------------------------------

    /**
     * Hiển thị biểu tượng mũi tên sắp xếp dựa trên trạng thái hiện tại
     */
    const renderSortIcon = (field: string) => {
        if (!onSort) return null;
        if (currentSortBy !== field) {
            return <ChevronUp className="w-3 h-3 opacity-20" />;
        }
        
        return currentSortDir === "asc" ? (
            <ChevronUp className="w-3 h-3 text-[#0052CC]" />
        ) : (
            <ChevronDown className="w-3 h-3 text-[#0052CC]" />
        );
    };

    /**
     * Định dạng số tiền sang VNĐ
     */
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    /**
     * Cấu trúc tiêu đề cột có khả năng sắp xếp
     */
    const SortableTh = ({ label, field, className }: { label: string; field: string; className?: string }) => (
        <th
            onClick={() => onSort?.(field)}
            className={cn(
                "px-4 py-3 cursor-pointer select-none transition-colors group",
                "text-[10px] font-black uppercase tracking-[0.15em] text-[#6B778C]",
                "hover:text-[#0052CC] hover:bg-slate-100/50",
                className
            )}
        >
            <div className="flex items-center gap-1.5">
                <span>{label}</span>
                <span className="transition-transform group-hover:scale-110">
                    {renderSortIcon(field)}
                </span>
            </div>
        </th>
    );

    // ---------------------------------------------------------------------------
    // 5. RENDER LOGIC
    // ---------------------------------------------------------------------------

    // Giao diện khi không có dữ liệu trả về
    if (plans.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                    <SearchX className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-[#172B4D]">No plans found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                    Try adjusting your search keywords or applied filters to find what you are looking for.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    {/* TABLE HEADER */}
                    <thead className="bg-[#F4F5F7] border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.15em] text-[#6B778C] w-16">
                                #
                            </th>
                            <SortableTh label="Plan Blueprint" field="name" />
                            <SortableTh label="Pricing Model" field="monthlyPrice" />
                            <SortableTh label="Status" field="isActive" />
                            <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.15em] text-[#6B778C] w-32">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    {/* TABLE BODY */}
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {plans.map((plan, index) => (
                            <tr
                                key={plan.id}
                                className="group hover:bg-[#F4F5F7]/40 transition-colors"
                            >
                                {/* Cột: Số thứ tự */}
                                <td className="px-4 py-4 text-center">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 text-[#6B778C] text-[11px] font-black border border-slate-200 shadow-sm">
                                        {index + 1}
                                    </span>
                                </td>

                                {/* Cột: Tên và Mã nhận diện gói */}
                                <td className="px-4 py-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] border border-blue-100 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                            <Package className="w-5 h-5 text-[#0052CC]" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-[#172B4D] truncate flex items-center gap-2 tracking-tight">
                                                {plan.name}
                                                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md font-black uppercase border border-slate-200 tracking-widest">
                                                    {plan.planCode}
                                                </span>
                                            </div>
                                            <div className="text-[12px] text-[#42526E] mt-1 line-clamp-1 max-w-[300px] font-medium leading-relaxed">
                                                {plan.description || "No description provided."}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Cột: Cấu hình giá */}
                                <td className="px-4 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-black text-[#172B4D] tracking-tight">
                                            {formatCurrency(plan.monthlyPrice)}
                                            <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">/mo</span>
                                        </span>
                                        {plan.yearlyPrice > 0 && (
                                            <span className="text-[11px] text-[#6B778C] font-semibold mt-0.5">
                                                {formatCurrency(plan.yearlyPrice)}
                                                <span className="text-[9px] font-black uppercase ml-1">/yr</span>
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* Cột: Trạng thái hiển thị */}
                                <td className="px-4 py-4">
                                    {renderStatus(plan.isActive)}
                                </td>

                                {/* Cột: Các thao tác điều khiển */}
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <button
                                            onClick={() => onViewDetail?.(plan)}
                                            className="p-2 text-[#42526E] hover:text-[#0052CC] hover:bg-[#E3F2FD] rounded-lg transition-all active:scale-90"
                                            title="View Snapshot"
                                        >
                                            <Eye className="w-4 h-4 stroke-[2.5]" />
                                        </button>
                                        <button
                                            onClick={() => onEdit?.(plan)}
                                            className="p-2 text-[#42526E] hover:text-[#FF991F] hover:bg-orange-50 rounded-lg transition-all active:scale-90"
                                            title="Modify Schema"
                                        >
                                            <Edit className="w-4 h-4 stroke-[2.5]" />
                                        </button>
                                        <button
                                            className="p-2 text-[#42526E] hover:text-[#FF5630] hover:bg-red-50 rounded-lg transition-all active:scale-90"
                                            title="Decommission Plan"
                                        >
                                            <Trash2 className="w-4 h-4 stroke-[2.5]" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* STYLES CỤC BỘ (Thanh cuộn thẩm mỹ) */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B3BAC5; }
            `}</style>
        </div>
    );
}