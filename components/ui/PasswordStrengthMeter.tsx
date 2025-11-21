"use client";

import { Check, X } from "lucide-react";
import { useMemo } from "react";

interface PasswordStrengthMeterProps {
  password: string;
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  // Các tiêu chí đánh giá
  const requirements = [
    { regex: /.{6,}/, label: "Ít nhất 6 ký tự" },
    { regex: /[A-Z]/, label: "Chữ in hoa (A-Z)" },
    { regex: /[a-z]/, label: "Chữ thường (a-z)" },
    { regex: /[0-9]/, label: "Số (0-9)" },
    { regex: /[^A-Za-z0-9]/, label: "Ký tự đặc biệt (!@#...)" },
  ];

  // Tính toán điểm số
  const strength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    requirements.forEach((req) => {
      if (req.regex.test(password)) score++;
    });
    return score;
  }, [password]);

  // Cấu hình màu sắc và text dựa trên điểm số (0 - 5)
  const getStrengthStyles = (score: number) => {
    if (score === 0) return { color: "bg-slate-200", label: "Trống", text: "text-slate-400" };
    if (score <= 2) return { color: "bg-red-500", label: "Yếu", text: "text-red-600" };
    if (score <= 3) return { color: "bg-orange-500", label: "Trung bình", text: "text-orange-600" };
    if (score <= 4) return { color: "bg-blue-500", label: "Tốt", text: "text-blue-600" };
    return { color: "bg-green-500", label: "Rất mạnh", text: "text-green-600" };
  };

  const style = getStrengthStyles(strength);

  return (
    <div className="space-y-3 mt-2">
      {/* Thanh Progress (Dạng 4 đoạn) */}
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex-1 rounded-full transition-all duration-300 ${
              // Logic: Nếu điểm >= step hiện tại, hoặc nếu điểm > 4 (max) thì tô màu
              // Tuy nhiên để đơn giản: 
              // Score 1-2: 1 vạch đỏ
              // Score 3: 2 vạch cam
              // Score 4: 3 vạch xanh dương
              // Score 5: 4 vạch xanh lá
              step <= (strength === 5 ? 4 : strength === 4 ? 3 : strength === 3 ? 2 : strength >= 1 ? 1 : 0)
                ? style.color
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Label độ mạnh */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Độ mạnh mật khẩu
        </span>
        <span className={`text-xs font-bold ${style.text}`}>
          {style.label}
        </span>
      </div>

      {/* Checklist yêu cầu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {requirements.map((req, index) => {
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