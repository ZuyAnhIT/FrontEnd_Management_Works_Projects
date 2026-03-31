"use client";

// =============================================================================
// 1. IMPORTS
// =============================================================================

import React, { useEffect, useState } from "react";
import { ArrowRight, Star, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

// Context & Utils
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface HeroSectionProps {
  onRegisterClick: () => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần Hero (Màn hình chính đầu tiên) cho trang Landing Page.
 * Hỗ trợ đa ngôn ngữ và chủ đề Sáng/Tối.
 */
export default function HeroSection({ onRegisterClick }: HeroSectionProps) {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Trạng thái kiểm tra component đã được mount trên client chưa
  // Giúp khắc phục triệt để lỗi Hydration Mismatch giữa Server và Client
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ---------------------------------------------------------------------------
  // 5. RENDER LOGIC
  // ---------------------------------------------------------------------------

  // Trả về một khối rỗng với chiều cao tương đương để giữ chỗ trong quá trình SSR
  if (!isMounted) {
    return <section className="h-[500px] bg-white dark:bg-slate-900" />;
  }

  return (
    <section 
      className={cn(
        "relative py-28 px-4 text-center overflow-hidden transition-colors duration-300",
        "bg-white dark:bg-slate-900"
      )}
    >
      {/* Khối hiệu ứng ánh sáng nền (Background Glow Effects) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className={cn(
            "absolute top-0 left-1/3 w-96 h-96 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse",
            "bg-blue-200 dark:bg-blue-900"
          )} 
        />
        <div 
          className={cn(
            "absolute top-24 right-1/3 w-96 h-96 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse delay-1000",
            "bg-cyan-200 dark:bg-cyan-900"
          )} 
        />
      </div>

      {/* Khối nội dung chính (Main Content) */}
      <div className="max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-700 ease-out">
        
        {/* Nhãn bằng chứng xã hội (Social Proof Badge) */}
        <div 
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full text-[13px] font-bold uppercase tracking-widest shadow-sm transition-colors",
            "bg-blue-50 text-[#0052CC] dark:bg-slate-800 dark:text-blue-400"
          )}
        >
          <Star className="w-4 h-4 fill-current" />
          {t("hero.socialProof")}
        </div>

        {/* Tiêu đề chính (Headline) */}
        <h1 
          className={cn(
            "text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight",
            "text-[#172B4D] dark:text-white"
          )}
        >
          {t("hero.headlinePart1")}{" "}
          <span 
            className={cn(
              "bg-clip-text text-transparent bg-gradient-to-r",
              "from-blue-600 via-cyan-500 to-blue-600",
              "dark:from-blue-400 dark:via-cyan-400 dark:to-blue-500"
            )}
          >
            {t("hero.headlinePart2")}
          </span>
        </h1>

        {/* Đoạn mô tả (Sub-headline) */}
        <p 
          className={cn(
            "text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto leading-relaxed",
            "text-[#42526E] dark:text-slate-300"
          )}
        >
          {t("hero.description")}
        </p>

        {/* Khối nút bấm gọi hành động (Call to Action Buttons) */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onRegisterClick}
            className={cn(
              "group flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[15px] font-black uppercase tracking-widest text-white transition-all",
              "bg-[#0052CC] hover:bg-[#0047B3] dark:bg-blue-600 dark:hover:bg-blue-700",
              "shadow-[0_8px_20px_rgba(0,82,204,0.2)] dark:shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_12px_24px_rgba(0,82,204,0.3)]",
              "hover:-translate-y-0.5 active:scale-[0.98]"
            )}
          >
            {t("hero.ctaStart")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button 
            className={cn(
              "px-8 py-4 rounded-xl text-[15px] font-black uppercase tracking-widest transition-all",
              "bg-white dark:bg-slate-800",
              "border-2 border-slate-200 dark:border-slate-700",
              "text-[#42526E] dark:text-slate-200",
              "hover:border-[#0052CC] hover:text-[#0052CC] dark:hover:border-blue-400 dark:hover:text-blue-400",
              "active:scale-[0.98]"
            )}
          >
            {t("hero.ctaDemo")}
          </button>
        </div>

        {/* Biểu tượng cuộn xuống (Scroll Down Indicator) */}
        <ChevronDown 
          className="w-7 h-7 mx-auto mt-16 text-slate-300 dark:text-slate-600 animate-bounce" 
        />
      </div>
    </section>
  );
}