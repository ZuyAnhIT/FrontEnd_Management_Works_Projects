"use client";

import { ArrowRight, Star, ChevronDown } from "lucide-react";

interface HeroSectionProps {
  onRegisterClick: () => void;
}

export default function HeroSection({ onRegisterClick }: HeroSectionProps) {
  return (
    <section className="relative py-28 px-4 text-center overflow-hidden">
      {/* Nền mờ ảo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-24 right-1/3 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-5xl mx-auto animate-fadeIn">
        {/* Social Proof */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-6 shadow-sm animate-fadeInUp">
          <Star className="w-4 h-4 fill-current" />
          10.000+ đội nhóm đang dùng WorkNet
        </div>

        {/* Tiêu đề chính */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 animate-slideUp">
          Quản lý dự án{" "}
          <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
            dễ dàng & thông minh
          </span>
        </h1>

        {/* Mô tả */}
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-fadeInUp delay-150">
          WorkNet giúp bạn tổ chức công việc, theo dõi tiến độ và cộng tác hiệu
          quả — tất cả trong một nền tảng.
        </p>

        {/* Nút Kêu gọi Hành động (CTA) */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fadeInUp delay-200">
          <button
            onClick={onRegisterClick}
            className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold text-lg 
                       shadow-lg shadow-cyan-500/30
                       hover:shadow-2xl hover:shadow-cyan-400/50 
                       hover:scale-[1.03]
                       transition-all duration-300 ease-in-out 
                       flex items-center justify-center gap-2"
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
  );
}
