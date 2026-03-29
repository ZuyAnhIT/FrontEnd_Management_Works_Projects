// components/features/company/TransactionDetailModal.tsx
"use client";

import { X, Loader2, Receipt, CheckCircle2, XCircle, Clock, Calendar, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Buttons";
import { TransactionDetailResponse } from "@/services/apiPayment";

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: TransactionDetailResponse | null;
    loading: boolean;
}

export default function TransactionDetailModal({ isOpen, onClose, transaction, loading }: TransactionDetailModalProps) {
    if (!isOpen) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDateTime = (dateString?: string | null) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("vi-VN", { 
            hour: "2-digit", minute: "2-digit", 
            day: "2-digit", month: "2-digit", year: "numeric" 
        });
    };

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "SUCCESS": return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide"><CheckCircle2 className="w-3.5 h-3.5" /> Thành công</span>;
            case "PENDING": return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide"><Clock className="w-3.5 h-3.5" /> Đang chờ xử lý</span>;
            case "CANCELLED": return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wide"><XCircle className="w-3.5 h-3.5" /> Đã hủy</span>;
            default: return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">{status}</span>;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Chi tiết giao dịch</h2>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">#{transaction?.transactionCode || "Loading..."}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-md hover:bg-slate-200 text-slate-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {loading || !transaction ? (
                        <div className="flex flex-col justify-center items-center py-20 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="text-sm text-slate-500">Đang tải biên lai...</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Trạng thái & Thông tin cơ bản */}
                            <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-dashed border-slate-200">
                                <div className="mb-3">{renderStatusBadge(transaction.status)}</div>
                                <div className="text-3xl font-black text-slate-900">{formatCurrency(transaction.finalPaidAmount)}</div>
                                <div className="text-sm text-slate-500 mt-1">Đã thanh toán qua {transaction.paymentMethod}</div>
                                {transaction.paidAt && (
                                    <div className="text-xs text-slate-400 mt-1">Thời gian: {formatDateTime(transaction.paidAt)}</div>
                                )}
                            </div>

                            {/* Bảng tính toán tiền (Proration Math) */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Chi tiết thanh toán</h3>
                                <div className="bg-slate-50 p-4 rounded-xl space-y-3 text-sm">
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Giá gốc ({transaction.currentPlanName})</span>
                                        <span className="font-medium">{formatCurrency(transaction.originalPrice)}</span>
                                    </div>
                                    {transaction.deductedAmount > 0 && (
                                        <div className="flex justify-between items-center text-emerald-600">
                                            <span>Khấu trừ (Từ gói cước cũ)</span>
                                            <span className="font-medium">- {formatCurrency(transaction.deductedAmount)}</span>
                                        </div>
                                    )}
                                    <div className="h-px bg-slate-200 w-full my-2"></div>
                                    <div className="flex justify-between items-center text-slate-900 font-bold text-base">
                                        <span>Tổng cộng (Thực trả)</span>
                                        <span className="text-blue-600">{formatCurrency(transaction.finalPaidAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Trạng thái gói cước sau khi mua */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Thông tin gói cước</h3>
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <div className="grid grid-cols-2 gap-px bg-slate-200">
                                        <div className="bg-white p-4">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Gói hiện tại</p>
                                            <p className="text-sm font-bold text-slate-900">{transaction.currentPlanName}</p>
                                        </div>
                                        <div className="bg-white p-4">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Trạng thái</p>
                                            <p className="text-sm font-bold text-emerald-600">{transaction.subscriptionStatus}</p>
                                        </div>
                                        <div className="bg-white p-4 col-span-2">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Chu kỳ sử dụng</p>
                                            <p className="text-sm font-medium text-slate-900">
                                                {formatDateTime(transaction.currentPeriodStart)} <span className="text-slate-400 mx-1">đến</span> {formatDateTime(transaction.currentPeriodEnd)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Mã đối soát */}
                            {transaction.gatewayReferenceCode && (
                                <p className="text-xs text-center text-slate-400 font-mono mt-4">
                                    Mã tham chiếu NH: {transaction.gatewayReferenceCode}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 text-center">
                    <Button onClick={onClose} variant="outline" className="w-full bg-white border-slate-300 text-slate-700 hover:bg-slate-100 font-bold">
                        Đóng Biên Lai
                    </Button>
                </div>
            </div>
        </div>
    );
}