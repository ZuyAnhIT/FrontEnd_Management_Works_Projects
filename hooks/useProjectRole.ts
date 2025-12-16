// hooks/useProjectRole.ts
"use client";

import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

export const useProjectRole = (projectId: number) => {
  const { user } = useAuth();

  const roleCode = useMemo(() => {
    if (!user || !user.projectMemberships) return null;
    const membership = user.projectMemberships.find(
      (m) => m.projectId === projectId
    );
    return membership?.roleCode || null;
  }, [user, projectId]);

  const isGuest = roleCode === "GUEST_PROJECT";
  const isAdmin = roleCode === "PROJECT_ADMIN";
  const isMember = roleCode === "PROJECT_MEMBER";

  // Kiểm tra quyền được phép truy cập Settings/Members (Chỉ Admin và Member)
  const canManageProject = isAdmin || isMember;

  return { roleCode, isGuest, isAdmin, isMember, canManageProject };
};