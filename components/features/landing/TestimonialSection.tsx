"use client";

import { motion } from "framer-motion"; // 1. Import motion

export default function TestimonialSection() {
  return (
    // 2. Bọc section bằng motion.section
    <motion.section
      id="gioi-thieu"
      className="py-20 bg-white text-center border-t border-gray-100 scroll-mt-24"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Vì sao chọn WorkNet?
      </h2>
      <p className="max-w-2xl mx-auto text-gray-600 text-lg mb-10">
        WorkNet không chỉ là công cụ quản lý — mà là{" "}
        <b>nền tảng kết nối đội ngũ</b>, giúp bạn tập trung vào điều quan
        trọng nhất: hiệu quả công việc.
      </p>
      
      {/* 3. Thêm hiệu ứng cho thẻ testimonial */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} // Hiệu ứng ease-out-circ
        viewport={{ once: true, amount: 0.5 }}
        className="mx-auto max-w-3xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-8 shadow-lg hover:scale-[1.02] transition-transform duration-300"
      >
        <p className="text-lg font-medium mb-4">
          “Nhờ WorkNet, nhóm tôi tiết kiệm được 30% thời gian họp và tăng tiến
          độ dự án rõ rệt.”
        </p>
        <p className="text-sm font-light">— CEO, TechCorp</p>
      </motion.div>
    </motion.section>
  );
}