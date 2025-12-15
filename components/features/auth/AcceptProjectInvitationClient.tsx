"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Loader2, User, Mail, FolderKanban, UserPlus, LogOut, CheckCircle2,
  AlertTriangle
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { getProjectInvitationDetails, acceptProjectInvitation } from "@/services/apiInvitation";
import { registerFromProjectInvite } from "@/services/apiAuth";

import AuthFormLogin from "./AuthFormLogin";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import LoadingButton from "@/components/ui/LoadingButton";
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface ProjectInviteDetails {
  email: string;
  projectName: string;
  companyName?: string; 
  accountExists: boolean;
}

interface FlowProps {
  details: ProjectInviteDetails;
  token: string;
}

// =============================================================================
// 2. SUB-COMPONENT: NEW USER FLOW (Người dùng mới chưa có tài khoản)
// =============================================================================

function NewUserFlow({ details, token }: FlowProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { loginWithTokens } = useAuth();
  const router = useRouter();

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  // --- HANDLERS ---
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mật khẩu khớp nhau
    if (form.password !== form.confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setLoading(true);

    try {
      // 1. Đăng ký tài khoản kèm token lời mời Project
      const data = await registerFromProjectInvite({
        fullName: form.fullName,
        password: form.password,
        invitationToken: token,
      });

      showToast("Account created & Joined project successfully!", "success");

      // 2. Tự động đăng nhập và chuyển hướng
      if (loginWithTokens) {
        await loginWithTokens(data.accessToken, data.refreshToken);
        router.push("/");
      }

    } catch (err: any) {
      // Hiển thị message lỗi từ API
      showToast(err.message || "Registration failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <>
      <div className="px-8 pt-8 pb-4 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          Create Account
        </h2>

        <p className="text-sm text-slate-500 mt-2">
          Join project <strong>{details.projectName}</strong>
          {details.companyName && <span> at <strong>{details.companyName}</strong></span>}
        </p>
      </div>

      <form className="px-8 pb-8 space-y-4" onSubmit={handleSubmit}>
        {/* Read-only Email Field */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
          <div className="p-1.5 bg-white rounded-md shadow-sm">
            <Mail className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Email Address
            </p>
            <p className="text-sm font-semibold text-slate-700 truncate">{details.email}</p>
          </div>
        </div>

        {/* Full Name */}
        <InputField
          label="Full Name"
          icon={<User className="w-4 h-4 text-slate-400" />}
          value={form.fullName}
          onChange={handleChange("fullName")}
          placeholder="e.g. John Doe"
          required
        />

        {/* Password & Strength */}
        <div className="space-y-3">
          <PasswordField
            label="Create Password"
            value={form.password}
            onChange={handleChange("password")}
            show={showPassword}
            toggle={() => setShowPassword((prev) => !prev)}
            placeholder="Minimum 6 characters"
          />
          <PasswordStrengthMeter password={form.password} />
        </div>

        {/* Confirm Password */}
        <PasswordField
          label="Confirm Password"
          value={form.confirmPassword}
          show={showPassword}
          onChange={handleChange("confirmPassword")}
          toggle={() => setShowPassword((prev) => !prev)}
          placeholder="Re-enter your password"
        />

        <LoadingButton
          text="Create Account & Join Project"
          isLoading={loading}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 shadow-md"
        />
      </form>
    </>
  );
}

// =============================================================================
// 3. SUB-COMPONENT: EXISTING USER FLOW (Đã có tài khoản)
// =============================================================================

function ExistingUserFlow({ details, token }: FlowProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated, login, isLoading, logout } = useAuth();

  // --- STATE ---
  const [isAccepting, setIsAccepting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  // --- HANDLERS ---
  const handleChange = (field: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Chấp nhận lời mời (khi đã đăng nhập đúng tài khoản)
  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await acceptProjectInvitation(token);
      showToast("Joined project successfully!", "success");
      router.push("/"); // Về trang chủ
    } catch (err: any) {
      showToast(err.message || "Failed to join project.", "error");
      setIsAccepting(false);
    }
  };

  // Đăng nhập (khi chưa đăng nhập)
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      // Sau khi login, component re-render -> lọt vào case Authenticated bên dưới
    } catch (err: any) {
      showToast(err.message || "Login failed.", "error");
    }
  };

  // --- SCENARIO A: User ĐÃ đăng nhập ---
  if (isAuthenticated && user) {

    // A1: Tài khoản đăng nhập KHỚP với email được mời
    if (user.email === details.email) {
      return (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Accept Invitation
          </h2>

          <p className="text-sm text-slate-500 mt-2 mb-6">
            You are logged in as <strong>{user.email}</strong>.<br/>
            Join project <strong>{details.projectName}</strong> now?
          </p>

          <LoadingButton
            text="Join Project"
            isLoading={isAccepting}
            onClick={handleAccept}
            className="w-full bg-blue-600 hover:bg-blue-700 shadow-md mb-3"
          />

          <button
            onClick={() => logout()}
            className="text-sm text-slate-400 hover:text-slate-600 hover:underline transition-all"
          >
            Not you? Logout
          </button>
        </div>
      );
    }

    // A2: Tài khoản đăng nhập KHÁC với email được mời (Sai tài khoản)
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>

        <h2 className="text-lg font-bold text-slate-900">
          Wrong Account
        </h2>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg my-4 text-left text-sm text-amber-800">
          <p><strong>Invitation sent to:</strong> {details.email}</p>
          <p className="mt-1"><strong>Currently logged in:</strong> {user.email}</p>
        </div>

        <button
          onClick={() => logout()}
          className="w-full py-2 px-4 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" /> Logout & Login Correctly
        </button>
      </div>
    );
  }

  // --- SCENARIO B: User CHƯA đăng nhập -> Hiện Form Login ---
  return (
    <>
      <div className="px-8 pt-8 pb-2 text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
          <FolderKanban className="w-7 h-7 text-blue-600" />
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          Welcome Back
        </h2>

        <p className="text-sm text-slate-500 mt-1">
           Please login as <strong>{details.email}</strong> to join project <strong>{details.projectName}</strong>.
        </p>
      </div>

      <form className="p-8 space-y-4 pt-4" onSubmit={handleSubmitLogin}>
        <AuthFormLogin
          form={form}
          handleChange={handleChange as any}
          isLoading={isLoading}
          setTab={() => {}} // Không cần chuyển tab Register ở đây
        />
      </form>
    </>
  );
}

