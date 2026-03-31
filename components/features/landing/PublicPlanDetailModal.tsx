"use client";

// =============================================================================
// 1. IMPORTS
// =============================================================================

import React, { useMemo } from "react";
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

// Internal Components & Utils
import { Button } from "@/components/ui/Buttons";
import { PublicPlan } from "@/services/apiPlanPublic";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface PublicPlanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PublicPlan | null;
  loading: boolean;
  onSubscribe: (planId: number, cycle: "MONTHLY" | "YEARLY") => void;
}

interface LimitBoxProps {
  label: string;
  value: number;
  unit?: string;
  icon: React.ElementType;
}

// =============================================================================
// 3. HELPERS
// =============================================================================

/**
 * Định dạng hiển thị tiền tệ
 */
const formatCurrency = (amount: number) => {
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Render giá trị giới hạn tài nguyên (Hỗ trợ vô hạn -1)
 */
const renderLimitValue = (value: number, unit: string = "") => {
  if (value === -1) {
    return (
      <span className="flex items-center justify-center text-[#0052CC] gap-1">
        <Infinity className="w-5 h-5 stroke-[3]" />
      </span>
    );
  }
  return (
    <span className="font-black">
      {value.toLocaleString()} {unit}
    </span>
  );
};

/**
 * Khối hiển thị chỉ số tài nguyên (Quota Box)
 */
const LimitBox = ({ label, value, unit = "", icon: Icon }: LimitBoxProps) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md">
    <Icon className="w-5 h-5 text-slate-400" />
    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.1em]">
      {label}
    </p>
    <div className="text-lg text-[#172B4D] dark:text-white leading-tight">
      {renderLimitValue(value, unit)}
    </div>
  </div>
);

// =============================================================================
// 4. MAIN COMPONENT
// =============================================================================

export default function PublicPlanDetailModal({
  isOpen,
  onClose,
  plan,
  loading,
  onSubscribe,
}: PublicPlanDetailModalProps) {
  
  // ---------------------------------------------------------------------------
  // 5. CALCULATIONS
  // ---------------------------------------------------------------------------

  // Chuẩn hóa danh sách tính năng từ Object hoặc Array
  const featuresList = useMemo(() => {
    if (!plan) return [];
    if (Array.isArray(plan.features)) return plan.features;
    if (typeof plan.features === "object" && plan.features !== null) {
      return Object.entries(plan.features as Record<string, boolean>)
        .filter(([_, value]) => value === true)
        .map(([key]) =>
          key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        );
    }
    return [];
  }, [plan]);

  if (!isOpen) return null;

  // ---------------------------------------------------------------------------
  // 6. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative border border-slate-200 dark:border-slate-800">
        
        {/* Nút đóng Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full text-white transition-all z-20 active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {loading || !plan ? (
          /* TRẠNG THÁI ĐANG TẢI (Loading State) */
          <div className="flex flex-col justify-center items-center py-32 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#0052CC]" />
            <p className="text-[12px] font-black uppercase tracking-widest text-slate-500">
              Fetching plan details...
            </p>
          </div>
        ) : (
          <div className="flex flex-col max-h-[90vh]">
            
            {/* --- PHẦN 1: BANNER & PRICING --- */}
            <div className="bg-gradient-to-br from-[#0052CC] to-[#0747A6] p-10 text-white text-center shrink-0 relative overflow-hidden">
              {/* Hiệu ứng nền Zap */}
              <Zap className="absolute -right-10 -bottom-10 w-48 h-48 text-white opacity-10 rotate-12 pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <span className="bg-white/20 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md inline-block border border-white/30 shadow-sm">
                  {plan.planCode}
                </span>
                
                <h2 className="text-4xl font-black tracking-tighter">{plan.name}</h2>
                
                {plan.description && (
                  <p className="text-blue-100/80 text-[14px] font-medium max-w-md mx-auto leading-relaxed">
                    {plan.description}
                  </p>
                )}

                <div className="mt-8 flex flex-col items-center">
                  <div className="flex items-end gap-1.5">
                    <span className="text-5xl font-black tracking-tighter">
                      {formatCurrency(plan.monthlyPrice)}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2">
                        / mo
                      </span>
                    )}
                  </div>

                  {/* Giá trị theo năm (Yearly Saver) */}
                  {plan.yearlyPrice > 0 && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg text-[12px] font-bold border border-white/10 backdrop-blur-sm">
                      <span className="text-blue-200 uppercase tracking-wider">Yearly billing:</span>
                      <span className="text-white">
                        {formatCurrency(plan.yearlyPrice)} / year
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- PHẦN 2: THÔNG SỐ TÀI NGUYÊN (Quotas) --- */}
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-slate-50 dark:bg-slate-900">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <LimitBox label="Members" value={plan.maxUsers} icon={Users} />
                <LimitBox label="Workspaces" value={plan.maxWorkspaces} icon={LayoutGrid} />
                <LimitBox label="Projects" value={plan.maxProjects} icon={FolderKanban} />
                <LimitBox label="Storage" value={plan.maxStorageGb} unit="GB" icon={HardDrive} />
              </div>

              {/* Danh sách tính năng chi tiết */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-[#172B4D] dark:text-white uppercase tracking-[0.2em] flex items-center gap-2.5">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  Included Features
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </h3>

                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4 px-2">
                  {featuresList.length > 0 ? (
                    featuresList.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 group">
                        <CheckCircle2 className="w-5 h-5 text-[#36B37E] shrink-0 mt-0.5 transition-transform group-hover:scale-110" />
                        <span className="text-[14px] font-semibold text-[#42526E] dark:text-slate-300 leading-snug">
                          {feat}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400 italic text-[13px] col-span-2 text-center py-4">
                      No specific features defined for this plan.
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* --- PHẦN 3: ACTIONS (Footer) --- */}
            <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              {plan.monthlyPrice === 0 ? (
                <Button
                  onClick={() => onSubscribe(plan.id, "MONTHLY")}
                  disabled={loading}
                  className="w-full h-14 text-base font-black uppercase tracking-[0.2em] bg-[#0052CC] hover:bg-[#0747A6] text-white shadow-lg active:scale-[0.98] transition-all"
                >
                  Start For Free
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => onSubscribe(plan.id, "MONTHLY")}
                    disabled={loading}
                    variant="outline"
                    className="flex-1 h-14 text-[12px] font-black uppercase tracking-widest border-[#0052CC] text-[#0052CC] hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-[0.98] transition-all"
                  >
                    Monthly Billing
                  </Button>

                  {plan.yearlyPrice > 0 && (
                    <Button
                      onClick={() => onSubscribe(plan.id, "YEARLY")}
                      disabled={loading}
                      className="flex-1 h-14 text-[12px] font-black uppercase tracking-widest bg-[#0052CC] hover:bg-[#0747A6] text-white shadow-lg relative overflow-hidden active:scale-[0.98] transition-all"
                    >
                      {/* Badge khuyến mãi cho gói năm */}
                      <div className="absolute top-0 right-0 bg-[#FF5630] text-white text-[8px] px-3 py-1 font-black uppercase transform translate-x-3 translate-y-1 rotate-12 shadow-sm">
                        Save More
                      </div>
                      Yearly Billing
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B3BAC5; }
      `}</style>
    </div>
  );
}