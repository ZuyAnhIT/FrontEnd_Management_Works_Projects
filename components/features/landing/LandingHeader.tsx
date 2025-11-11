"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

// Định nghĩa các link điều hướng
const navLinks = [
  { label: "Tính năng", href: "#tinh-nang" },
  { label: "Gói dịch vụ", href: "#goi-dich-vu" },
  { label: "Giới thiệu", href: "#gioi-thieu" },
];

// Định nghĩa props để component nhận lệnh từ cha
interface LandingHeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function LandingHeader({
  onLoginClick,
  onRegisterClick,
}: LandingHeaderProps) {
  // State của mobile menu nằm gọn trong Header
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo trỏ về trang chủ */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl select-none group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-sm shadow-lg group-hover:scale-105 transition-transform">
            WN
          </div>
          <span className="text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
            WorkNet
          </span>
        </Link>

        {/* Desktop menu - Dùng thẻ <a> cho anchor link */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href} // Dùng href #...
              className="hover:text-blue-600 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onLoginClick}
            className="px-5 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Đăng nhập
          </button>
          <button
            onClick={onRegisterClick}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold 
                       shadow-md shadow-cyan-500/20 
                       hover:shadow-lg hover:shadow-cyan-400/40 
                       hover:scale-[1.03] 
                       transition-all duration-300 ease-in-out"
          >
            Bắt đầu ngay
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-blue-600"
          aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-inner">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)} // Đóng menu khi nhấn
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => {
                onLoginClick();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => {
                onRegisterClick();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold"
            >
              Bắt đầu ngay
            </button>
          </div>
        </div>
      )}
    </header>
  );
}