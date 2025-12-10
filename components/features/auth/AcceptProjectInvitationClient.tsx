"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";

// ✅ Import API dành cho Project
import { getProjectInvitationDetails, acceptProjectInvitation } from "@/services/apiInvitation";
import { registerFromProjectInvite } from "@/services/apiAuth";

import {
  Loader2, User, Mail, FolderKanban, UserPlus, LogOut, CheckCircle2,
  AlertTriangle, Building2
} from "lucide-react";

import AuthFormLogin from "./AuthFormLogin";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import LoadingButton from "@/components/ui/LoadingButton";
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";

// ✅ Interface cho Project
interface ProjectInviteDetails {
  email: string;
  projectName: string;
  companyName?: string; // Có thể hiển thị thêm tên công ty nếu API trả về
  accountExists: boolean;
}

/* =====================================================================================
   🟢 CASE 1 — NEW USER FLOW (Người dùng chưa có tài khoản -> Đăng ký & Vào Project)
   ===================================================================================== */
function NewUserFlow({ details, token }: { details: ProjectInviteDetails; token: string }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { loginWithTokens } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      showToast(t("invite.newUser.passwordNotMatch") || "Passwords do not match", "error");
      return;
    }

    setLoading(true);

    try {
      // ✅ Gọi API Đăng ký từ lời mời Project
      const data = await registerFromProjectInvite({
        fullName: form.fullName,
        password: form.password,
        invitationToken: token,
      });

      showToast("Account created & Joined project successfully!", "success");

      // Đăng nhập và chuyển hướng về trang chủ
      if (loginWithTokens) {
        await loginWithTokens(data.accessToken, data.refreshToken);
        router.push("/");
      }

    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

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
          {details.companyName && <span> at {details.companyName}</span>}
        </p>
      </div>

      <form className="px-8 pb-8 space-y-4" onSubmit={handleSubmit}>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
          <div className="p-1.5 bg-white rounded-md shadow-sm">
            <Mail className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              {t("invite.common.emailLabel") || "Email Address"}
            </p>
            <p className="text-sm font-semibold text-slate-700 truncate">{details.email}</p>
          </div>
        </div>

        <InputField
          label={t("invite.common.fullName") || "Full Name"}
          icon={<User className="w-4 h-4 text-slate-400" />}
          value={form.fullName}
          onChange={handleChange("fullName")}
          placeholder="e.g. John Doe"
          required
        />

        <div className="space-y-3">
          <PasswordField
            label={t("invite.common.createPassword") || "Create Password"}
            value={form.password}
            onChange={handleChange("password")}
            show={showPassword}
            toggle={() => setShowPassword((prev) => !prev)}
            placeholder={t("invite.common.minCharacters") || "Min 6 characters"}
          />
          <PasswordStrengthMeter password={form.password} />
        </div>

        <PasswordField
          label={t("invite.common.confirmPassword") || "Confirm Password"}
          value={form.confirmPassword}
          show={showPassword}
          onChange={handleChange("confirmPassword")}
          toggle={() => setShowPassword((prev) => !prev)}
          placeholder={t("invite.common.reenterPassword") || "Re-enter password"}
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

/* =====================================================================================
   🟠 CASE 2 — EXISTING USER FLOW (Đã có tài khoản -> Đăng nhập & Chấp nhận)
   ===================================================================================== */
function ExistingUserFlow({ details, token }: { details: ProjectInviteDetails; token: string }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated, login, isLoading, logout } = useAuth();

  const [isAccepting, setIsAccepting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (field: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      // ✅ Gọi API Chấp nhận lời mời Project
      await acceptProjectInvitation(token);
      showToast("Joined project successfully!", "success");
      router.push("/"); // Chuyển hướng về trang chủ
    } catch (err: any) {
      showToast(err.message, "error");
      setIsAccepting(false);
    }
  };

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
    } catch (err: any) {
      showToast(err.message || "Login failed", "error");
    }
  };

  /* SCENARIO A — Already logged in */
  if (isAuthenticated && user) {

    /* A1 — Correct account */
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
            You are invited to join project <strong>{details.projectName}</strong>.
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
            {t("invite.existing.notYou") || "Not you? Logout"}
          </button>
        </div>
      );
    }

    /* A2 — Wrong account */
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
          <p className="mt-1"><strong>You are logged in as:</strong> {user.email}</p>
        </div>

        <button
          onClick={() => logout()}
          className="w-full py-2 px-4 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" /> {t("invite.existing.logoutAndLogin") || "Logout & Switch Account"}
        </button>
      </div>
    );
  }

  /* SCENARIO B — Not logged in */
  return (
    <>
      <div className="px-8 pt-8 pb-2 text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
          {/* ✅ Icon Project */}
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
          setTab={() => {}}
        />
      </form>
    </>
  );
}

/* =====================================================================================
   🔵 PARENT LOGIC
   ===================================================================================== */
export default function AcceptProjectInvitationClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<ProjectInviteDetails | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");

    if (!tokenFromUrl) {
      setError(t("invite.errors.invalidToken") || "Invalid invitation link.");
      setLoading(false);
      return;
    }

    setToken(tokenFromUrl);

    const fetchDetails = async () => {
      try {
        // ✅ Gọi API lấy chi tiết lời mời Project
        const data = await getProjectInvitationDetails(tokenFromUrl);
        setDetails(data);
      } catch (err: any) {
        setError(t("invite.errors.expired") || "This invitation is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [searchParams, t]);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Checking project invitation...</span>
      </div>
    );
  }

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
          {t("invite.errorPage.backHome") || "Back to Home"}
        </a>
      </div>
    );
  }

  if (details && token) {
    return details.accountExists
      ? <ExistingUserFlow details={details} token={token} />
      : <NewUserFlow details={details} token={token} />;
  }

  return null;
}