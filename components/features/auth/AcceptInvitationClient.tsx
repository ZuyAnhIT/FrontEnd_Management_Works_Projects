"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { getInvitationDetails, acceptInvitation } from "@/services/apiInvitation";
import { registerFromInvite } from "@/services/apiAuth";
import {
  Loader2, User, Mail, Building2, UserPlus, LogOut, CheckCircle2,
  AlertTriangle
} from "lucide-react";

import AuthFormLogin from "./AuthFormLogin";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import LoadingButton from "@/components/ui/LoadingButton";
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";

interface InviteDetails {
  email: string;
  companyName: string;
  accountExists: boolean;
}

/* 🟢 CASE 1 — NEW USER FLOW 
*/
function NewUserFlow({ details, token }: { details: InviteDetails; token: string }) {
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
      showToast(t("invite.newUser.passwordNotMatch"), "error");
      return;
    }

    setLoading(true);
    try {
      const data = await registerFromInvite({
        fullName: form.fullName,
        password: form.password,
        invitationToken: token,
      });

      showToast(t("invite.newUser.welcomeToast"), "success");
      
      // Đăng nhập và chuyển hướng về trang chủ "/"
      if(loginWithTokens) {
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
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {t("invite.newUser.title")}
        </h2>
        <p className="text-sm text-slate-500 mt-2">
            Tham gia <strong>{details.companyName}</strong>
        </p>
      </div>

      <form className="px-8 pb-8 space-y-4" onSubmit={handleSubmit}>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
          <div className="p-1.5 bg-white rounded-md shadow-sm">
            <Mail className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              {t("invite.common.emailLabel")}
            </p>
            <p className="text-sm font-semibold text-slate-700 truncate">{details.email}</p>
          </div>
        </div>

        <InputField
          label={t("invite.common.fullName")}
          icon={<User className="w-4 h-4 text-slate-400" />}
          value={form.fullName}
          onChange={handleChange("fullName")}
          placeholder="e.g. John Doe"
          required
        />

        <div className="space-y-3">
          <PasswordField
            label={t("invite.common.createPassword")}
            value={form.password}
            onChange={handleChange("password")}
            show={showPassword}
            toggle={() => setShowPassword((prev) => !prev)}
            placeholder={t("invite.common.minCharacters")}
          />
          <PasswordStrengthMeter password={form.password} />
        </div>

        <PasswordField
          label={t("invite.common.confirmPassword")}
          value={form.confirmPassword}
          show={showPassword}
          onChange={handleChange("confirmPassword")}
          toggle={() => setShowPassword((prev) => !prev)}
          placeholder={t("invite.common.reenterPassword")}
        />

        <LoadingButton
          text={t("invite.newUser.createAccount")}
          isLoading={loading}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 shadow-md"
        />
      </form>
    </>
  );
}

/* 🟠 CASE 2 — EXISTING USER FLOW  
*/
function ExistingUserFlow({ details, token }: { details: InviteDetails; token: string }) {
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
      await acceptInvitation(token);
      showToast(t("invite.existing.acceptedToast"), "success");
      router.push("/"); // Chuyển hướng về trang chủ sau khi chấp nhận
    } catch (err: any) {
      showToast(err.message, "error");
      setIsAccepting(false);
    }
  };

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      // Sau khi login xong, component sẽ re-render và rơi vào case "Already logged in"
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
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {t("invite.existing.acceptTitle")}
          </h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
             Bạn đang đăng nhập với <strong>{user.email}</strong>. Tham gia <strong>{details.companyName}</strong> ngay?
          </p>
          <LoadingButton
            text={t("invite.existing.acceptButton")}
            isLoading={isAccepting}
            onClick={handleAccept}
            className="w-full bg-blue-600 hover:bg-blue-700 shadow-md mb-3"
          />
          <button
            onClick={() => logout()}
            className="text-sm text-slate-400 hover:text-slate-600 hover:underline transition-all"
          >
            {t("invite.existing.notYou")}
          </button>
        </div>
      );
    }

    /* A2 — Wrong account */
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          {t("invite.existing.wrongAccountTitle")}
        </h2>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg my-4 text-left text-sm text-amber-800">
          <p><strong>{t("invite.existing.wrongAccountFor")}</strong> {details.email}</p>
          <p className="mt-1"><strong>{t("invite.existing.wrongAccountCurrent")}</strong> {user.email}</p>
        </div>
        <button
          onClick={() => logout()}
          className="w-full py-2 px-4 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" /> {t("invite.existing.logoutAndLogin")}
        </button>
      </div>
    );
  }

  /* SCENARIO B — Not logged in */
  return (
    <>
      <div className="px-8 pt-8 pb-2 text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <Building2 className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {t("invite.existing.welcomeBack")}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
           Vui lòng đăng nhập tài khoản <strong>{details.email}</strong> để tham gia <strong>{details.companyName}</strong>.
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

/* 🔵 PARENT LOGIC 
*/
export default function AcceptInvitationClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");

    if (!tokenFromUrl) {
      setError(t("invite.errors.invalidToken"));
      setLoading(false);
      return;
    }

    setToken(tokenFromUrl);

    const fetchDetails = async () => {
      try {
        const data = await getInvitationDetails(tokenFromUrl);
        setDetails(data);
      } catch (err: any) {
        setError(t("invite.errors.expired"));
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
        <span className="text-sm font-medium">{t("invite.loading.validating")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          {t("invite.errorPage.title")}
        </h3>
        <p className="text-slate-500 mb-6">{error}</p>
        <a href="/" className="text-blue-600 font-medium hover:underline">
          {t("invite.errorPage.backHome")}
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