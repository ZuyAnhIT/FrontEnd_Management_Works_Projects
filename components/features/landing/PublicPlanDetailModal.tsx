// components/features/landing/PublicPlanDetailModal.tsx
"use client";

import {
  X,
  CheckCircle2,
  Infinity,
  Zap,
  Loader2,
  Users,
  LayoutGrid,
  FolderKanban,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/Buttons";
import { PublicPlan } from "@/services/apiPlanPublic";

interface PublicPlanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PublicPlan | null;
  loading: boolean;
  onSubscribe: (planId: number, cycle: "MONTHLY" | "YEARLY") => void;
}

export default function PublicPlanDetailModal({
  isOpen,
  onClose,
  plan,
  loading,
  onSubscribe,
}: PublicPlanDetailModalProps) {
  if (!isOpen) return null;

  // --- Helpers ---
  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const renderLimit = (value: number, unit: string = "") => {
    if (value === -1) {
      return (
        <span className="flex items-center justify-center text-blue-600 gap-1 font-bold">
          <Infinity className="w-5 h-5" />
        </span>
      );
    }
    return (
      <span className="font-bold">
        {value.toLocaleString()} {unit}
      </span>
    );
  };

  // Component hiển thị từng khối tài nguyên
  const LimitBox = ({ label, value, unit = "", icon: Icon }: any) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center flex flex-col items-center justify-center gap-2">
      <Icon className="w-5 h-5 text-slate-400" />
      <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
        {label}
      </p>
      <div className="text-lg text-slate-900 dark:text-white">
        {renderLimit(value, unit)}
      </div>
    </div>
  );

  let featuresList: string[] = [];
  if (plan && Array.isArray(plan.features)) {
    featuresList = plan.features;
  } else if (plan && plan.features && typeof plan.features === "object") {
    featuresList = Object.entries(plan.features as any)
      .filter(([_, value]) => value === true)
      .map(([key, _]) =>
        key
          .split("_")
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {loading || !plan ? (
          <div className="flex flex-col justify-center items-center py-32 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-slate-500 dark:text-slate-400">
              Đang tải thông tin gói cước...
            </p>
          </div>
        ) : (
          <div className="flex flex-col max-h-[90vh]">
            {/* --- Banner & Pricing --- */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white text-center shrink-0 relative overflow-hidden">
              {/* Icon nền trang trí */}
              <Zap className="absolute -right-6 -bottom-6 w-40 h-40 text-white opacity-10 rotate-12" />

              <div className="relative z-10">
                <span className="bg-white/20 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md mb-4 inline-block border border-white/30">
                  {plan.planCode}
                </span>
                <h2 className="text-3xl font-extrabold mb-2">{plan.name}</h2>
                {plan.description && (
                  <p className="text-blue-100 text-sm max-w-md mx-auto">
                    {plan.description}
                  </p>
                )}

                <div className="mt-6 flex flex-col items-center justify-center">
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-5xl font-black">
                      {formatCurrency(plan.monthlyPrice)}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-blue-200 font-medium mb-1">
                        / tháng
                      </span>
                    )}
                  </div>

                  {/* Hiển thị giá năm nếu có cấu hình */}
                  {plan.yearlyPrice > 0 && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-black/20 px-4 py-1.5 rounded-full text-sm font-medium">
                      <span className="text-blue-200">Thanh toán năm:</span>
                      <span className="text-white font-bold">
                        {formatCurrency(plan.yearlyPrice)} / năm
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- Content Scrollable (Sử dụng toàn bộ Quotas) --- */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar bg-slate-50 dark:bg-slate-800/50">
              {/* Lưới hiển thị 4 chỉ số tài nguyên quan trọng */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <LimitBox
                  label="Thành viên"
                  value={plan.maxUsers}
                  icon={Users}
                />
                <LimitBox
                  label="Workspace"
                  value={plan.maxWorkspaces}
                  icon={LayoutGrid}
                />
                <LimitBox
                  label="Dự án"
                  value={plan.maxProjects}
                  icon={FolderKanban}
                />
                <LimitBox
                  label="Lưu trữ"
                  value={plan.maxStorageGb}
                  unit="GB"
                  icon={HardDrive}
                />
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tính năng
                gói cước
              </h3>

              <ul className="space-y-4 grid sm:grid-cols-2 gap-x-4 gap-y-1">
                {featuresList.length > 0 ? (
                  featuresList.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{feat}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 italic text-sm col-span-2">
                    Không có tính năng đặc thù nào được thiết lập.
                  </li>
                )}
              </ul>
            </div>

            {/* --- Footer Action (Nâng cấp chọn Tháng/Năm) --- */}
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
              {plan.monthlyPrice === 0 ? (
                <Button
                  onClick={() => onSubscribe(plan.id, "MONTHLY")}
                  disabled={loading}
                  className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Bắt đầu miễn phí ngay"
                  )}
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => onSubscribe(plan.id, "MONTHLY")}
                    disabled={loading}
                    variant="outline"
                    className="flex-1 h-12 text-base font-bold border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Đăng ký theo Tháng"
                    )}
                  </Button>

                  {plan.yearlyPrice > 0 && (
                    <Button
                      onClick={() => onSubscribe(plan.id, "YEARLY")}
                      disabled={loading}
                      className="flex-1 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 relative overflow-hidden"
                    >
                      {/* Badge giảm giá cho gói năm */}
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] px-2 py-0.5 font-black uppercase transform translate-x-2 -translate-y-1 rotate-12">
                        Tiết kiệm
                      </div>
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Đăng ký theo Năm"
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
