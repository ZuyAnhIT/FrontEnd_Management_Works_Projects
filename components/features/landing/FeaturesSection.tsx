"use client";

// =============================================================================
// 1. IMPORTS
// =============================================================================

import React, { useMemo, useState, useEffect } from "react";
import { Users, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// Internal Hooks & Utils
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  desc: string;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần hiển thị danh sách tính năng nổi bật (Features Section) trên Landing Page.
 * Tích hợp hiệu ứng hoạt ảnh mượt mà (framer-motion) và hỗ trợ đa ngôn ngữ (i18n).
 */
export default function FeaturesSection() {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { t } = useTranslation();
  const { theme } = useTheme(); 

  // ✅ STATE CHỐNG HYDRATION MISMATCH
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ---------------------------------------------------------------------------
  // 5. DATA PREPARATION
  // ---------------------------------------------------------------------------

  const features: FeatureItem[] = useMemo(() => [
    {
      icon: Users,
      title: t("features.teamCollabTitle"),
      desc: t("features.teamCollabDesc"),
    },
    {
      icon: Zap,
      title: t("features.smartAutoTitle"),
      desc: t("features.smartAutoDesc"),
    },
    {
      icon: Shield,
      title: t("features.securityTitle"),
      desc: t("features.securityDesc"),
    },
  ], [t]);

  // ---------------------------------------------------------------------------
  // 6. RENDER LOGIC
  // ---------------------------------------------------------------------------

  // ✅ NẾU CHƯA MOUNT (ĐANG Ở SERVER), RENDER KHUNG TRỐNG ĐỂ TRÁNH LỖI LỆCH DOM
  if (!mounted) {
    return (
      <section id="features" className="py-24 px-6 min-h-[400px] opacity-0 bg-white dark:bg-slate-900" />
    );
  }

  // ✅ CHỈ RENDER UI CHÍNH THỨC KHI ĐÃ LÊN CLIENT
  return (
    <motion.section
      id="features"
      className={cn(
        "py-24 px-6 text-center scroll-mt-24 transition-colors duration-300",
        "bg-white dark:bg-slate-900"
      )}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Tiêu đề phần (Section Heading) */}
      <h2 className="text-[28px] md:text-[32px] font-black text-[#172B4D] dark:text-white tracking-tight mb-14">
        {t("features.heading")}
      </h2>

      {/* Lưới hiển thị danh sách tính năng (Features Grid) */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true, amount: 0.5 }}
            className={cn(
              "group p-8 rounded-2xl border transition-all duration-300 ease-in-out cursor-default",
              "bg-white dark:bg-slate-800/50",
              "border-slate-200 dark:border-slate-700",
              "hover:border-[#2684FF] dark:hover:border-[#4C9AFF]",
              "hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]",
              "hover:-translate-y-1.5"
            )}
          >
            {/* Khối biểu tượng (Icon Box) */}
            <div className={cn(
              "w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-colors duration-300",
              "bg-[#E3F2FD] dark:bg-[#0052CC]/20 text-[#0052CC] dark:text-[#4C9AFF]",
              "group-hover:bg-[#0052CC] group-hover:text-white dark:group-hover:bg-[#4C9AFF] dark:group-hover:text-white"
            )}>
              <Icon className="w-7 h-7 stroke-[2.5]" />
            </div>
            
            {/* Nội dung tính năng (Content) */}
            <h3 className="text-[18px] font-bold text-[#172B4D] dark:text-slate-100 mb-3 tracking-tight">
              {title}
            </h3>
            <p className="text-[14px] text-[#42526E] dark:text-slate-400 leading-relaxed font-medium">
              {desc}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}