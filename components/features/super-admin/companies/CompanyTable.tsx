"use client";

import React from "react";
import { Mail, ChevronUp, ChevronDown, Building2, Eye, Lock, Unlock } from "lucide-react";
import { SystemCompany } from "@/services/apiCompanySystem";

// ✅ 1. THÊM 2 PROPS NÀY VÀO INTERFACE
interface CompanyTableProps {
    companies: SystemCompany[];
    renderStatus: (status: string) => React.ReactNode;
    renderPlan: (company: SystemCompany) => React.ReactNode;
    formatDateTime: (date?: string | null) => string;
    onViewDetail: (company: SystemCompany) => void;
    onSuspend: (company: SystemCompany) => void;   // Thêm dòng này
    onActivate: (company: SystemCompany) => void;  // Thêm dòng này
    onSort?: (field: string) => void;
    currentSortBy?: string;
    currentSortDir?: "asc" | "desc";
}

// ✅ 2. NHẬN 2 PROPS NÀY VÀO COMPONENT
export default function CompanyTable({
    companies,
    renderStatus,
    renderPlan,
    formatDateTime,
    onViewDetail,
    onSuspend,     // Thêm dòng này
    onActivate,    // Thêm dòng này
    onSort,
    currentSortBy,
    currentSortDir,
}: CompanyTableProps) {

    const renderSortIcon = (field: string) => {
        if (!onSort) return null;
        if (currentSortBy !== field) return <ChevronUp className="w-3 h-3 opacity-30" />;
        return currentSortDir === "asc" ? (
            <ChevronUp className="w-3 h-3 text-blue-600" />
        ) : (
            <ChevronDown className="w-3 h-3 text-blue-600" />
        );
    };

    const sortableTh = (label: string, field: string, width?: string) => (
        <th
            onClick={() => onSort && onSort(field)}
            className={`px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] tracking-wider select-none cursor-pointer hover:text-blue-600 ${width}`}
        >
            <div className="flex items-center gap-1">
                <span>{label}</span>
                {renderSortIcon(field)}
            </div>
        </th>
    );

    if (companies.length === 0) {
        return (
             <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-10 text-center text-slate-500">
                <p className="text-sm font-medium">No companies found matching the criteria.</p>
                <p className="text-xs mt-1">Try adjusting your search keywords or filters.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-200">
                        <tr>
                            {sortableTh("Company", "name")}
                            {sortableTh("Contact", "email")}
                            {sortableTh("Subscription", "planCode")}
                            {sortableTh("Status", "status")}
                            {sortableTh("Registered Date", "createdAt")}
                            <th className="px-4 py-3 text-right font-semibold text-slate-500 uppercase text-[11px] tracking-wider w-24">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {companies.map((company) => (
                            <tr key={company.id} className="group hover:bg-slate-50/50 transition-colors">
                                {/* Name & Code */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                            <Building2 className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-slate-900 truncate">
                                                {company.name}
                                            </div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">
                                                Code: {company.companyCode}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Email ONLY (Bỏ Storage đi cho gọn) */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="truncate max-w-[150px]">{company.email}</span>
                                    </div>
                                </td>

                                {/* Plan Badge */}
                                <td className="px-4 py-3">{renderPlan(company)}</td>
                                
                                {/* Status Badge */}
                                <td className="px-4 py-3">{renderStatus(company.status)}</td>

                                {/* Created At */}
                                <td className="px-4 py-3 text-slate-500 text-xs font-medium">
                                    {formatDateTime(company.createdAt)}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onViewDetail(company)}
                                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Tenant 360 View"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {company.status === "ACTIVE" ? (
                                            <button
                                                onClick={() => onSuspend(company)}
                                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Suspend Company"
                                            >
                                                <Lock className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onActivate(company)}
                                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                                title="Activate Company"
                                            >
                                                <Unlock className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}