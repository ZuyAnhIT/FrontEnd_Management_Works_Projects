"use client";

import { useState } from "react";
import AuthModal from "@/components/features/auth/AuthModal";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "react-i18next";

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
    <div
      className="
    min-h-screen 
    scroll-smooth
    bg-gradient-to-b from-white via-blue-50/40 to-white
    dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-950 dark:to-slate-900
  "
    >

      <LandingHeader
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
      />

      <main>
        <HeroSection onRegisterClick={handleRegisterClick} />
        <FeaturesSection />
        <PricingSection onRegisterClick={handleRegisterClick} />
        <TestimonialSection />
      </main>

      <LandingFooter />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}
