"use client";

import { useEffect, useState } from "react";
import { Check, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getPublicPlans, searchPublicPlans, getPublicPlanDetail, PublicPlan } from "@/services/apiPlanPublic";
import PublicPlanDetailModal from "./PublicPlanDetailModal";

interface PricingSectionProps {
  // ✅ Đã cập nhật Interface để nhận planId và cycle thay vì planCode
  onRegisterClick: (planId: number, cycle: "MONTHLY" | "YEARLY") => void;
}

export default function PricingSection({ onRegisterClick }: PricingSectionProps) {
  const { t } = useTranslation();

  // --- States ---
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // States cho Modal Chi tiết
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PublicPlan | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // --- Fetch Logic ---
  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        let data;
        if (searchTerm.trim()) {
            data = await searchPublicPlans(searchTerm, { size: 10, sortBy: "sortOrder", sortDir: "asc" });
        } else {
            data = await getPublicPlans({ size: 10, sortBy: "sortOrder", sortDir: "asc" });
        }
        setPlans(data.content || []);
      } catch (error) {
        console.error("Lỗi khi tải bảng giá:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchPlans();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // --- Handlers ---
  const handleViewDetail = async (planId: number) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    try {
        const detail = await getPublicPlanDetail(planId);
        setSelectedPlan(detail);
    } catch (error) {
        console.error("Lỗi khi tải chi tiết gói:", error);
        setIsDetailOpen(false);
    } finally {
        setIsDetailLoading(false);
    }
  };

  // ✅ Đã cập nhật handler để nhận planId và cycle (mặc định là MONTHLY cho nút bấm nhanh ngoài thẻ)
  const handleSubscribe = (planId: number, cycle: "MONTHLY" | "YEARLY" = "MONTHLY") => {
      setIsDetailOpen(false);
      onRegisterClick(planId, cycle); 
  };

  const formatCurrency = (amount: number) => {
      if (amount === 0) return "Miễn phí";
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <motion.section
      id="pricing"
      className="py-24 text-center scroll-mt-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative"
      initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }} viewport={{ once: true, amount: 0.2 }}
    >
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t("pricing.heading")}</h2>
      <p className="text-slate-500 dark:text-slate-300 mb-8 max-w-2xl mx-auto">{t("pricing.subheading")}</p>

      {/* --- Thanh tìm kiếm --- */}
      <div className="max-w-md mx-auto mb-12 px-6">
        <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm gói cước (VD: Pro, Enterprise)..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white shadow-sm transition-all"
            />
        </div>
      </div>

      {/* --- Hiển thị danh sách Gói --- */}
      <div className="max-w-6xl mx-auto px-6">
        {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>
        ) : plans.length === 0 ? (
             <div className="py-20 text-slate-500">Không tìm thấy gói cước nào phù hợp.</div>
        ) : (
            <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan, i) => {
                    const isPopular = plan.planCode === "PRO" || plan.planCode === "BUSINESS";

                    // ✅ CHUẨN HÓA MẢNG FEATURES TRÁNH LỖI TYPE ERROR
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
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true, amount: 0.5 }}
                            className={`relative p-8 rounded-2xl border flex flex-col text-left transition-all duration-300
                                ${isPopular 
                                    ? "bg-white dark:bg-slate-800 border-blue-600 shadow-2xl scale-105 z-10 ring-1 ring-blue-600" 
                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-400"
                                }`}
                        >
                            {isPopular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs px-4 py-1 rounded-full font-bold uppercase tracking-wider shadow-md">
                                    Khuyên Dùng
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 h-10">{plan.description}</p>

                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(plan.monthlyPrice)}</span>
                                {plan.monthlyPrice > 0 && <span className="text-slate-500 dark:text-slate-400 ml-1">/tháng</span>}
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {/* Chỉ hiển thị tối đa 4 tính năng đầu tiên trên thẻ nhỏ, còn lại xem trong Chi tiết */}
                                {featuresList.slice(0, 4).map((f, j) => (
                                    <li key={j} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm">
                                        <Check className={`w-5 h-5 shrink-0 ${isPopular ? 'text-blue-600' : 'text-slate-400'}`} />
                                        <span>{f}</span>
                                    </li>
                                ))}
                                {(featuresList.length > 4) && (
                                    <li className="text-sm text-blue-600 font-medium italic mt-2">Và nhiều tính năng khác...</li>
                                )}
                            </ul>

                            <div className="space-y-3 mt-auto">
                                <button
                                    onClick={() => handleViewDetail(plan.id)}
                                    className="w-full py-2.5 rounded-lg font-medium text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-slate-700 dark:text-blue-400 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Xem chi tiết
                                </button>
                                <button
                                    // ✅ SỬ DỤNG plan.id VÀ MẶC ĐỊNH LÀ "MONTHLY" KHI BẤM NHANH Ở BẢNG GIÁ
                                    onClick={() => handleSubscribe(plan.id, "MONTHLY")}
                                    className={`w-full py-3 rounded-lg font-bold text-sm transition-all duration-200 shadow-sm
                                        ${isPopular 
                                            ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg" 
                                            : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                                        }`}
                                >
                                    {plan.monthlyPrice === 0 ? "Bắt đầu miễn phí" : "Đăng ký ngay"}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        )}
      </div>

      {/* Modal Chi tiết */}
      <PublicPlanDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          plan={selectedPlan}
          loading={isDetailLoading}
          onSubscribe={handleSubscribe} // ✅ Truyền hàm đã được sửa ở trên xuống Modal
      />
    </motion.section>
  );
}