"use client";

// =============================================================================
// 1. IMPORT (Thư viện -> Internal -> Styles)
// =============================================================================

import React from "react";
import { 
    Mail, ChevronUp, ChevronDown, Building2, 
    Eye, Lock, Unlock, SearchX 
} from "lucide-react";

// Internal Types & Utils
import { SystemCompany } from "@/services/apiCompanySystem";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface CompanyTableProps {
    companies: SystemCompany[];
    renderStatus: (status: string) => React.ReactNode;
    renderPlan: (company: SystemCompany) => React.ReactNode;
    formatDateTime: (date?: string | null) => string;
    onViewDetail: (company: SystemCompany) => void;
    onSuspend: (company: SystemCompany) => void;
    onActivate: (company: SystemCompany) => void;
    onSort?: (field: string) => void;
    currentSortBy?: string;
    currentSortDir?: "asc" | "desc";
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần bảng danh sách Công ty (Company/Tenant Table).
 * Cung cấp khả năng hiển thị dữ liệu tập trung, sắp xếp động và các thao tác quản trị nhanh.
 */
export default function CompanyTable({
    companies,
    renderStatus,
    renderPlan,
    formatDateTime,
    onViewDetail,
    onSuspend,
    onActivate,
    onSort,
    currentSortBy,
    currentSortDir,
}: CompanyTableProps) {

    // ---------------------------------------------------------------------------
    // 4. HELPER RENDERS (Các hàm hỗ trợ hiển thị thành phần nhỏ)
    // ---------------------------------------------------------------------------

    /**
     * Hiển thị biểu tượng sắp xếp dựa trên trạng thái hiện tại
     */
    const renderSortIcon = (field: string) => {
        if (!onSort) return null;
        if (currentSortBy !== field) return <ChevronUp className="w-3 h-3 opacity-20" />;
        
        return currentSortDir === "asc" ? (
            <ChevronUp className="w-3 h-3 text-[#0052CC]" />
        ) : (
            <ChevronDown className="w-3 h-3 text-[#0052CC]" />
        );
    };

    /**
     * Render tiêu đề cột có khả năng sắp xếp (Sortable Header)
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

    // Trường hợp không có dữ liệu để hiển thị
    if (companies.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                    <SearchX className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-[#172B4D]">No results found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                    We couldn't find any companies matching your current search or filters.
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
                            <SortableTh label="Company Entity" field="name" />
                            <SortableTh label="Contact Info" field="email" />
                            <SortableTh label="Subscription Plan" field="planCode" />
                            <SortableTh label="Status" field="status" />
                            <SortableTh label="Registration" field="createdAt" />
                            <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.15em] text-[#6B778C] w-32">
                                Operations
                            </th>
                        </tr>
                    </thead>

                    {/* TABLE BODY */}
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {companies.map((company) => (
                            <tr key={company.id} className="group hover:bg-[#F4F5F7]/40 transition-colors">
                                
                                {/* Cột: Tên và Mã công ty */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                                            <Building2 className="w-5 h-5 text-[#0052CC]" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-[#172B4D] truncate group-hover:text-[#0052CC] transition-colors">
                                                {company.name}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                                ID: {company.companyCode}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Cột: Thông tin liên hệ */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2 text-[#42526E] text-[13px] font-medium">
                                        <Mail className="w-3.5 h-3.5 opacity-50" />
                                        <span className="truncate max-w-[180px]">{company.email}</span>
                                    </div>
                                </td>

                                {/* Cột: Gói cước */}
                                <td className="px-4 py-4">
                                    {renderPlan(company)}
                                </td>
                                
                                {/* Cột: Trạng thái */}
                                <td className="px-4 py-4">
                                    {renderStatus(company.status)}
                                </td>

                                {/* Cột: Ngày đăng ký */}
                                <td className="px-4 py-4">
                                    <div className="text-[12px] font-bold text-[#6B778C] uppercase tracking-tighter">
                                        {formatDateTime(company.createdAt)}
                                    </div>
                                </td>

                                {/* Cột: Hành động */}
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        
                                        {/* Nút Xem chi tiết (Tenant 360) */}
                                        <button
                                            onClick={() => onViewDetail(company)}
                                            className="p-2 text-[#42526E] hover:text-[#0052CC] hover:bg-[#E3F2FD] rounded-lg transition-all active:scale-90"
                                            title="Tenant 360 View"
                                        >
                                            <Eye className="w-4 h-4 stroke-[2.5]" />
                                        </button>

                                        {/* Nút Đình chỉ / Kích hoạt dựa trên Status */}
                                        {company.status === "ACTIVE" ? (
                                            <button
                                                onClick={() => onSuspend(company)}
                                                className="p-2 text-[#42526E] hover:text-[#FF5630] hover:bg-red-50 rounded-lg transition-all active:scale-90"
                                                title="Suspend Account"
                                            >
                                                <Lock className="w-4 h-4 stroke-[2.5]" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onActivate(company)}
                                                className="p-2 text-[#42526E] hover:text-[#36B37E] hover:bg-emerald-50 rounded-lg transition-all active:scale-90"
                                                title="Reactivate Account"
                                            >
                                                <Unlock className="w-4 h-4 stroke-[2.5]" />
                                            </button>
                                        )}
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