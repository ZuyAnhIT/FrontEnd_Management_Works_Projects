"use client";

import { LucideIcon } from "lucide-react";

// =============================================================================
// 1. CONSTANTS & INTERFACES
// =============================================================================

interface WeeklyStatCardProps {
    title: string;
    count: number;
    icon: LucideIcon;
    color: "blue" | "green" | "orange" | "red";
    onClick?: () => void;
    isActive?: boolean;
}

const COLOR_STYLES = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    red: "bg-red-50 text-red-600 border-red-200",
};

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function WeeklyStatCard({ 
    title, 
    count, 
    icon: Icon, 
    color, 
    onClick, 
    isActive 
}: WeeklyStatCardProps) {

    // Xác định style động
    const cardStyle = COLOR_STYLES[color];
    const activeClass = isActive 
        ? "ring-2 ring-blue-300 shadow-lg border-blue-300" // Ring xanh khi active
        : "hover:shadow-lg hover:border-slate-300"; // Hiệu ứng hover

    return (
        <div 
            onClick={onClick}
            className={`bg-white p-4 rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 ${activeClass}`}
        >
            <div className="flex items-start justify-between">
                
                {/* Text Content */}
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{count}</h3>
                </div>
                
                {/* Icon Badge */}
                <div className={`p-3 rounded-lg ${cardStyle}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}