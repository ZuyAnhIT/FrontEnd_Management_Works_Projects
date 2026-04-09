"use client";

// =============================================================================
// 1. IMPORTS
// =============================================================================
import React, { useState, useEffect, useCallback } from "react";
import { 
    Receipt, Calendar, Filter, ChevronLeft, ChevronRight, 
    CheckCircle2, XCircle, Clock, SearchX, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

import { 
    getCompanyTransactions, 
    TransactionDTO, 
    SystemPageResponse, 
    TransactionFilterParams 
} from "@/services/apiCompanySystem";

// =============================================================================
// 2. UTILS & FORMATTERS
// =============================================================================
const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency }).format(amount);
};

const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
};

const getStatusConfig = (status: string) => {
    switch (status) {
        case "SUCCESS": return { color: "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]", icon: CheckCircle2, label: "Success" };
        case "FAILED": return { color: "bg-[#FFEBE6] text-[#BF2600] border-[#FFBDAD]", icon: XCircle, label: "Failed" };
        case "PENDING": return { color: "bg-[#FFF0B3] text-[#FF8B00] border-[#FFE380]", icon: Clock, label: "Pending" };
        default: return { color: "bg-[#F4F5F7] text-[#42526E] border-[#DFE1E6]", icon: Clock, label: status };
    }
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

interface Props {
    companyId: number;
}

export default function TransactionHistoryTab({ companyId }: Props) {
    const { showToast } = useToast();

    // -- States --
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<SystemPageResponse<TransactionDTO> | null>(null);

    // -- Filters & Pagination States --
    const [status, setStatus] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [page, setPage] = useState<number>(0);
    const pageSize = 10;

    // ---------------------------------------------------------------------------
    // DATA FETCHING
    // ---------------------------------------------------------------------------
    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: TransactionFilterParams = {
                page,
                size: pageSize,
                sortBy: "createdAt",
                sortDir: "desc",
                ...(status && { status }),
                ...(startDate && { startDate: `${startDate}T00:00:00` }),
                ...(endDate && { endDate: `${endDate}T23:59:59` }),
            };

            const response = await getCompanyTransactions(companyId, params);
            setData(response);
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsLoading(false);
        }
    }, [companyId, page, pageSize, status, startDate, endDate, showToast]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // ---------------------------------------------------------------------------
    // SAFE PAGINATION VARIABLES (Khắc phục lỗi NaN)
    // ---------------------------------------------------------------------------
    // Lấy dữ liệu an toàn, hỗ trợ cả trường hợp Backend đổi tên biến
    const safePageNo = data?.pageNo ?? (data as any)?.pageNumber ?? 0;
    const safePageSize = data?.pageSize ?? (data as any)?.size ?? 10;
    const safeTotalElements = data?.totalElements ?? 0;
    const safeTotalPages = data?.totalPages ?? 0;
    const isLastPage = data?.last ?? true;

    // Tính toán số lượng hiển thị an toàn
    const startItem = safeTotalElements === 0 ? 0 : safePageNo * safePageSize + 1;
    const endItem = Math.min((safePageNo + 1) * safePageSize, safeTotalElements);

    // ---------------------------------------------------------------------------
    // RENDER LOGIC
    // ---------------------------------------------------------------------------
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#DFE1E6] flex flex-col animate-in fade-in duration-500">
            
            {/* 1. FILTER BAR */}
            <div className="p-5 border-b border-[#DFE1E6] bg-[#FAFBFC] rounded-t-2xl flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 mr-auto">
                    <div className="p-2 bg-[#DEEBFF] rounded-lg">
                        <Receipt className="w-5 h-5 text-[#0052CC]" />
                    </div>
                    <div>
                        <h3 className="text-[14px] font-black text-[#172B4D] uppercase tracking-tight">Billing History</h3>
                        <p className="text-[12px] text-[#6B778C] font-medium mt-0.5">Track all financial records and payment statuses.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-white border border-[#DFE1E6] rounded-md px-3 h-9 focus-within:border-[#0052CC] transition-colors">
                        <Filter className="w-4 h-4 text-[#6B778C] mr-2" />
                        <select 
                            value={status} 
                            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
                            className="bg-transparent border-none text-[13px] font-bold text-[#172B4D] outline-none cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="SUCCESS">Success</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>

                    <div className="flex items-center bg-white border border-[#DFE1E6] rounded-md h-9 px-2 focus-within:border-[#0052CC] transition-colors">
                        <Calendar className="w-4 h-4 text-[#6B778C] mr-2" />
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                            className="bg-transparent border-none text-[13px] font-medium text-[#172B4D] outline-none cursor-pointer"
                        />
                        <span className="text-[#DFE1E6] mx-2">|</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                            className="bg-transparent border-none text-[13px] font-medium text-[#172B4D] outline-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* 2. DATA TABLE */}
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left text-[13px]">
                    <thead className="bg-white text-[#6B778C] text-[10px] font-black uppercase tracking-[0.15em] border-b border-[#DFE1E6]">
                        <tr>
                            <th className="p-4 pl-6 whitespace-nowrap">Transaction ID</th>
                            <th className="p-4 whitespace-nowrap">Subscription Plan</th>
                            <th className="p-4 whitespace-nowrap">Amount</th>
                            <th className="p-4 whitespace-nowrap">Method</th>
                            <th className="p-4 whitespace-nowrap">Status</th>
                            <th className="p-4 pr-6 whitespace-nowrap">Timeline</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F5F7]">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="p-4 pl-6"><div className="h-4 bg-slate-100 rounded w-32 mb-1" /><div className="h-3 bg-slate-50 rounded w-24" /></td>
                                    <td className="p-4"><div className="h-4 bg-slate-100 rounded w-24 mb-1" /><div className="h-3 bg-slate-50 rounded w-16" /></td>
                                    <td className="p-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                                    <td className="p-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                                    <td className="p-4"><div className="h-6 bg-slate-100 rounded-full w-20" /></td>
                                    <td className="p-4 pr-6"><div className="h-4 bg-slate-100 rounded w-32" /></td>
                                </tr>
                            ))
                        ) : data?.content && data.content.length > 0 ? (
                            data.content.map((tx) => {
                                const st = getStatusConfig(tx.status);
                                return (
                                    <tr key={tx.id} className="hover:bg-[#FAFBFC] transition-colors group">
                                        <td className="p-4 pl-6">
                                            <span className="block font-mono font-bold text-[#0052CC] text-[12px]">{tx.transactionCode}</span>
                                            {tx.gatewayTransactionId && (
                                                <span className="block text-[10px] font-bold text-[#6B778C] uppercase tracking-wider mt-0.5">Ref: {tx.gatewayTransactionId}</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="block font-bold text-[#172B4D]">{tx.planName}</span>
                                            <span className="block text-[10px] font-bold text-[#6B778C] uppercase tracking-wider mt-0.5">{tx.billingCycle}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-black text-[#172B4D]">{formatCurrency(tx.amount, tx.currency)}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#42526E] bg-[#DFE1E6]/50 px-2 py-1 rounded">
                                                {tx.paymentMethod.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border", st.color)}>
                                                <st.icon className="w-3 h-3 stroke-[2.5]" /> {st.label}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6">
                                            <span className="block text-[#172B4D] font-medium">{formatDate(tx.createdAt)}</span>
                                            {tx.status === "SUCCESS" && tx.paidAt && (
                                                <span className="block text-[10px] font-bold text-[#006644] uppercase tracking-wider mt-0.5">
                                                    Paid: {formatDate(tx.paidAt)}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <SearchX className="w-10 h-10 text-[#DFE1E6] mx-auto mb-3" />
                                    <h4 className="text-[14px] font-bold text-[#172B4D]">No transactions found</h4>
                                    <p className="text-[12px] text-[#6B778C] mt-1">Adjust your filters or date range to see results.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 3. PAGINATION (Đã fix lỗi NaN) */}
            {!isLoading && safeTotalElements > 0 && (
                <div className="p-4 border-t border-[#DFE1E6] bg-[#FAFBFC] rounded-b-2xl flex items-center justify-between">
                    <p className="text-[11px] font-black text-[#6B778C] uppercase tracking-widest">
                        Showing <span className="text-[#172B4D]">{startItem}</span> to <span className="text-[#172B4D]">{endItem}</span> of <span className="text-[#0052CC]">{safeTotalElements}</span> entries
                    </p>
                    
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={safePageNo === 0}
                            className="p-1.5 rounded-md text-[#42526E] hover:bg-[#DFE1E6] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <span className="px-3 py-1 bg-white border border-[#DFE1E6] rounded-md text-[12px] font-bold text-[#172B4D]">
                            Page {safePageNo + 1} / {safeTotalPages || 1}
                        </span>
                        
                        <button 
                            onClick={() => setPage(p => Math.min(safeTotalPages - 1, p + 1))}
                            disabled={isLastPage}
                            className="p-1.5 rounded-md text-[#42526E] hover:bg-[#DFE1E6] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}