"use client";

import {
    Users,
    FolderKanban,
    CreditCard,
    Building2,
    UserPlus,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Giả định AuthContext đã tồn tại
import { Button } from "@/components/ui/Button"; // Giả định Button component đã tồn tại

// =================================================================
// 1. CONFIG: Action Links (Chuyển sang Tiếng Anh)
// =================================================================
const actionLinks = [
    {
        icon: Building2,
        title: "Company Profile",
        desc: "Update name, logo, and address details.",
        href: "/admin/company/companyinfo",
        variant: "blue",
    },
    {
        icon: Users,
        title: "Member Management",
        desc: "Invite, remove, or change member roles.",
        href: "/admin/company/members",
        variant: "green",
    },
    {
        icon: FolderKanban,
        title: "Workspaces",
        desc: "Create and manage department workspaces.",
        href: "/admin/company/workspaces",
        variant: "purple",
    },
    {
        icon: CreditCard,
        title: "Billing & Plan",
        desc: "View payment history and manage subscription.",
        href: "/admin/company/billing",
        variant: "orange",
    },
];

// 2. Style Map cho các icon (Màu nền & Màu chữ)
const variantStyles: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    green: "bg-green-50 text-green-600 group-hover:bg-green-100",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
    orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-100",
};

// =================================================================
// 3. MAIN COMPONENT
// =================================================================

export default function CompanyDashboardPage() {
    // Lấy user và activeCompany từ AuthContext
    const { user, activeCompany } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-900">
            {/* --- HEADER SECTION --- */}
            <div className="max-w-5xl mx-auto mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Dashboard:{" "}
                    <span className="text-blue-600">
                        {activeCompany?.companyName || "My Company"}
                    </span>
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Welcome back, {user?.fullName}. Manage your organization from here.
                </p>
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
                {/* --- CTA BANNER (Mời thành viên nhanh) --- */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                            <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Grow your team
                            </h2>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Start collaborating by inviting new members to your company.
                            </p>
                        </div>
                    </div>

                    <Link href="/admin/company/members" passHref>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-5 shadow-sm rounded-[3px]">
                            Invite Members
                        </Button>
                    </Link>
                </div>
                

                {/* --- QUICK ACTIONS GRID (Các nút điều hướng) --- */}
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {actionLinks.map((item) => {
                            // Lấy style class dựa trên variant
                            const styleClass =
                                variantStyles[item.variant] || variantStyles.blue;

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="group flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                                >
                                    {/* Icon Box */}
                                    <div
                                        className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${styleClass}`}
                                    >
                                        <item.icon className="w-6 h-6" />
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {item.title}
                                            </h3>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                            {item.desc}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}