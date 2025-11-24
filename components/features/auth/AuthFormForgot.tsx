"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import InputField from "./InputField";
import { Mail } from "lucide-react";
import LoadingButton from "@/components/ui/LoadingButton";
import { forgotPassword } from "@/services/apiAuth";

interface AuthFormForgotProps {
  form: { email: string };
  handleChange: (
    field: "email"
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  setTab: (tab: string) => void;
}

export default function AuthFormForgot({
  form,
  handleChange,
  isLoading,
  setTab,
}: AuthFormForgotProps) {
  const { t } = useTranslation();

  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSendEmail = async () => {
    if (!form.email.trim()) {
      setMessage(t("forgot.errorInvalidEmail"));
      setIsError(true);
      return;
    }

    try {
      setMessage(null);
      setIsError(false);

      const res = await forgotPassword(form.email);

      setMessage(
        res?.message || t("forgot.successMessage")
      );
      setIsError(false);
    } catch (error: any) {
      setMessage(error.message || t("forgot.failedMessage"));
      setIsError(true);
    }
  };

  return (
    <div>
      <InputField
        label={t("forgot.email")}
        icon={<Mail className="w-4 h-4 text-gray-400" />}
        type="email"
        value={form.email}
        onChange={handleChange("email")}
        placeholder={t("forgot.emailPlaceholder")}
        required
      />

      <LoadingButton
        type="button"
        isLoading={isLoading}
        onClick={handleSendEmail}
        className="w-full mt-4"
        text={t("forgot.sendButton")}
      />

      {message && (
        <div
          className={`mt-3 text-sm text-center p-3 rounded-lg ${
            isError ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
