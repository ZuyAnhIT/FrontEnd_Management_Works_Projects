"use client";

// =============================================================================
// 1. IMPORTS
// =============================================================================

import React, { useEffect, useState } from "react";
import { Check, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// Utils
import { cn } from "@/lib/utils";

// API & Components
import { 
    getPublicPlans, 
    searchPublicPlans, 
    getPublicPlanDetail, 
    PublicPlan 
} from "@/services/apiPlanPublic";
import PublicPlanDetailModal from "./PublicPlanDetailModal";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface PricingSectionProps {
    onRegisterClick: (planId: number, cycle: "MONTHLY" | "YEARLY") => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần hiển thị Bảng giá (Pricing Section) cho Landing Page.
 * Hỗ trợ tìm kiếm, xem chi tiết và đăng ký gói cước.
 */
export default function PricingSection({ onRegisterClick }: PricingSectionProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const { t } = useTranslation();

    // Dữ liệu danh sách
    const [plans, setPlans] = useState<PublicPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Dữ liệu Modal chi tiết
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PublicPlan | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // ---------------------------------------------------------------------------
    // 5. EFFECTS
    // ---------------------------------------------------------------------------

    // Tải dữ liệu bảng giá với cơ chế Debounce khi tìm kiếm
    useEffect(() => {
        const fetchPlans = async () => {
            setIsLoading(true);
            try {
                let data;
                if (searchTerm.trim()) {
                    data = await searchPublicPlans(searchTerm, { size: 10, sortBy: "sortOrder", sortDir: "asc" });
                } else {
                    data = await getPublicPlans({ size: 10, sortBy: "sortOrder", sortDir: "asc" });
                }
                setPlans(data.content || []);
            } catch (error) {
                console.error("Failed to load pricing plans:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchPlans();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // ---------------------------------------------------------------------------
    // 6. HANDLERS
    // ---------------------------------------------------------------------------

    /**
     * Xử lý mở Modal xem chi tiết một gói cước
     */
    const handleViewDetail = async (planId: number) => {
        setIsDetailOpen(true);
        setIsDetailLoading(true);
        try {
            const detail = await getPublicPlanDetail(planId);
            setSelectedPlan(detail);
        } catch (error) {
            console.error("Failed to load plan details:", error);
            setIsDetailOpen(false);
        } finally {
            setIsDetailLoading(false);
        }
    };

    /**
     * Xử lý hành động đăng ký gói cước
     */
    const handleSubscribe = (planId: number, cycle: "MONTHLY" | "YEARLY" = "MONTHLY") => {
        setIsDetailOpen(false);
        onRegisterClick(planId, cycle); 
    };

    /**
     * Định dạng tiền tệ hiển thị
     */
    const formatCurrency = (amount: number) => {
        if (amount === 0) return t("pricing.free", "Free");
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // ---------------------------------------------------------------------------
    // 7. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <motion.section
            id="pricing"
            className="py-24 text-center scroll-mt-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300 relative"
            initial={{ opacity: 0, y: 50 }} 
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }} 
            viewport={{ once: true, amount: 0.2 }}
        >
            <h2 className="text-[28px] md:text-[32px] font-black text-[#172B4D] dark:text-white mb-4 tracking-tight">
                {t("pricing.heading", "Simple, transparent pricing")}
            </h2>
            <p className="text-[16px] text-[#42526E] dark:text-slate-400 mb-10 max-w-2xl mx-auto font-medium">
                {t("pricing.subheading", "No surprise fees. Choose the plan that fits your team's needs.")}
            </p>

            {/* Thanh tìm kiếm (Search Bar) */}
            <div className="max-w-md mx-auto mb-14 px-6">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0052CC] transition-colors" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t("pricing.searchPlaceholder", "Search plans (e.g., Pro, Enterprise)...")}
                        className={cn(
                            "w-full pl-12 pr-4 py-3.5 rounded-full text-[14px] font-medium transition-all shadow-sm",
                            "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                            "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2684FF] dark:text-white"
                        )}
                    />
                </div>
            </div>

            {/* Danh sách Gói cước (Pricing Cards) */}
            <div className="max-w-6xl mx-auto px-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-[#0052CC] opacity-80" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Loading plans...</span>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="py-20 text-[14px] font-medium text-slate-500">
                        {t("pricing.noPlansFound", "No matching plans found.")}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8 items-stretch">
                        {plans.map((plan, i) => {
                            // Xác định gói phổ biến để nổi bật giao diện
                            const isPopular = plan.planCode === "PRO" || plan.planCode === "BUSINESS";

                            // Chuẩn hóa mảng tính năng (Features List)
                            let featuresList: string[] = [];
                            if (Array.isArray(plan.features)) {
                                featuresList = plan.features;
                            } else if (plan.features && typeof plan.features === 'object') {
                                featuresList = Object.entries(plan.features)
                                    .filter(([_, value]) => value === true)
                                    .map(([key, _]) => key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
                            }

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }} 
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }} 
                                    viewport={{ once: true, amount: 0.5 }}
                                    className={cn(
                                        "relative p-8 rounded-2xl border flex flex-col text-left transition-all duration-300",
                                        isPopular 
                                            ? "bg-white dark:bg-slate-800 border-[#0052CC] shadow-[0_20px_40px_rgba(0,82,204,0.12)] md:scale-105 z-10 ring-2 ring-[#0052CC]" 
                                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-[#2684FF]"
                                    )}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0052CC] text-white text-[10px] px-3.5 py-1.5 rounded-full font-black uppercase tracking-widest shadow-md">
                                            {t("pricing.recommended", "Recommended")}
                                        </div>
                                    )}

                                    <h3 className="text-xl font-black text-[#172B4D] dark:text-white mb-2 tracking-tight">
                                        {plan.name}
                                    </h3>
                                    
                                    <p className="text-[13px] font-medium text-[#6B778C] dark:text-slate-400 mb-6 h-10 line-clamp-2">
                                        {plan.description}
                                    </p>

                                    <div className="flex items-baseline mb-8">
                                        <span className="text-4xl font-black text-[#172B4D] dark:text-white tracking-tighter">
                                            {formatCurrency(plan.monthlyPrice)}
                                        </span>
                                        {plan.monthlyPrice > 0 && (
                                            <span className="text-[13px] font-bold text-slate-400 ml-1.5 uppercase tracking-widest">
                                                {t("pricing.perMonth", "/month")}
                                            </span>
                                        )}
                                    </div>

                                    {/* Danh sách tính năng tóm tắt */}
                                    <ul className="space-y-3.5 mb-8 flex-1">
                                        {featuresList.slice(0, 4).map((feature, j) => (
                                            <li key={j} className="flex items-start gap-3 text-[#172B4D] dark:text-slate-300 text-[14px] font-medium leading-snug">
                                                <Check className={cn("w-5 h-5 shrink-0 stroke-[3px]", isPopular ? "text-[#0052CC]" : "text-slate-300")} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                        {(featuresList.length > 4) && (
                                            <li className="text-[12px] text-[#0052CC] font-bold pt-2">
                                                {t("pricing.andMore", "And many more features...")}
                                            </li>
                                        )}
                                    </ul>

                                    {/* Khối nút bấm hành động */}
                                    <div className="space-y-3 mt-auto">
                                        <button
                                            onClick={() => handleViewDetail(plan.id)}
                                            className={cn(
                                                "w-full py-2.5 rounded-lg font-bold text-[12px] uppercase tracking-widest transition-colors active:scale-[0.98]",
                                                "text-[#0052CC] bg-[#E3F2FD] hover:bg-blue-100",
                                                "dark:bg-slate-700 dark:text-[#4C9AFF] dark:hover:bg-slate-600"
                                            )}
                                        >
                                            {t("pricing.viewDetails", "View Details")}
                                        </button>
                                        
                                        <button
                                            onClick={() => handleSubscribe(plan.id, "MONTHLY")}
                                            className={cn(
                                                "w-full py-3.5 rounded-lg font-black text-[12px] uppercase tracking-widest transition-all duration-200 shadow-sm active:scale-[0.98]",
                                                isPopular 
                                                    ? "bg-[#0052CC] text-white hover:bg-[#0047B3] hover:shadow-md" 
                                                    : "bg-[#172B4D] dark:bg-white text-white dark:text-[#172B4D] hover:bg-[#091E42] dark:hover:bg-slate-200"
                                            )}
                                        >
                                            {plan.monthlyPrice === 0 
                                                ? t("pricing.startFree", "Start for free") 
                                                : t("pricing.subscribeNow", "Subscribe now")}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Chi tiết gói cước */}
            <PublicPlanDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                plan={selectedPlan}
                loading={isDetailLoading}
                onSubscribe={handleSubscribe} 
            />
        </motion.section>
    );
}