"use client"; // Cần 'use client' vì Framer Motion dùng hook

import { Users, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion"; // 1. Import motion

const features = [
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Work together efficiently and quickly.",
  },
  {
    icon: Zap,
    title: "Smart Automation",
    desc: "Reduce manual tasks and save time.",
  },
  {
    icon: Shield,
    title: "Top-tier Security",
    desc: "Your data is encrypted and fully protected.",
  },
];

export default function FeaturesSection() {
  return (
    // 2. Bọc section bằng motion.section
    <motion.section
      id="features"
      className="py-24 px-6 bg-white text-center scroll-mt-24"
      // 3. Định nghĩa hiệu ứng cho section
      initial={{ opacity: 0, y: 50 }} // Trạng thái ban đầu (ẩn, ở dưới)
      whileInView={{ opacity: 1, y: 0 }} // Trạng thái khi lọt vào màn hình (hiện, ở vị trí 0)
      transition={{ duration: 0.5, ease: "easeInOut" }}
      viewport={{ once: true, amount: 0.3 }} // Chạy 1 lần, khi 30% section lọt vào
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-10">
        Key Features
      </h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map(({ icon: Icon, title, desc }, i) => (
          // 4. Thêm hiệu ứng so le cho từng thẻ
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }} // <-- Delay so le
            viewport={{ once: true, amount: 0.5 }}
            className="p-6 bg-gradient-to-b from-white to-blue-50 rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1"
          >
            <Icon className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 text-sm">{desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}