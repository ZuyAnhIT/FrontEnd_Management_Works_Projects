"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Components)
// =============================================================================

import React, { useEffect, useState, useCallback } from "react";
import {
  Search, Users, CheckCircle, Clock, Save, Loader2, UserPlus,
  Crown, Shield, ChevronsLeft, ChevronLeft, ChevronRight,
  ChevronsRight, XCircle, Mail, AlertCircle, Filter
} from "lucide-react";

// Services & Types
import {
  getCompanyMembers, getCompanyInvitations, cancelCompanyInvitation,
  inviteMemberToCompany, removeCompanyMember, updateCompanyMemberStatus,
  updateCompanyMemberRole, searchCompanyMembers, PageResponse,
  CompanyMember, CompanyInvitation, InvitationSearchParams,
} from "@/services/apiCompany";

// Context & UI Components
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Buttons";
import MemberDetailModal from "@/components/features/admin/MemberDetailModal";
import MemberTable from "@/components/ui/MemberTable";
import InvitationTable from "@/components/ui/InvitationTable";
import InviteMemberModal from "@/components/ui/InviteMemberModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. INTERFACES & CONSTANTS
// =============================================================================

type TabType = "MEMBERS" | "INVITATIONS";

interface MemberSearchParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  name?: string;
  email?: string;
  roleName?: string;
  status?: string;
  [key: string]: any;
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "joinedAt";
const DEFAULT_SORT_DIR = "desc";

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function MembersPage() {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS & CONTEXT
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const { user, activeCompany, isLoading: isAuthLoading } = useAuth();
  const companyId = activeCompany?.companyId || null;

  // ---------------------------------------------------------------------------
  // 5. STATE MANAGEMENT
  // ---------------------------------------------------------------------------

  // Data States
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("MEMBERS");

  // Pagination & Search States
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });

  const [searchParams, setSearchParams] = useState<MemberSearchParams>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sortBy: DEFAULT_SORT_BY,
    sortDir: DEFAULT_SORT_DIR,
  });

  const [searchValue, setSearchValue] = useState("");
  const [searchBy, setSearchBy] = useState("name");

  // Modal States
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleCode, setInviteRoleCode] = useState("COMPANY_MEMBER");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CompanyMember | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRoleCode, setNewRoleCode] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Common Confirmation Modal
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [confirmContent, setConfirmContent] = useState({ title: "", desc: "", variant: "danger" as any });
  const [onConfirmAction, setOnConfirmAction] = useState<() => Promise<void>>(() => Promise.resolve());

  // Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMember, setDetailMember] = useState<CompanyMember | null>(null);
  const [loadingDetail] = useState(false); 

  // ---------------------------------------------------------------------------
  // 6. DATA FETCHING (Handlers)
  // ---------------------------------------------------------------------------

  /**
   * Tai du lieu thanh vien hoac loi moi dua tren Tab va Bo loc hien tai
   */
  const fetchData = useCallback(async () => {
    if (!companyId) return;
    setIsLoading(true);

    try {
      if (activeTab === "MEMBERS") {
        const { name, email, roleName, status, ...apiParams } = searchParams;
        const useSearchApi = name || email || roleName || status;
        let response: PageResponse<CompanyMember>;

        // Uu tien logic tim kiem neu co gia tri search
        if (searchValue && searchBy) {
          const searchPayload: any = { ...apiParams };
          searchPayload[searchBy] = searchValue;
          response = await searchCompanyMembers(companyId, searchPayload);
        } else if (useSearchApi) {
          response = await searchCompanyMembers(companyId, searchParams);
        } else {
          response = await getCompanyMembers(companyId, apiParams);
        }

        setMembers(response.content || []);
        updatePaginationState(response);
      } else {
        const invParams: InvitationSearchParams = {
          page: searchParams.page,
          size: searchParams.size,
          sortBy: "createdAt",
          sortDir: "desc",
          status: "PENDING",
          keyword: searchValue || undefined,
        };

        const res = await getCompanyInvitations(companyId, invParams);
        setInvitations(res.content || []);
        updatePaginationState(res);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to load directory data";
      showToast(message, "error");
      setMembers([]);
      setInvitations([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, activeTab, searchParams, searchValue, searchBy, showToast]);

  const updatePaginationState = (data: PageResponse<any>) => {
    setPagination({
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      first: data.first,
      last: data.last,
    });
  };

  // Debounce hieu ung tai du lieu
  useEffect(() => {
    if (!companyId || isAuthLoading) return;
    const timer = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timer);
  }, [fetchData, companyId, isAuthLoading]);

  // ---------------------------------------------------------------------------
  // 7. EVENT HANDLERS (Business Logic)
  // ---------------------------------------------------------------------------

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchValue("");
    setSearchParams((prev) => ({ ...prev, page: 0 }));
  };

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

  const handleSearchChange = (text: string) => {
    setSearchValue(text);
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      name: undefined, email: undefined, phone: undefined, roleName: undefined, status: undefined,
      [searchBy]: text,
    }));
  };

  const handleSearchByChange = (field: string) => {
    setSearchBy(field);
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      name: undefined, email: undefined, phone: undefined, roleName: undefined, status: undefined,
      [field]: searchValue,
    }));
  };

  /**
   * Gui loi moi thanh vien moi vao to chuc
   */
  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !companyId || !inviteRoleCode) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }
    setIsLoading(true);
    try {
      await inviteMemberToCompany(companyId, { email: inviteEmail, roleCode: inviteRoleCode });
      showToast("Invitation dispatched successfully!", "success");
      setInviteEmail("");
      setInviteRoleCode("COMPANY_MEMBER");
      setShowInviteModal(false);
      
      if (activeTab !== "INVITATIONS") {
        setActiveTab("INVITATIONS");
      } else {
        fetchData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "Invitation failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xoa vinh vien mot thanh vien khoi cong ty
   */
  const openDeleteMemberConfirm = (member: CompanyMember) => {
    if (member.userId === user?.id) {
      showToast("Self-removal is not permitted.", "error");
      return;
    }
    setConfirmContent({
      title: "Remove Team Member",
      desc: `Are you sure you want to remove ${member.fullName}? Access will be revoked immediately.`,
      variant: "danger"
    });
    setOnConfirmAction(() => async () => {
      if (!companyId) return;
      await removeCompanyMember(companyId, member.userId);
      showToast("Member successfully removed.", "success");
      fetchData();
    });
    setIsConfirmOpen(true);
  };

  /**
   * Thu hoi loi moi da gui
   */
  const openCancelInvitationConfirm = (inv: CompanyInvitation) => {
    setConfirmContent({
      title: "Revoke Invitation",
      desc: `Cancel pending invitation for ${inv.email}? The secure link will be invalidated.`,
      variant: "warning"
    });
    setOnConfirmAction(() => async () => {
      if (!companyId) return;
      await cancelCompanyInvitation(companyId, inv.id);
      showToast("Invitation revoked successfully.", "success");
      fetchData();
    });
    setIsConfirmOpen(true);
  };

  /**
   * Xu ly luong Confirm Action chung
   */
  const handleConfirmAction = async () => {
    setIsProcessingAction(true);
    try {
      await onConfirmAction();
      setIsConfirmOpen(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "Action failed", "error");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleViewDetails = (member: CompanyMember) => {
    setDetailMember(member);
    setShowDetailModal(true);
  };

  const openEditModal = (member: CompanyMember) => {
    setSelectedMember(member);
    setNewStatus("");
    setNewRoleCode("");
    setShowEditModal(true);
  };

  /**
   * Cap nhat vai tro hoac trang thai cua nhan vien
   */
  const handleUpdateMemberAction = async () => {
    if (!companyId || !selectedMember) return;
    setIsUpdating(true);
    try {
      const tasks = [];
      if (newStatus !== "") tasks.push(updateCompanyMemberStatus(companyId, selectedMember.memberId, newStatus));
      if (newRoleCode !== "") tasks.push(updateCompanyMemberRole(companyId, selectedMember.memberId, newRoleCode));
      
      await Promise.all(tasks);
      showToast("Member configuration updated.", "success");
      setShowEditModal(false);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "Update failed", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 8. UI HELPERS (Renderers)
  // ---------------------------------------------------------------------------

  const formatDateTime = (date?: string | null): string => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const renderStatusBadge = (status: string) => {
    const configs: any = {
      ACTIVE: { class: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle, label: "Active" },
      SUSPENDED: { class: "bg-slate-100 text-slate-600 border-slate-200", icon: XCircle, label: "Suspended" },
      PENDING: { class: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock, label: "Pending" },
    };
    const config = configs[status] || { class: "bg-slate-50 text-slate-500", icon: AlertCircle, label: status };
    const Icon = config.icon;
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-sm", config.class)}>
        <Icon className="w-3 h-3" /> {config.label}
      </div>
    );
  };

  const renderRoleBadge = (m: CompanyMember) => {
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

  // ---------------------------------------------------------------------------
  // 9. RENDER LOGIC
  // ---------------------------------------------------------------------------

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">
        <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin" />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400">
        No Active Workspace
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans text-[#172B4D] p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase">Team Directory</h1>
            <p className="text-[14px] text-[#42526E] font-medium mt-1">
              Manage workforce access and pending invites for <span className="text-[#0052CC] font-bold">{activeCompany?.companyName}</span>
            </p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-black text-[12px] uppercase tracking-widest h-11 px-8 rounded-lg shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 stroke-[3]" /> Invite Teammates
          </Button>
        </div>

        {/* TABS NAVIGATION */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex gap-8">
            {(["MEMBERS", "INVITATIONS"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  "pb-4 px-1 border-b-2 font-black text-[12px] uppercase tracking-[0.2em] flex items-center gap-2.5 transition-all",
                  activeTab === tab 
                    ? "border-[#0052CC] text-[#0052CC]" 
                    : "border-transparent text-[#6B778C] hover:text-[#172B4D] hover:border-slate-300"
                )}
              >
                {tab === "MEMBERS" ? <Users className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                {tab}
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] shadow-sm border",
                  activeTab === tab ? "bg-[#0052CC] text-white border-[#0052CC]" : "bg-white text-slate-500 border-slate-200"
                )}>
                  {activeTab === tab ? pagination.totalElements : "—"}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* TOOLBAR: SEARCH & FILTER */}
        <div className="bg-white p-5 rounded-2xl border border-[#DFE1E6] shadow-sm flex flex-col md:flex-row gap-4 items-center">
          {activeTab === "MEMBERS" && (
            <div className="relative w-full md:w-48">
              <select
                value={searchBy}
                onChange={(e) => handleSearchByChange(e.target.value)}
                className="w-full h-11 pl-4 pr-10 border border-[#DFE1E6] rounded-xl text-[12px] font-black uppercase tracking-widest bg-[#F4F5F7] cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 appearance-none"
              >
                <option value="name">Full Name</option>
                <option value="email">Email Addr</option>
                <option value="phone">Mobile No</option>
                <option value="roleName">Auth Role</option>
                <option value="status">Status</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          )}

          <div className="relative w-full md:w-[450px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#0052CC] transition-colors" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={activeTab === "MEMBERS" ? `Lookup member by ${searchBy}...` : "Filter by email address..."}
              className="w-full pl-12 pr-4 h-11 bg-white border border-[#DFE1E6] rounded-xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-[#2684FF] transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* CONTENT DATA AREA */}
        <div className="relative">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm gap-3">
              <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin opacity-60" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Syncing directory...</span>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              
              {/* === VIEW 1: MEMBERS === */}
              {activeTab === "MEMBERS" && (
                members.length > 0 ? (
                  <div className="bg-white rounded-2xl border border-[#DFE1E6] shadow-sm overflow-hidden">
                    <MemberTable
                      members={members}
                      renderStatus={renderStatusBadge}
                      renderRole={renderRoleBadge}
                      formatDateTime={formatDateTime}
                      onViewDetail={handleViewDetails}
                      onEdit={openEditModal}
                      onDelete={openDeleteMemberConfirm}
                      onSort={handleSort}
                      currentSortBy={searchParams.sortBy}
                      currentSortDir={searchParams.sortDir}
                      disableEdit={(m) => m.userId === user?.id}
                      disableDelete={(m) => m.userId === user?.id}
                    />
                  </div>
                ) : (
                  <EmptyState icon={Users} message="No team members found." />
                )
              )}

              {/* === VIEW 2: INVITATIONS === */}
              {activeTab === "INVITATIONS" && (
                invitations.length > 0 ? (
                  <div className="bg-white rounded-2xl border border-[#DFE1E6] shadow-sm overflow-hidden">
                    <InvitationTable 
                      invitations={invitations} 
                      onCancel={openCancelInvitationConfirm} 
                      formatDateTime={formatDateTime} 
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-[#DFE1E6]">
                    <Mail className="w-12 h-12 text-slate-200 mb-4 stroke-[1.5]" />
                    <p className="text-[14px] font-bold text-slate-400 uppercase tracking-widest mb-4">No pending invitations.</p>
                    <Button variant="link" onClick={() => setShowInviteModal(true)} className="text-[#0052CC] font-bold">
                      Invite someone now
                    </Button>
                  </div>
                )
              )}

              {/* PAGINATION FOOTER */}
              <PaginationFooter pagination={pagination} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>

      {/* MODALS SECTION */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleSendInvite}
        isLoading={isLoading}
        email={inviteEmail}
        setEmail={setInviteEmail}
        roleCode={inviteRoleCode}
        setRoleCode={setInviteRoleCode}
        contextType="company"
      />

      <MemberDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        member={detailMember as any}
        loading={loadingDetail}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        isLoading={isProcessingAction}
        title={confirmContent.title}
        description={confirmContent.desc}
        confirmText="Execute Action"
        modalVariant={confirmContent.variant}
      />

      {/* EDIT ROLE & STATUS MODAL (Inline Refactored) */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#091E42]/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-[#FAFBFC]">
              <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#172B4D]">Modify Member Permissions</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-all"><XCircle className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-[#F4F5F7] rounded-xl border border-slate-100">
                <div className="h-12 w-12 rounded-xl bg-[#0052CC] flex items-center justify-center text-white text-lg font-black shadow-md">{selectedMember.fullName.charAt(0)}</div>
                <div className="min-w-0"><p className="font-black text-[#172B4D] truncate">{selectedMember.fullName}</p><p className="text-[12px] font-medium text-slate-500 truncate">{selectedMember.email}</p></div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Authority Role</label>
                  <div className="relative"><select value={newRoleCode} onChange={(e) => setNewRoleCode(e.target.value)} className="w-full h-11 pl-4 pr-10 border border-slate-200 rounded-xl text-[14px] font-bold text-[#172B4D] bg-white focus:ring-2 focus:ring-blue-100 appearance-none outline-none">
                    <option value="">Current: {selectedMember.roleName}</option>
                    <option value="COMPANY_MEMBER">Member</option>
                    <option value="COMPANY_ADMIN">Administrator</option>
                  </select><Shield className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Operating Status</label>
                  <div className="relative"><select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full h-11 pl-4 pr-10 border border-slate-200 rounded-xl text-[14px] font-bold text-[#172B4D] bg-white focus:ring-2 focus:ring-blue-100 appearance-none outline-none">
                    <option value="">Current: {selectedMember.status}</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select><CheckCircle className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" /></div>
                </div>
              </div>
            </div>
            <div className="px-8 py-5 bg-[#FAFBFC] border-t border-slate-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="h-10 px-6 rounded-lg text-[12px] font-black uppercase tracking-widest border-slate-200">Cancel</Button>
              <Button onClick={handleUpdateMemberAction} disabled={isUpdating} className="h-10 px-8 bg-[#0052CC] hover:bg-[#0747A6] text-white font-black text-[12px] uppercase tracking-widest rounded-lg shadow-md active:scale-95 transition-all">
                {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Snapshot
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS (Refactored for Cleanliness)
// =============================================================================

const EmptyState = ({ icon: Icon, message }: { icon: any, message: string }) => (
  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-[#DFE1E6]">
    <Icon className="w-12 h-12 text-slate-200 mb-4 stroke-[1.5]" />
    <p className="text-[14px] font-bold text-slate-400 uppercase tracking-widest">{message}</p>
  </div>
);

const PaginationFooter = ({ pagination, onPageChange }: any) => {
  if (pagination.totalElements === 0) return null;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8 px-2">
      <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
        Displaying <span className="text-[#172B4D]">{pagination.pageNumber * pagination.pageSize + 1}</span> 
        {" "}to <span className="text-[#172B4D]">{Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}</span> 
        {" "}of <span className="text-[#172B4D]">{pagination.totalElements}</span> entries
      </p>

      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#DFE1E6] shadow-sm">
        <PaginationBtn onClick={() => onPageChange(0)} disabled={pagination.first} icon={ChevronsLeft} />
        <PaginationBtn onClick={() => onPageChange(pagination.pageNumber - 1)} disabled={pagination.first} icon={ChevronLeft} />
        <div className="px-4 text-[11px] font-black uppercase tracking-widest text-[#0052CC]">
          Page {pagination.pageNumber + 1} / {pagination.totalPages}
        </div>
        <PaginationBtn onClick={() => onPageChange(pagination.pageNumber + 1)} disabled={pagination.last} icon={ChevronRight} />
        <PaginationBtn onClick={() => onPageChange(pagination.totalPages - 1)} disabled={pagination.last} icon={ChevronsRight} />
      </div>
    </div>
  );
};

const PaginationBtn = ({ onClick, disabled, icon: Icon }: any) => (
  <Button onClick={onClick} disabled={disabled} variant="outline" size="icon" className="h-9 w-9 rounded-lg border-transparent hover:bg-[#F4F5F7] disabled:opacity-30 active:scale-90 transition-all">
    <Icon className="w-4 h-4" />
  </Button>
);