"use client";

// =================================================================
// 1️⃣ IMPORTS
// =================================================================
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Search,
  Users,
  Loader2,
  Crown,
  Shield,
  CheckCircle,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldAlert,
  X,
  Save,
  UserPlus
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/button";
import { Chatbot } from "@/components/chatbot/chatbot";

// API Services
import {
  getProjectMembers,
  searchProjectMembers, 
  updateProjectMemberRole,
  inviteProjectMember, // ✅ API Mới
  ProjectMember,
  PageResponse
} from "@/services/apiProject";

// Components UI
import MemberTable from "@/components/ui/MemberTable";
import MemberDetailModalBase from "@/components/ui/MemberDetailModalBase";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import InviteMemberModal from "@/components/ui/InviteMemberModal"; 

// =================================================================
// 2️⃣ CONSTANTS & TYPES
// =================================================================

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "joinedAt";
const DEFAULT_SORT_DIR = "desc";

const SEARCH_FIELDS = [
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "role", label: "Role" },
  { value: "phone", label: "Phone" },
];

interface MemberSearchParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  [key: string]: any;
}

// =================================================================
// 3️⃣ COMPONENT CHÍNH
// =================================================================
export default function ProjectMembersPage() {
  const { showToast } = useToast();
  const params = useParams();
  
  const workspaceId = Number(params.workspaceId);
  const projectId = Number(params.projectId);

  const { activeCompany, isLoading: isAuthLoading, user } = useAuth();
  const companyId = activeCompany?.companyId;

  // --- STATE DATA ---
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE SEARCH & FILTER ---
  const [searchBy, setSearchBy] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  
  const [pagination, setPagination] = useState<Omit<PageResponse<ProjectMember>, 'content'>>({
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

  // --- MODAL STATES ---
  
  // 1. Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleCode, setInviteRoleCode] = useState("PROJECT_MEMBER");
  const [isInviting, setIsInviting] = useState(false);

  // 2. Edit Role Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const [newRole, setNewRole] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // 3. Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMember, setDetailMember] = useState<ProjectMember | null>(null);

  // 4. Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<ProjectMember | null>(null);


  // ===============================================================
  // 4️⃣ FETCH DATA LOGIC
  // ===============================================================
  const fetchMembers = useCallback(async (params: MemberSearchParams) => {
    if (!companyId || !workspaceId || !projectId) return;
    setLoading(true);

    try {
      const { name, email, phone, role, ...pagingParams } = params;
      
      const isSearching = (name && name.trim() !== "") || 
                          (email && email.trim() !== "") || 
                          (phone && phone.trim() !== "") || 
                          (role && role.trim() !== "");

      let data: PageResponse<ProjectMember>;

      if (isSearching) {
        data = await searchProjectMembers(companyId, workspaceId, projectId, params);
      } else {
        data = await getProjectMembers(companyId, workspaceId, projectId, pagingParams);
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
      showToast(err.message || "Failed to load members", "error");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, workspaceId, projectId, showToast]);

  useEffect(() => {
    if (!companyId || !workspaceId || !projectId || isAuthLoading) return;
    const t = setTimeout(() => fetchMembers(searchParams), 300);
    return () => clearTimeout(t);
  }, [searchParams, companyId, workspaceId, projectId, isAuthLoading, fetchMembers]);


  // ===============================================================
  // 5️⃣ HANDLERS
  // ===============================================================

  // --- PAGINATION & SORT ---
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

  // --- SEARCH ---
  const handleSearchChange = (text: string) => {
    setSearchValue(text);
    setSearchParams((prev) => {
        const newParams = { ...prev };
        delete newParams.name;
        delete newParams.email;
        delete newParams.phone;
        delete newParams.role;
        newParams.page = 0;
        if (text.trim() !== "") newParams[searchBy] = text.trim();
        return newParams;
    });
  };

  const handleSearchByChange = (field: string) => {
    setSearchBy(field);
    setSearchValue(""); 
    setSearchParams((prev) => {
        const newParams = { ...prev };
        delete newParams.name;
        delete newParams.email;
        delete newParams.phone;
        delete newParams.role;
        return { ...newParams, page: 0 };
    });
  };

  // ✅ --- INVITE LOGIC (GỌI API MỚI) ---
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      showToast("Please enter an email", "warning");
      return;
    }
    if (!companyId || !workspaceId || !projectId) return;

    setIsInviting(true);
    try {
        await inviteProjectMember(companyId, workspaceId, projectId, {
            email: inviteEmail,
            roleCode: inviteRoleCode
        });
        
        showToast(`Invited ${inviteEmail} to project successfully!`, "success");
        
        // Reset form & Close modal
        setInviteEmail("");
        setInviteRoleCode("PROJECT_MEMBER");
        setShowInviteModal(false);
        
        // Refresh list
        fetchMembers(searchParams); 
    } catch (err: any) {
        showToast(err.message || "Failed to invite", "error");
    } finally {
        setIsInviting(false);
    }
  };

  // --- UPDATE ROLE ---
  const openEditModal = (member: ProjectMember) => {
    setSelectedMember(member);
    const currentRole = member.roleName?.includes("Admin") ? "PROJECT_ADMIN" : "PROJECT_MEMBER";
    setNewRole(currentRole); 
    setShowEditModal(true);
  };

  const handleUpdateRole = async () => {
    if (!companyId || !workspaceId || !projectId || !selectedMember) return;
    
    setIsUpdating(true);
    try {
      await updateProjectMemberRole(companyId, workspaceId, projectId, selectedMember.memberId, newRole);
      showToast("Role updated successfully!", "success");
      setShowEditModal(false);
      fetchMembers(searchParams); 
    } catch (err: any) {
      showToast(err.message || "Update failed", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- HELPERS RENDER ---
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200"><CheckCircle className="w-3 h-3" /> Active</div>;
      case "PENDING": return <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Pending</div>;
      default: return <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200">{status}</div>;
    }
  };

  const renderRoleBadge = (m: ProjectMember) => {
    const isAdmin = m.roleName?.toUpperCase().includes("ADMIN");
    const Icon = isAdmin ? Crown : Shield;
    const style = isAdmin ? "bg-amber-50 text-amber-800 border-2 border-amber-500" : "bg-blue-50 text-blue-700 border border-blue-300";
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
        <Icon className="w-3 h-3" />
        {m.roleName || "Member"}
      </div>
    );
  };

  const formatDateTime = (date?: string | null): string => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-50"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>;
  }

  if (!companyId) return <div className="p-8 text-center">No Active Company</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
               Project Members <span className="text-slate-400 text-lg ml-2">({pagination.totalElements})</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage team members within this project.</p>
          </div>
          
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-5 rounded-[3px] flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Add Member
          </Button>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center">
          <div className="relative w-full md:w-40">
            <select
              value={searchBy}
              onChange={(e) => handleSearchByChange(e.target.value)}
              className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
            >
              {SEARCH_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
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
              onViewDetail={(m) => { setDetailMember(m); setShowDetailModal(true); }}
              onEdit={openEditModal}
              onDelete={(m) => { if(m.userId !== user?.id) { setMemberToDelete(m); setIsDeleteModalOpen(true); } else showToast("Cannot remove yourself", "error"); }}
              onSort={handleSort}
              currentSortBy={searchParams.sortBy}
              currentSortDir={searchParams.sortDir}
              disableEdit={(m) => m.userId === user?.id}
              disableDelete={(m) => m.userId === user?.id} 
            />
            
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
               <p className="text-sm text-slate-500">
                  Page {pagination.pageNumber + 1} of {pagination.totalPages || 1}
               </p>
               <div className="flex gap-1">
                  <Button onClick={() => handlePageChange(0)} disabled={pagination.first} variant="outline" size="icon" className="h-8 w-8"><ChevronsLeft className="w-4 h-4"/></Button>
                  <Button onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.first} variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="w-4 h-4"/></Button>
                  <Button onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.last} variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="w-4 h-4"/></Button>
                  <Button onClick={() => handlePageChange(pagination.totalPages - 1)} disabled={pagination.last} variant="outline" size="icon" className="h-8 w-8"><ChevronsRight className="w-4 h-4"/></Button>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No members found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or add a new member.</p>
          </div>
        )}

        {/* --- MODALS --- */}
        
        {/* ✅ Invite Modal */}
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
          isLoading={isInviting} 
          email={inviteEmail}
          setEmail={setInviteEmail}
          roleCode={inviteRoleCode}
          setRoleCode={setInviteRoleCode}
          title="Add Member to Project"
          description="Invite an existing workspace member or a new user to this project."
          contextType="project" 
        />

        {/* Detail Modal */}
        <MemberDetailModalBase
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          member={detailMember}
          loading={false}
          title="Project Member Details"
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
          onConfirm={() => { showToast("Feature coming soon", "info"); setIsDeleteModalOpen(false); }}
          isLoading={false}
          title="Remove Member?"
          description={`Are you sure you want to remove ${memberToDelete?.fullName} from this project?`}
          confirmText="Remove"
          cancelText="Cancel"
          modalVariant="danger"
        />

        {/* Edit Role Modal */}
        {showEditModal && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Change Project Role</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                 <p className="text-sm text-slate-600">Select a new role for <span className="font-bold text-slate-900">{selectedMember.fullName}</span>.</p>
                 <div className="relative">
                    <select 
                        value={newRole} 
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white appearance-none"
                    >
                        <option value="PROJECT_MEMBER">Project Member</option>
                        <option value="PROJECT_ADMIN">Project Admin</option>
                    </select>
                    <ShieldAlert className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                 </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                 <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                 <Button onClick={handleUpdateRole} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save
                 </Button>
              </div>
            </div>
          </div>
        )}
        <Chatbot />
      </div>
    </div>
  );
}