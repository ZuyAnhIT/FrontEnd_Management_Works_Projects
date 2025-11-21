"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  Users,
  ShieldAlert,
  CheckCircle,
  Clock,
  XCircle,
  Save,
  Loader2,
  UserPlus,
  Crown,
  Shield,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  XCircle as CloseIcon, // Đổi tên để tránh xung đột với XCircle của Status
} from "lucide-react";

import {
  getCompanyMembers,
  inviteMemberToCompany,
  removeCompanyMember,
  updateCompanyMemberStatus,
  updateCompanyMemberRole,
  searchCompanyMembers,
  PageResponse,
  CompanyMember,
} from "@/services/apiCompany";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/button";

// --- Giả định components ---
import MemberDetailModal from "@/components/features/admin/MemberDetailModal";
// Cần đảm bảo MemberTable nhận đủ props onSort, currentSortBy, currentSortDir
import MemberTable from "@/components/ui/MemberTable";
// Cần đảm bảo InviteMemberModal nhận đủ props inviteRoleCode, setInviteRoleCode
import InviteMemberModal from "@/components/ui/InviteMemberModal";
// Cần đảm bảo ConfirmationModal nhận prop modalVariant (thay cho variant)
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// ===================================================
// 🛠️ Interfaces & Constants
// ===================================================

interface MemberSearchParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  name?: string;
  email?: string;
  roleName?: string;
  status?: string;
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "joinedAt";
const DEFAULT_SORT_DIR = "desc";

// ===================================================
// 🖥️ Component Chính
// ===================================================

