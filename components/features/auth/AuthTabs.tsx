"use client";

export default function AuthTabs({
  tab,
  setTab,
}: {
  tab: "login" | "register";
  setTab: (t: "login" | "register") => void;
}) {
  return (
    <div className="flex gap-2 mb-5 bg-gray-100 rounded-lg p-1">
      {["login", "register"].map((t) => (
        <button
          key={t}
          onClick={() => setTab(t as "login" | "register")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
            tab === t
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {t === "login" ? "Đăng nhập" : "Đăng ký"}
        </button>
      ))}
    </div>
  );
}
