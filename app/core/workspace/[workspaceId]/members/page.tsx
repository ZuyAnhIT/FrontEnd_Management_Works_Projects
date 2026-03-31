"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Components)
// =============================================================================

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Search, Users, UserPlus, Shield, Loader2, Crown,
  CheckCircle, Clock, Save, Filter, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight, X, ShieldAlert
} from "lucide-react";

// Services & Types
import {
  getWorkspaceMembers, searchWorkspaceMembers, inviteMemberToWorkspace,
  removeWorkspaceMember, updateWorkspaceMemberStatus, updateWorkspaceMemberRole,
  getWorkspaceMemberDetail, PageResponse, WorkspaceMember,
} from "@/services/apiWorkspace";

// Context & UI
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Buttons";
import { cn } from "@/lib/utils";

// Shared Feature Components
import MemberTable from "@/components/ui/MemberTable";
import InviteMemberModal from "@/components/ui/InviteMemberModal";
import MemberDetailModalBase from "@/components/ui/MemberDetailModalBase";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// =============================================================================
// 2. CONSTANTS & INTERFACES
// =============================================================================

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
  role?: string;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function WorkspaceMembersPage() {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS, CONTEXT & PARAMS
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const params = useParams();
  const workspaceId = Number(params.workspaceId);
  const { user, activeCompany, isLoading: isAuthLoading } = useAuth();
  const companyId = activeCompany?.companyId;

  // ---------------------------------------------------------------------------
  // 5. STATE MANAGEMENT
  // ---------------------------------------------------------------------------

  // Data States
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Pagination States
  const [searchValue, setSearchValue] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [searchParams, setSearchParams] = useState<MemberSearchParams>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sortBy: DEFAULT_SORT_BY,
    sortDir: DEFAULT_SORT_DIR,
  });

  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    last: true,
    first: true,
  });

  // Modal: Invite
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleCode, setInviteRoleCode] = useState("WORKSPACE_MEMBER");

  // Modal: Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRole, setNewRole] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal: Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<WorkspaceMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal: Detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMember, setDetailMember] = useState<WorkspaceMember | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // ---------------------------------------------------------------------------
  // 6. DATA FETCHING (Handlers)
  // ---------------------------------------------------------------------------

  /**
   * Tai danh sach thanh vien dua tren bo loc va phan trang
   */
  const fetchMembersData = useCallback(async (params: MemberSearchParams) => {
    if (!companyId || !workspaceId) return;
    setIsLoading(true);

    try {
      const { name, email, phone, role, ...apiParams } = params;
      const isSearching = name || email || phone || role;
      
      let response: PageResponse<WorkspaceMember>;
      
      if (isSearching) {
        response = await searchWorkspaceMembers(companyId, workspaceId, params);
      } else {
        response = await getWorkspaceMembers(companyId, workspaceId, apiParams);
      }

      setMembers(response.content || []);
      setPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        first: response.first,
        last: response.last,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to load directory";
      showToast(message, "error");
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, workspaceId, showToast]);

  // Hieu ung tu dong tai lai khi tham so thay doi (co Debounce)
  useEffect(() => {
    if (!companyId || !workspaceId || isAuthLoading) return;
    const timer = setTimeout(() => fetchMembersData(searchParams), 300);
    return () => clearTimeout(timer);
  }, [searchParams, companyId, workspaceId, isAuthLoading, fetchMembersData]);

  // ---------------------------------------------------------------------------
  // 7. EVENT HANDLERS (Business Logic)
  // ---------------------------------------------------------------------------

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleSort = (field: string) => {
    setSearchParams((prev) => ({
      ...prev,
      sortBy: field,
      sortDir: prev.sortBy === field && prev.sortDir === "desc" ? "asc" : "desc",
      page: 0,
    }));
  };

  const handleSearchUpdate = (text: string) => {
    setSearchValue(text);
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      name: undefined, email: undefined, phone: undefined, role: undefined,
      [searchBy]: text,
    }));
  };

  const handleSearchCriteriaChange = (field: string) => {
    setSearchBy(field);
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      name: undefined, email: undefined, phone: undefined, role: undefined,
      [field]: searchValue,
    }));
  };

  /**
   * Gui loi moi tham gia vao Workspace
   */
  const handleInviteExecution = async () => {
    if (!inviteEmail.trim()) {
      showToast("Email address is required.", "warning");
      return;
    }
    if (!companyId || !workspaceId) return;

    setIsLoading(true);
    try {
      await inviteMemberToWorkspace(companyId, workspaceId, {
        email: inviteEmail,
        roleCode: inviteRoleCode,
      });
      showToast("Invitation dispatched successfully!", "success");
      setShowInviteModal(false);
      setInviteEmail("");
      fetchMembersData(searchParams);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Invitation failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cap nhat vai tro hoac trang thai thanh vien
   */
  const handleUpdateMemberAction = async () => {
    if (!companyId || !workspaceId || !selectedMember) return;
    if (newStatus === "" && newRole === "") {
      setShowEditModal(false);
      return;
    }

    setIsUpdating(true);
    try {
      const tasks = [];
      if (newStatus) tasks.push(updateWorkspaceMemberStatus(companyId, workspaceId, selectedMember.memberId, newStatus));
      if (newRole) tasks.push(updateWorkspaceMemberRole(companyId, workspaceId, selectedMember.memberId, newRole));
      
      await Promise.all(tasks);
      showToast("Member permissions updated.", "success");
      setShowEditModal(false);
      fetchMembersData(searchParams);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Loai bo thanh vien khoi Workspace
   */
  const handleConfirmRemoval = async () => {
    if (!companyId || !workspaceId || !memberToDelete) return;
    setIsDeleting(true);
    try {
      await removeWorkspaceMember(companyId, workspaceId, memberToDelete.memberId);
      showToast("Member removed from workspace.", "success");
      setIsDeleteModalOpen(false);
      fetchMembersData(searchParams);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Removal failed", "error");
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null);
    }
  };

  /**
   * Xem chi tiet thanh vien (360 View)
   */
  const handleViewMemberDetails = async (memberId: number) => {
    if (!companyId || !workspaceId) return;
    setIsLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const detail = await getWorkspaceMemberDetail(companyId, workspaceId, memberId);
      setDetailMember(detail);
    } catch (err: any) {
      showToast(err.message || "Failed to load details", "error");
      setShowDetailModal(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 8. UI HELPERS (Renderers)
  // ---------------------------------------------------------------------------

  const renderStatusBadge = (status: string) => {
    const configs: any = {
      ACTIVE: { class: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle, label: "Active" },
      SUSPENDED: { class: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock, label: "Suspended" },
    };
    const config = configs[status] || { class: "bg-slate-50 text-slate-500", icon: Users, label: status };
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-sm", config.class)}>
        <config.icon className="w-3 h-3" /> {config.label}
      </div>
    );
  };

  const renderRoleBadge = (m: WorkspaceMember) => {
    const isAdmin = m.roleName?.toUpperCase().includes("ADMIN");
    const Icon = isAdmin ? Crown : Shield;
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-sm",
        isAdmin ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-[#0052CC] border-blue-100"
      )}>
        <Icon className="w-3 h-3" /> {m.roleName || "Member"}
      </div>
    );
  };

  const formatDateTime = (date?: string | null): string => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // ---------------------------------------------------------------------------
  // 9. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (isAuthLoading || !companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">
        <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans text-[#172B4D] py-10 px-6">
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase flex items-center gap-3">
              Workspace Directory
              <span className="text-[#0052CC] bg-blue-50 px-2.5 py-0.5 rounded-lg text-[14px]">
                {pagination.totalElements}
              </span>
            </h1>
            <p className="text-[14px] text-[#42526E] font-medium mt-1">
              Manage permissions and roster for this specific workspace.
            </p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-black text-[12px] uppercase tracking-widest h-11 px-8 rounded-lg shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 stroke-[3]" /> Invite Teammates
          </Button>
        </div>

        {/* TOOLBAR: SEARCH & FILTER */}
        <div className="bg-white p-5 rounded-2xl border border-[#DFE1E6] shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-48">
            <select
              value={searchBy}
              onChange={(e) => handleSearchCriteriaChange(e.target.value)}
              className="w-full h-11 pl-4 pr-10 border border-[#DFE1E6] rounded-xl text-[12px] font-black uppercase tracking-widest bg-[#F4F5F7] cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 appearance-none"
            >
              <option value="name">Full Name</option>
              <option value="email">Email Addr</option>
              <option value="phone">Mobile No</option>
              <option value="role">Auth Role</option>
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative w-full md:w-[450px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#0052CC] transition-colors" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => handleSearchUpdate(e.target.value)}
              placeholder={`Lookup member by ${searchBy}...`}
              className="w-full pl-12 pr-4 h-11 bg-white border border-[#DFE1E6] rounded-xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-[#2684FF] transition-all"
            />
          </div>
        </div>

        {/* DATA CONTENT AREA */}
        <div className="relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-[#F4F5F7]/50 backdrop-blur-sm z-10 rounded-2xl">
              <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-60 mb-3" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Syncing Roster...</span>
            </div>
          ) : members.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#DFE1E6] shadow-sm overflow-hidden">
                <MemberTable
                  members={members}
                  renderStatus={renderStatusBadge}
                  renderRole={renderRoleBadge}
                  formatDateTime={formatDateTime}
                  onViewDetail={(m) => handleViewMemberDetails(m.memberId)}
                  onEdit={(m) => {
                    if (m.userId === user?.id) {
                      showToast("Self-configuration is restricted.", "warning");
                      return;
                    }
                    setSelectedMember(m);
                    setNewStatus("");
                    setNewRole("");
                    setShowEditModal(true);
                  }}
                  onDelete={(m) => {
                    if (m.userId === user?.id) {
                      showToast("You cannot remove yourself.", "error");
                      return;
                    }
                    setMemberToDelete(m);
                    setIsDeleteModalOpen(true);
                  }}
                  onSort={handleSort}
                  currentSortBy={searchParams.sortBy}
                  currentSortDir={searchParams.sortDir}
                  disableEdit={(m) => m.userId === user?.id}
                  disableDelete={(m) => m.userId === user?.id}
                />
              </div>

              <PaginationFooter pagination={pagination} onPageChange={handlePageChange} />
            </div>
          ) : (
            <EmptyState icon={Users} message="No members found in this directory." />
          )}
        </div>

        {/* MODALS SECTION */}
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteExecution}
          isLoading={isLoading}
          email={inviteEmail}
          setEmail={setInviteEmail}
          roleCode={inviteRoleCode}
          setRoleCode={setInviteRoleCode}
          contextType="workspace"
          companyId={companyId}
        />

        <MemberDetailModalBase
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          member={detailMember as any}
          loading={isLoadingDetail}
          title="Member Snapshot"
          fields={[
            { label: "Identity", key: "fullName" },
            { label: "Corporate Email", key: "email" },
            { label: "Permissions", key: "roleName" },
            { label: "Onboarding Date", key: "joinedAt" },
            { label: "Contact No", key: "phoneNumber" },
          ]}
        />

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmRemoval}
          isLoading={isDeleting}
          title="Revoke Access"
          description={`Are you sure you want to remove ${memberToDelete?.fullName}? They will lose all permissions for this workspace.`}
          confirmText="Confirm Removal"
          modalVariant="danger"
        />

        {showEditModal && selectedMember && (
          <EditMemberModal 
            member={selectedMember}
            onClose={() => setShowEditModal(false)}
            onSave={handleUpdateMemberAction}
            isUpdating={isUpdating}
            newRole={newRole}
            setNewRole={setNewRole}
            newStatus={newStatus}
            setNewStatus={setNewStatus}
          />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS (Refactored for Cleanliness)
// =============================================================================

const EmptyState = ({ icon: Icon, message }: { icon: any, message: string }) => (
  <div className="flex flex-col items-center justify-center py-28 bg-white rounded-2xl border-2 border-dashed border-[#DFE1E6]">
    <div className="w-16 h-16 bg-[#F4F5F7] rounded-full flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-slate-300 stroke-[1.5]" />
    </div>
    <h3 className="text-[16px] font-black uppercase tracking-widest text-[#172B4D]">{message}</h3>
    <p className="text-[14px] text-[#6B778C] font-medium mt-1">Try adjusting your filters or invite new teammates.</p>
  </div>
);

const PaginationFooter = ({ pagination, onPageChange }: any) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
      <p className="text-[12px] font-bold text-[#6B778C] uppercase tracking-widest">
        Page <span className="text-[#172B4D]">{pagination.pageNumber + 1}</span> 
        {" "}of <span className="text-[#172B4D]">{pagination.totalPages || 1}</span> 
        {" "}(<span className="text-[#172B4D]">{pagination.totalElements}</span> members)
      </p>

      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-[#DFE1E6] shadow-sm">
        <PaginationBtn onClick={() => onPageChange(0)} disabled={pagination.first} icon={ChevronsLeft} />
        <PaginationBtn onClick={() => onPageChange(pagination.pageNumber - 1)} disabled={pagination.first} icon={ChevronLeft} />
        <div className="px-4 text-[11px] font-black uppercase tracking-[0.15em] text-[#0052CC]">
          Navigate
        </div>
        <PaginationBtn onClick={() => onPageChange(pagination.pageNumber + 1)} disabled={pagination.last} icon={ChevronRight} />
        <PaginationBtn onClick={() => onPageChange(pagination.totalPages - 1)} disabled={pagination.last} icon={ChevronsRight} />
      </div>
    </div>
  );
};

const PaginationBtn = ({ onClick, disabled, icon: Icon }: any) => (
  <Button 
    onClick={onClick} 
    disabled={disabled} 
    variant="outline" 
    size="icon" 
    className="h-9 w-9 rounded-lg border-transparent text-[#42526E] hover:bg-[#F4F5F7] hover:text-[#172B4D] disabled:opacity-30 active:scale-90 transition-all"
  >
    <Icon className="w-4.5 h-4.5" />
  </Button>
);

const EditMemberModal = ({ member, onClose, onSave, isUpdating, newRole, setNewRole, newStatus, setNewStatus }: any) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#091E42]/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-[#FAFBFC]">
        <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#172B4D]">Modify Permissions</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-all"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4 p-4 bg-[#F4F5F7] rounded-xl border border-slate-100">
          <div className="h-12 w-12 rounded-xl bg-[#0052CC] flex items-center justify-center text-white text-lg font-black shadow-md">{member.fullName.charAt(0)}</div>
          <div className="min-w-0">
            <p className="font-black text-[#172B4D] truncate">{member.fullName}</p>
            <p className="text-[12px] font-medium text-slate-500 truncate">{member.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Workspace Role</label>
            <div className="relative">
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full h-11 pl-4 pr-10 border border-slate-200 rounded-xl text-[14px] font-bold text-[#172B4D] bg-white focus:ring-2 focus:ring-blue-100 appearance-none outline-none">
                <option value="">Current: {member.roleName}</option>
                <option value="WORKSPACE_MEMBER">Member</option>
                <option value="WORKSPACE_ADMIN">Administrator</option>
              </select>
              <ShieldAlert className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Account Status</label>
            <div className="relative">
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full h-11 pl-4 pr-10 border border-slate-200 rounded-xl text-[14px] font-bold text-[#172B4D] bg-white focus:ring-2 focus:ring-blue-100 appearance-none outline-none">
                <option value="">Current: {member.status}</option>
                <option value="ACTIVE">ACTIVE</option>
              </select>
              <CheckCircle className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      <div className="px-8 py-5 bg-[#FAFBFC] border-t border-slate-100 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} className="h-10 px-6 rounded-lg text-[12px] font-black uppercase tracking-widest border-slate-200">Cancel</Button>
        <Button onClick={onSave} disabled={isUpdating} className="h-10 px-8 bg-[#0052CC] hover:bg-[#0747A6] text-white font-black text-[12px] uppercase tracking-widest rounded-lg shadow-md active:scale-95 transition-all">
          {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
        </Button>
      </div>
    </div>
  </div>
);