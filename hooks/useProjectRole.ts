"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook xử lý và kiểm tra phân quyền của người dùng trong một dự án cụ thể
 * @param projectId Định danh dự án cần kiểm tra quyền
 */
export const useProjectRole = (projectId: number) => {
  // Lấy thông tin người dùng hiện tại từ Context xác thực
  const { user } = useAuth();

  // Xác định mã vai trò (roleCode) của người dùng trong dự án
  const roleCode = useMemo(() => {
    if (!user || !user.projectMemberships) return null;

    // Tìm kiếm thông tin tham gia dự án dựa trên projectId
    const membership = user.projectMemberships.find(
      (m) => m.projectId === projectId
    );

    return membership?.roleCode || null;
  }, [user, projectId]);

  // Các cờ trạng thái kiểm tra vai trò cụ thể trong dự án
  const isGuest = roleCode === "GUEST_PROJECT";
  const isAdmin = roleCode === "PROJECT_ADMIN";
  const isMember = roleCode === "PROJECT_MEMBER";

  // Kiểm tra quyền hạn quản lý dự án (bao gồm cài đặt và thành viên)
  // Chỉ vai trò Admin và Member mới có quyền quản lý
  const canManageProject = isAdmin || isMember;

  return { 
    roleCode, 
    isGuest, 
    isAdmin, 
    isMember, 
    canManageProject 
  };
};