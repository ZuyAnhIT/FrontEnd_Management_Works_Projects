"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Loader2, User, Mail, Building2, UserPlus, LogOut, CheckCircle2,
  AlertTriangle
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { getInvitationDetails, acceptInvitation } from "@/services/apiInvitation";
import { registerFromInvite } from "@/services/apiAuth";

import AuthFormLogin from "./AuthFormLogin";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import LoadingButton from "@/components/ui/LoadingButton";
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";

// =============================================================================
// 1. INTERFACES
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
      // 1. Đăng ký tài khoản kèm token lời mời
      const data = await registerFromInvite({
        fullName: form.fullName,
        password: form.password,
        invitationToken: token,
      });

      showToast("Account created successfully. Welcome!", "success");
      
      // 2. Tự động đăng nhập và chuyển hướng
      if(loginWithTokens) {
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
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Set up your account
        </h2>
        <p className="text-sm text-slate-500 mt-2">
            Join <strong>{details.companyName}</strong> to start collaborating.
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
          text="Create Account & Join"
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
      await acceptInvitation(token);
      showToast("Invitation accepted successfully!", "success");
      router.push("/"); // Về trang chủ
    } catch (err: any) {
      showToast(err.message || "Failed to accept invitation.", "error");
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
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Ready to join?
          </h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
              You are logged in as <strong>{user.email}</strong>. <br/>
              Join <strong>{details.companyName}</strong> now?
          </p>
          <LoadingButton
            text="Accept Invitation"
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
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Wrong Account
        </h2>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg my-4 text-left text-sm text-amber-800">
          <p><strong>Invite sent to:</strong> {details.email}</p>
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
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <Building2 className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Welcome Back
        </h2>
        <p className="text-sm text-slate-500 mt-1">
            Please log in as <strong>{details.email}</strong> to join <strong>{details.companyName}</strong>.
        </p>
      </div>

      <form className="p-8 space-y-4 pt-4" onSubmit={handleSubmitLogin}>
        <AuthFormLogin
          form={form}
          handleChange={handleChange as any} // AuthFormLogin có thể yêu cầu type cụ thể
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

export default function AcceptInvitationClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // --- EFFECT: Validate Token & Fetch Details ---
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");

    if (!tokenFromUrl) {
      setError("Invalid invitation token.");
      setLoading(false);
      return;
    }

    setToken(tokenFromUrl);

    const fetchDetails = async () => {
      try {
        const data = await getInvitationDetails(tokenFromUrl);
        setDetails(data);
      } catch (err: any) {
        // Lỗi: Token hết hạn hoặc không tồn tại
        setError(err.message || "Invitation expired or invalid.");
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
        <span className="text-sm font-medium">Validating invitation...</span>
      </div>
    );
  }

  // 2. Error (Token Invalid/Expired)
  if (error) {
    return (
      <div className="p-10 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Invitation Error
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