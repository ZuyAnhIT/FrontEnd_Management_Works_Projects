"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Users,
  CheckCircle,
  Clock,
  Save,
  Loader2,
  UserPlus,
  Crown,
  Shield,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  XCircle as CloseIcon,
  Mail,
  Trash2,
  AlertCircle,
  Copy,
} from "lucide-react";

import {
  getCompanyMembers,
  getCompanyInvitations,
  cancelCompanyInvitation,
  inviteMemberToCompany,
  removeCompanyMember,
  updateCompanyMemberStatus,
  updateCompanyMemberRole,
  searchCompanyMembers,
  PageResponse,
  CompanyMember,
  CompanyInvitation,
  InvitationSearchParams,
} from "@/services/apiCompany";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Buttons";

// --- Components ---
// Giả định MemberDetailModal được truyền type 'any' để tránh xung đột
import MemberDetailModal from "@/components/features/admin/MemberDetailModal";
import MemberTable from "@/components/ui/MemberTable";
import InvitationTable from "@/components/ui/InvitationTable";
import InviteMemberModal from "@/components/ui/InviteMemberModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// ===================================================
// 🛠️ Interfaces & Constants
// ===================================================

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

// ===================================================
// 🖥️ Component Chính
// ===================================================

export default function MembersPage() {
  const { showToast } = useToast();
  const { user, activeCompany, isLoading: isAuthLoading } = useAuth();

  // Data State
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const companyId = activeCompany?.companyId || null;

  // --- States UI ---
  const [activeTab, setActiveTab] = useState<TabType>("MEMBERS");

  // --- States Phân trang & Tìm kiếm ---
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

  // --- States Modals ---
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteRoleCode, setInviteRoleCode] = useState("COMPANY_MEMBER");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CompanyMember | null>(
    null
  );
  const [newStatus, setNewStatus] = useState("");
  const [newRoleCode, setNewRoleCode] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete / Cancel Modal (Dùng chung cho cả xóa member và hủy lời mời)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDesc, setConfirmDesc] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() =>
    Promise.resolve()
  );

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMember, setDetailMember] = useState<CompanyMember | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false); // Giữ nguyên, giả định dùng khi load detail

  // ===================================================
  // 🔄 Fetch Data Logic (Logic nghiệp vụ quan trọng)
  // ===================================================
  const fetchData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    try {
      if (activeTab === "MEMBERS") {
        // --- FETCH MEMBERS ---
        const { name, email, roleName, status, ...apiParams } = searchParams;
        const useSearchApi = name || email || roleName || status;
        let data: PageResponse<CompanyMember>;

        // Cập nhật params dựa trên searchValue hiện tại nếu cần đồng bộ
        if (searchValue && searchBy) {
          const searchPayload: any = { ...apiParams };
          searchPayload[searchBy] = searchValue;
          data = await searchCompanyMembers(companyId, searchPayload);
        } else if (useSearchApi) {
          // Fallback nếu dùng filter object trực tiếp
          data = await searchCompanyMembers(companyId, searchParams);
        } else {
          data = await getCompanyMembers(companyId, apiParams);
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
      } else {
        // --- FETCH INVITATIONS ---
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
        setPagination({
          pageNumber: res.pageNumber,
          pageSize: res.pageSize,
          totalElements: res.totalElements,
          totalPages: res.totalPages,
          first: res.first,
          last: res.last,
        });
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      const message =
        err.response?.data?.message || err.message || "Failed to load data";
      showToast(message, "error");
      setMembers([]);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, activeTab, searchParams, searchValue, searchBy, showToast]);

  // Debounce Fetch
  useEffect(() => {
    if (!companyId || isAuthLoading) return;
    const t = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(t);
  }, [fetchData, companyId, isAuthLoading]);

  // ===================================================
  // ⚙️ Handlers (Giữ nguyên logic chức năng)
  // ===================================================

  // Chuyển Tab
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchValue(""); // Reset search text
    setSearchParams((prev) => ({ ...prev, page: 0 })); // Reset page
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleSort = (newSortBy: string) => {
    setSearchParams((prev) => ({
      ...prev,
      sortBy: newSortBy,
      sortDir:
        prev.sortBy === newSortBy && prev.sortDir === "desc" ? "asc" : "desc",
      page: 0,
    }));
  };

  const handleSearchChange = (text: string) => {
    setSearchValue(text);
    // Logic cập nhật searchParams để trigger fetch
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      // Reset các field cũ
      name: undefined,
      email: undefined,
      phone: undefined,
      roleName: undefined,
      status: undefined,
      // Set field mới
      [searchBy]: text,
    }));
  };

  const handleSearchByChange = (field: string) => {
    setSearchBy(field);
    // Giữ nguyên text, đổi field
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      name: undefined,
      email: undefined,
      phone: undefined,
      roleName: undefined,
      status: undefined,
      [field]: searchValue,
    }));
  };

  // --- ACTIONS ---

  const handleInvite = async () => {
    if (!email.trim() || !companyId || !inviteRoleCode) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }
    setLoading(true);
    try {
      await inviteMemberToCompany(companyId, {
        email,
        roleCode: inviteRoleCode,
      });
      showToast("Invitation sent successfully!", "success");
      setEmail("");
      setInviteRoleCode("COMPANY_MEMBER");
      setShowInviteModal(false);

      // Chuyển sang tab Invitations để xem kết quả
      if (activeTab !== "INVITATIONS") {
        setActiveTab("INVITATIONS");
      } else {
        fetchData();
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Invite failed";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Mở modal xóa thành viên
  const openDeleteMemberConfirm = (member: CompanyMember) => {
    if (member.userId === user?.id) {
      showToast("You cannot remove yourself.", "error");
      return;
    }
    setConfirmTitle("Remove Member?");
    setConfirmDesc(
      `Are you sure you want to remove ${member.fullName}? They will lose access immediately.`
    );
    setConfirmAction(() => async () => {
      if (!companyId) return;
      await removeCompanyMember(companyId, member.userId);
      showToast("Member removed successfully", "success");
      fetchData();
    });
    setIsConfirmOpen(true);
  };

  // Mở modal hủy lời mời (Mới)
  const openCancelInvitationConfirm = (inv: CompanyInvitation) => {
    setConfirmTitle("Revoke Invitation?");
    setConfirmDesc(
      `Cancel invitation for ${inv.email}? The link will become invalid.`
    );
    setConfirmAction(() => async () => {
      if (!companyId) return;
      await cancelCompanyInvitation(companyId, inv.id);
      showToast("Invitation revoked successfully", "success");
      fetchData();
    });
    setIsConfirmOpen(true);
  };

  // Xử lý xác nhận chung
  const handleConfirmAction = async () => {
    setIsProcessingAction(true);
    try {
      await confirmAction();
      setIsConfirmOpen(false);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Action failed";
      showToast(message, "error");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Các hàm cũ (View Detail, Edit Role...) giữ nguyên logic
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

  const handleUpdateMember = async () => {
    if (!companyId || !selectedMember) return;
    setIsUpdating(true);
    try {
      const promises = [];
      if (newStatus !== "")
        promises.push(
          updateCompanyMemberStatus(
            companyId,
            selectedMember.memberId,
            newStatus
          )
        );
      if (newRoleCode !== "")
        promises.push(
          updateCompanyMemberRole(
            companyId,
            selectedMember.memberId,
            newRoleCode
          )
        );

      await Promise.all(promises);
      fetchData();
      showToast("Member updated successfully", "success");
      setShowEditModal(false);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Update failed";
      showToast(message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // ===================================================
  // 🎨 Helpers Render
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
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <CloseIcon className="w-3 h-3" /> Suspended
          </div>
        );
      case "PENDING":
        return (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Pending
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

  const renderRoleBadge = (m: CompanyMember) => {
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
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  // ===================================================
  // 🖥️ RENDER MAIN
  // ===================================================

  if (isAuthLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  if (!companyId)
    return <div className="p-10 text-center">No Active Company</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 p-6 sm:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Team Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage users and pending invitations for{" "}
              <span className="font-semibold text-blue-600">
                {activeCompany?.companyName}
              </span>
              .
            </p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-5 rounded-[3px] flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Invite People
          </Button>
        </div>

        {/* TABS NAVIGATION */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex gap-6" aria-label="Tabs">
            <button
              onClick={() => handleTabChange("MEMBERS")}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === "MEMBERS"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Users className="w-4 h-4" />
              Members{" "}
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs ml-1">
                {activeTab === "MEMBERS" ? pagination.totalElements : ""}
              </span>
            </button>

            <button
              onClick={() => handleTabChange("INVITATIONS")}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === "INVITATIONS"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Mail className="w-4 h-4" />
              Invitations{" "}
              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs ml-1">
                {activeTab === "INVITATIONS" ? pagination.totalElements : ""}
              </span>
            </button>
          </nav>
        </div>

        {/* TOOLBAR & SEARCH */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center">
          {/* Select Field (Chỉ hiện ở Tab Members) */}
          {activeTab === "MEMBERS" && (
            <div className="relative w-full md:w-40">
              <select
                value={searchBy}
                onChange={(e) => handleSearchByChange(e.target.value)}
                className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-slate-50 cursor-pointer"
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="roleName">Role</option>
                <option value="status">Status</option>
              </select>
            </div>
          )}

          {/* Search Input */}
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={
                activeTab === "MEMBERS"
                  ? `Search by ${searchBy}...`
                  : "Search email..."
              }
              className="w-full pl-9 pr-4 h-10 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* CONTENT AREA */}
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* 1. MEMBERS VIEW */}
            {activeTab === "MEMBERS" &&
              (members.length > 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
                  <Users className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-slate-500">No members found.</p>
                </div>
              ))}

            {/* 2. INVITATIONS VIEW */}
            {activeTab === "INVITATIONS" &&
              (invitations.length > 0 ? (
                <InvitationTable
                  invitations={invitations}
                  onCancel={openCancelInvitationConfirm}
                  formatDateTime={formatDateTime}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
                  <Mail className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-slate-500">No pending invitations.</p>
                  <Button
                    variant="link"
                    onClick={() => setShowInviteModal(true)}
                  >
                    Invite someone now
                  </Button>
                </div>
              ))}

            {/* PAGINATION */}
            {(activeTab === "MEMBERS"
              ? members.length > 0
              : invitations.length > 0) && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-900">
                    {pagination.pageNumber * pagination.pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-900">
                    {Math.min(
                      (pagination.pageNumber + 1) * pagination.pageSize,
                      pagination.totalElements
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900">
                    {pagination.totalElements}
                  </span>{" "}
                  results
                </p>

                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => handlePageChange(0)}
                    disabled={pagination.first}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    title="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    disabled={pagination.first}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="mx-2 text-sm font-medium text-slate-700">
                    Page {pagination.pageNumber + 1} of {pagination.totalPages}
                  </span>
                  <Button
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    disabled={pagination.last}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handlePageChange(pagination.totalPages - 1)}
                    disabled={pagination.last}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    title="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* --- MODALS --- */}
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
          isLoading={loading}
          email={email}
          setEmail={setEmail}
          roleCode={inviteRoleCode}
          setRoleCode={setInviteRoleCode}
          contextType="company"
        />

        {/* FIX: Ép kiểu Member cho Modal Detail nếu cần thiết, hoặc sử dụng type 'any' */}
        <MemberDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          member={detailMember as any}
          loading={loadingDetail}
        />

        {/* Confirmation Modal (Dùng chung cho Delete & Cancel) */}
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmAction}
          isLoading={isProcessingAction}
          title={confirmTitle}
          description={confirmDesc}
          confirmText="Confirm"
          modalVariant={confirmTitle.includes("Revoke") ? "warning" : "danger"} // Dựa vào title để chọn variant
        />

        {/* EDIT MODAL */}
        {showEditModal && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Edit Member</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title="Close"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
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
                      value={newRoleCode}
                      onChange={(e) => setNewRoleCode(e.target.value)}
                      className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none"
                    >
                      <option value="">
                        {selectedMember.roleName || "No Change"}
                      </option>
                      <option value="COMPANY_MEMBER">Member</option>
                      <option value="COMPANY_ADMIN">Administrator</option>
                    </select>
                    <Shield className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900 block">
                    Account Status
                  </label>
                  <div className="relative">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none"
                    >
                      <option value="">
                        {selectedMember.status || "No Change"}
                      </option>
                      <option value="ACTIVE">Active</option>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
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
