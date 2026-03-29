"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Users,
  HardDrive,
  Calendar,
  Loader2,
  FolderKanban,
  AlertCircle,
  Eye,
  Search,
  Filter,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/Buttons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Cards";
import { Badge } from "@/components/ui/Badges";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/context/AuthContext";
import PricingSection from "@/components/features/landing/PricingSection";

// Import API Payment
import {
  createCheckoutSession,
  getMySubscription,
  getTransactionHistory,
  getTransactionDetail,
  cancelTransaction,
  MySubscriptionResponse,
  CheckoutRequest,
  TransactionListResponse,
  TransactionDetailResponse,
} from "@/services/apiPayment";
import TransactionDetailModal from "@/components/features/company/TransactionDetailModal";

export default function BillingPage() {
  const router = useRouter();
  const searchParamsUrl = useSearchParams();
  const { showToast } = useToast();
  const { activeCompany } = useAuth();

  // States: Upgrade & Quotas
  const [showUpgradeSection, setShowUpgradeSection] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [subscription, setSubscription] =
    useState<MySubscriptionResponse | null>(null);
  const [isLoadingSub, setIsLoadingSub] = useState(true);

  // States: Transaction History (Table)
  const [transactions, setTransactions] = useState<TransactionListResponse[]>(
    [],
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [pagination, setPagination] = useState({
    pageNo: 0,
    pageSize: 10,
    totalPages: 0,
    last: true,
  });

  // Bộ lọc tìm kiếm
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  // States: Detail Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDetailResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // ✅ States: Cancel Transaction Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [transactionToCancel, setTransactionToCancel] = useState<string | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // =======================================================================
  // 1. FETCH DỮ LIỆU
  // =======================================================================
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

  const fetchTransactions = useCallback(
    async (pageIndex: number = 0) => {
      if (!activeCompany?.companyId) return;
      setIsLoadingHistory(true);
      try {
        const params: any = {
          companyId: activeCompany.companyId,
          page: pageIndex,
          size: 10,
          status: filterStatus === "ALL" ? undefined : filterStatus,
        };

        if (dateRange.startDate)
          params.startDate = `${dateRange.startDate}T00:00:00`;
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
    },
    [activeCompany?.companyId, filterStatus, dateRange, showToast],
  );

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  useEffect(() => {
    fetchTransactions(0);
  }, [fetchTransactions]);

  useEffect(() => {
    const status = searchParamsUrl.get("payment_status");
    if (status === "success") {
      showToast("Thanh toán thành công! Gói cước đã được nâng cấp.", "success");
      router.replace("/admin/company/billing");
      fetchSubscriptionData();
      fetchTransactions(0);
    } else if (status === "cancel") {
      showToast("Đã hủy quá trình thanh toán PayOS.", "warning");
      router.replace("/admin/company/billing");
    }
  }, [
    searchParamsUrl,
    router,
    showToast,
    fetchSubscriptionData,
    fetchTransactions,
  ]);

  // =======================================================================
  // 2. HANDLERS
  // =======================================================================
  const handleUpgradeClick = async (
    planId: number,
    cycle: "MONTHLY" | "YEARLY",
  ) => {
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
      if (response.checkoutUrl) window.location.href = response.checkoutUrl;
      else throw new Error("Không nhận được đường dẫn thanh toán.");
    } catch (error: any) {
      showToast(error.message || "Lỗi khi tạo thanh toán.", "error");
      setIsProcessingPayment(false);
    }
  };

  const handleViewDetail = async (transactionCode: string) => {
    if (!activeCompany?.companyId) return;
    setIsModalOpen(true);
    setIsDetailLoading(true);
    try {
      const data = await getTransactionDetail(
        transactionCode,
        activeCompany.companyId,
      );
      setSelectedTransaction(data);
    } catch (error: any) {
      showToast(error.message, "error");
      setIsModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // ✅ Handler: Mở Modal Hủy
  const handleOpenCancelModal = (transactionCode: string) => {
    setTransactionToCancel(transactionCode);
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  // ✅ Handler: Submit Hủy Giao Dịch
  const handleConfirmCancel = async () => {
    if (!activeCompany?.companyId || !transactionToCancel) return;
    setIsCancelling(true);
    try {
      await cancelTransaction(transactionToCancel, {
        companyId: activeCompany.companyId,
        cancellationReason: cancelReason.trim() || "Người dùng chủ động hủy",
      });
      showToast(
        `Đã hủy thành công giao dịch #${transactionToCancel}`,
        "success",
      );
      setIsCancelModalOpen(false);
      fetchTransactions(pagination.pageNo); // Refresh lại bảng ở trang hiện tại
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsCancelling(false);
    }
  };

  // =======================================================================
  // 3. HELPERS UI
  // =======================================================================
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatBytes = (bytes: number) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${["Bytes", "KB", "MB", "GB", "TB"][i]}`;
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> THÀNH CÔNG
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> ĐANG CHỜ
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3 h-3" /> ĐÃ HỦY
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const QuotaProgressBar = ({
    current,
    max,
    formatFn = (v: number) => v,
  }: any) => {
    const isUnlimited = max === -1;
    const percentage = isUnlimited ? 0 : Math.min((current / max) * 100, 100);
    const isNearLimit = !isUnlimited && percentage >= 90;
    return (
      <div className="mt-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-900">
            {formatFn(current)}
          </span>
          <span className="text-sm text-slate-400 font-medium">
            / {isUnlimited ? "∞" : formatFn(max)}
          </span>
        </div>
        {!isUnlimited && (
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${isNearLimit ? "bg-red-500" : "bg-blue-500"}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
        {isNearLimit && !isUnlimited && (
          <p className="text-[10px] text-red-500 mt-2 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Sắp hết dung lượng
          </p>
        )}
        {isUnlimited && (
          <p className="text-xs text-emerald-600 font-medium mt-2">
            Không giới hạn
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-8 relative">
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-slate-900">
            Đang kết nối PayOS...
          </h3>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-6 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Gói cước & Thanh toán
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Quản lý giới hạn tài nguyên và lịch sử giao dịch.
            </p>
          </div>
          <Button
            onClick={() => setShowUpgradeSection(!showUpgradeSection)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-5 rounded-[3px] flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />{" "}
            {showUpgradeSection ? "Đóng Bảng giá" : "Nâng cấp Gói cước"}
          </Button>
        </div>

        {/* PRICING SECTION */}
        {showUpgradeSection && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <PricingSection onRegisterClick={handleUpgradeClick} />
          </div>
        )}

        {/* QUOTA OVERVIEW */}
        {isLoadingSub || !subscription ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-white relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Gói hiện tại
                  </CardTitle>
                  {subscription.subscriptionStatus === "ACTIVE" ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-none">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 shadow-none">
                      Past Due
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-slate-900 mb-1 truncate">
                  {subscription.planName}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Gia hạn:{" "}
                    <strong className="text-slate-700">
                      {formatDate(subscription.currentPeriodEnd)}
                    </strong>
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-0">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" /> Thành viên
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuotaProgressBar
                  current={subscription.currentMembers}
                  max={subscription.maxMembers}
                />
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-0">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <FolderKanban className="w-4 h-4" /> Dự án
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuotaProgressBar
                  current={subscription.currentProjects}
                  max={subscription.maxProjects}
                />
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-0">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-4 h-4" /> Lưu trữ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuotaProgressBar
                  current={subscription.currentStorageBytes}
                  max={subscription.maxStorageBytes}
                  formatFn={(val: number) => formatBytes(val)}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* BẢNG LỊCH SỬ GIAO DỊCH */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-500" /> Lịch sử giao
              dịch
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm text-sm">
                <span className="text-slate-500 mr-2 text-xs font-semibold">
                  Từ
                </span>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="bg-transparent outline-none text-slate-700"
                />
              </div>
              <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm text-sm">
                <span className="text-slate-500 mr-2 text-xs font-semibold">
                  Đến
                </span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="bg-transparent outline-none text-slate-700"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-sm outline-none text-slate-700"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="SUCCESS">Thành công</option>
                <option value="PENDING">Đang chờ</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                  <tr>
                    <th className="px-6 py-3">Mã GD</th>
                    <th className="px-6 py-3">Thời gian</th>
                    <th className="px-6 py-3">Gói đăng ký</th>
                    <th className="px-6 py-3">Số tiền</th>
                    <th className="px-6 py-3">Trạng thái</th>
                    <th className="px-6 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingHistory ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-slate-500"
                      >
                        Không có giao dịch nào được tìm thấy.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr
                        key={tx.transactionCode}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-slate-900 font-mono">
                          #{tx.transactionCode}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {formatDateTime(tx.createdAt)}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {tx.planName}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-4">
                          {renderStatusBadge(tx.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            {/* Nút Xem Biên Lai */}
                            <button
                              onClick={() =>
                                handleViewDetail(tx.transactionCode)
                              }
                              className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Xem Biên Lai"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* ✅ CHỈ HIỆN NÚT HỦY NẾU GIAO DỊCH ĐANG PENDING */}
                            {tx.status === "PENDING" && (
                              <button
                                onClick={() =>
                                  handleOpenCancelModal(tx.transactionCode)
                                }
                                className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Hủy Giao Dịch"
                              >
                                <Ban className="w-4 h-4" />
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

            {/* Phân trang */}
            {transactions.length > 0 && (
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Trang {pagination.pageNo + 1} / {pagination.totalPages || 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.pageNo === 0}
                    onClick={() => fetchTransactions(pagination.pageNo - 1)}
                  >
                    Trang trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.last}
                    onClick={() => fetchTransactions(pagination.pageNo + 1)}
                  >
                    Trang sau
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Biên Lai */}
      <TransactionDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
        loading={isDetailLoading}
      />

      {/* ✅ Modal Xác Nhận Hủy Giao Dịch */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Ban className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Hủy giao dịch #{transactionToCancel}?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Giao dịch này đang chờ thanh toán. Nếu hủy, đường link quét mã QR
              sẽ bị vô hiệu hóa. Hành động này không thể hoàn tác.
            </p>

            <div className="text-left mb-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lý do hủy (Tùy chọn)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="VD: Tôi chọn nhầm gói cước..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
                className="flex-1 bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Quay lại
              </Button>
              <Button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-sm"
              >
                {isCancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Xác nhận Hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