// =============================================================================
// 4. PARENT COMPONENT (Main Client)
// =============================================================================

export default function AcceptProjectInvitationClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<ProjectInviteDetails | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // --- EFFECT: Validate Token & Fetch Details ---
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");

    if (!tokenFromUrl) {
      setError("Invalid invitation link.");
      setLoading(false);
      return;
    }

    setToken(tokenFromUrl);

    const fetchDetails = async () => {
      try {
        const data = await getProjectInvitationDetails(tokenFromUrl);
        setDetails(data);
      } catch (err: any) {
        // Lỗi: Token hết hạn hoặc không tồn tại
        setError(err.message || "This invitation is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [searchParams]);

  // --- RENDER STATES ---

  // 1. Loading
  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Checking project invitation...</span>
      </div>
    );
  }

  // 2. Error
  if (error) {
    return (
      <div className="p-10 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Unable to Access
        </h3>

        <p className="text-slate-500 mb-6">{error}</p>

        <a href="/" className="text-blue-600 font-medium hover:underline">
          Back to Home
        </a>
      </div>
    );
  }

  // 3. Success -> Render Flow tương ứng
  if (details && token) {
    return details.accountExists
      ? <ExistingUserFlow details={details} token={token} />
      : <NewUserFlow details={details} token={token} />;
  }

  return null;
}