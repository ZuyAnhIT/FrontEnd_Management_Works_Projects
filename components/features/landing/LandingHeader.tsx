"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageThemeButton from "@/components/ui/LanguageThemeButton";

interface LandingHeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function LandingHeader({
  onLoginClick,
  onRegisterClick,
}: LandingHeaderProps) {
  // 1. Thêm state để kiểm tra component đã được mount lên trình duyệt chưa
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  // 2. Dùng useEffect để set mounted = true sau khi render lần đầu
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { label: t("header.nav.features"), href: "#features" },
    { label: t("header.nav.pricing"), href: "#pricing" },
    { label: t("header.nav.about"), href: "#about" },
  ];

  // 3. Nếu chưa mount, trả về một Header rỗng (Skeleton) để giữ chỗ
  // Việc này ngăn lỗi "Text content does not match"
  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 h-16 border-b border-gray-200 dark:border-slate-700 shadow-sm" />
    );
  }

  return (
    <header
      className="
        sticky top-0 z-40 
        bg-white/80 dark:bg-slate-900/80 
        backdrop-blur-md 
        border-b border-gray-200 dark:border-slate-700 
        shadow-sm 
        transition-all
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl select-none group"
        >
          <div className="w-10 h-10 rounded-xl 
                          bg-gradient-to-br from-blue-500 to-cyan-500 
                          text-white flex items-center justify-center 
                          text-sm shadow-lg group-hover:scale-105 
                          transition-transform">
            WN
          </div>

          <span className="text-gray-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">
            WorkNet
          </span>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="
                text-gray-700 dark:text-gray-300 
                hover:text-blue-600 dark:hover:text-blue-400 
                transition-colors
              "
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">

          {/* Language + Theme Button */}
          {/* Nút này sẽ hoạt động tốt vì Context đã được sửa */}
          <LanguageThemeButton />

          <button
            onClick={onLoginClick}
            className="
              px-5 py-2 
              text-gray-700 dark:text-gray-300 
              hover:text-blue-600 dark:hover:text-blue-400 
              font-medium transition
            "
          >
            {t("header.login")}
          </button>

          <button
            onClick={onRegisterClick}
            className="
              px-6 py-2 
              bg-gradient-to-r from-blue-500 to-cyan-500 
              text-white rounded-lg font-semibold 
              shadow-md shadow-cyan-500/20 dark:shadow-none
              hover:shadow-lg hover:shadow-cyan-400/40 
              hover:scale-[1.03] 
              transition-all duration-300 ease-in-out
            "
          >
            {t("header.register")}
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="
            md:hidden p-2 
            text-gray-700 dark:text-gray-300 
            hover:text-blue-600 dark:hover:text-blue-400
          "
          aria-label={
            isMobileMenuOpen ? t("header.menuClose") : t("header.menuOpen")
          }
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMobileMenuOpen && (
        <div
          className="
            md:hidden 
            bg-white dark:bg-slate-900 
            border-t border-gray-200 dark:border-slate-700 
            shadow-inner transition-colors
          "
        >
          <div className="px-4 py-4 space-y-3">

            {/* Language Theme Button */}
            <div className="flex justify-end mb-2">
              <LanguageThemeButton />
            </div>

            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="
                  block w-full text-left px-4 py-2 
                  text-gray-700 dark:text-gray-300 
                  hover:bg-gray-50 dark:hover:bg-slate-800 
                  rounded-lg transition
                "
              >
                {item.label}
              </a>
            ))}

            <button
              onClick={() => {
                onLoginClick();
                setIsMobileMenuOpen(false);
              }}
              className="
                block w-full text-left px-4 py-2 
                text-gray-700 dark:text-gray-300 
                hover:bg-gray-50 dark:hover:bg-slate-800 
                rounded-lg font-medium transition
              "
            >
              {t("header.login")}
            </button>

            <button
              onClick={() => {
                onRegisterClick();
                setIsMobileMenuOpen(false);
              }}
              className="
                block w-full px-4 py-3 
                bg-gradient-to-r from-blue-500 to-cyan-500 
                text-white rounded-lg font-semibold
              "
            >
              {t("header.register")}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}