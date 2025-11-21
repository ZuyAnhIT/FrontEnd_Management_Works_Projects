"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react"; // Added Quote icon for style

export default function TestimonialSection() {
  return (
    <motion.section
      id="about"
      className="py-24 bg-white text-center border-t border-slate-100 scroll-mt-24"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <h2 className="text-3xl font-bold text-slate-900 mb-6">
        Why choose WorkNet?
      </h2>
      <p className="max-w-2xl mx-auto text-slate-500 text-lg mb-12 leading-relaxed">
        WorkNet is not just a management tool — it is a{" "}
        <strong className="text-slate-900 font-semibold">team connection platform</strong> that helps you focus on what
        matters most: work efficiency.
      </p>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, amount: 0.5 }}
        // Optimized UI: Pastel background, dark text, flat design
        className="mx-auto max-w-3xl bg-blue-50 border border-blue-100 rounded-2xl p-10 shadow-sm relative"
      >
        {/* Quote Icon */}
        <div className="absolute top-6 left-6 opacity-10">
            <Quote className="w-12 h-12 text-blue-600" />
        </div>

        <p className="text-xl font-medium text-slate-800 mb-6 relative z-10 italic">
          “Thanks to WorkNet, my team saved 30% of meeting time and significantly improved project progress.”
        </p>
        
        <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                C
            </div>
            <div className="text-left">
                <p className="text-sm font-bold text-slate-900">CEO</p>
                <p className="text-xs text-slate-500">TechCorp</p>
            </div>
        </div>
      </motion.div>
    </motion.section>
  );
}