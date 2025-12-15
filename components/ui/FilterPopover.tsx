"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface Option {
    label: string;       // Tên hiển thị (e.g., John Doe)
    value: string | number; // Giá trị để lọc (e.g., userId: 123)
    icon?: React.ReactNode; // Icon hoặc Avatar
    color?: string; // Màu sắc (nếu có, dùng cho badge)
}

interface FilterPopoverProps {
    label: string;       // Tên bộ lọc (e.g., Assignee)
    icon: React.ReactNode; // Icon chính của bộ lọc (e.g., User icon)
    options: Option[];
    value?: string | number; // Giá trị đang chọn
    onChange: (val: any) => void;
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function FilterPopover({ label, icon, options, value, onChange }: FilterPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Đóng menu khi click ra ngoài (Logic nghiệp vụ quan trọng)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Tìm option đang được chọn để hiển thị
    const selectedOption = options.find((opt) => opt.value === value);
    // isActive: Coi là active nếu giá trị khác undefined VÀ không phải là giá trị "ALL"
    const isActive = value !== undefined && value !== "ALL";

    return (
        <div className="relative" ref={containerRef}>
            {/* Nút kích hoạt */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 shrink-0
                ${isActive
                        ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    }
                `}
                title={isActive ? `Filter by: ${selectedOption?.label}` : `Filter by ${label}`}
            >
                {/* Icon của bộ lọc */}
                <span className={isActive ? "text-blue-600" : "text-slate-400"}>{icon}</span>

                {/* Text hiển thị: Nếu đã chọn thì hiện tên lựa chọn, chưa thì hiện Label */}
                <span className="truncate max-w-[100px]">
                    {isActive ? selectedOption?.label : label}
                </span>

                {/* Nút Xóa hoặc Mũi tên */}
                {isActive ? (
                    <span
                        onClick={(e) => {
                            e.stopPropagation(); // Tránh mở lại menu
                            onChange(undefined); // Clear filter
                        }}
                        className="p-0.5 hover:bg-blue-200 rounded-full cursor-pointer"
                        title="Clear Filter"
                    >
                        <X className="w-3 h-3" />
                    </span>
                ) : (
                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                )}
            </button>

            {/* Menu thả xuống */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 overflow-hidden origin-top-left">
                    <div className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
                        {/* Option "All" */}
                        <button
                            onClick={() => { onChange("ALL"); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-600 flex items-center justify-between group"
                        >
                            <span>All {label}s</span>
                            {/* Checkmark nếu giá trị đang là undefined hoặc "ALL" */}
                            {(!isActive || value === "ALL") && <Check className="w-4 h-4 text-blue-600" />}
                        </button>

                        <div className="h-px bg-slate-100 my-1" />

                        {/* List Options */}
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700 flex items-center justify-between group transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Hiển thị Icon/Avatar/Màu sắc trong menu */}
                                    {opt.icon ? (
                                        <span className="shrink-0">{opt.icon}</span>
                                    ) : opt.color ? (
                                        <span className={`w-2.5 h-2.5 rounded-full ${opt.color} shrink-0`} />
                                    ) : null}

                                    <span>{opt.label}</span>
                                </div>

                                {/* Checkmark nếu đang chọn */}
                                {value === opt.value && <Check className="w-4 h-4 text-blue-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}