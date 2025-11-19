"use client";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
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
  Shield
} from "lucide-react";

import {
  getCompanyMembers,
  inviteMemberToCompany,
  removeCompanyMember,
  updateCompanyMemberStatus,
  updateCompanyMemberRole,
} from "@/services/apiCompany";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/button"; // Giả sử có Button component

import MemberDetailModal from "@/components/features/admin/MemberDetailModal"; // Dùng component đã tối ưu
import MemberTable from "@/components/ui/MemberTable";
import InviteMemberModal from "@/components/ui/InviteMemberModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function MembersPage() {
  const { showToast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const companyId = user?.company?.companyId || null;

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(3);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState(""); 
  const [newRole, setNewRole] = useState(""); 
  const [isUpdating, setIsUpdating] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMember, setDetailMember] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!companyId) {
      setLoading(false);
      return;
    }
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await getCompanyMembers(companyId);
        setMembers(data);
      } catch (err: any) {
        showToast(err.message || "Failed to load members", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [companyId, isAuthLoading, showToast]);

  const handleInvite = async () => {
    if (!email.trim() || !companyId) {
      showToast("Please enter email", "warning");
      return;
    }
    try {
      await inviteMemberToCompany(companyId, { email, roleId });
      showToast("Invitation sent successfully!", "success");
      setEmail("");
      setRoleId(3);
      setShowInviteModal(false);
      const refreshed = await getCompanyMembers(companyId);
      setMembers(refreshed);
    } catch (err: any) {
      showToast(err.message || "Failed to send invitation", "error");
    }
  };

  const openDeleteConfirmation = (member: any) => {
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
      setMembers((prev) => prev.filter((m) => m.userId !== memberToDelete.userId));
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Failed to remove member", "error");
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null);
    }
  };

  const handleViewDetails = async (member: any) => {
    setLoadingDetail(true);
    try {
      setDetailMember(member);
      setShowDetailModal(true);
    } catch (err: any) {
      showToast("Failed to load member details", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  const openEditModal = (member: any) => {
    setSelectedMember(member);
    setNewStatus(""); 
    setNewRole(""); 
    setShowEditModal(true);
  };

  const handleUpdateMember = async () => {
    if (!companyId || !selectedMember) return;
    if (newStatus === "" && newRole === "") {
      setShowEditModal(false);
      return;
    }

    setIsUpdating(true);
    try {
      const promises = [];
      if (newStatus !== "") {
        promises.push(updateCompanyMemberStatus(companyId, selectedMember.memberId, newStatus));
      }
      if (newRole !== "") {
        promises.push(updateCompanyMemberRole(companyId, selectedMember.memberId, newRole));
      }
      await Promise.all(promises);

      const refreshed = await getCompanyMembers(companyId);
      setMembers(refreshed);

      showToast("Member updated successfully", "success");
      setShowEditModal(false);
      setSelectedMember(null);
    } catch (err: any) {
      showToast(err.message || "Update failed", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide"><CheckCircle className="w-3 h-3" /> Active</div>;
      case "SUSPENDED":
        return <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide"><XCircle className="w-3 h-3" /> Suspended</div>;
      case "PENDING":
        return <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide"><Clock className="w-3 h-3" /> Pending</div>;
      case "REMOVED":
        return <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-50 text-slate-400 border border-slate-100 uppercase tracking-wide">Removed</div>;
      default:
        return null;
    }
  };

  const renderRoleBadge = (m: any) => {
    const isAdmin = m.roleCode === "COMPANY_ADMIN" || m.roleName === "Company Administrator";
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

  const filteredMembers = members.filter(
    (m) => m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAuthLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h1 className="text-2xl font-bold text-slate-900">Members</h1>
              <p className="text-sm text-slate-500 mt-1">Manage team members and roles</p>
           </div>
           <Button 
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-5 rounded-[3px] flex items-center gap-2"
           >
              <UserPlus className="w-4 h-4" /> Invite Member
           </Button>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 h-10 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
            </div>
            <Button variant="outline" className="border-slate-300 text-slate-700 h-10 px-4">
                <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex justify-center py-12">
             <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredMembers.length > 0 ? (
          <MemberTable
            members={filteredMembers}
            renderStatus={renderStatusBadge}
            renderRole={renderRoleBadge}
            formatDateTime={formatDateTime}
            onViewDetail={handleViewDetails}
            onEdit={openEditModal}
            onDelete={openDeleteConfirmation}
            disableEdit={(m) => m.userId === user?.id}
            disableDelete={(m) => m.userId === user?.id || m.status === "PENDING"}
          />
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
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
          isLoading={loading}
          email={email}
          setEmail={setEmail}
          roleId={roleId}
          setRoleId={setRoleId}
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
          title="Remove Member"
          description={`Are you sure you want to remove ${memberToDelete?.fullName}? They will lose access to all workspaces.`}
          confirmText="Remove"
        />

        {/* EDIT MODAL (Inline) - Cần tách ra file riêng nếu phức tạp, ở đây mình làm inline minimalist */}
        {showEditModal && selectedMember && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 text-lg">Edit Member</h3>
                        <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><Users className="w-5 h-5"/></button>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-900 block">Role</label>
                            <div className="relative">
                                <select 
                                    value={newRole} 
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 appearance-none cursor-pointer"
                                >
                                    <option value="">No Change</option>
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
                                    <option value="">No Change</option>
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
                             {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}