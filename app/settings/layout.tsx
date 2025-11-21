"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock, ArrowLeft, Loader2, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Menu cho trang Cài đặt (Minimalist Icons)
const settingsNav = [
  {
    name: "Profile",
    href: "/settings/profile",
    icon: User,
  },
  {
    name: "Security",
    href: "/settings/account",
    icon: Lock,
  },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* 1. Top Bar Minimalist */}
      <header className="bg-white border-b border-slate-200 h-14 flex items-center px-6 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-4">
            <button
                onClick={() => router.back()}
                className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
                title="Go back"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-semibold">
                    {settingsNav.find(item => item.href === pathname)?.name || "General"}
                </span>
            </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 py-8">
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* 2. Sidebar Navigation (Vertical Tabs) */}
          <nav className="w-full md:w-64 shrink-0 space-y-1">
            <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Personal Settings
            </div>
            {settingsNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <item.icon
                    className={`w-4 h-4 ${
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* 3. Main Content Area */}
          <main className="flex-1 w-full min-w-0">
             {children}
          </main>

        </div>
      </div>
    </div>
  );
}