"use client"; 

import { Users, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

export default function FeaturesSection() {
  const { t } = useTranslation();
  const { theme } = useTheme(); 

  const features = [
    {
      icon: Users,
      title: t("features.teamCollabTitle"),
      desc: t("features.teamCollabDesc"),
    },
    {
      icon: Zap,
      title: t("features.smartAutoTitle"),
      desc: t("features.smartAutoDesc"),
    },
    {
      icon: Shield,
      title: t("features.securityTitle"),
      desc: t("features.securityDesc"),
    },
  ];

  return (
    <motion.section
      id="features"
      className="py-24 px-6 text-center scroll-mt-24 
                 bg-white dark:bg-slate-900 transition-colors duration-300"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10">
        {t("features.heading")}
      </h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true, amount: 0.5 }}
            className="
              p-6 rounded-2xl border transition-all duration-300 ease-in-out 
              bg-gradient-to-b from-white to-blue-50 
              dark:bg-gradient-to-b dark:from-slate-800 dark:to-slate-900
              border-gray-100 dark:border-slate-700
              hover:border-blue-300 dark:hover:border-blue-500
              hover:shadow-lg hover:-translate-y-1
            "
          >
            <Icon
              className="
                w-10 h-10 mx-auto mb-3 
                text-blue-500 dark:text-blue-400
              "
            />
            <h3
              className="
                text-lg font-semibold mb-2 
                text-gray-900 dark:text-white
              "
            >
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {desc}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
