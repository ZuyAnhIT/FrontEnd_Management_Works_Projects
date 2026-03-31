"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Styles)
// =============================================================================

import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần hiển thị lời chứng thực (Testimonial) từ khách hàng.
 * Áp dụng hiệu ứng mượt mà khi cuộn tới và hỗ trợ giao diện Dark Mode.
 */
export default function TestimonialSection() {
  
  // ---------------------------------------------------------------------------
  // 3. HOOKS
  // ---------------------------------------------------------------------------
  
  const { t } = useTranslation();

  // ---------------------------------------------------------------------------
  // 4. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <motion.section
      id="about"
      className={cn(
        "py-24 px-6 text-center scroll-mt-24 transition-colors duration-300",
        "bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800"
      )}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Tiêu đề chính (Section Heading) */}
      <h2 className="text-[28px] md:text-[32px] font-black text-[#172B4D] dark:text-white mb-6 tracking-tight">
        {t("testimonial.heading")}
      </h2>

      {/* Mô tả phụ trợ - Cho phép render HTML từ i18n */}
      <p
        className="max-w-2xl mx-auto text-[#42526E] dark:text-slate-400 text-[16px] mb-14 leading-relaxed font-medium"
        dangerouslySetInnerHTML={{
          __html: t("testimonial.description"),
        }}
      />

      {/* Khối trích dẫn nổi bật (Featured Quote) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, amount: 0.5 }}
        className={cn(
          "mx-auto max-w-3xl p-10 rounded-2xl relative transition-all duration-300",
          "bg-[#F4F5F7] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm"
        )}
      >
        {/* Biểu tượng trích dẫn nền (Quote Background Icon) */}
        <div className="absolute top-6 left-8 opacity-10 pointer-events-none">
          <Quote className="w-14 h-14 text-[#0052CC] dark:text-blue-400" />
        </div>

        {/* Nội dung trích dẫn (Quote Body) */}
        <p className="text-[20px] md:text-[22px] font-bold italic relative z-10 mb-8 leading-snug text-[#172B4D] dark:text-slate-100 tracking-tight">
          "{t("testimonial.quote")}"
        </p>

        {/* Thông tin tác giả (Author Attribution) */}
        <div className="flex items-center justify-center gap-4">
          {/* Avatar dạng chữ cái đầu (Initials Avatar) */}
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
            "bg-[#0052CC] dark:bg-blue-600 text-white font-black text-[13px] uppercase tracking-wider"
          )}>
            {t("testimonial.initial")}
          </div>

          <div className="text-left">
            <p className="text-[14px] font-black text-[#172B4D] dark:text-white uppercase tracking-tight">
              {t("testimonial.role")}
            </p>
            <p className="text-[12px] font-bold text-[#6B778C] dark:text-slate-400 uppercase tracking-widest mt-0.5">
              {t("testimonial.company")}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}