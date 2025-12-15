"use client";

import { Check, X } from "lucide-react";
import { useMemo } from "react";

// =============================================================================
// 1. INTERFACES & CONFIG
// =============================================================================

interface PasswordStrengthMeterProps {
    password: string;
}

// Các tiêu chí đánh giá (Requirements)
const requirementsConfig = [
    { regex: /.{6,}/, label: "At least 6 characters" },
    { regex: /[A-Z]/, label: "Uppercase letters (A-Z)" },
    { regex: /[a-z]/, label: "Lowercase letters (a-z)" },
    { regex: /[0-9]/, label: "Numbers (0-9)" },
    { regex: /[^A-Za-z0-9]/, label: "Special characters (!@#...)" },
];

// Cấu hình màu sắc và text dựa trên điểm số (0 - 5)
const getStrengthStyles = (score: number) => {
    if (score === 0) return { color: "bg-slate-200", label: "Empty", text: "text-slate-400" };
    if (score <= 2) return { color: "bg-red-500", label: "Weak", text: "text-red-600" };
    if (score <= 3) return { color: "bg-orange-500", label: "Medium", text: "text-orange-600" };
    if (score <= 4) return { color: "bg-blue-500", label: "Good", text: "text-blue-600" };
    return { color: "bg-green-500", label: "Very Strong", text: "text-green-600" };
};

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
    
    // Tính toán điểm số (0 - 5)
    const strength = useMemo(() => {
        if (!password) return 0;
        let score = 0;
        requirementsConfig.forEach((req) => {
            if (req.regex.test(password)) score++;
        });
        return score;
    }, [password]);

    const style = getStrengthStyles(strength);

    // Tính toán số vạch cần tô màu (từ 0 đến 4)
    const activeSteps = useMemo(() => {
        if (strength === 5) return 4;
        if (strength === 4) return 3;
        if (strength === 3) return 2;
        if (strength >= 1) return 1;
        return 0;
    }, [strength]);


    return (
        <div className="space-y-3 mt-2">
            {/* Thanh Progress (Dạng 4 đoạn) */}
            <div className="flex gap-1 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                            // Tô màu nếu step hiện tại nhỏ hơn hoặc bằng số vạch cần tô
                            step <= activeSteps
                                ? style.color
                                : "bg-slate-200"
                        }`}
                    />
                ))}
            </div>

            {/* Label độ mạnh */}
            <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Password Strength
                </span>
                <span className={`text-xs font-bold ${style.text}`}>
                    {style.label}
                </span>
            </div>

            {/* Checklist yêu cầu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {requirementsConfig.map((req, index) => {
                    const isMet = req.regex.test(password);
                    return (
                        <div
                            key={index}
                            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                                isMet ? "text-green-600" : "text-slate-400"
                            }`}
                        >
                            {isMet ? (
                                <Check className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                            )}
                            <span>{req.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}