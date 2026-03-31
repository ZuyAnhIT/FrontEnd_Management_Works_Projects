"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Styles)
// =============================================================================

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";

// Components
import AuthModal from "@/components/features/auth/AuthModal";

// Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

/**
 * Trang xac thuc tap trung (Auth Page).
 * Su dung AuthModal nhu mot thanh phan chinh de thuc hien Dang nhap/Dang ky.
 */
export default function AuthPage() {
  // ---------------------------------------------------------------------------
  // 3. HOOKS
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // 4. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Dieu huong nguoi dung quay lai trang chu khi dong modal.
   * Su dung useCallback de toi uu hieu suat render.
   */
  const handleClose = useCallback(() => {
    router.push("/");
  }, [router]);

  // ---------------------------------------------------------------------------
  // 5. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <main
      className={cn(
        "flex min-h-screen items-center justify-center p-4 transition-colors duration-300",
        "bg-[#F4F5F7] dark:bg-slate-950", // Su dung mau nen trung tinh giong Jira
      )}
    >
      {/* Hien thi AuthModal o che do luon mo (isOpen=true).
        Trong moi truong nay, Modal se dong vai tro nhu mot Card trung tam.
      */}
      <AuthModal isOpen={true} onClose={handleClose} />
    </main>
  );
}
