"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import i18n from "@/i18n";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>("vn");

  // 🔹 Load lang từ localStorage khi app mount
  useEffect(() => {
    const saved = localStorage.getItem("lang") || i18n.language || "vn";
    setLanguageState(saved);
    i18n.changeLanguage(saved);

    // Update <html lang="">
    document.documentElement.lang = saved;
  }, []);

  // 🔹 Hàm đổi ngôn ngữ — dùng useCallback để tránh re-render thừa
  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("lang", lang);
    i18n.changeLanguage(lang);

    // Update SEO <html lang="">
    document.documentElement.lang = lang;
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used in LanguageProvider");
  return ctx;
}