export default function MembersPage() {
  const { showToast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const companyId = user?.company?.companyId || null;

  // --- States Phân trang & Tìm kiếm ---
  const [pagination, setPagination] = useState<Omit<PageResponse<CompanyMember>, 'content'>>({
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
  // 🔥 FIX: searchValue thay cho filterInputs
  const [searchValue, setSearchValue] = useState("");


  // --- States Modals (Giữ nguyên cấu trúc ban đầu) ---
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState("");
  // Đổi tên biến tránh xung đột prop: roleCode -> inviteRoleCode
  const [inviteRoleCode, setInviteRoleCode] = useState("COMPANY_MEMBER");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CompanyMember | null>(null);
  const [newStatus, setNewStatus] = useState("");
  // Đổi tên biến tránh xung đột prop: newRole -> newRoleCode
  const [newRoleCode, setNewRoleCode] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<CompanyMember | null>(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMember, setDetailMember] = useState<CompanyMember | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [searchBy, setSearchBy] = useState("name");


  // ===================================================
  // 🔄 Fetch Data Logic
  // ===================================================
  const fetchMembers = useCallback(async (params: MemberSearchParams) => {
    if (!companyId) return;
    setLoading(true);
    try {
      const { name, email, roleName, status, ...apiParams } = params;

      let data: PageResponse<CompanyMember>;

      const useSearchApi = name || email || roleName || status;

      if (useSearchApi) {
        // Lỗi 1 được giải quyết: Sử dụng searchCompanyMembers
        data = await searchCompanyMembers(companyId, params);
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

    } catch (err: any) {
      console.error("Error fetching company info:", err);
      showToast(err.response?.data?.message || err.message || "Failed to load members", "error");
      setMembers([]);
      setPagination(prev => ({ ...prev, totalElements: 0, totalPages: 0 }));
    } finally {
      setLoading(false);
    }
  }, [companyId, showToast]);

  useEffect(() => {
    if (!companyId || isAuthLoading) return;

    const t = setTimeout(() => {
      fetchMembers(searchParams);
    }, 300);

    return () => clearTimeout(t);
  }, [searchParams, companyId, isAuthLoading]);


  // ===================================================
  // ⚙️ Handlers
  // ===================================================


  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleSort = (newSortBy: string) => {
    setSearchParams((prev) => ({
      ...prev,
      sortBy: newSortBy,
      sortDir: prev.sortBy === newSortBy && prev.sortDir === "desc" ? "asc" : "desc",
      page: 0,
    }));
  };

  const handleInvite = async () => {
    if (!email.trim() || !companyId || !inviteRoleCode) {
      showToast("Please enter email and select a role", "warning");
      return;
    }
    setLoading(true);
    try {
      // Đã dùng inviteRoleCode
      await inviteMemberToCompany(companyId, { email, roleCode: inviteRoleCode });
      showToast("Invitation sent successfully!", "success");
      setEmail("");
      setInviteRoleCode("COMPANY_MEMBER");
      setShowInviteModal(false);

      await fetchMembers(searchParams);

    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "Failed to send invitation", "error");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirmation = (member: CompanyMember) => {
    if (member.userId === user?.id) {
      showToast("You cannot remove yourself.", "error");
      return;
    }
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!companyId || !memberToDelete) return;
    setIsDeleting(true);
    try {
      await removeCompanyMember(companyId, memberToDelete.userId);
      showToast("Member removed successfully", "success");
      setIsDeleteModalOpen(false);

      await fetchMembers(searchParams);

    } catch (err: any) {
      showToast(err.message || "Failed to remove member", "error");
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null);
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

  const handleUpdateMember = async () => {
    if (!companyId || !selectedMember) return;
    if (newStatus === "" && newRoleCode === "") {
      showToast("No changes detected.", "info");
      setShowEditModal(false);
      return;
    }

    setIsUpdating(true);
    try {
      const promises = [];
      if (newStatus !== "") {
        promises.push(updateCompanyMemberStatus(companyId, selectedMember.memberId, newStatus));
      }
      if (newRoleCode !== "") {
        promises.push(updateCompanyMemberRole(companyId, selectedMember.memberId, newRoleCode));
      }
      await Promise.all(promises);

      await fetchMembers(searchParams);

      showToast("Member updated successfully", "success");
      setShowEditModal(false);
      setSelectedMember(null);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // ===================================================
  // 🎨 Helpers
  // ===================================================

  const renderStatusBadge = (status: string) => {
    // ... (Code render status giữ nguyên)
    switch (status) {
      case "ACTIVE":
        return <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide"><CheckCircle className="w-3 h-3" /> Active</div>;
      case "SUSPENDED":
        return <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide"><CloseIcon className="w-3 h-3" /> Suspended</div>;
      case "PENDING":
        return <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide"><Clock className="w-3 h-3" /> Pending</div>;
      case "REMOVED":
        return <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-50 text-slate-400 border border-slate-100 uppercase tracking-wide">Removed</div>;
      default:
        return null;
    }
  };

  // SỬA LỖI 2: Loại bỏ tham chiếu 'roleCode' trực tiếp từ 'm'
  const renderRoleBadge = (m: CompanyMember) => {
    // Nếu roleCode không tồn tại, dùng roleName để xác định Admin
    const isAdmin = m.roleName?.includes("Administrator");
    const Icon = isAdmin ? Crown : Shield;
    const style = isAdmin ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200";

    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wide ${style}`}>
        <Icon className="w-3 h-3" />
        {m.roleName || "Member"}
      </div>
    );
  };

  const formatDateTime = (date?: string | null): string => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("en-US");
    } catch { return "—"; }
  };

  // ===================================================
  // 🛑 Pre-render Checks
  // ===================================================
  if (isAuthLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );

  // ===================================================
  // 🖥️ Render Component
  // ===================================================
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Team Members ({pagination.totalElements})</h1>
            <p className="text-sm text-slate-500 mt-1">Manage team members, roles, and access.</p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-5 rounded-[3px] flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Invite Member
          </Button>
        </div>

        {/* TOOLBAR & SEARCH/FILTER */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center">

          <div className="relative w-full md:w-40">
            <select
              value={searchBy}
              onChange={(e) => {
                const field = e.target.value;
                setSearchBy(field);

                // 🔥 FIX: reset tất cả field search cũ và giữ value hiện tại
                setSearchParams(prev => ({
                  ...prev,
                  page: 0,
                  name: undefined,
                  email: undefined,
                  phone: undefined,
                  roleName: undefined,
                  jobTitle: undefined,
                  status: undefined,
                  [field]: searchValue,
                }));
              }}

              className="w-full h-10 pl-3 pr-8 border rounded-md text-sm"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="jobTitle">Job Title</option>
              <option value="roleName">Role</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => {
                const text = e.target.value;
                setSearchValue(text);

                // 🔥 FIX: truyền đúng param theo searchBy
                setSearchParams(prev => ({
                  ...prev,
                  page: 0,
                  name: undefined,
                  email: undefined,
                  phone: undefined,
                  jobTitle: undefined,
                  roleName: undefined,
                  status: undefined,
                  [searchBy]: text,
                }));
              }}
              placeholder={`Search by ${searchBy}...`}
              className="w-full pl-9 pr-4 h-10 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

          </div>





        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex justify-center py-12 bg-white rounded-lg border border-slate-200">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : members.length > 0 ? (
          <>
            {/* SỬA LỖI 2: Đảm bảo các props phân trang/sắp xếp tồn tại trên MemberTable */}
            <MemberTable
              members={members}
              renderStatus={renderStatusBadge}
              renderRole={renderRoleBadge}
              formatDateTime={formatDateTime}
              onViewDetail={handleViewDetails}
              onEdit={openEditModal}
              onDelete={openDeleteConfirmation}
              onSort={handleSort}
              currentSortBy={searchParams.sortBy}
              currentSortDir={searchParams.sortDir}
              disableEdit={(m) => m.userId === user?.id}
              disableDelete={(m) => m.userId === user?.id || m.status === "PENDING"}
            />

            {/* PHÂN TRANG */}
            <div className="flex items-center justify-between pt-4 pb-2">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold">{(pagination.pageNumber * pagination.pageSize) + 1}</span> to <span className="font-semibold">{(pagination.pageNumber * pagination.pageSize) + members.length}</span> of <span className="font-semibold">{pagination.totalElements}</span> results
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handlePageChange(0)}
                  disabled={pagination.first || loading}
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.pageNumber - 1)}
                  disabled={pagination.first || loading}
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium text-slate-700">
                  Page {pagination.pageNumber + 1} of {pagination.totalPages || 1}
                </span>
                <Button
                  onClick={() => handlePageChange(pagination.pageNumber + 1)}
                  disabled={pagination.last || loading}
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.totalPages - 1)}
                  disabled={pagination.last || loading}
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-white">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No members found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or invite a new member.</p>
          </div>
        )}

        {/* MODALS */}
        {/* SỬA LỖI 3: Đổi 'roleCode' thành 'inviteRoleCode' trong props */}
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
          isLoading={loading}
          email={email}
          setEmail={setEmail}
          roleCode={inviteRoleCode}
          setRoleCode={setInviteRoleCode}
        />

        <MemberDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          member={detailMember}
          loading={loadingDetail}
        />

        {/* SỬA LỖI 4: Đổi 'variant' thành 'modalVariant' (hoặc tên tương đương mà component con chấp nhận) */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmRemove}
          isLoading={isDeleting}
          title="Remove Member"
          description={`Are you sure you want to remove ${memberToDelete?.fullName}? They will lose access to all company resources.`}
          confirmText="Remove"
          modalVariant="danger" // Thay đổi prop name tại đây
        />

        {/* EDIT MODAL (Inline) */}
        {showEditModal && selectedMember && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-lg">Edit Member: {selectedMember.fullName}</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><CloseIcon className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900 block">Role</label>
                  <div className="relative">
                    <select
                      value={newRoleCode}
                      onChange={(e) => setNewRoleCode(e.target.value)}
                      className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 appearance-none cursor-pointer"
                    >
                      <option value="">{selectedMember.roleName || "No Change"}</option>
                      <option value="COMPANY_MEMBER">Member</option>
                      <option value="COMPANY_ADMIN">Admin</option>
                    </select>
                    <ShieldAlert className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900 block">Status</label>
                  <div className="relative">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 appearance-none cursor-pointer"
                    >
                      <option value="">{selectedMember.status || "No Change"}</option>
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                    <CheckCircle className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button onClick={handleUpdateMember} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
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