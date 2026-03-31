"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode
} from "react";
import i18n from "@/i18n";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// =============================================================================
// LANGUAGE PROVIDER
// =============================================================================

export function LanguageProvider({ children }: { children: ReactNode }) {
  // ---------------------------------------------------------------------------
  // 1. STATE
  // ---------------------------------------------------------------------------
  const [language, setLanguageState] = useState<string>("vn");

  // ---------------------------------------------------------------------------
  // 2. EFFECTS
  // ---------------------------------------------------------------------------

  // Tải cấu hình ngôn ngữ từ bộ nhớ cục bộ khi ứng dụng khởi chạy
  useEffect(() => {
    const savedLanguage = localStorage.getItem("lang") || i18n.language || "vn";
    setLanguageState(savedLanguage);
    i18n.changeLanguage(savedLanguage);

    // Cập nhật thuộc tính lang của thẻ html để hỗ trợ SEO và truy cập
    document.documentElement.lang = savedLanguage;
  }, []);

  // ---------------------------------------------------------------------------
  // 3. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Thiết lập ngôn ngữ mới cho toàn bộ hệ thống
   */
  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("lang", lang);
    i18n.changeLanguage(lang);

    // Đồng bộ hóa ngôn ngữ hiển thị trên thẻ html
    document.documentElement.lang = lang;
  }, []);

  // ---------------------------------------------------------------------------
  // 4. RENDER
  // ---------------------------------------------------------------------------
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// =============================================================================
// CUSTOM HOOK
// =============================================================================

/**
 * Hook sử dụng để truy cập và thay đổi ngôn ngữ trong các component
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}