"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface PricingSectionProps {
  onRegisterClick: () => void;
}

export default function PricingSection({ onRegisterClick }: PricingSectionProps) {
  const { t } = useTranslation();

  const plans = [
    {
      key: "free",
      price: "$0",
      period: "",
      popular: false
    },
    {
      key: "pro",
      price: "$9",
      period: "/mo",
      popular: true
    },
    {
      key: "enterprise",
      price: "Contact",
      period: "",
      popular: false
    }
  ];

  return (
    <motion.section
      id="pricing"
      className="
        py-24 text-center scroll-mt-24
        bg-slate-50 dark:bg-slate-900 
        transition-colors duration-300
      "
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        {t("pricing.heading")}
      </h2>

      <p className="text-slate-500 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
        {t("pricing.subheading")}
      </p>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">

        {plans.map((plan, i) => {
          const name = t(`pricing.plans.${plan.key}.name`);
          const desc = t(`pricing.plans.${plan.key}.desc`);
          const features = t(`pricing.plans.${plan.key}.features`, {
            returnObjects: true,
          }) as string[];

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true, amount: 0.5 }}
              className={`
                relative p-8 rounded-xl border flex flex-col transition-all duration-300
                ${
                  plan.popular
                    ? "bg-white dark:bg-slate-800 border-blue-600 shadow-xl scale-105 z-10 ring-1 ring-blue-600"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500"
                }
              `}
            >
              {plan.popular && (
                <div className="
                  absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 
                  bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold 
                  uppercase tracking-wider shadow-sm
                ">
                  {t("pricing.plans.pro.popularBadge")}
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {name}
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-300 mb-6">
                {desc}
              </p>

              <div className="flex items-baseline justify-center mb-6">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-slate-500 dark:text-slate-300 ml-1">
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1 text-left">
                {features.map((f, j) => (
                  <li
                    key={j}
                    className="
                      flex items-center gap-3 
                      text-slate-700 dark:text-slate-300 text-sm
                    "
                  >
                    <div
                      className={`
                        p-0.5 rounded-full
                        ${
                          plan.popular
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                        }
                      `}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onRegisterClick}
                className={`
                  w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200
                  ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }
                `}
              >
                {plan.price === "Contact"
                  ? t("pricing.ctaContact")
                  : t("pricing.ctaTrial")}
              </button>
            </motion.div>
          );
        })}

      </div>
    </motion.section>
  );
}
