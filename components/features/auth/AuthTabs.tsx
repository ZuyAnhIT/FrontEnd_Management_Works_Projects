"use client";

// =============================================================================
// 1. INTERFACES & TYPES
// =============================================================================

// Định nghĩa các chế độ tab được phép trong component này
type AuthTabMode = "login" | "register";

interface AuthTabsProps {
  tab: string; // Nhận string chung từ parent (có thể là verify/forgot)
  setTab: (t: any) => void; // Hàm setTab từ parent
}

// Cấu hình danh sách các tab hiển thị
const TAB_ITEMS = [
  { id: "login", label: "Log In" },
  { id: "register", label: "Sign Up" },
] as const;

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function AuthTabs({ tab, setTab }: AuthTabsProps) {
  return (
    // Container chứa các tab (Nền xám nhạt, bo góc)
    <div className="flex gap-1 mb-6 bg-slate-100 rounded-lg p-1">
      {TAB_ITEMS.map((item) => {
        // Kiểm tra tab nào đang active
        const isActive = tab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`
              flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm font-semibold" // Style khi Active (Nền trắng, chữ xanh)
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50" // Style khi Inactive (Chữ xám)
              }
            `}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}