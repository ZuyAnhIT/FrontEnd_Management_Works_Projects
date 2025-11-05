"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Users,
  Zap,
  Shield,
  Star,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import AuthModal from "@/components/features/auth/AuthModal";
import { useToast } from "@/components/ui/ToastProvider";

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { showToast } = useToast();

  // 🧩 Map thủ công để đảm bảo ID không có dấu
  const sectionMap: Record<string, string> = {
    "Tính năng": "tinh-nang",
    "Gói dịch vụ": "goi-dich-vu",
    "Giới thiệu": "gioi-thieu",
  };

  const features = [
    { icon: Users, title: "Cộng tác nhóm", desc: "Làm việc cùng nhau hiệu quả và nhanh chóng." },
    { icon: Zap, title: "Tự động hóa thông minh", desc: "Giảm thao tác thủ công, tiết kiệm thời gian." },
    { icon: Shield, title: "Bảo mật hàng đầu", desc: "Dữ liệu của bạn được mã hóa và bảo vệ tuyệt đối." },
  ];

  const plans = [
    {
      name: "Miễn Phí",
      price: "0₫",
      period: "",
      desc: "Hoàn hảo để bắt đầu",
      features: ["Tối đa 5 thành viên", "3 dự án", "1 GB lưu trữ", "Hỗ trợ cơ bản"],
      popular: false,
    },
    {
      name: "Pro",
      price: "199,000₫",
      period: "tháng",
      desc: "Cho đội nhóm chuyên nghiệp",
      features: ["Không giới hạn thành viên", "Không giới hạn dự án", "100 GB lưu trữ", "Hỗ trợ ưu tiên 24/7"],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Liên hệ",
      period: "",
      desc: "Giải pháp doanh nghiệp",
      features: ["Tùy chỉnh hoàn toàn", "Bảo mật nâng cao", "Lưu trữ không giới hạn", "Hỗ trợ chuyên biệt"],
      popular: false,
    },
  ];

  // 🧩 Cuộn mượt
  const scrollToSection = (label: string) => {
    const id = sectionMap[label];
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white scroll-smooth">
      {/* 🌐 Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 font-bold text-xl select-none cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-sm shadow-lg group-hover:scale-105 transition-transform">
              WN
            </div>
            <span className="text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
              WorkNet
            </span>
          </div>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            {Object.keys(sectionMap).map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="hover:text-blue-600 transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-5 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => {
                setIsAuthOpen(true);
                showToast("Bắt đầu hành trình của bạn!", "info");
              }}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-[1.03] transition-all"
            >
              Bắt đầu ngay
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-inner animate-fadeDown">
            <div className="px-4 py-4 space-y-3">
              {Object.keys(sectionMap).map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    scrollToSection(item);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  {item}
                </button>
              ))}
              <button
                onClick={() => setIsAuthOpen(true)}
                className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => {
                  setIsAuthOpen(true);
                  showToast("Bắt đầu hành trình của bạn!", "info");
                }}
                className="block w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold"
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 🚀 Hero */}
      <section className="relative py-28 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-24 right-1/3 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-5xl mx-auto animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-6 shadow-sm animate-fadeInUp">
            <Star className="w-4 h-4 fill-current" />
            10.000+ đội nhóm đang dùng WorkNet
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 animate-slideUp">
            Quản lý dự án{" "}
            <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              dễ dàng & thông minh
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-fadeInUp delay-150">
            WorkNet giúp bạn tổ chức công việc, theo dõi tiến độ và cộng tác hiệu quả — tất cả trong một nền tảng.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fadeInUp delay-200">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              Dùng thử miễn phí 14 ngày
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:border-blue-400 hover:text-blue-600 transition-all">
              Xem demo
            </button>
          </div>

          <ChevronDown className="w-6 h-6 mx-auto mt-12 text-gray-400 animate-bounce" />
        </div>
      </section>

      {/* ✨ Features */}
      <section id="tinh-nang" className="py-24 px-6 bg-white text-center scroll-mt-24">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">Tính năng nổi bật</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              className="p-6 bg-gradient-to-b from-white to-blue-50 rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <Icon className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 💰 Pricing */}
      <section id="goi-dich-vu" className="py-24 bg-gradient-to-b from-blue-50/40 to-white text-center scroll-mt-24">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Gói dịch vụ</h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-2xl shadow-lg border transition-all duration-300 transform hover:scale-105 ${
                plan.popular
                  ? "bg-gradient-to-b from-blue-500 to-cyan-500 text-white scale-105"
                  : "bg-white text-gray-900 border-gray-200 hover:border-blue-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-xs px-3 py-1 rounded-bl-lg font-semibold text-gray-900">
                  Phổ biến
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm opacity-80 mb-4">{plan.desc}</p>
              <div className="text-4xl font-extrabold mb-4">
                {plan.price}
                <span className="text-base font-normal opacity-80">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setIsAuthOpen(true)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? "bg-white text-blue-600 hover:bg-gray-50"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90"
                }`}
              >
                Dùng thử ngay
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 💬 Giới thiệu */}
      <section id="gioi-thieu" className="py-20 bg-white text-center border-t border-gray-100 scroll-mt-24">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Vì sao chọn WorkNet?</h2>
        <p className="max-w-2xl mx-auto text-gray-600 text-lg mb-10">
          WorkNet không chỉ là công cụ quản lý — mà là <b>nền tảng kết nối đội ngũ</b>,
          giúp bạn tập trung vào điều quan trọng nhất: hiệu quả công việc.
        </p>
        <div className="mx-auto max-w-3xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-8 shadow-lg hover:scale-[1.02] transition-transform duration-300">
          <p className="text-lg font-medium mb-4">
            “Nhờ WorkNet, nhóm tôi tiết kiệm được 30% thời gian họp và tăng tiến độ dự án rõ rệt.”
          </p>
          <p className="text-sm font-light">— CEO, TechCorp</p>
        </div>
      </section>

      {/* ⚡ Footer */}
      <footer className="py-10 bg-white border-t border-gray-100 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} WorkNet. Made with ❤️ in Germany 🇩🇪
      </footer>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
