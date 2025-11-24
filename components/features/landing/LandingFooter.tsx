"use client";

import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

export default function LandingFooter() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const year = new Date().getFullYear();

  return (
    <footer
      className="
        py-10 
        bg-white dark:bg-slate-900
        border-t border-gray-100 dark:border-slate-700
        text-center 
        text-gray-500 dark:text-gray-400 
        text-sm 
        transition-colors duration-300
      "
    >
      {t("footer.copyright", { year })}
    </footer>
  );
}
