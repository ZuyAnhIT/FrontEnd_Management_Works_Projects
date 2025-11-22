"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { getInvitationDetails, acceptInvitation } from "@/services/apiInvitation";
import { registerFromInvite } from "@/services/apiAuth";
import { 
  Loader2, User, Mail, Building2, UserPlus, LogOut, CheckCircle2, AlertTriangle 
} from "lucide-react";

// Reuse components
import AuthFormLogin from "./AuthFormLogin";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import LoadingButton from "@/components/ui/LoadingButton";
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter"; 

// --- TYPES ---
interface InviteDetails {
  email: string;
  companyName: string;
  accountExists: boolean;
}

// =========================================================================
// 🟢 CASE 1: NEW USER FLOW (Đăng ký mới)
// =========================================================================
function NewUserFlow({ details, token }: { details: InviteDetails; token: string }) {
  const { showToast } = useToast();
  const { loginWithTokens } = useAuth();
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
      showToast("Passwords do not match!", "error");
      return;
    }
    setLoading(true);
    try {
      const data = await registerFromInvite({
        fullName: form.fullName,
        password: form.password,
        invitationToken: token,
      });
      showToast("Welcome aboard!", "success");
      await loginWithTokens(data.accessToken, data.refreshToken);
    } catch (err: any) {
      showToast(err.message, "error");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header Card */}
      <div className="px-8 pt-8 pb-4 text-center">
         <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
         </div>
         <h2 className="text-xl font-bold text-slate-900">You've been invited!</h2>
         <p className="text-sm text-slate-500 mt-2">
            Join <strong>{details.companyName}</strong> on WorkNet. <br/>
            Setup your account to get started.
         </p>
      </div>

      <form className="px-8 pb-8 space-y-4" onSubmit={handleSubmit}>
        
        {/* Email Readonly Badge */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
            <div className="p-1.5 bg-white rounded-md shadow-sm">
                <Mail className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Invitation Email</p>
                <p className="text-sm font-semibold text-slate-700 truncate">{details.email}</p>
            </div>
        </div>

        <InputField
          label="Full Name"
          icon={<User className="w-4 h-4 text-slate-400" />}
          value={form.fullName}
          onChange={handleChange("fullName")}
          placeholder="e.g. John Doe"
          required
        />

        <div className="space-y-3">
            <PasswordField
            label="Create Password"
            value={form.password}
            onChange={handleChange("password")}
            show={showPassword}
            toggle={() => setShowPassword((prev) => !prev)}
            placeholder="Min 6 characters"
            />
            {/* Password Meter */}
            <PasswordStrengthMeter password={form.password} />
        </div>

        <PasswordField
          label="Confirm Password"
          value={form.confirmPassword}
          show={showPassword}
          onChange={handleChange("confirmPassword")}
          toggle={() => setShowPassword((prev) => !prev)}
          placeholder="Re-enter password"
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

// =========================================================================
// 🟠 CASE 2: EXISTING USER FLOW (Đã có tài khoản)
// =========================================================================
function ExistingUserFlow({ details, token }: { details: InviteDetails; token: string }) {
  const { showToast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated, login, isLoading, logout } = useAuth();
  const [isAccepting, setIsAccepting] = useState(false);

  // Login Form State
  const [form, setForm] = useState({ email: "", password: "" });
  const handleChange = (field: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await acceptInvitation(token);
      showToast("Invitation accepted!", "success");
      router.push("/admin"); 
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

  // --- SCENARIO A: Đã Login ---
  if (isAuthenticated && user) {
    // A1: Đúng tài khoản
    if (user.email === details.email) {
      return (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-900">Accept Invitation</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
             You are logged in as <strong>{user.email}</strong>. <br/>
             Join <strong>{details.companyName}</strong> now?
          </p>

          <LoadingButton
            text="Accept & Join Workspace"
            isLoading={isAccepting}
            onClick={handleAccept}
            className="w-full bg-blue-600 hover:bg-blue-700 shadow-md mb-3"
          />
          
          <button 
            onClick={() => logout()}
            className="text-sm text-slate-400 hover:text-slate-600 hover:underline transition-all"
          >
            Not you? Sign out
          </button>
        </div>
      );
    }

    // A2: Sai tài khoản
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
           <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Wrong Account</h2>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg my-4 text-left text-sm text-amber-800">
           <p><strong>Invitation for:</strong> {details.email}</p>
           <p className="mt-1"><strong>Currently logged in:</strong> {user.email}</p>
        </div>
        
        <button
          onClick={() => logout()}
          className="w-full py-2 px-4 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign out & Login correctly
        </button>
      </div>
    );
  }

  // --- SCENARIO B: Chưa Login ---
  return (
    <>
      <div className="px-8 pt-8 pb-2 text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Welcome Back!</h2>
        <p className="text-sm text-slate-500 mt-1">
           Login to <strong>{details.email}</strong> to join <strong>{details.companyName}</strong>.
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

// =========================================================================
// 🔵 PARENT COMPONENT (LOGIC HUB)
// =========================================================================
export default function AcceptInvitationClient() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setError("Invalid or missing invitation token.");
      setLoading(false);
      return;
    }
    setToken(tokenFromUrl);

    const fetchDetails = async () => {
      try {
        const data = await getInvitationDetails(tokenFromUrl);
        setDetails(data);
      } catch (err: any) {
        setError(err.message || "Invitation invalid or expired.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Validating invitation...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
         <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <AlertTriangle className="w-8 h-8 text-red-500" />
         </div>
         <h3 className="text-lg font-bold text-slate-900 mb-2">Invitation Error</h3>
         <p className="text-slate-500 mb-6">{error}</p>
         <a href="/" className="text-blue-600 font-medium hover:underline">Go to Homepage</a>
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