"use client";

import { useRouter } from "next/navigation";
import { User, Shield, LogOut, Moon, Sun, Globe } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next"; // Giả định đã có i18next

// Giả định Context Hooks đã được import và định nghĩa đúng
// import { useLanguage } from "@/context/LanguageContext";
// import { useTheme } from "@/context/ThemeContext";

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface UserMenuProps {
    user: {
        name: string;
        email: string;
    };
    onClose: () => void;
    onLogout: () => void;
}

// Giả định các Hooks sau đã được định nghĩa bên ngoài file này
const useLanguage = () => ({ language: "en", setLanguage: (lang: string) => {} });
const useTheme = () => ({ theme: "light", toggleTheme: () => {} });


// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function UserMenu({ user, onClose, onLogout }: UserMenuProps) {
    const router = useRouter();
    // Giả định t function được cung cấp từ i18next
    const { t } = useTranslation(); 

    // LẤY TỪ CONTEXT (Giả định)
    const { language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    const handleNavigate = (path: string) => {
        onClose();
        router.push(path);
    };

    // Đóng menu khi click ngoài (Logic nghiệp vụ quan trọng)
    useEffect(() => {
        // Đảm bảo event listener được thêm vào body/document
        const handleClickOutside = () => onClose();
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [onClose]);

    // Đổi ngôn ngữ (Logic nghiệp vụ quan trọng)
    const handleToggleLanguage = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Giữ nguyên logic switch
        setLanguage(language === "vn" ? "en" : "vn");
    };

    // Đổi giao diện sáng/tối (Logic nghiệp vụ quan trọng)
    const handleToggleTheme = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleTheme();
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()} // Ngăn sự kiện lan ra ngoài để không trigger handleClickOutside
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 
                    rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 
                    overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
        >
            {/* 1. User Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
                <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        {/* Status Dot */}
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                            {user?.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-300 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* 2. Menu items */}
            <div className="p-2">
                {/* Account Links */}
                <div className="mb-2">
                    <button
                        onClick={() => handleNavigate("/settings/profile")}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md 
                                    hover:bg-slate-100 dark:hover:bg-slate-700 
                                    transition-colors text-left group"
                    >
                        <User className="w-4 h-4 text-slate-500 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white" />
                        <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                            {t("Profile")}
                        </span>
                    </button>

                    <button
                        onClick={() => handleNavigate("/settings/account")}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md 
                                    hover:bg-slate-100 dark:hover:bg-slate-700 
                                    transition-colors text-left group"
                    >
                        <Shield className="w-4 h-4 text-slate-500 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white" />
                        <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                            {t("Security")}
                        </span>
                    </button>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-2"></div>

                {/* Preferences */}
                <div className="mb-2">

                    {/* Theme Toggle */}
                    <button
                        onClick={handleToggleTheme}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md 
                                    hover:bg-slate-100 dark:hover:bg-slate-700 
                                    transition-colors text-left group"
                    >
                        <div className="flex items-center gap-3">
                            {theme === "light" ? (
                                <Sun className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                            ) : (
                                <Moon className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                            )}
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {t("Theme")}
                            </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-200 
                                        bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded capitalize">
                            {theme}
                        </span>
                    </button>

                    {/* Language Toggle */}
                    <button
                        onClick={handleToggleLanguage}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md 
                                    hover:bg-slate-100 dark:hover:bg-slate-700 
                                    transition-colors text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {t("Language")}
                            </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-200 
                                        bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded">
                            {language === "vn" ? "Tiếng Việt" : "English"}
                        </span>
                    </button>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-2"></div>

                {/* Logout */}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md 
                                    hover:bg-red-50 dark:hover:bg-red-900/20 
                                    transition-colors text-left group"
                >
                    <LogOut className="w-4 h-4 text-red-500 dark:text-red-300 group-hover:text-red-600" />
                    <span className="flex-1 text-sm font-medium text-red-600 dark:text-red-300 group-hover:text-red-700">
                        {t("Logout")}
                    </span>
                </button>
            </div>

            {/* 3. Footer */}
            <div className="px-5 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-[10px] text-center text-slate-400">
                ProjectHub v1.0.0
            </div>
        </div>
    );
}