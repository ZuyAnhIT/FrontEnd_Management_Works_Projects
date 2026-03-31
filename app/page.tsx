"use client";

// =============================================================================
// 1. IMPORT (Thu vien -> Noi bo -> Component con)
// =============================================================================

import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

// Context & Utils
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// Sections & Components
import LandingHeader from "@/components/features/landing/LandingHeader";
import HeroSection from "@/components/features/landing/HeroSection";
import FeaturesSection from "@/components/features/landing/FeaturesSection";
import PricingSection from "@/components/features/landing/PricingSection";
import TestimonialSection from "@/components/features/landing/TestimonialSection";
import LandingFooter from "@/components/features/landing/LandingFooter";

// Modals & Chatbot
import AuthModal from "@/components/features/auth/AuthModal";
import { Chatbot } from "@/components/chatbot/chatbot";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

/**
 * Trang chu gioi thieu he thong (Landing Page).
 * Chua cac thanh phan tiep thi va dieu huong nguoi dung vao luong xac thuc.
 */
export default function LandingPage() {
    
    // ---------------------------------------------------------------------------
    // 3. HOOKS & STATE
    // ---------------------------------------------------------------------------
    
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    const { showToast } = useToast();
    const { t } = useTranslation();

    // ---------------------------------------------------------------------------
    // 4. EVENT HANDLERS
    // ---------------------------------------------------------------------------

    /**
     * Xu ly su kien mo luong Dang ky
     */
    const handleRegisterInitiation = useCallback(() => {
        setIsAuthModalOpen(true);
        // Hien thi thong bao theo ngon ngu hien tai
        showToast(t("landing.toastRegister"), "info");
    }, [showToast, t]);

    /**
     * Xu ly su kien mo luong Dang nhap
     */
    const handleLoginInitiation = useCallback(() => {
        setIsAuthModalOpen(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setIsAuthModalOpen(false);
    }, []);

    // ---------------------------------------------------------------------------
    // 5. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        // Bao boc tong the voi cac thuoc tinh boi den van ban (selection) theo Atlassian
        <div 
            className={cn(
                "relative min-h-screen jira-landing-override",
                "selection:bg-[#DEEBFF] selection:text-[#0052CC]",
                "dark:selection:bg-[#0052CC] dark:selection:text-[#DEEBFF]"
            )}
        >
            
            {/* LOP NEN HIEU UNG (Background Layer - Co dinh) */}
            <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden bg-[#F4F5F7] dark:bg-[#091E42]">
                
                {/* 1. Lop luoi cham bi (Dot Pattern Mesh) */}
                <div className="absolute inset-0 bg-jira-mesh opacity-100" />

                {/* 2. Cac luong sang mang phong cach Jira (Gradient Orbs) */}
                
                {/* Luong sang goc tren phai (Primary Blue/Cyan) */}
                <div 
                    className={cn(
                        "absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] animate-pulse-slow",
                        "bg-gradient-to-br from-[#0052CC]/20 to-[#00B8D9]/20",
                        "dark:from-[#0052CC]/15 dark:to-[#00B8D9]/10"
                    )} 
                />
                
                {/* Luong sang goc duoi trai (Secondary Indigo/Purple) */}
                <div 
                    className={cn(
                        "absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] animate-pulse-slow",
                        "bg-gradient-to-tr from-[#403294]/20 to-[#6554C0]/20",
                        "dark:from-[#403294]/15 dark:to-[#6554C0]/10"
                    )}
                    style={{ animationDelay: "2s" }} 
                />

                {/* Luong sang trung tam (Subtle Center Glow) */}
                <div 
                    className={cn(
                        "absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full blur-[80px]",
                        "bg-[#0052CC]/10 dark:bg-[#0052CC]/5"
                    )} 
                />
            </div>

            {/* KHU VUC NOI DUNG CHINH (Main Content) */}
            <div className="relative z-10 flex flex-col min-h-screen">
                
                <LandingHeader
                    onLoginClick={handleLoginInitiation}
                    onRegisterClick={handleRegisterInitiation}
                />
                
                <main className="flex-grow space-y-12 md:space-y-20">
                    <HeroSection onRegisterClick={handleRegisterInitiation} />
                    <FeaturesSection />
                    <PricingSection onRegisterClick={handleRegisterInitiation} />
                    <TestimonialSection />
                </main>
                
                <LandingFooter />
            </div>

            {/* KHU VUC MODALS & TIEN ICH BO SUNG */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
            />
            
            <Chatbot />
            
        </div>
    );
}