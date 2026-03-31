"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Services)
// =============================================================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard, CheckCircle2, XCircle, Clock, Zap, Users,
  HardDrive, Calendar, Loader2, FolderKanban, AlertCircle,
  Eye, Search, Filter, Ban, ArrowUpRight, ChevronLeft, ChevronRight
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/Buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Cards";
import { Badge } from "@/components/ui/Badges";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/context/AuthContext";

// Features Components
import PricingSection from "@/components/features/landing/PricingSection";
import TransactionDetailModal from "@/components/features/company/TransactionDetailModal";

// Services & Types
import {
  createCheckoutSession, getMySubscription, getTransactionHistory,
  getTransactionDetail, cancelTransaction, MySubscriptionResponse,
  TransactionListResponse, TransactionDetailResponse
} from "@/services/apiPayment";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function BillingPage() {
  
  // ---------------------------------------------------------------------------
  // 3. HOOKS & CONTEXT
  // ---------------------------------------------------------------------------
  
  const router = useRouter();
  const searchParamsUrl = useSearchParams();
  const { showToast } = useToast();
  const { activeCompany } = useAuth();

  // ---------------------------------------------------------------------------
  // 4. STATE MANAGEMENT
  // ---------------------------------------------------------------------------

  // Subscription & Quotas State
  const [subscription, setSubscription] = useState<MySubscriptionResponse | null>(null);
  const [isLoadingSub, setIsLoadingSub] = useState(true);
  const [showUpgradeSection, setShowUpgradeSection] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Transaction History State
  const [transactions, setTransactions] = useState<TransactionListResponse[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [pagination, setPagination] = useState({
    pageNo: 0,
    pageSize: 10,
    totalPages: 0,
    last: true,
  });

  // Filters State
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  // Modal Detail State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetailResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Modal Cancel State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [transactionToCancel, setTransactionToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // ---------------------------------------------------------------------------
  // 5. DATA FETCHING (Handlers)
  // ---------------------------------------------------------------------------

  /**
   * Tai thong tin goi cuoc va gioi han tai nguyen hien tai
   */
  const fetchSubscriptionData = useCallback(async () => {
    if (!activeCompany?.companyId) return;
    setIsLoadingSub(true);
    try {
      const data = await getMySubscription(activeCompany.companyId);
      setSubscription(data);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsLoadingSub(false);
    }
  }, [activeCompany?.companyId, showToast]);

  /**
   * Tai lich su giao dich co kem bo loc va phan trang
   */
  const fetchTransactions = useCallback(async (pageIndex: number = 0) => {
    if (!activeCompany?.companyId) return;
    setIsLoadingHistory(true);
    try {
      const params: any = {
        companyId: activeCompany.companyId,
        page: pageIndex,
        size: 10,
        status: filterStatus === "ALL" ? undefined : filterStatus,
      };

      if (dateRange.startDate) params.startDate = `${dateRange.startDate}T00:00:00`;
      if (dateRange.endDate) params.endDate = `${dateRange.endDate}T23:59:59`;

      const data = await getTransactionHistory(params);
      setTransactions(data.content || []);
      setPagination({
        pageNo: data.pageNo ?? (data as any).pageNumber ?? 0,
        pageSize: data.pageSize ?? 10,
        totalPages: data.totalPages ?? 0,
        last: data.last ?? true,
      });
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsLoadingHistory(false);
    }
  }, [activeCompany?.companyId, filterStatus, dateRange, showToast]);

  // ---------------------------------------------------------------------------
  // 6. SIDE EFFECTS
  // ---------------------------------------------------------------------------

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  useEffect(() => {
    fetchTransactions(0);
  }, [fetchTransactions]);

  /**
   * Xu ly trang thai tra ve tu cong thanh toan PayOS
   */
  useEffect(() => {
    const status = searchParamsUrl.get("payment_status");
    if (status === "success") {
      showToast("Payment successful! Your plan has been upgraded.", "success");
      router.replace("/admin/company/billing");
      fetchSubscriptionData();
      fetchTransactions(0);
    } else if (status === "cancel") {
      showToast("Payment process cancelled.", "warning");
      router.replace("/admin/company/billing");
    }
  }, [searchParamsUrl, router, showToast, fetchSubscriptionData, fetchTransactions]);

  // ---------------------------------------------------------------------------
  // 7. EVENT HANDLERS
  // ---------------------------------------------------------------------------

  const handleInitiatePayment = async (planId: number, cycle: "MONTHLY" | "YEARLY") => {
    if (!activeCompany?.companyId) return;
    setIsProcessingPayment(true);
    try {
      const baseUrl = window.location.origin;
      const response = await createCheckoutSession({
        companyId: activeCompany.companyId,
        planId,
        billingCycle: cycle,
        returnUrl: `${baseUrl}/admin/company/billing?payment_status=success`,
        cancelUrl: `${baseUrl}/admin/company/billing?payment_status=cancel`,
      });
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error("Could not retrieve checkout URL.");
      }
    } catch (error: any) {
      showToast(error.message || "Failed to initiate payment.", "error");
      setIsProcessingPayment(false);
    }
  };

  const handleOpenTransactionDetail = async (transactionCode: string) => {
    if (!activeCompany?.companyId) return;
    setIsModalOpen(true);
    setIsDetailLoading(true);
    try {
      const data = await getTransactionDetail(transactionCode, activeCompany.companyId);
      setSelectedTransaction(data);
    } catch (error: any) {
      showToast(error.message, "error");
      setIsModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleConfirmCancelTransaction = async () => {
    if (!activeCompany?.companyId || !transactionToCancel) return;
    setIsCancelling(true);
    try {
      await cancelTransaction(transactionToCancel, {
        companyId: activeCompany.companyId,
        cancellationReason: cancelReason.trim() || "User manually cancelled",
      });
      showToast(`Transaction #${transactionToCancel} cancelled successfully.`, "success");
      setIsCancelModalOpen(false);
      fetchTransactions(pagination.pageNo);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsCancelling(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 8. UI HELPERS
  // ---------------------------------------------------------------------------

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  /**
   * Định dạng ngày (Chỉ hiển thị Ngày Tháng Năm)
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /**
   * Định dạng ngày giờ (Hiển thị đầy đủ Giờ:Phút Ngày Tháng Năm)
   */
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-US", {
      hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short", year: "numeric",
    });
  };

  const formatBytes = (bytes: number) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const renderStatusBadge = (status: string) => {
    const config: any = {
      SUCCESS: { class: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2, label: "SUCCESS" },
      PENDING: { class: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock, label: "PENDING" },
      CANCELLED: { class: "bg-slate-100 text-slate-600 border-slate-200", icon: XCircle, label: "CANCELLED" },
    };
    const current = config[status] || { class: "bg-slate-100", icon: AlertCircle, label: status };
    const Icon = current.icon;

    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm", current.class)}>
        <Icon className="w-3 h-3" /> {current.label}
      </span>
    );
  };

  const QuotaProgressBar = ({ current, max, formatFn = (v: number) => v }: any) => {
    const isUnlimited = max === -1;
    const percentage = isUnlimited ? 0 : Math.min((current / max) * 100, 100);
    const isNearLimit = !isUnlimited && percentage >= 90;

    return (
      <div className="mt-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-[#172B4D] tracking-tight">{formatFn(current)}</span>
          <span className="text-sm text-slate-400 font-bold uppercase tracking-tighter">
            / {isUnlimited ? "∞" : formatFn(max)}
          </span>
        </div>
        {!isUnlimited ? (
          <>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4 overflow-hidden shadow-inner">
              <div
                className={cn("h-full rounded-full transition-all duration-1000 ease-out", isNearLimit ? "bg-[#FF5630]" : "bg-[#0052CC]")}
                style={{ width: `${percentage}%` }}
              />
            </div>
            {isNearLimit && (
              <p className="text-[10px] text-[#FF5630] mt-2 font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" /> Near capacity
              </p>
            )}
          </>
        ) : (
          <p className="text-[11px] text-[#36B37E] font-black uppercase tracking-widest mt-3">Unlimited access</p>
        )}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // 9. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-slate-950 py-10 relative">
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-[#091E42]/40 backdrop-blur-sm z-[60] flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
            <Loader2 className="w-12 h-12 text-[#0052CC] animate-spin" />
            <h3 className="text-lg font-black text-[#172B4D] uppercase tracking-tight">Connecting to PayOS...</h3>
            <p className="text-sm text-slate-500 font-medium">Please do not close your browser.</p>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-6 space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase">Plans & Billing</h1>
            <p className="text-[14px] text-[#42526E] font-medium mt-1">Manage your subscriptions, resource quotas, and transaction history.</p>
          </div>
          <Button
            onClick={() => setShowUpgradeSection(!showUpgradeSection)}
            className={cn(
              "h-11 px-6 rounded-lg font-black text-[12px] uppercase tracking-[0.15em] transition-all shadow-md active:scale-95",
              showUpgradeSection ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50" : "bg-[#0052CC] hover:bg-[#0747A6] text-white"
            )}
          >
            {showUpgradeSection ? <XCircle className="w-4 h-4 mr-2" /> : <Zap className="w-4 h-4 mr-2 stroke-[3]" />}
            {showUpgradeSection ? "Close Pricing" : "Upgrade Plan"}
          </Button>
        </div>

        {showUpgradeSection && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100 mb-10 animate-in fade-in slide-in-from-top-6 duration-500">
            <PricingSection onRegisterClick={handleInitiatePayment} />
          </div>
        )}

        {isLoadingSub || !subscription ? (
          <div className="flex flex-col justify-center items-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#0052CC] opacity-60" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Fetching metrics...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-700">
            <Card className="border-none shadow-md bg-gradient-to-br from-[#0052CC] to-[#0747A6] text-white overflow-hidden relative group">
              <Zap className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12 transition-transform group-hover:scale-110" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Current Plan</CardTitle>
                  <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-2 shadow-sm border-none", subscription.subscriptionStatus === "ACTIVE" ? "bg-[#36B37E] text-white" : "bg-[#FFAB00] text-white")}>
                    {subscription.subscriptionStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-black tracking-tight mb-6">{subscription.planName}</div>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-blue-100/70 pt-4 border-t border-white/10">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Renews on: <span className="text-white">{formatDate(subscription.currentPeriodEnd)}</span></span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white dark:bg-slate-900 transition-all hover:shadow-md">
              <CardHeader className="pb-0">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Users className="w-4 h-4 opacity-60" /> Member Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuotaProgressBar current={subscription.currentMembers} max={subscription.maxMembers} />
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white dark:bg-slate-900 transition-all hover:shadow-md">
              <CardHeader className="pb-0">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 opacity-60" /> Active Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuotaProgressBar current={subscription.currentProjects} max={subscription.maxProjects} />
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white dark:bg-slate-900 transition-all hover:shadow-md">
              <CardHeader className="pb-0">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <HardDrive className="w-4 h-4 opacity-60" /> Cloud Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuotaProgressBar current={subscription.currentStorageBytes} max={subscription.maxStorageBytes} formatFn={formatBytes} />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <h2 className="text-[16px] font-black text-[#172B4D] uppercase tracking-widest flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-400 stroke-[2.5]" /> Transaction Ledger
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 h-10 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-transparent outline-none text-[12px] font-bold uppercase tracking-tighter text-[#42526E] w-28 cursor-pointer"
                  title="From Date"
                />
                <span className="text-slate-300 mx-1">—</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="bg-transparent outline-none text-[12px] font-bold uppercase tracking-tighter text-[#42526E] w-28 cursor-pointer"
                  title="To Date"
                />
              </div>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-10 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-[12px] font-black uppercase tracking-wider shadow-sm outline-none appearance-none hover:bg-slate-50 transition-colors"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUCCESS">Success</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-1000">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F4F5F7] border-b border-slate-200">
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B778C]">
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Subscription</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {isLoadingHistory ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0052CC] opacity-60" />
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20">
                        <div className="flex flex-col items-center gap-2 opacity-40">
                          <CreditCard className="w-12 h-12 stroke-[1.5]" />
                          <p className="text-[13px] font-bold">No transaction records found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.transactionCode} className="group hover:bg-[#F4F5F7]/30 transition-colors">
                        <td className="px-6 py-5 font-black text-[#172B4D] font-mono text-[13px]">
                          #{tx.transactionCode}
                        </td>
                        <td className="px-6 py-5 text-[12px] font-bold text-[#6B778C]">
                          {formatDateTime(tx.createdAt)}
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[13px] font-black text-[#172B4D] tracking-tight">{tx.planName}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[14px] font-black text-[#0052CC] tracking-tighter">
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {renderStatusBadge(tx.status)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button
                              onClick={() => handleOpenTransactionDetail(tx.transactionCode)}
                              className="p-2 text-slate-400 hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition-all active:scale-90"
                              title="View Invoice"
                            >
                              <Eye className="w-4.5 h-4.5 stroke-[2.5]" />
                            </button>

                            {tx.status === "PENDING" && (
                              <button
                                onClick={() => {
                                  setTransactionToCancel(tx.transactionCode);
                                  setIsCancelModalOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-[#FF5630] hover:bg-red-50 rounded-lg transition-all active:scale-90"
                                title="Void Transaction"
                              >
                                <Ban className="w-4.5 h-4.5 stroke-[2.5]" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {transactions.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Page {pagination.pageNo + 1} / {pagination.totalPages || 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.pageNo === 0}
                    onClick={() => fetchTransactions(pagination.pageNo - 1)}
                    className="h-8 px-3 rounded-lg border-slate-200 text-[#42526E] font-bold text-[11px] uppercase tracking-widest bg-white active:scale-95"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.last}
                    onClick={() => fetchTransactions(pagination.pageNo + 1)}
                    className="h-8 px-3 rounded-lg border-slate-200 text-[#42526E] font-bold text-[11px] uppercase tracking-widest bg-white active:scale-95"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <TransactionDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
        loading={isDetailLoading}
      />

      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 border border-red-100 mb-6">
              <Ban className="h-6 w-6 text-[#FF5630]" />
            </div>
            <h3 className="text-xl font-black text-[#172B4D] tracking-tight uppercase mb-2">
              Void Transaction #{transactionToCancel}?
            </h3>
            <p className="text-[14px] text-[#42526E] font-medium leading-relaxed mb-8">
              This action will invalidate the QR code for this transaction. 
              This process cannot be undone.
            </p>

            <div className="text-left mb-8">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                Reason for cancellation (Optional)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Selected wrong plan..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-red-100 focus:border-[#FF5630] transition-all"
              />
            </div>

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
                className="flex-1 h-12 rounded-xl text-[12px] font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50 active:scale-95"
              >
                Go Back
              </Button>
              <Button
                onClick={handleConfirmCancelTransaction}
                disabled={isCancelling}
                className="flex-1 h-12 rounded-xl text-[12px] font-black uppercase tracking-widest bg-[#FF5630] hover:bg-[#DE350B] text-white shadow-md active:scale-95"
              >
                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirm Void
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B3BAC5; }
      `}</style>
    </div>
  );
}