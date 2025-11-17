"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Search,
  Sparkles,
  Users,
  Shield,
  Crown,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/context/AuthContext";

// UI Components
import MemberTable from "@/components/ui/MemberTable";
import MemberDetailModalBase from "@/components/ui/MemberDetailModalBase";

// API
import {
  getProjectMembers,
  updateProjectMemberRole,
} from "@/services/apiProject";

export default function ProjectMembersPage() {
  const { showToast } = useToast();
  const params = useParams();

  const workspaceId = Number(params.workspaceId);
  const projectId = Number(params.projectId);

  const { user, isLoading: isAuthLoading } = useAuth();
  const companyId = user?.company?.companyId || null;

  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // ===========================
  // FORMAT DATE
  // ===========================
  const formatDateTime = (date?: string | null): string => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  // ===========================
  // LOAD MEMBERS
  // ===========================
  useEffect(() => {
    if (isAuthLoading) return;
    if (!companyId || !workspaceId || !projectId) {
      setLoading(false);
      return;
    }

    const loadMembers = async () => {
      try {
        setLoading(true);

        const data = await getProjectMembers(workspaceId, projectId); // ✔ FIXED

        const mapped = data.map((m: any, i: number) => ({
          ...m,
          status: m.status || (i % 2 === 0 ? "ACTIVE" : "PENDING"),
        }));

        setMembers(mapped);
      } catch (err: any) {
        showToast(err.message || "Không thể tải danh sách thành viên.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [companyId, workspaceId, projectId, isAuthLoading]);

  // ===========================
  // VIEW DETAIL
  // ===========================
  const handleViewDetail = (member: any) => {
    setSelectedMember(member);
    setShowDetailModal(true);
  };

  // ===========================
  // CHANGE ROLE
  // ===========================
  const handleChangeRole = async (member: any) => {
    try {
      const newRole =
        member.roleCode === "PROJECT_ADMIN"
          ? "PROJECT_MEMBER"
          : "PROJECT_ADMIN";

      await updateProjectMemberRole(
        workspaceId,
        projectId,
        member.memberId,
        newRole // ✔ FIXED
      );

      showToast("Cập nhật vai trò thành công!", "success");

      setMembers((prev) =>
        prev.map((m) =>
          m.memberId === member.memberId ? { ...m, roleCode: newRole } : m
        )
      );
    } catch (err: any) {
      showToast(err.message || "Lỗi cập nhật vai trò", "error");
    }
  };

  // ===========================
  // STATUS BADGE
  // ===========================
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Hoạt động
          </div>
        );
      case "PENDING":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
            <Clock className="w-3.5 h-3.5" />
            Chờ xác nhận
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            <XCircle className="w-3.5 h-3.5" />
            Không hoạt động
          </div>
        );
    }
  };

  // FILTER
  const filteredMembers = members.filter(
    (m) =>
      m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAuthLoading)
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-white via-blue-50/40 to-white">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 p-8 rounded-3xl shadow-2xl text-white mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Thành viên Dự án
              <Sparkles className="text-yellow-300 animate-pulse w-5 h-5" />
            </h1>
            <p className="text-white/80 mt-1">
              Quản lý vai trò và thông tin thành viên trong dự án.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            className="w-full pl-12 pr-4 py-3 border-2 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow">
          <Loader2 className="w-10 h-10 mx-auto animate-spin" />
          <p className="text-gray-500 mt-2">Đang tải...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <MemberTable
            members={filteredMembers}
            renderStatus={renderStatusBadge}
            renderRole={(m) => (
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${
                  m.roleCode === "PROJECT_ADMIN"
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {m.roleCode === "PROJECT_ADMIN" ? (
                  <Crown className="w-3.5 h-3.5" />
                ) : (
                  <Shield className="w-3.5 h-3.5" />
                )}
                {m.roleName}
              </div>
            )}
            onViewDetail={handleViewDetail}
            onEdit={handleChangeRole}
            onDelete={undefined}
            disableDelete={() => true}
            formatDateTime={formatDateTime} // ✔ REQUIRED
          />
        </div>
      )}

      {/* DETAIL MODAL */}
      <MemberDetailModalBase
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        member={selectedMember}
        loading={false}
        title="Chi tiết thành viên dự án"
        fields={[
          { label: "ID thành viên", key: "memberId" },
          { label: "User ID", key: "userId" },
          { label: "Vai trò", key: "roleName" },
          { label: "Email", key: "email" },
          { label: "Ngày tham gia", key: "joinedAt" },
        ]}
      />
    </div>
  );
}
