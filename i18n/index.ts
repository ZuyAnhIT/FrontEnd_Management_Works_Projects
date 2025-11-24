"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import vn from "./vn.json";

// Chỉ init 1 lần duy nhất (fix lỗi "already initialized")
if (!i18n.isInitialized) {
  const savedLang =
    typeof window !== "undefined"
      ? localStorage.getItem("lang") || "vn"
      : "vn";

  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        vn: { translation: vn },
      },
      lng: savedLang,
      fallbackLng: "vn",
      interpolation: { escapeValue: false },
    });
}

export default i18n;
