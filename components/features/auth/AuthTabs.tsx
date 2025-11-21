"use client";

interface AuthTabsProps {
  tab: "login" | "register";
  setTab: (t: "login" | "register") => void;
}

export default function AuthTabs({ tab, setTab }: AuthTabsProps) {
  return (
    // Container chứa các tab (Nền xám nhạt, bo góc)
    <div className="flex gap-1 mb-6 bg-slate-100 rounded-lg p-1">
      {["login", "register"].map((t) => {
        // Kiểm tra tab nào đang active
        const isActive = tab === t;
        
        return (
          <button
            key={t}
            onClick={() => setTab(t as "login" | "register")}
            className={`
              flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm font-semibold" // Style khi Active (Nền trắng, chữ xanh)
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50" // Style khi Inactive (Chữ xám)
              }
            `}
          >
            {/* Nội dung hiển thị Tiếng Anh */}
            {t === "login" ? "Log in" : "Sign up"}
          </button>
        );
      })}
    </div>
  );
}