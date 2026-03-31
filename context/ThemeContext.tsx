"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode
} from "react";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// =============================================================================
// THEME PROVIDER
// =============================================================================

export function ThemeProvider({ children }: { children: ReactNode }) {
  // ---------------------------------------------------------------------------
  // 1. STATE
  // ---------------------------------------------------------------------------
  const [theme, setThemeState] = useState<Theme>("light");

  // ---------------------------------------------------------------------------
  // 2. EFFECTS
  // ---------------------------------------------------------------------------

  // Khởi tạo giao diện dựa trên bộ nhớ cục bộ hoặc cấu hình hệ thống
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    // Kiểm tra chế độ tối ưu tiên của hệ điều hành
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme ?? (prefersDark ? "dark" : "light");

    setThemeState(initialTheme);

    // Cập nhật class vào thẻ html để Tailwind CSS nhận diện
    document.documentElement.classList.remove("dark");
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // ---------------------------------------------------------------------------
  // 3. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Thiết lập chế độ hiển thị sáng hoặc tối
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    // Xử lý thay đổi class tại root để áp dụng giao diện
    document.documentElement.classList.remove("dark");
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  /**
   * Đổi trạng thái qua lại giữa hai chế độ sáng và tối
   */
  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  // ---------------------------------------------------------------------------
  // 4. RENDER
  // ---------------------------------------------------------------------------
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// =============================================================================
// CUSTOM HOOK
// =============================================================================

/**
 * Hook sử dụng để truy cập và điều chỉnh giao diện (Theme) trong các component
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}