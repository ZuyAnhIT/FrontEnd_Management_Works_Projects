"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Components)
// =============================================================================

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Users,
  FolderKanban,
  CreditCard,
  Building2,
  UserPlus,
  ChevronRight,
} from "lucide-react";

// Context & Hooks
import { useAuth } from "@/context/AuthContext";

// UI Components
import { Button } from "@/components/ui/Buttons";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONFIG & TYPES
// =============================================================================

interface ActionLink {
  icon: React.ElementType;
  title: string;
  desc: string;
  href: string;
  variant: "blue" | "green" | "purple" | "orange";
}

/**
 * Ban do mau sac cho cac bieu tuong theo phong cach Atlassian
 */
const VARIANT_STYLES: Record<string, string> = {
  blue: "bg-blue-50 text-[#0052CC] group-hover:bg-blue-100",
  green: "bg-green-50 text-[#36B37E] group-hover:bg-green-100",
  purple: "bg-purple-50 text-[#6554C0] group-hover:bg-purple-100",
  orange: "bg-orange-50 text-[#FF8B00] group-hover:bg-orange-100",
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function CompanyDashboardPage() {
  // ---------------------------------------------------------------------------
  // 4. HOOKS & CONTEXT
  // ---------------------------------------------------------------------------
  
  const { user, activeCompany } = useAuth();

  // ---------------------------------------------------------------------------
  // 5. DATA PREPARATION
  // ---------------------------------------------------------------------------

  /**
   * Danh sach cac hanh dong nhanh duoc ghi nho de tranh render lai du thua
   */
  const actionLinks: ActionLink[] = useMemo(() => [
    {
      icon: Building2,
      title: "Company Profile",
      desc: "Update identity, branding, and corporate address.",
      href: "/admin/company/companyinfo",
      variant: "blue",
    },
    {
      icon: Users,
      title: "Member Directory",
      desc: "Manage access, roles, and invitation status.",
      href: "/admin/company/members",
      variant: "green",
    },
    {
      icon: FolderKanban,
      title: "Workspaces",
      desc: "Organize departments and specialized working groups.",
      href: "/admin/company/workspaces",
      variant: "purple",
    },
    {
      icon: CreditCard,
      title: "Billing & Plans",
      desc: "Monitor usage metrics and subscription history.",
      href: "/admin/company/billing",
      variant: "orange",
    },
  ], []);

  // ---------------------------------------------------------------------------
  // 6. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F4F5F7] py-10">
      <div className="max-w-5xl mx-auto px-6 space-y-10">
        
        {/* TIÊU ĐỀ TRANG (PAGE HEADER) */}
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase">
            Dashboard:{" "}
            <span className="text-[#0052CC]">
              {activeCompany?.companyName || "Organization"}
            </span>
          </h1>
          <p className="text-[#42526E] text-[14px] font-medium mt-1">
            Welcome back, <span className="font-bold">{user?.fullName}</span>. Access your administrative controls below.
          </p>
        </div>

        {/* KHỐI KÊU GỌI HÀNH ĐỘNG (GROW TEAM CTA) */}
        <div className="bg-white border border-[#DFE1E6] rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8 transition-all hover:shadow-md">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-[#0052CC] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
              <UserPlus className="w-7 h-7 text-white stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#172B4D] tracking-tight">
                Scale your workforce
              </h2>
              <p className="text-[#42526E] text-[14px] font-medium mt-0.5">
                Invite teammates to start collaborating on projects and tasks.
              </p>
            </div>
          </div>

          <Link href="/admin/company/members" passHref>
            <Button className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-black text-[12px] uppercase tracking-widest h-11 px-8 rounded-lg shadow-md active:scale-95 transition-all">
              Invite Members
            </Button>
          </Link>
        </div>

        {/* LƯỚI HÀNH ĐỘNG NHANH (QUICK ACTIONS GRID) */}
        <div className="space-y-6">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">
            Administrative Operations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actionLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-start gap-5 p-6 bg-white rounded-2xl border border-[#DFE1E6] hover:border-[#2684FF] hover:shadow-xl transition-all duration-300"
              >
                {/* Khoi bieu tuong (Icon Box) */}
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm",
                    VARIANT_STYLES[item.variant]
                  )}
                >
                  <item.icon className="w-7 h-7 stroke-[2.5]" />
                </div>

                {/* Noi dung van ban (Text Content) */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[16px] font-black text-[#172B4D] group-hover:text-[#0052CC] transition-colors tracking-tight">
                      {item.title}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#0052CC] group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[13px] text-[#42526E] font-medium mt-1.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}