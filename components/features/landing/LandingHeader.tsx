"use client";

// =============================================================================
// 1. IMPORTS
// =============================================================================

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";

// Internal Components & Utils
import LanguageThemeButton from "@/components/ui/LanguageThemeButton";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES
// =============================================================================

interface LandingHeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thanh điều hướng chính cho Landing Page.
 * Xử lý Hydration mismatch bằng cách kiểm tra trạng thái mounted.
 */
export default function LandingHeader({
  onLoginClick,
  onRegisterClick,
}: LandingHeaderProps) {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const { t } = useTranslation();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Đánh dấu component đã render trên client để tránh lỗi Hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ---------------------------------------------------------------------------
  // 5. DATA PREPARATION
  // ---------------------------------------------------------------------------

  const navLinks = useMemo(() => [
    { label: t("header.nav.features"), href: "#features" },
    { label: t("header.nav.pricing"), href: "#pricing" },
    { label: t("header.nav.about"), href: "#about" },
  ], [t]);

  // ---------------------------------------------------------------------------
  // 6. RENDER LOGIC
  // ---------------------------------------------------------------------------

  // Trả về khung xương (Skeleton) rỗng nếu chưa mount xong để giữ chỗ UI
  if (!isMounted) {
    return (
      <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 shadow-sm" />
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-16 transition-all duration-300",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md",
        "border-b border-slate-200 dark:border-slate-800 shadow-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Khối Logo (Brand) */}
        <Link
          href="/"
          className="flex items-center gap-3 font-black text-xl select-none group"
        >
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shadow-sm transition-transform duration-300",
            "bg-gradient-to-br from-[#0052CC] to-[#2684FF] text-white",
            "group-hover:scale-105"
          )}>
            <span className="text-[14px] tracking-tight">WN</span>
          </div>
          <span className="text-[#172B4D] dark:text-white tracking-tight group-hover:text-[#0052CC] dark:group-hover:text-[#4C9AFF] transition-colors">
            WorkNet
          </span>
        </Link>

        {/* Khối điều hướng Desktop (Desktop Navigation) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                "text-[12px] font-bold uppercase tracking-widest transition-colors",
                "text-[#42526E] dark:text-slate-300",
                "hover:text-[#0052CC] dark:hover:text-[#4C9AFF]"
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Khối hành động Desktop (Desktop Actions) */}
        <div className="hidden md:flex items-center gap-5">
          <LanguageThemeButton />

          <button
            onClick={onLoginClick}
            className={cn(
              "text-[12px] font-bold uppercase tracking-widest transition-colors",
              "text-[#42526E] dark:text-slate-300",
              "hover:text-[#0052CC] dark:hover:text-[#4C9AFF]"
            )}
          >
            {t("header.login")}
          </button>

          <button
            onClick={onRegisterClick}
            className={cn(
              "px-6 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-widest text-white transition-all shadow-sm",
              "bg-[#0052CC] hover:bg-[#0047B3] dark:bg-[#2684FF] dark:hover:bg-[#0052CC]",
              "active:scale-95 hover:shadow-md"
            )}
          >
            {t("header.register")}
          </button>
        </div>

        {/* Nút bật/tắt Menu Mobile (Mobile Menu Toggle) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn(
            "md:hidden p-2 rounded-md transition-colors",
            "text-[#42526E] dark:text-slate-300",
            "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0052CC] dark:hover:text-[#4C9AFF]"
          )}
          aria-label={isMobileMenuOpen ? t("header.menuClose") : t("header.menuOpen")}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Trình đơn thả xuống Mobile (Mobile Dropdown Menu) */}
      {isMobileMenuOpen && (
        <div
          className={cn(
            "md:hidden absolute top-16 left-0 right-0 shadow-xl transition-colors animate-in slide-in-from-top-2 duration-200",
            "bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
          )}
        >
          <div className="px-4 py-6 space-y-4">
            
            {/* Cấu hình ngôn ngữ & giao diện */}
            <div className="flex justify-end mb-4">
              <LanguageThemeButton />
            </div>

            {/* Các liên kết điều hướng */}
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block w-full text-left px-4 py-3 rounded-lg transition-colors",
                  "text-[13px] font-bold uppercase tracking-widest",
                  "text-[#172B4D] dark:text-slate-200",
                  "hover:bg-[#E3F2FD] dark:hover:bg-slate-800 hover:text-[#0052CC] dark:hover:text-[#4C9AFF]"
                )}
              >
                {item.label}
              </a>
            ))}

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

            {/* Nút Đăng nhập */}
            <button
              onClick={() => {
                onLoginClick();
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "block w-full text-left px-4 py-3 rounded-lg transition-colors",
                "text-[13px] font-bold uppercase tracking-widest",
                "text-[#42526E] dark:text-slate-300",
                "hover:bg-[#E3F2FD] dark:hover:bg-slate-800 hover:text-[#0052CC] dark:hover:text-[#4C9AFF]"
              )}
            >
              {t("header.login")}
            </button>

            {/* Nút Đăng ký */}
            <button
              onClick={() => {
                onRegisterClick();
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "block w-full px-4 py-3.5 rounded-lg text-center text-white transition-all shadow-sm mt-2",
                "text-[13px] font-bold uppercase tracking-widest",
                "bg-[#0052CC] hover:bg-[#0047B3] dark:bg-[#2684FF] dark:hover:bg-[#0052CC]",
                "active:scale-[0.98]"
              )}
            >
              {t("header.register")}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}