"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import {
  getInvitationDetails,
  acceptInvitation,
} from "@/services/apiInvitation";
import { registerFromInvite } from "@/services/apiAuth";
import { Loader2, User, Mail } from "lucide-react";

// Reuse components
import AuthFormLogin from "./AuthFormLogin";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import LoadingButton from "@/components/ui/LoadingButton";
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter"; 

// Type for /details API response
interface InviteDetails {
  email: string;
  companyName: string;
  accountExists: boolean;
}

function NewUserFlow({
  details,
  token,
}: {
  details: InviteDetails;
  token: string;
}) {
  const { showToast } = useToast();
  const { loginWithTokens } = useAuth();
  const [loading, setLoading] = useState(false);

  // 👁 Thêm biến showPassword
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
      showToast("Registration & company join successful!", "success");
      await loginWithTokens(data.accessToken, data.refreshToken);
    } catch (err: any) {
      showToast(err.message, "error");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-center py-6 px-4">
        <h2 className="text-lg sm:text-xl font-bold text-white mt-3">
          Join {details.companyName}
        </h2>
        <p className="text-xs text-blue-100 mt-1">
          Create an account to accept the invitation.
        </p>
      </div>

      <form className="p-6 space-y-4" onSubmit={handleSubmit}>
        <InputField
          label="Email (Invited)"
          icon={<Mail className="w-4 h-4 text-gray-400" />}
          type="email"
          value={details.email}
          disabled
        />

        <InputField
          label="Full Name"
          icon={<User className="w-4 h-4 text-gray-400" />}
          value={form.fullName}
          onChange={handleChange("fullName")}
          placeholder="Enter your full name"
          required
        />

        {/* PASSWORD */}
        <PasswordField
          label="Password"
          value={form.password}
          onChange={handleChange("password")}
          show={showPassword}
          toggle={() => setShowPassword((prev) => !prev)}
          placeholder="Create a password (min 6 chars)"
        />

        {/* ⬅️ THÊM METER CHECK ĐỘ MẠNH Ở ĐÂY */}
        <PasswordStrengthMeter password={form.password} />

        {/* CONFIRM */}
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
          className="mt-4 w-full"
        />
      </form>
    </>
  );
}

// ----------------------------------------
// Component for CASE 2: Existing User
// ----------------------------------------
function ExistingUserFlow({
  details,
  token,
}: {
  details: InviteDetails;
  token: string;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated, login, isLoading } = useAuth();
  const [isAccepting, setIsAccepting] = useState(false);

  // State for login form
  const [form, setForm] = useState({ email: "", password: "" });
  const handleChange =
    (field: "email" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // Handle accept when already logged in
  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await acceptInvitation(token);
      showToast("Invitation accepted successfully!", "success");
      router.push("/admin"); // Redirect to admin
    } catch (err: any) {
      showToast(err.message, "error");
      setIsAccepting(false);
    }
  };

  // Handle login submit
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      // AuthContext handles redirect on success
      // Page re-renders with isAuthenticated = true
    } catch (err: any) {
      showToast(err.message || "Login failed", "error");
    }
  };

  // --- Render Logic ---

  // 1. Logged in
  if (isAuthenticated && user) {
    // 1a. Correct account
    if (user.email === details.email) {
      return (
        <div className="p-6 text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Accept Invitation?
          </h2>
          <p className="text-sm text-gray-600">
            <b>{details.companyName}</b> has invited you to join.
          </p>
          <LoadingButton
            text="Accept"
            isLoading={isAccepting}
            onClick={handleAccept}
          />
        </div>
      );
    }
    // 1b. Wrong account
    return (
      <div className="p-6 text-center space-y-4">
        <h2 className="text-lg font-semibold text-red-600">Account Error</h2>
        <p className="text-sm text-gray-600">
          This invitation is for <b>{details.email}</b>, but you are logged in as <b>{user.email}</b>.
        </p>
        <p className="text-sm text-gray-600">Please logout and try again.</p>
      </div>
    );
  }

  // 2. Not logged in
  return (
    <>
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-center py-6 px-4">
        <h2 className="text-lg sm:text-xl font-bold text-white mt-3">
          Join {details.companyName}
        </h2>
        <p className="text-xs text-blue-100 mt-1">
          This invitation is for <b>{details.email}</b>.
        </p>
        <p className="text-xs text-blue-100 mt-1">
          Please login to accept.
        </p>
      </div>

      {/* Show Login Form */}
      <form className="p-6 space-y-4" onSubmit={handleSubmitLogin}>
        <AuthFormLogin
          form={form}
          handleChange={handleChange as any}
          isLoading={isLoading}
          setTab={() => {}} // not needed
        />
      </form>
    </>
  );
}

// ----------------------------------------
// "PARENT" Component (Logic Hub)
// ----------------------------------------
export default function AcceptInvitationClient() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Step 3 & 4: "Ask" Backend
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [searchParams]);

  // --- Render Logic (Step 5) ---
  if (loading) {
    return (
      <div className="p-8 text-center flex items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin" /> Verifying invitation...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (details && token) {
    // Step 5: Decision making
    if (details.accountExists) {
      return <ExistingUserFlow details={details} token={token} />;
    } else {
      return <NewUserFlow details={details} token={token} />;
    }
  }

  return null; // Unexpected case
}