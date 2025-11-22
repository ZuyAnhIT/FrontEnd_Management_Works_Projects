"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Users,
  ShieldAlert,
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

// --- Components ---
import MemberDetailModal from "@/components/features/admin/MemberDetailModal";
import MemberTable from "@/components/ui/MemberTable";
import InviteMemberModal from "@/components/ui/InviteMemberModal";
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
  [key: string]: any; // Cho phép index signature để dễ map dynamic keys
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "joinedAt";
const DEFAULT_SORT_DIR = "desc";

// ===================================================
// 🖥️ Component Chính
// ===================================================

export default function MembersPage() {
  const { showToast } = useToast();
  
  // ✅ SỬA 1: Lấy activeCompany từ Context (Thay vì user.company)
  const { user, activeCompany, isLoading: isAuthLoading } = useAuth();

  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ Lấy ID từ active context
  const companyId = activeCompany?.companyId || null;

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
  
  const [searchValue, setSearchValue] = useState("");
  const [searchBy, setSearchBy] = useState("name");

  // --- States Modals ---
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteRoleCode, setInviteRoleCode] = useState("COMPANY_MEMBER");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CompanyMember | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRoleCode, setNewRoleCode] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<CompanyMember | null>(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMember, setDetailMember] = useState<CompanyMember | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);


  // ===================================================
  // 🔄 Fetch Data Logic
  // ===================================================
  const fetchMembers = useCallback(async (params: MemberSearchParams) => {
    if (!companyId) return;
    setLoading(true);
    try {
      // Tách các param search ra khỏi pagination param
      const { name, email, roleName, status, ...apiParams } = params;

      let data: PageResponse<CompanyMember>;

      // Kiểm tra xem có đang search không
      const useSearchApi = name || email || roleName || status;

      if (useSearchApi) {
        // Gọi API Search
        data = await searchCompanyMembers(companyId, params);
      } else {
        // Gọi API Get All
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
      console.error("Error fetching members:", err);
      showToast(err.response?.data?.message || "Failed to load members", "error");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, showToast]);

  // Debounce Fetch Effect
  useEffect(() => {
    if (!companyId || isAuthLoading) return;

    const t = setTimeout(() => {
      fetchMembers(searchParams);
    }, 300);

    return () => clearTimeout(t);
  }, [searchParams, companyId, isAuthLoading, fetchMembers]);


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

  // Xử lý Search Input Change
  const handleSearchChange = (text: string) => {
    setSearchValue(text);
    setSearchParams(prev => ({
        ...prev,
        page: 0,
        name: undefined,
        email: undefined,
        phone: undefined,
        jobTitle: undefined,
        roleName: undefined,
        status: undefined,
        [searchBy]: text, // Gán giá trị vào field đang chọn
    }));
  };

  // Xử lý đổi cột Search
  const handleSearchByChange = (field: string) => {
    setSearchBy(field);
    setSearchParams(prev => ({
        ...prev,
        page: 0,
        name: undefined,
        email: undefined,
        phone: undefined,
        jobTitle: undefined,
        roleName: undefined,
        status: undefined,
        [field]: searchValue, // Giữ nguyên giá trị search text hiện tại nhưng đổi field
    }));
  };

  const handleInvite = async () => {
    if (!email.trim() || !companyId || !inviteRoleCode) {
      showToast("Please enter email and select a role", "warning");
      return;
    }
    setLoading(true);
    try {
      await inviteMemberToCompany(companyId, { email, roleCode: inviteRoleCode });
      showToast("Invitation sent successfully!", "success");
      setEmail("");
      setInviteRoleCode("COMPANY_MEMBER");
      setShowInviteModal(false);
      // Refresh list
      fetchMembers(searchParams);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to send invitation", "error");
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
      fetchMembers(searchParams);
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

      fetchMembers(searchParams);
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
  // 🎨 Helpers Render
  // ===================================================

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200"><CheckCircle className="w-3 h-3" /> Active</div>;
      case "SUSPENDED":
        return <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200"><CloseIcon className="w-3 h-3" /> Suspended</div>;
      case "PENDING":
        return <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Pending</div>;
      default:
        return <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200">{status}</div>;
    }
  };

  const renderRoleBadge = (m: CompanyMember) => {
    // Logic xác định Admin dựa vào roleName (hoặc roleCode nếu có trong object)
    const isAdmin = m.roleName?.toUpperCase().includes("ADMIN");
    const Icon = isAdmin ? Crown : Shield;
    const style = isAdmin ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200";

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
        <Icon className="w-3 h-3" />
        {m.roleName || "Member"}
      </div>
    );
  };

  const formatDateTime = (date?: string | null): string => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return "—"; }
  };

  // ===================================================
  // 🛑 Pre-render Checks
  // ===================================================
  
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Nếu không có Active Company -> Hiển thị màn hình Empty
  if (!companyId) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center p-10 bg-white rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">No Active Workspace</h3>
                <p className="text-slate-500 mt-1 mb-4">Please select a company from the dashboard.</p>
                <Button variant="outline" onClick={() => window.location.href = '/admin'}>Go to Hub</Button>
            </div>
        </div>
      )
  }

  // ===================================================
  // 🖥️ Render Main
  // ===================================================
  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 p-6 sm:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
                Team Members <span className="text-slate-400 font-normal text-lg ml-2">({pagination.totalElements})</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage users, roles, and access permissions for <span className="font-semibold text-blue-600">{activeCompany?.companyName}</span>.</p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-5 rounded-[3px] flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Invite Member
          </Button>
        </div>

        {/* TOOLBAR & SEARCH */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center">
          
          {/* Select Field to Search */}
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

          {/* Search Input */}
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

        {/* TABLE SECTION */}
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : members.length > 0 ? (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-900">{(pagination.pageNumber * pagination.pageSize) + 1}</span> to <span className="font-semibold text-slate-900">{Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}</span> of <span className="font-semibold text-slate-900">{pagination.totalElements}</span> results
              </p>
              
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => handlePageChange(0)}
                  disabled={pagination.first || loading}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.pageNumber - 1)}
                  disabled={pagination.first || loading}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="mx-2 text-sm font-medium text-slate-700">
                  Page {pagination.pageNumber + 1} / {pagination.totalPages || 1}
                </span>

                <Button
                  onClick={() => handlePageChange(pagination.pageNumber + 1)}
                  disabled={pagination.last || loading}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.totalPages - 1)}
                  disabled={pagination.last || loading}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No members found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria or invite a new member.</p>
          </div>
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
        />

        <MemberDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          member={detailMember}
          loading={loadingDetail}
        />

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmRemove}
          isLoading={isDeleting}
          title="Remove Team Member"
          description={`Are you sure you want to remove ${memberToDelete?.fullName}? This action cannot be undone and they will lose access immediately.`}
          confirmText="Remove Member"
          modalVariant="danger"
        />

        {/* EDIT MODAL (Inline để giữ context state) */}
        {showEditModal && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Edit Member</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><CloseIcon className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {selectedMember.fullName.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{selectedMember.fullName}</p>
                        <p className="text-xs text-slate-500">{selectedMember.email}</p>
                    </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900 block">Role</label>
                  <div className="relative">
                    <select
                      value={newRoleCode}
                      onChange={(e) => setNewRoleCode(e.target.value)}
                      className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none"
                    >
                      <option value="">{selectedMember.roleName || "No Change"}</option>
                      <option value="COMPANY_MEMBER">Member</option>
                      <option value="COMPANY_ADMIN">Administrator</option>
                    </select>
                    <Shield className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900 block">Account Status</label>
                  <div className="relative">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none"
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
                <Button onClick={handleUpdateMember} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
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