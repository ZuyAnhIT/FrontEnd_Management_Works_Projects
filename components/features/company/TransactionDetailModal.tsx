"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React from "react";
import { 
  X, 
  Loader2, 
  Receipt, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  ArrowRight 
} from "lucide-react";

// Internal Components & Services
import { Button } from "@/components/ui/Buttons";
import { TransactionDetailResponse } from "@/services/apiPayment";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionDetailResponse | null;
  loading: boolean;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần hiển thị chi tiết biên lai giao dịch (Receipt).
 * Cung cấp cái nhìn minh bạch về số tiền thanh toán, các khoản khấu trừ proration 
 * và trạng thái chu kỳ gói cước.
 */
export default function TransactionDetailModal({ 
  isOpen, 
  onClose, 
  transaction, 
  loading 
}: TransactionDetailModalProps) {
  
  // ---------------------------------------------------------------------------
  // 4. RENDER HELPERS
  // ---------------------------------------------------------------------------

  /**
   * Định dạng tiền tệ theo chuẩn VND (Hỗ trợ định hướng i18n)
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount).replace('₫', 'VND');
  };

  /**
   * Định dạng thời gian sang chuẩn EN-US chuyên nghiệp
   */
  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit", 
      day: "2-digit", 
      month: "short", 
      year: "numeric" 
    });
  };

  /**
   * Cấu hình nhãn trạng thái giao dịch
   */
  const renderStatusBadge = (status: string) => {
    const config = {
      SUCCESS: {
        label: "Success",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        styles: "bg-emerald-50 text-emerald-700 border-emerald-200"
      },
      PENDING: {
        label: "Pending",
        icon: <Clock className="w-3.5 h-3.5" />,
        styles: "bg-amber-50 text-amber-700 border-amber-200"
      },
      CANCELLED: {
        label: "Cancelled",
        icon: <XCircle className="w-3.5 h-3.5" />,
        styles: "bg-red-50 text-red-700 border-red-200"
      }
    };

    const current = config[status as keyof typeof config] || {
      label: status,
      icon: null,
      styles: "bg-slate-100 text-slate-700 border-slate-200"
    };

    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm",
        current.styles
      )}>
        {current.icon}
        {current.label}
      </span>
    );
  };

  // ---------------------------------------------------------------------------
  // 5. MAIN RENDER
  // ---------------------------------------------------------------------------

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Transaction Receipt</h2>
              <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5 uppercase tracking-widest">
                Ref: {transaction?.transactionCode || "Loading..."}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all active:scale-95"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          {loading || !transaction ? (
            <div className="flex flex-col justify-center items-center py-24 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 opacity-80" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Synchronizing bill details...</span>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* PHẦN 1: TỔNG QUAN GIÁ TRỊ (OVERVIEW) */}
              <div className="flex flex-col items-center justify-center text-center pb-8 border-b border-dashed border-slate-200">
                <div className="mb-4">{renderStatusBadge(transaction.status)}</div>
                <div className="text-4xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(transaction.finalPaidAmount)}
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-2">
                  Paid via {transaction.paymentMethod}
                </div>
                {transaction.paidAt && (
                  <div className="text-[11px] font-medium text-slate-400 mt-1">
                    Completed on {formatDateTime(transaction.paidAt)}
                  </div>
                )}
              </div>

              {/* PHẦN 2: CHI TIẾT TÍNH TOÁN (BILLING BREAKDOWN) */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Payment Breakdown</h3>
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4 shadow-inner">
                  <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                    <span>Base Price ({transaction.currentPlanName})</span>
                    <span className="text-slate-900">{formatCurrency(transaction.originalPrice)}</span>
                  </div>
                  
                  {transaction.deductedAmount > 0 && (
                    <div className="flex justify-between items-center text-sm font-semibold text-emerald-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                      <span className="flex items-center gap-1.5">
                        Prorated Discount (Legacy Plan)
                      </span>
                      <span>-{formatCurrency(transaction.deductedAmount)}</span>
                    </div>
                  )}

                  <div className="h-px bg-slate-200 w-full" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Grand Total</span>
                    <span className="text-xl font-black text-blue-600">
                      {formatCurrency(transaction.finalPaidAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* PHẦN 3: THÔNG TIN GÓI CƯỚC (SUBSCRIPTION CONTEXT) */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Subscription Context</h3>
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="grid grid-cols-2 gap-px bg-slate-100">
                    <div className="bg-white p-5">
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Active Plan
                      </p>
                      <p className="text-sm font-bold text-slate-800">{transaction.currentPlanName}</p>
                    </div>
                    <div className="bg-white p-5 border-l border-slate-50">
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" /> Status
                      </p>
                      <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide">
                        {transaction.subscriptionStatus}
                      </p>
                    </div>
                    <div className="bg-white p-5 col-span-2 border-t border-slate-50">
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-2 flex items-center gap-1.5">
                        <ArrowRight className="w-3 h-3" /> Billing Cycle Period
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {formatDateTime(transaction.currentPeriodStart)} 
                        <span className="text-slate-300 mx-2 font-normal">→</span> 
                        {formatDateTime(transaction.currentPeriodEnd)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* PHẦN CUỐI: THÔNG TIN ĐỐI SOÁT (SYSTEM TRACE) */}
              {transaction.gatewayReferenceCode && (
                <div className="pt-2 text-center">
                  <span className="inline-block px-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-[9px] font-mono text-slate-400">
                    GATEWAY REF: {transaction.gatewayReferenceCode}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER ACTION */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 shrink-0">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="w-full h-11 bg-white border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-xs hover:bg-slate-100 hover:border-slate-300 transition-all"
          >
            Close Receipt
          </Button>
        </div>

      </div>
    </div>
  );
}