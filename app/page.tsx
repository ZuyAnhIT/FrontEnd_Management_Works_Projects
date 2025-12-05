"use client";

import { useState } from "react";
import AuthModal from "@/components/features/auth/AuthModal";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "react-i18next";
import { Chatbot } from "@/components/chatbot/chatbot";

// Sections
import LandingHeader from "@/components/features/landing/LandingHeader";
import HeroSection from "@/components/features/landing/HeroSection";
import FeaturesSection from "@/components/features/landing/FeaturesSection";
import PricingSection from "@/components/features/landing/PricingSection";
import TestimonialSection from "@/components/features/landing/TestimonialSection";
import LandingFooter from "@/components/features/landing/LandingFooter";

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { showToast } = useToast();
  const { t } = useTranslation();

  const handleRegisterClick = () => {
    setIsAuthOpen(true);
    showToast(t("landing.toastRegister"), "info");
  };

  const handleLoginClick = () => {
    setIsAuthOpen(true);
  };

  return (
    // Thêm class 'jira-landing-override' để xử lý background trong suốt cho các section con
    <div className="relative min-h-screen selection:bg-blue-200 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100 jira-landing-override">
      
      {/* === BACKGROUND LAYER (Cố định, không cuộn) === */}
      <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
        
        {/* 1. Dot Pattern Mesh */}
        <div className="absolute inset-0 bg-jira-mesh opacity-100" />

        {/* 2. Gradient Orbs (Luồng sáng Jira) */}
        {/* Top Right - Blue/Cyan Primary */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full 
                      bg-gradient-to-br from-blue-400/20 to-cyan-300/20 
                      dark:from-blue-600/15 dark:to-cyan-500/10 
                      blur-[120px] animate-pulse-slow" />
        
        {/* Bottom Left - Purple/Indigo Secondary */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full 
                      bg-gradient-to-tr from-indigo-400/20 to-purple-300/20 
                      dark:from-indigo-600/15 dark:to-purple-500/10 
                      blur-[100px] animate-pulse-slow" 
             style={{ animationDelay: "2s" }} />

        {/* Center Hint - Subtle Glow */}
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] 
                      bg-blue-300/10 dark:bg-blue-800/5 
                      blur-[80px] rounded-full" />
      </div>

      {/* === MAIN CONTENT === */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <LandingHeader
          onLoginClick={handleLoginClick}
          onRegisterClick={handleRegisterClick}
        />
        
        <main className="flex-grow space-y-12 md:space-y-20">
          <HeroSection onRegisterClick={handleRegisterClick} />
          <FeaturesSection />
          <PricingSection onRegisterClick={handleRegisterClick} />
          <TestimonialSection />
        </main>
        
        <LandingFooter />
      </div>

      {/* === MODALS === */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
      <Chatbot />
    </div>
  );
}