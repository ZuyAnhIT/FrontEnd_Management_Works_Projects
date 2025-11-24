"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TestimonialSection() {
  const { t } = useTranslation();

  return (
    <motion.section
      id="about"
      className="
        py-24 text-center scroll-mt-24
        bg-white dark:bg-slate-900
        border-t border-slate-100 dark:border-slate-700
        transition-colors duration-300
      "
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
        {t("testimonial.heading")}
      </h2>

      <p
        className="
          max-w-2xl mx-auto text-slate-500 dark:text-slate-300 
          text-lg mb-12 leading-relaxed
        "
        dangerouslySetInnerHTML={{
          __html: t("testimonial.description"),
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, amount: 0.5 }}
        className="
          mx-auto max-w-3xl p-10 rounded-2xl shadow-sm relative
          bg-blue-50 dark:bg-slate-800
          border border-blue-100 dark:border-slate-700
          transition-colors duration-300
        "
      >
        {/* Quote Icon */}
        <div className="absolute top-6 left-6 opacity-10">
          <Quote className="w-12 h-12 text-blue-600 dark:text-blue-300" />
        </div>

        {/* Quote Text */}
        <p className="
            text-xl font-medium mb-6 italic relative z-10
            text-slate-800 dark:text-slate-100
          ">
          {t("testimonial.quote")}
        </p>

        {/* Avatar + Info */}
        <div className="flex items-center justify-center gap-3">
          <div className="
              w-8 h-8 rounded-full flex items-center justify-center 
              bg-blue-200 dark:bg-blue-900
              text-blue-700 dark:text-blue-300 
              font-bold text-xs
            ">
            {t("testimonial.initial")}
          </div>

          <div className="text-left">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {t("testimonial.role")}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("testimonial.company")}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
