"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  User, Mail, Building2, UserPlus, LogOut, CheckCircle2, 
  AlertTriangle, Loader2 
} from "lucide-react";

// Internal Contexts & Services
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { getInvitationDetails, acceptInvitation } from "@/services/apiInvitation";
import { registerFromInvite } from "@/services/apiAuth";

// UI Components
import AuthFormLogin from "./AuthFormLogin";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import { LoadingButton } from "@/components/ui/LoadingButton"; // Đã sửa lỗi import ở đây
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES
// =============================================================================

interface InviteDetails {
  email: string;
  companyName: string;
  accountExists: boolean;
}

interface FlowProps {
  details: InviteDetails;
  token: string;
}

// =============================================================================
// SUB-COMPONENT: NEW USER FLOW
// =============================================================================

/**
 * Quy trình dành cho người dùng mới (chưa có tài khoản).
 * Thiết lập hồ sơ cơ bản và mật khẩu để tham gia hệ thống.
 */
function NewUserFlow({ details, token }: FlowProps) {
  const { showToast } = useToast();
  const { loginWithTokens } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerFromInvite({
        fullName: form.fullName,
        password: form.password,
        invitationToken: token,
      });

      showToast("Account created successfully. Welcome!", "success");
      
      if (loginWithTokens) {
        await loginWithTokens(response.accessToken, response.refreshToken);
        router.push("/");
      }
    } catch (error: any) {
      showToast(error.message || "Registration failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-8 pt-8 pb-6 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Set up your account</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Join <strong>{details.companyName}</strong> to start collaborating with your team.
        </p>
      </div>

      <form className="px-8 pb-8 space-y-5" onSubmit={handleRegister}>
        {/* Email Display Only */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
          <div className="p-1.5 bg-white rounded-md shadow-sm">
            <Mail className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Target Email</p>
            <p className="text-sm font-semibold text-slate-700 truncate">{details.email}</p>
          </div>
        </div>

        <InputField
          label="Full Name"
          icon={<User className="w-4 h-4 text-slate-400" />}
          value={form.fullName}
          onChange={handleInputChange("fullName")}
          placeholder="e.g. John Wick"
          required
        />

        <div className="space-y-3">
          <PasswordField
            label="Create Password"
            value={form.password}
            onChange={handleInputChange("password")}
            show={showPassword}
            toggle={() => setShowPassword((prev) => !prev)}
            placeholder="Minimum 6 characters"
          />
          <PasswordStrengthMeter password={form.password} />
        </div>

        <PasswordField
          label="Confirm Password"
          value={form.confirmPassword}
          show={showPassword}
          onChange={handleInputChange("confirmPassword")}
          toggle={() => setShowPassword((prev) => !prev)}
          placeholder="Repeat your password"
        />

        <LoadingButton
          text="Create Account & Join"
          isLoading={isLoading}
          className="mt-4 w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-md font-bold"
        />
      </form>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: EXISTING USER FLOW
// =============================================================================

/**
 * Quy trình dành cho người dùng đã có tài khoản.
 * Xử lý xác thực chéo email được mời và tài khoản hiện tại.
 */
function ExistingUserFlow({ details, token }: FlowProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated, login, isLoading: authLoading, logout } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const handleLoginChange = (field: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await acceptInvitation(token);
      showToast("Invitation accepted. Welcome aboard!", "success");
      router.push("/");
    } catch (error: any) {
      showToast(error.message || "Failed to accept invitation", "error");
      setIsProcessing(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm.email, loginForm.password);
    } catch (error: any) {
      showToast(error.message || "Login failed", "error");
    }
  };

  if (isAuthenticated && user) {
    // Trường hợp 1: Đăng nhập đúng email được mời
    if (user.email === details.email) {
      return (
        <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ready to join?</h2>
          <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed">
            You are logged in as <strong>{user.email}</strong>. <br/>
            Confirm to join <strong>{details.companyName}</strong>.
          </p>
          <LoadingButton
            text="Accept Invitation"
            isLoading={isProcessing}
            onClick={handleAccept}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-md font-bold mb-4"
          />
          <button
            onClick={() => logout()}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
          >
            Not you? Switch account
          </button>
        </div>
      );
    }

    // Trường hợp 2: Sai tài khoản
    return (
      <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Account Mismatch</h2>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl my-6 text-left text-xs text-amber-800 leading-relaxed shadow-sm">
          <p><strong>Sent to:</strong> {details.email}</p>
          <p className="mt-2"><strong>Active:</strong> {user.email}</p>
        </div>
        <button
          onClick={() => logout()}
          className="w-full py-3 px-4 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Logout & Sign in correctly
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-8 pt-8 pb-2 text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Building2 className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="text-sm text-slate-500 mt-2">
          Log in as <strong>{details.email}</strong> to join <strong>{details.companyName}</strong>.
        </p>
      </div>

      <form className="p-8 space-y-4" onSubmit={handleLoginSubmit}>
        <AuthFormLogin
          form={loginForm}
          handleChange={handleLoginChange as any}
          isLoading={authLoading}
          setTab={() => {}} 
        />
      </form>
    </div>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function AcceptInvitationClient() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<{
    isLoading: boolean;
    error: string | null;
    details: InviteDetails | null;
    token: string | null;
  }>({
    isLoading: true,
    error: null,
    details: null,
    token: null,
  });

  const validateInvitation = useCallback(async () => {
    const token = searchParams.get("token");

    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false, error: "Missing invitation token" }));
      return;
    }

    try {
      const data = await getInvitationDetails(token);
      setState({ isLoading: false, error: null, details: data, token });
    } catch (error: any) {
      setState({ isLoading: false, error: error.message || "Invalid invitation", details: null, token: null });
    }
  }, [searchParams]);

  useEffect(() => {
    validateInvitation();
  }, [validateInvitation]);

  if (state.isLoading) {
    return (
      <div className="p-16 text-center flex flex-col items-center gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Validating...</span>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-12 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Invitation Error</h3>
        <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">{state.error}</p>
        <button 
          onClick={() => window.location.href = "/"}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors"
        >
          Return to home
        </button>
      </div>
    );
  }

  if (state.details && state.token) {
    return state.details.accountExists
      ? <ExistingUserFlow details={state.details} token={state.token} />
      : <NewUserFlow details={state.details} token={state.token} />;
  }

  return null;
}