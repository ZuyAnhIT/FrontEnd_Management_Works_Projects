"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion"; // 1. Import motion

const plans = [
  {
    name: "Miễn Phí",
    price: "0₫",
    period: "",
    desc: "Hoàn hảo để bắt đầu",
    features: [
      "Tối đa 5 thành viên",
      "3 dự án",
      "1 GB lưu trữ",
      "Hỗ trợ cơ bản",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "199,000₫",
    period: "tháng",
    desc: "Cho đội nhóm chuyên nghiệp",
    features: [
      "Không giới hạn thành viên",
      "Không giới hạn dự án",
      "100 GB lưu trữ",
      "Hỗ trợ ưu tiên 24/7",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Liên hệ",
    period: "",
    desc: "Giải pháp doanh nghiệp",
    features: [
      "Tùy chỉnh hoàn toàn",
      "Bảo mật nâng cao",
      "Lưu trữ không giới hạn",
      "Hỗ trợ chuyên biệt",
    ],
    popular: false,
  },
];

interface PricingSectionProps {
  onRegisterClick: () => void;
}

export default function PricingSection({
  onRegisterClick,
}: PricingSectionProps) {
  return (
    // 2. Bọc section bằng motion.section
    <motion.section
      id="goi-dich-vu"
      className="py-24 bg-gradient-to-b from-blue-50/40 to-white text-center scroll-mt-24"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-12">Gói dịch vụ</h2>
      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
        {plans.map((plan, i) => (
          // 3. Thêm hiệu ứng so le cho từng thẻ
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true, amount: 0.5 }}
            className={`relative p-8 rounded-2xl shadow-lg border 
                       transition-transform duration-300 ease-in-out 
                       transform hover:scale-105 ${
                         plan.popular
                           ? "bg-gradient-to-b from-blue-500 to-cyan-500 text-white scale-105"
                           : // Thêm ease-in-out cho thẻ thường
                             "bg-white text-gray-900 border-gray-200 hover:border-blue-300"
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
              <span className="text-base font-normal opacity-80">
                {plan.period}
              </span>
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
              onClick={onRegisterClick}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                plan.popular
                  ? "bg-white text-blue-600 hover:bg-gray-50"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90"
              }`}
            >
              Dùng thử ngay
            </button>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
