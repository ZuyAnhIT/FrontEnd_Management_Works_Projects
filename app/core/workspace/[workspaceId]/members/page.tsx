"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Search,
  Users,
  UserPlus,
  Shield,
  Loader2,
  Crown,
  Edit,
  X,
  CheckCircle,
  Clock,
  ShieldAlert,
  Save,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  XCircle as CloseIcon,
} from "lucide-react";

import {
  getWorkspaceMembers,
  searchWorkspaceMembers,
  inviteMemberToWorkspace,
  removeWorkspaceMember,
  updateWorkspaceMemberStatus,
  updateWorkspaceMemberRole,
  getWorkspaceMemberDetail,
  PageResponse,
  WorkspaceMember,
} from "@/services/apiWorkspace";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/button";

// Components tái sử dụng
import MemberTable from "@/components/ui/MemberTable";
import InviteMemberModal from "@/components/ui/InviteMemberModal";
import MemberDetailModalBase from "@/components/ui/MemberDetailModalBase";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// --- CONSTANTS ---
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "joinedAt";
const DEFAULT_SORT_DIR = "desc";

interface MemberSearchParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  name?: string;
  email?: string;
  phone?: string;
  role?: string; // API dùng 'role' thay vì 'roleName'
  [key: string]: any;
}

export default function WorkspaceMembersPage() {
  const { showToast } = useToast();
  const params = useParams();
  const workspaceId = Number(params.workspaceId);

  // Lấy activeCompany từ AuthContext
  const { user, activeCompany, isLoading: isAuthLoading } = useAuth();
  const companyId = activeCompany?.companyId;

  // State Data
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  // State Pagination & Search
  const [pagination, setPagination] = useState<
    Omit<PageResponse<WorkspaceMember>, "content">
  >({
    pageNumber: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    last: true,
    first: true,
  });

  const [searchParams, setSearchParams] = useState<MemberSearchParams>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sortBy: DEFAULT_SORT_BY,
    sortDir: DEFAULT_SORT_DIR,
  });

  const [searchValue, setSearchValue] = useState("");
  const [searchBy, setSearchBy] = useState("name");

  // --- MODAL STATES ---
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleCode, setInviteRoleCode] = useState("WORKSPACE_MEMBER");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(
    null
  );
  const [newStatus, setNewStatus] = useState("");
  const [newRole, setNewRole] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<WorkspaceMember | null>(
    null
  );

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMember, setDetailMember] = useState<WorkspaceMember | null>(
    null
  );
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ===================================================
  // 🔄 FETCH DATA LOGIC
  // ===================================================
  const fetchMembers = useCallback(
    async (params: MemberSearchParams) => {
      if (!companyId || !workspaceId) return;
      setLoading(true);

      try {
        const { name, email, phone, role, ...apiParams } = params;
        let data: PageResponse<WorkspaceMember>;

        const isSearching = name || email || phone || role;

        if (isSearching) {
          // Gọi API Search Workspace Members
          data = await searchWorkspaceMembers(companyId, workspaceId, params);
        } else {
          // Gọi API Get All
          data = await getWorkspaceMembers(companyId, workspaceId, apiParams);
        }

        setMembers(data.content || []);
        setPagination({
          pageNumber: data.pageNumber,
          pageSize: data.pageSize,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          first: data.first,
          last: data.last,
        });
      } catch (err: any) {
        console.error("Fetch Error:", err);
        showToast(err.message || "Failed to load members", "error");
        setMembers([]);
      } finally {
        setLoading(false);
      }
    },
    [companyId, workspaceId, showToast]
  );

  // Auto reload khi params thay đổi
  useEffect(() => {
    if (!companyId || !workspaceId || isAuthLoading) return;
    const t = setTimeout(() => fetchMembers(searchParams), 300);
    return () => clearTimeout(t);
  }, [searchParams, companyId, workspaceId, isAuthLoading, fetchMembers]);

  // ===================================================
  // ⚙️ HANDLERS
  // ===================================================

  // Pagination & Sort
  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleSort = (field: string) => {
    setSearchParams((prev) => ({
      ...prev,
      sortBy: field,
      sortDir:
        prev.sortBy === field && prev.sortDir === "desc" ? "asc" : "desc",
      page: 0,
    }));
  };

  // Search Handlers
  const handleSearchChange = (text: string) => {
    setSearchValue(text);
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      name: undefined,
      email: undefined,
      phone: undefined,
      role: undefined,
      [searchBy]: text,
    }));
  };

  const handleSearchByChange = (field: string) => {
    setSearchBy(field);
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      name: undefined,
      email: undefined,
      phone: undefined,
      role: undefined,
      [field]: searchValue,
    }));
  };

  // 1. INVITE MEMBER
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      showToast("Please enter an email", "warning");
      return;
    }
    if (!companyId || !workspaceId) return;

    setLoading(true); // Tạm dùng loading chung hoặc tạo state riêng
    try {
      await inviteMemberToWorkspace(companyId, workspaceId, {
        email: inviteEmail,
        roleCode: inviteRoleCode,
      });
      showToast("Invitation sent successfully!", "success");
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRoleCode("WORKSPACE_MEMBER");
      fetchMembers(searchParams);
    } catch (err: any) {
      showToast(err.message || "Invitation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. EDIT MEMBER (Role/Status)
  const openEditModal = (member: WorkspaceMember) => {
    setSelectedMember(member);
    setNewStatus("");
    setNewRole("");
    setShowEditModal(true);
  };

  const handleUpdateMember = async () => {
    if (!companyId || !workspaceId || !selectedMember) return;
    if (newStatus === "" && newRole === "") {
      setShowEditModal(false);
      return;
    }

    setIsUpdating(true);
    try {
      const promises = [];
      if (newStatus !== "") {
        promises.push(
          updateWorkspaceMemberStatus(
            companyId,
            workspaceId,
            selectedMember.memberId,
            newStatus
          )
        );
      }
      if (newRole !== "") {
        promises.push(
          updateWorkspaceMemberRole(
            companyId,
            workspaceId,
            selectedMember.memberId,
            newRole
          )
        );
      }
      await Promise.all(promises);

      showToast("Member updated successfully!", "success");
      setShowEditModal(false);
      fetchMembers(searchParams);
    } catch (err: any) {
      showToast(err.message || "Update failed", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // 3. DELETE MEMBER
  const openDeleteConfirmation = (member: WorkspaceMember) => {
    if (member.userId === user?.id) {
      showToast("You cannot remove yourself.", "error");
      return;
    }
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!companyId || !workspaceId || !memberToDelete) return;
    setIsDeleting(true);
    try {
      await removeWorkspaceMember(
        companyId,
        workspaceId,
        memberToDelete.memberId
      );
      showToast("Member removed successfully", "success");
      setIsDeleteModalOpen(false);
      fetchMembers(searchParams);
    } catch (err: any) {
      showToast(err.message || "Failed to remove member", "error");
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null);
    }
  };

  // 4. VIEW DETAIL
  const handleViewDetail = async (memberId: number) => {
    if (!companyId || !workspaceId) return;
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const detail = await getWorkspaceMemberDetail(
        companyId,
        workspaceId,
        memberId
      );
      setDetailMember(detail);
    } catch (err: any) {
      showToast("Failed to load details", "error");
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ===================================================
  // 🎨 HELPERS
  // ===================================================
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3" /> Active
          </div>
        );
      case "SUSPENDED":
        return (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Suspended
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200">
            {status}
          </div>
        );
    }
  };

  const renderRoleBadge = (m: WorkspaceMember) => {
    // Check role name string (Backend trả về 'Workspace Administrator' hoặc 'Workspace Member')
    const isAdmin = m.roleName?.toUpperCase().includes("ADMIN");
    const Icon = isAdmin ? Crown : Shield;
    const style = isAdmin
        ? "bg-amber-50 text-amber-800 border-2 border-amber-500"
        : "bg-blue-50 text-blue-700 border border-blue-300";



    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
      >
        <Icon className="w-3 h-3" />
        {m.roleName || "Member"}
      </div>
    );
  };

  const formatDateTime = (date?: string | null): string => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ===================================================
  // 🖥️ RENDER UI
  // ===================================================

  if (isAuthLoading || !companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white py-8 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto px-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Workspace Members{" "}
              <span className="text-slate-400 text-lg ml-2">
                ({pagination.totalElements})
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage members within this specific workspace.
            </p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-5 rounded-[3px] flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Invite to Workspace
          </Button>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center">
          <div className="relative w-full md:w-40">
            <select
              value={searchBy}
              onChange={(e) => handleSearchByChange(e.target.value)}
              className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-sm
               focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-slate-50 
               cursor-pointer appearance-none [-webkit-appearance:none] [-moz-appearance:none]"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="role">Role</option>
            </select>
            <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={`Search by ${searchBy}...`}
              className="w-full pl-9 pr-4 h-10 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : members.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeInUp">
            <MemberTable
              members={members}
              renderStatus={renderStatusBadge}
              renderRole={renderRoleBadge}
              formatDateTime={formatDateTime}
              onViewDetail={(m) => handleViewDetail(m.memberId)}
              onEdit={openEditModal}
              onDelete={openDeleteConfirmation}
              onSort={handleSort}
              currentSortBy={searchParams.sortBy}
              currentSortDir={searchParams.sortDir}
              disableEdit={(m) => m.userId === user?.id} // Không sửa chính mình
              disableDelete={(m) => m.userId === user?.id} // Không xóa chính mình
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Page {pagination.pageNumber + 1} of {pagination.totalPages || 1}
              </p>
              <div className="flex gap-1">
                <Button
                  onClick={() => handlePageChange(0)}
                  disabled={pagination.first}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.pageNumber - 1)}
                  disabled={pagination.first}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.pageNumber + 1)}
                  disabled={pagination.last}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.totalPages - 1)}
                  disabled={pagination.last}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No members found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Try inviting a new member to this workspace.
            </p>
          </div>
        )}

        {/* --- MODALS --- */}

        {/* Invite Modal */}
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
          isLoading={loading}
          email={inviteEmail}
          setEmail={setInviteEmail}
          roleCode={inviteRoleCode}
          setRoleCode={setInviteRoleCode}
          title="Invite to Workspace"
          description="Add a new member to this workspace."
          contextType="workspace" // Để Modal hiển thị đúng role options (Workspace Admin/Member)
        />

        {/* Detail Modal */}
        <MemberDetailModalBase
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          member={detailMember}
          loading={loadingDetail}
          title="Member Details"
          fields={[
            { label: "Full Name", key: "fullName" },
            { label: "Email", key: "email" },
            { label: "Role", key: "roleName" },
            { label: "Joined At", key: "joinedAt" },
            { label: "Phone", key: "phoneNumber" },
          ]}
        />

        {/* Delete Confirmation */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmRemove}
          isLoading={isDeleting}
          title="Remove Member"
          description={`Are you sure you want to remove ${memberToDelete?.fullName} from this workspace?`}
          confirmText="Remove"
          modalVariant="danger"
        />

        {/* Edit Modal (Inline) */}
        {showEditModal && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900">
                  Edit Workspace Member
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                    {selectedMember.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {selectedMember.fullName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedMember.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900 block">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white appearance-none"
                    >
                      <option value="">
                        {selectedMember.roleName || "No Change"}
                      </option>
                      <option value="WORKSPACE_MEMBER">Member</option>
                      <option value="WORKSPACE_ADMIN">Administrator</option>
                    </select>
                    <ShieldAlert className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900 block">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white appearance-none"
                    >
                      <option value="">
                        {selectedMember.status || "No Change"}
                      </option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                    <CheckCircle className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateMember}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
