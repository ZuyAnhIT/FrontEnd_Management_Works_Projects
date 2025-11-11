"use client";

import { useState } from "react";
import AuthModal from "@/components/features/auth/AuthModal";
import { useToast } from "@/components/ui/ToastProvider";

// 1. Import các section đã được tách ra
import LandingHeader from "@/components/features/landing/LandingHeader";
import HeroSection from "@/components/features/landing/HeroSection";
import FeaturesSection from "@/components/features/landing/FeaturesSection";
import PricingSection from "@/components/features/landing/PricingSection";
import TestimonialSection from "@/components/features/landing/TestimonialSection";
import LandingFooter from "@/components/features/landing/LandingFooter";

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { showToast } = useToast();

  const handleRegisterClick = () => {
    setIsAuthOpen(true);
    showToast("Bắt đầu hành trình của bạn!", "info");
  };

  const handleLoginClick = () => {
    setIsAuthOpen(true);
  };

  return (
    // Thêm scroll-smooth để các link anchor (a href="#...") cuộn mượt
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white scroll-smooth">
      {/* Lắp ráp các component con */}
      <LandingHeader
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
      />

      {/* Bọc các section trong <main> để đúng ngữ nghĩa HTML */}
      <main>
        <HeroSection onRegisterClick={handleRegisterClick} />
        <FeaturesSection />
        <PricingSection onRegisterClick={handleRegisterClick} />
        <TestimonialSection />
      </main>

      <LandingFooter />

      {/* Modal được kiểm soát ở trang cao nhất */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
