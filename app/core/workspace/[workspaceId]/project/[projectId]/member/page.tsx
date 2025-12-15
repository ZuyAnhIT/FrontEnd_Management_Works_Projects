"use client";

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
    UserPlus,
    Mail,
    Trash2,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Chatbot } from "@/components/chatbot/chatbot";

import {
    getProjectMembers,
    searchProjectMembers,
    updateProjectMemberRole,
    inviteProjectMember,
    getProjectInvitations, 
    cancelProjectInvitation, 
    ProjectMember,
    ProjectInvitation, 
    PageResponse,
    InvitationSearchParams,
} from "@/services/apiProject";

// Components UI
import MemberTable from "@/components/ui/MemberTable";
import ProjectInvitationTable from "@/components/ui/ProjectInvitationTable"; 
import MemberDetailModalBase from "@/components/ui/MemberDetailModalBase";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import InviteMemberModal from "@/components/ui/InviteMemberModal";

// --- TYPES & CONSTANTS ---
type TabType = "MEMBERS" | "INVITATIONS";

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

    // --- STATE UI ---
    const [activeTab, setActiveTab] = useState<TabType>("MEMBERS");
    const [loading, setLoading] = useState(true);

    // --- STATE DATA ---
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);

    // --- STATE SEARCH & PAGINATION ---
    const [searchBy, setSearchBy] = useState("name");
    const [searchValue, setSearchValue] = useState("");

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

    // --- MODAL STATES ---
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRoleCode, setInviteRoleCode] = useState("PROJECT_MEMBER");
    const [isInviting, setIsInviting] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(
        null
    );
    const [newRole, setNewRole] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailMember, setDetailMember] = useState<ProjectMember | null>(null);

    // Delete / Cancel Confirmation Modal
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState("");
    const [confirmDesc, setConfirmDesc] = useState("");
    const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() =>
        Promise.resolve()
    );

    // ===============================================================
    // 🔄 FETCH DATA LOGIC (Logic nghiệp vụ quan trọng)
    // ===============================================================
    const fetchData = useCallback(async () => {
        if (!companyId || !workspaceId || !projectId) return;
        setLoading(true);

        try {
            if (activeTab === "MEMBERS") {
                // --- FETCH MEMBERS ---
                const { name, email, phone, role, ...pagingParams } = searchParams;

                const currentSearchVal = searchValue.trim();
                const isSearching =
                    !!currentSearchVal || !!name || !!email || !!phone || !!role;

                let data: PageResponse<ProjectMember>;

                if (isSearching) {
                    // Build search params dynamically
                    const apiParams = { ...searchParams };
                    if (currentSearchVal) apiParams[searchBy] = currentSearchVal;

                    data = await searchProjectMembers(
                        companyId,
                        workspaceId,
                        projectId,
                        apiParams
                    );
                } else {
                    data = await getProjectMembers(
                        companyId,
                        workspaceId,
                        projectId,
                        pagingParams
                    );
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

                const res = await getProjectInvitations(
                    companyId,
                    workspaceId,
                    projectId,
                    invParams
                );
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
            const message = err.response?.data?.message || err.message || "Failed to load data";
            showToast(message, "error");
            setMembers([]);
            setInvitations([]);
        } finally {
            setLoading(false);
        }
    }, [
        companyId,
        workspaceId,
        projectId,
        activeTab,
        searchParams,
        searchValue,
        searchBy,
        showToast,
    ]);

    useEffect(() => {
        if (!companyId || isAuthLoading) return;
        const t = setTimeout(() => fetchData(), 300);
        return () => clearTimeout(t);
    }, [fetchData, companyId, isAuthLoading]);

    // ===============================================================
    // ⚙️ HANDLERS
    // ===============================================================

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
            sortDir:
                prev.sortBy === field && prev.sortDir === "desc" ? "asc" : "desc",
            page: 0,
        }));
    };

    const handleSearchChange = (text: string) => {
        setSearchValue(text);
        setSearchParams((prev) => {
            const newParams = { ...prev, page: 0 };
            // Clear specific fields to avoid conflict with general search text
            delete newParams.name;
            delete newParams.email;
            delete newParams.phone;
            delete newParams.role;
            return newParams;
        });
    };

    const handleSearchByChange = (field: string) => {
        setSearchBy(field);
        setSearchValue("");
        setSearchParams((prev) => ({ ...prev, page: 0 }));
    };

    // --- ACTIONS ---

    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            showToast("Please enter an email address.", "warning");
            return;
        }
        if (!companyId || !workspaceId || !projectId) return;

        setIsInviting(true);
        try {
            await inviteProjectMember(companyId, workspaceId, projectId, {
                email: inviteEmail,
                roleCode: inviteRoleCode,
            });
            showToast(`Invitation sent to ${inviteEmail} successfully!`, "success");
            setInviteEmail("");
            setShowInviteModal(false);

            // Switch tab to view result
            if (activeTab !== "INVITATIONS") setActiveTab("INVITATIONS");
            else fetchData();
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Invitation failed";
            showToast(message, "error");
        } finally {
            setIsInviting(false);
        }
    };

    // Confirm Actions
    const handleConfirmAction = async () => {
        setIsProcessingAction(true);
        try {
            await confirmAction();
            setIsConfirmOpen(false);
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Action failed";
            showToast(message, "error");
        } finally {
            setIsProcessingAction(false);
        }
    };

    // Cancel Invitation (Logic nghiệp vụ quan trọng)
    const openCancelInvitation = (inv: ProjectInvitation) => {
        setConfirmTitle("Revoke Invitation?");
        setConfirmDesc(
            `Revoke invitation for ${inv.email}? The link will become invalid.`
        );
        setConfirmAction(() => async () => {
            if (!companyId || !workspaceId || !projectId) return;
            await cancelProjectInvitation(companyId, workspaceId, projectId, inv.id);
            showToast("Invitation revoked successfully", "success");
            fetchData();
        });
        setIsConfirmOpen(true);
    };

    // Remove Member (Mock/Future API - Giữ nguyên logic xác nhận)
    const openRemoveMember = (m: ProjectMember) => {
        if (m.userId === user?.id) {
            showToast("You cannot remove yourself", "error");
            return;
        }
        setConfirmTitle("Remove Member?");
        setConfirmDesc(`Remove ${m.fullName} from this project?`);
        setConfirmAction(() => async () => {
            // await removeProjectMember(...) // Cần API này nếu muốn implement
            showToast("Remove member feature coming soon", "info");
        });
        setIsConfirmOpen(true);
    };

    // Update Role
    const openEditModal = (member: ProjectMember) => {
        if (member.userId === user?.id) {
            showToast("You cannot edit your own role", "warning");
            return;
        }
        setSelectedMember(member);
        const currentRole = member.roleName?.toUpperCase().includes("ADMIN")
            ? "PROJECT_ADMIN"
            : "PROJECT_MEMBER";
        setNewRole(currentRole);
        setShowEditModal(true);
    };

    const handleUpdateRole = async () => {
        if (!companyId || !workspaceId || !projectId || !selectedMember) return;
        setIsUpdating(true);
        try {
            await updateProjectMemberRole(
                companyId,
                workspaceId,
                projectId,
                selectedMember.memberId,
                newRole
            );
            showToast("Role updated successfully!", "success");
            setShowEditModal(false);
            fetchData();
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Update failed";
            showToast(message, "error");
        } finally {
            setIsUpdating(false);
        }
    };

    // --- HELPERS RENDER (Chuyển sang Tiếng Anh) ---
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle className="w-3 h-3" /> Active
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

    const renderRoleBadge = (m: ProjectMember) => {
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

    if (isAuthLoading)
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    if (!companyId)
        return <div className="p-8 text-center">No Active Company</div>;

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-8 font-sans text-slate-900">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Project Members
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Manage team members within this project.
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowInviteModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2"
                    >
                        <UserPlus className="w-4 h-4" /> Add Member
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

                {/* TOOLBAR */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center">
                    {activeTab === "MEMBERS" && (
                        <div className="relative w-full md:w-40">
                            <select
                                value={searchBy}
                                onChange={(e) => handleSearchByChange(e.target.value)}
                                className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 bg-slate-50 cursor-pointer"
                            >
                                {SEARCH_FIELDS.map((f) => (
                                    <option key={f.value} value={f.value}>
                                        {f.label}
                                    </option>
                                ))}
                            </select>
                  
                        </div>
                    )}
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
                            className="w-full pl-9 pr-4 h-10 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                </div>

                {/* TABLE CONTENT */}
                {loading ? (
                    <div className="flex justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    </div>
                ) : (
                    <>
                        {activeTab === "MEMBERS" &&
                            (members.length > 0 ? (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeInUp">
                                    <MemberTable
                                        members={members}
                                        renderStatus={renderStatusBadge}
                                        renderRole={renderRoleBadge}
                                        formatDateTime={formatDateTime}
                                        onViewDetail={(m) => {
                                            setDetailMember(m);
                                            setShowDetailModal(true);
                                        }}
                                        onEdit={openEditModal}
                                        onDelete={openRemoveMember}
                                        onSort={handleSort}
                                        currentSortBy={searchParams.sortBy}
                                        currentSortDir={searchParams.sortDir}
                                        disableEdit={(m) => m.userId === user?.id}
                                        disableDelete={(m) => m.userId === user?.id}
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white border-2 border-dashed rounded-xl">
                                    <p className="text-slate-500">No members found.</p>
                                </div>
                            ))}

                        {activeTab === "INVITATIONS" &&
                            (invitations.length > 0 ? (
                                <ProjectInvitationTable
                                    invitations={invitations}
                                    onCancel={openCancelInvitation}
                                    formatDateTime={formatDateTime}
                                />
                            ) : (
                                <div className="text-center py-20 bg-white border-2 border-dashed rounded-xl">
                                    <p className="text-slate-500">No pending invitations.</p>
                                </div>
                            ))}

                        {/* PAGINATION */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white rounded-b-xl">
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
                    </>
                )}

                {/* --- MODALS --- */}

                {/* ✅ Truyền companyId cho Invite Modal */}
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
                    companyId={companyId}
                />

                <MemberDetailModalBase
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    member={detailMember as any}
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
                
                <ConfirmationModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={handleConfirmAction}
                    isLoading={isProcessingAction}
                    title={confirmTitle}
                    description={confirmDesc}
                    confirmText="Confirm"
                    modalVariant={confirmTitle.includes("Revoke") ? "warning" : "danger"} 
                />

                {showEditModal && selectedMember && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                        <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-900">
                                    Change Project Role
                                </h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                                    title="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                <p className="text-sm text-slate-600">
                                    Select a new role for{" "}
                                    <span className="font-bold text-slate-900">
                                        {selectedMember.fullName}
                                    </span>
                                    .
                                </p>
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
                                <Button
                                    variant="outline"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateRole}
                                    disabled={isUpdating}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {isUpdating ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}{" "}
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