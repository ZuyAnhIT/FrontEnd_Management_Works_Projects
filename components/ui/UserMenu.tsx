"use client";
import { useRouter } from "next/navigation";
import { User, Shield, Settings, LogOut, Moon, Sun, Globe, Crown, Mail, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface UserMenuProps {
    user: {
        name: string;
        email: string;
    };
    onClose: () => void;
    onLogout: () => void;
}

export default function UserMenu({ user, onClose, onLogout }: UserMenuProps) {
    const router = useRouter();
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [language, setLanguage] = useState<"vn" | "en">("vn");

    const handleNavigate = (path: string) => {
        onClose();
        router.push(path);
    };

    // Đóng menu khi click ngoài
    useEffect(() => {
        const handleClickOutside = () => onClose();
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [onClose]);

    const toggleTheme = () => {
        setTheme(prev => prev === "light" ? "dark" : "light");
        // TODO: Implement theme switching logic
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === "vn" ? "en" : "vn");
        // TODO: Implement language switching logic
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden z-50 animate-slideDown"
        >
            {/* User Profile Header with Gradient */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 px-4 py-4">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10 flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {user?.name?.charAt(0)?.toUpperCase() || "N"}
                        </div>
                        {/* Online status */}
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></span>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="font-bold text-white truncate">{user?.name}</h3>
                            <Crown className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-1.5 text-white/80 text-sm">
                            <Mail className="w-3.5 h-3.5" />
                            <p className="truncate">{user?.email}</p>
                        </div>
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                            <span className="text-xs font-semibold text-white">VIP Member</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
                {/* Profile */}
                <button 
                    onClick={() => handleNavigate("/settings/profile")} 
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 text-left"
                >
                    <div className="w-9 h-9 bg-blue-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                        <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="flex-1 text-gray-700 font-medium">Thông tin cá nhân</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Change Password */}
                <button 
                    onClick={() => handleNavigate("/settings/account")} 
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 text-left"
                >
                    <div className="w-9 h-9 bg-green-50 group-hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors">
                        <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="flex-1 text-gray-700 font-medium">Đổi mật khẩu</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2"></div>

                {/* Theme Toggle */}
                <button 
                    onClick={toggleTheme}
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 text-left"
                >
                    <div className="w-9 h-9 bg-purple-50 group-hover:bg-purple-100 rounded-lg flex items-center justify-center transition-colors">
                        {theme === "light" ? (
                            <Moon className="w-4 h-4 text-purple-600" />
                        ) : (
                            <Sun className="w-4 h-4 text-purple-600" />
                        )}
                    </div>
                    <span className="flex-1 text-gray-700 font-medium">
                        {theme === "light" ? "Dark Mode" : "Light Mode"}
                    </span>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-100 rounded-full">
                        <span className="text-xs font-semibold text-purple-700">{theme === "light" ? "Light" : "Dark"}</span>
                    </div>
                </button>

                {/* Language Toggle */}
                <button 
                    onClick={toggleLanguage}
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 transition-all duration-200 text-left"
                >
                    <div className="w-9 h-9 bg-orange-50 group-hover:bg-orange-100 rounded-lg flex items-center justify-center transition-colors">
                        <Globe className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="flex-1 text-gray-700 font-medium">Ngôn ngữ</span>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 rounded-full">
                        <span className="text-xs font-semibold text-orange-700">{language === "vn" ? "🇻🇳 VN" : "🇬🇧 EN"}</span>
                    </div>
                </button>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2"></div>

                {/* Logout */}
                <button
                    onClick={onLogout}
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 text-left"
                >
                    <div className="w-9 h-9 bg-red-50 group-hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors">
                        <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="flex-1 text-red-600 font-semibold">Đăng xuất</span>
                    <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-all" />
                </button>
            </div>

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slideDown {
                    animation: slideDown 0.2s ease-out;
                }

                .bg-grid-white\/10 {
                    background-image: linear-gradient(white 1px, transparent 1px),
                        linear-gradient(90deg, white 1px, transparent 1px);
                    background-size: 20px 20px;
                    opacity: 0.1;
                }
            `}</style>
        </div>
    );
}