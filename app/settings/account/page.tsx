"use client";
import { useState } from "react";
import { changeUserPassword } from "@/services/apiUser";
import { useToast } from "@/components/ui/ToastProvider";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import LoadingButton from "@/components/ui/LoadingButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter"; // 1. Import

// Tách PasswordInput ra component con
function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-900">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="pr-10 h-10 border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.oldPassword || !form.newPassword || !form.confirmNewPassword) {
      showToast("Please fill in all fields.", "warning");
      return;
    }
    if (form.newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "warning");
      return;
    }
    if (form.newPassword !== form.confirmNewPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    try {
      setIsLoading(true);
      await changeUserPassword(form);
      showToast("Password changed successfully!", "success");
      setForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err: any) {
      showToast(err.message || "Failed to change password.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
      
      <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
        
        {/* Header */}
        <CardHeader className="border-b border-slate-100 px-8 py-6 bg-white">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center shadow-sm">
                 <KeyRound className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                 <CardTitle className="text-lg font-bold text-slate-900">Change Password</CardTitle>
                 <p className="text-sm text-slate-500 mt-0.5">
                    Update your password to keep your account secure.
                 </p>
              </div>
           </div>
        </CardHeader>

        {/* Body */}
        <CardContent className="p-8">
           <form onSubmit={handleSubmit} className="space-y-6">
              
              <PasswordInput
                label="Current Password"
                value={form.oldPassword}
                onChange={(e) => handleChange("oldPassword", e.target.value)}
                placeholder="Enter current password"
              />

              <div className="h-px bg-slate-100 my-2"></div>

              {/* Mật khẩu mới + Meter */}
              <div className="space-y-4">
                 <PasswordInput
                    label="New Password"
                    value={form.newPassword}
                    onChange={(e) => handleChange("newPassword", e.target.value)}
                    placeholder="Enter new password"
                 />
                 
                 {/* 2. 🔥 Thêm Password Strength Meter */}
                 <PasswordStrengthMeter password={form.newPassword} />
              </div>

              <PasswordInput
                label="Confirm Password"
                value={form.confirmNewPassword}
                onChange={(e) => handleChange("confirmNewPassword", e.target.value)}
                placeholder="Re-enter new password"
              />

              {/* Footer Actions */}
              <div className="pt-6 flex justify-end">
                 <LoadingButton
                    type="submit"
                    isLoading={isLoading}
                    text="Change Password"
                    loadingText="Updating..."
                    className="bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-sm"
                 />
              </div>

           </form>
        </CardContent>
      </Card>
    </div>
  );
}