"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Styles)
// =============================================================================

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell, Shield } from "lucide-react";

// Internal Components
import UserMenu from "@/components/ui/UserMenu";
import NotificationPopover from "@/components/features/admin/NotificationPopover";

// Hooks & Utils
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & PROPS
// =============================================================================

export interface SuperAdminHeaderProps {
    onMenuToggle: () => void;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function SuperAdminHeader({ onMenuToggle }: SuperAdminHeaderProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const router = useRouter();
    const { user, logout } = useAuth();

    // Trạng thái hiển thị menu người dùng và thông báo
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // ---------------------------------------------------------------------------
    // 5. VARIABLES & COMPUTED
    // ---------------------------------------------------------------------------

    // Đảm bảo dữ liệu người dùng luôn tồn tại để tránh lỗi hiển thị
    const safeUser = {
        name: user?.fullName || "Super Admin",
        email: user?.email || "admin@worknet.com",
    };

    // ---------------------------------------------------------------------------
    // 6. HANDLERS
    // ---------------------------------------------------------------------------

    /**
     * Xử lý bật/tắt menu người dùng
     */
    const handleToggleUserMenu = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsUserMenuOpen((prev) => !prev);
        setIsNotifOpen(false);
    }, []);

    /**
     * Xử lý bật/tắt cửa sổ thông báo
     */
    const handleToggleNotifications = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsNotifOpen((prev) => !prev);
        setIsUserMenuOpen(false);
    }, []);

    /**
     * Điều hướng về trang quản trị chính
     */
    const handleLogoClick = () => {
        router.push("/super-admin");
    };

    // ---------------------------------------------------------------------------
    // 7. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center shadow-sm shrink-0">
            <div className="w-full px-4 flex items-center justify-between">
                
                {/* KHỐI TRÁI: MOBILE MENU & LOGO */}
                <div className="flex items-center gap-4">
                    {/* Nút đóng/mở sidebar trên thiết bị di động */}
                    <button
                        onClick={onMenuToggle}
                        className="p-2 hover:bg-slate-100 rounded-md transition-colors lg:hidden text-slate-500 active:scale-95"
                        aria-label="Toggle Menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Logo Hệ thống trung tâm */}
                    <div
                        className="flex items-center gap-3 cursor-pointer group select-none"
                        onClick={handleLogoClick}
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-all group-hover:scale-105 bg-slate-900 border border-slate-800">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="font-black text-[15px] text-slate-900 tracking-tight block leading-tight uppercase">
                                Central System
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                                Platform Admin
                            </span>
                        </div>
                    </div>
                </div>

                {/* KHỐI PHẢI: ACTIONS & USER PROFILE */}
                <div className="flex items-center gap-3">
                    
                    {/* Cửa sổ thông báo hệ thống */}
                    <div className="relative">
                        <button
                            onClick={handleToggleNotifications}
                            className={cn(
                                "p-2 rounded-full transition-all relative active:scale-90",
                                isNotifOpen
                                    ? "bg-red-50 text-red-600 shadow-inner"
                                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            )}
                            title="Notifications"
                        >
                            <Bell className="w-5 h-5" />
                            {/* Chấm đỏ báo hiệu có thông báo mới */}
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white pointer-events-none shadow-sm" />
                        </button>

                        <NotificationPopover
                            isOpen={isNotifOpen}
                            onClose={() => setIsNotifOpen(false)}
                        />
                    </div>

                    {/* Dải phân cách dọc */}
                    <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

                    {/* Menu tài khoản Super Admin */}
                    <div className="relative ml-1">
                        <button
                            onClick={handleToggleUserMenu}
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black transition-all ring-2 ring-offset-1 shadow-md focus:outline-none active:scale-90",
                                "bg-red-600 hover:bg-red-700 ring-white"
                            )}
                        >
                            {safeUser.name.charAt(0).toUpperCase()}
                        </button>

                        {isUserMenuOpen && (
                            <UserMenu
                                user={safeUser}
                                onClose={() => setIsUserMenuOpen(false)}
                                onLogout={logout}
                            />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}