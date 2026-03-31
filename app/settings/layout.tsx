"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Utils)
// =============================================================================

import React, { ReactNode, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock, ArrowLeft, Loader2, Settings } from "lucide-react";

// Context
import { useAuth } from "@/context/AuthContext";

// Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & TYPES
// =============================================================================

interface SettingsLayoutProps {
    children: ReactNode;
}

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & CONTEXT
    // ---------------------------------------------------------------------------
    
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading } = useAuth();

    // ---------------------------------------------------------------------------
    // 5. DATA PREPARATION
    // ---------------------------------------------------------------------------

    /**
     * Danh sach cac muc menu cai dat, dung useMemo de tranh tao lai mang
     */
    const settingsNav: NavItem[] = useMemo(() => [
        {
            name: "Personal Profile",
            href: "/settings/profile",
            icon: User,
        },
        {
            name: "Account Security",
            href: "/settings/account",
            icon: Lock,
        },
    ], []);

    /**
     * Tinh toan tieu de hien tai dua tren duong dan
     */
    const currentRouteName = useMemo(() => {
        return settingsNav.find(item => item.href === pathname)?.name || "General Settings";
    }, [pathname, settingsNav]);

    // ---------------------------------------------------------------------------
    // 6. RENDER LOGIC
    // ---------------------------------------------------------------------------

    // MAN HINH: Kiem tra xac thuc
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] gap-3">
                <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin opacity-80" />
                <p className="text-[11px] font-black uppercase tracking-widest text-[#6B778C]">Loading Environment...</p>
            </div>
        );
    }

    // MAN HINH: Chan loi (Redirection se do AuthContext xu ly)
    if (!user) return null;

    // GIAO DIEN CHINH
    return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans text-[#172B4D]">
            
            {/* 1. TOP BAR (Header) */}
            <header className="bg-white border-b border-[#DFE1E6] h-14 flex items-center px-6 sticky top-0 z-20 shadow-sm">
                <div className="max-w-[1200px] mx-auto w-full flex items-center gap-5">
                    
                    {/* Nhan nut de quay lai trang truoc */}
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-[#42526E] hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                        title="Return to previous page"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>
                    
                    {/* Breadcrumbs hien thi vi tri hien tai */}
                    <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#6B778C] uppercase tracking-widest">
                        <Settings className="w-4 h-4 opacity-70" />
                        <span>Settings</span>
                        <span className="text-[#DFE1E6] font-light">/</span>
                        <span className="text-[#172B4D] font-black">
                            {currentRouteName}
                        </span>
                    </div>
                </div>
            </header>

            {/* 2. MAIN LAYOUT (Sidebar + Content) */}
            <div className="max-w-[1200px] mx-auto p-6 md:py-10 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row gap-10 items-start">
                    
                    {/* SIDEBAR NAVIGATION (Vertical Tabs) */}
                    <nav className="w-full md:w-64 shrink-0 space-y-2">
                        <div className="px-4 mb-4 text-[11px] font-black text-[#6B778C] uppercase tracking-[0.2em]">
                            Configuration
                        </div>
                        
                        <div className="space-y-1">
                            {settingsNav.map((item) => {
                                const isActive = pathname === item.href;
                                
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 outline-none",
                                            "text-[13px] font-black uppercase tracking-wider",
                                            isActive 
                                                ? "bg-[#E3F2FD] text-[#0052CC] shadow-sm" 
                                                : "text-[#42526E] hover:bg-white hover:shadow-sm hover:text-[#172B4D] border border-transparent hover:border-[#DFE1E6]"
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                "w-4.5 h-4.5 stroke-[2.5] transition-colors",
                                                isActive ? "text-[#0052CC]" : "text-[#6B778C] group-hover:text-[#172B4D]"
                                            )}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* RENDER DYNAMIC COMPONENT (Children) */}
                    <main className="flex-1 w-full min-w-0">
                        {children}
                    </main>

                </div>
            </div>
        </div>
    );
}