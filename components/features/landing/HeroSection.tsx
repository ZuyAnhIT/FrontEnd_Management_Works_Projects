"use client";

import { ArrowRight, Star, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";

interface HeroSectionProps {
  onRegisterClick: () => void;
}

export default function HeroSection({ onRegisterClick }: HeroSectionProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // 🚀 FIX Hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Skeleton — tránh render i18n khi SSR
    return <section className="h-[500px] bg-white dark:bg-slate-900" />;
  }

  return (
    <section className="relative py-28 px-4 text-center overflow-hidden 
                        bg-white dark:bg-slate-900 transition-colors duration-300">
      
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-96 h-96 
                        bg-blue-200 dark:bg-blue-900 
                        rounded-full mix-blend-multiply 
                        blur-3xl opacity-30 animate-pulse"></div>

        <div className="absolute top-24 right-1/3 w-96 h-96 
                        bg-cyan-200 dark:bg-cyan-900 
                        rounded-full mix-blend-multiply 
                        blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-5xl mx-auto animate-fadeIn">

        <div className="inline-flex items-center gap-2 px-4 py-2 
                        bg-blue-50 dark:bg-slate-700 
                        text-blue-600 dark:text-blue-300 
                        rounded-full text-sm font-medium mb-6 shadow-sm">
          <Star className="w-4 h-4 fill-current" />
          {t("hero.socialProof")}
        </div>

        <h1 className="text-5xl md:text-6xl font-bold 
                      text-gray-900 dark:text-white 
                      leading-tight mb-6">
          {t("hero.headlinePart1")}{" "}
          <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 
                           bg-clip-text text-transparent 
                           dark:from-blue-400 dark:via-cyan-400 dark:to-blue-500">
            {t("hero.headlinePart2")}
          </span>
        </h1>

        <p className="text-lg md:text-xl 
                      text-gray-600 dark:text-gray-300 
                      mb-10 max-w-2xl mx-auto">
          {t("hero.description")}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          
          <button
            onClick={onRegisterClick}
            className="group px-8 py-4 
                       bg-gradient-to-r from-blue-500 to-cyan-500 
                       dark:from-blue-600 dark:to-cyan-600
                       text-white rounded-xl font-semibold text-lg
                       shadow-lg shadow-cyan-500/30 dark:shadow-cyan-600/20
                       hover:shadow-2xl hover:shadow-cyan-400/50 
                       hover:scale-[1.03]
                       transition-all flex items-center gap-2"
          >
            {t("hero.ctaStart")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="px-8 py-4 
                             bg-white dark:bg-slate-800 
                             border-2 border-gray-200 dark:border-slate-600 
                             text-gray-700 dark:text-gray-200 
                             rounded-xl font-semibold text-lg 
                             hover:border-blue-400 dark:hover:border-blue-500 
                             hover:text-blue-600 dark:hover:text-blue-300 
                             transition-all">
            {t("hero.ctaDemo")}
          </button>
        </div>

        <ChevronDown className="w-6 h-6 mx-auto mt-12 
                                text-gray-400 dark:text-gray-500 
                                animate-bounce" />
      </div>
    </section>
  );
}
