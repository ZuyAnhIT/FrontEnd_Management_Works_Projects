"use client";
import { useRouter } from "next/navigation";
import { User, Shield, Settings, LogOut } from "lucide-react";
import { useEffect } from "react";

interface UserMenuProps {
    user: {
        name: string;
        email: string;
    };
    onClose: () => void;
    onLogout: () => void;
}

export default function UserMenu({ user, onClose, onLogout }: UserMenuProps) {
    // Đóng menu khi click ngoài
     const router = useRouter();
      const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };
    useEffect(() => {
        const handleClickOutside = () => onClose();
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [onClose]);

    return (
        
        <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20"
        >
            <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-medium text-gray-900">{user?.name}</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
            </div>

            <button onClick={() => handleNavigate("/admin/company/settings/profile")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Thông tin cá nhân</span>
            </button>

            <button onClick={() => handleNavigate("/admin/company/settings/account")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Đổi mật khẩu</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left">
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Light/Dark</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left">
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Vn/En</span>
            </button>

            <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left text-red-600"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
}
