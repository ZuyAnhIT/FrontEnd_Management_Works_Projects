"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

import PasswordField from "./PasswordField";
import LoadingButton from "@/components/ui/LoadingButton";
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";
import { resetPassword } from "@/services/apiAuth";

// =============================================================================
// 1. MAIN COMPONENT
// =============================================================================

export default function ResetPasswordForm() {
  // --- HOOKS ---
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- STATE ---
  const [token, setToken] = useState<string | null>(null);
  
  // Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  // Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status State
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // --- EFFECT: READ TOKEN ---
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setFeedback({ type: "error", message: "Invalid or missing reset token." });
    }
  }, [searchParams]);

  // --- HANDLER: SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // 1. Validate Basic
    if (!token) {
      setFeedback({ type: "error", message: "Token is missing." });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    // 2. Call API
    setLoading(true);
    try {
      const res = await resetPassword({
        token,
        newPassword,
      });

      // 3. Success
      setFeedback({ 
        type: "success", 
        message: res?.message || "Password has been reset successfully!" 
      });

      // Tự động chuyển về trang login sau 2s
      setTimeout(() => router.push("/"), 2000);

    } catch (error: any) {
      // 4. Error
      setFeedback({ 
        type: "error", 
        message: error.message || "Failed to reset password. Token may be expired." 
      });
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER: LOADING TOKEN ---
  if (!token && !feedback) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm font-medium animate-pulse">
        Verifying security token...
      </div>
    );
  }

  // --- RENDER: MAIN FORM ---
  return (
    <>
      {/* Header Minimalist */}
      <div className="bg-white border-b border-slate-100 px-6 py-8 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm mb-4">
          <KeyRound className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Reset Password
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Create a new strong password for your account.
        </p>
      </div>

      {/* Form Content */}
      <form className="p-6 space-y-5" onSubmit={handleSubmit}>
        
        {/* Field: New Password + Strength Meter */}
        <div className="space-y-3">
          <PasswordField
            label="New Password"
            value={newPassword}
            show={showPassword}
            toggle={() => setShowPassword(!showPassword)}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <PasswordStrengthMeter password={newPassword} />
        </div>

        {/* Field: Confirm Password */}
        <PasswordField
          label="Confirm Password"
          value={confirmNewPassword}
          show={showConfirm}
          toggle={() => setShowConfirm(!showConfirm)}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          placeholder="Re-enter password"
        />

        {/* Submit Button */}
        <div className="pt-2">
          <LoadingButton
            type="submit"
            isLoading={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 font-bold shadow-sm"
            text="Reset Password"
            loadingText="Resetting..."
          />
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-4 p-3 rounded-md flex items-start gap-3 text-sm font-medium border animate-in fade-in slide-in-from-top-1 ${
              feedback.type === "error"
                ? "bg-red-50 text-red-700 border-red-100"
                : "bg-green-50 text-green-700 border-green-100"
            }`}
          >
            {feedback.type === "error" ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </form>
    </>
  );
}