"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    desc: "Perfect to get started",
    features: [
      "Up to 5 members",
      "3 projects",
      "1 GB storage",
      "Basic support",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    desc: "For professional teams",
    features: [
      "Unlimited members",
      "Unlimited projects",
      "100 GB storage",
      "24/7 Priority support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Contact",
    period: "",
    desc: "For large organizations",
    features: [
      "Fully customizable",
      "Advanced security",
      "Unlimited storage",
      "Dedicated support",
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
    <motion.section
      id="pricing"
      className="py-24 bg-slate-50 text-center scroll-mt-24"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <h2 className="text-3xl font-bold text-slate-900 mb-4">
        Simple, transparent pricing
      </h2>
      <p className="text-slate-500 mb-12 max-w-2xl mx-auto">
        Choose the plan that's right for your team. No hidden fees.
      </p>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true, amount: 0.5 }}
            className={`relative p-8 rounded-xl border transition-all duration-300 ease-in-out flex flex-col
              ${
                plan.popular
                  ? "bg-white border-blue-600 shadow-xl scale-105 z-10 ring-1 ring-blue-600"
                  : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300"
              }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                Most Popular
              </div>
            )}

            <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
            <p className="text-sm text-slate-500 mb-6">{plan.desc}</p>
            
            <div className="flex items-baseline justify-center mb-6">
               <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
               <span className="text-slate-500 ml-1">{plan.period}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1 text-left">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-3 text-slate-700 text-sm">
                  <div className={`p-0.5 rounded-full ${plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Check className="w-3 h-3" />
                  </div>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={onRegisterClick}
              className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200
                ${
                  plan.popular
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                }`}
            >
              {plan.price === "Contact" ? "Contact Sales" : "Start free trial"}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}