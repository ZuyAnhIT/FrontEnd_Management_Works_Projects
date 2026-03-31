"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Services -> Hooks -> Components)
// =============================================================================

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Search, Users, Loader2, Crown, Shield, CheckCircle, Clock,
    Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    ShieldAlert, X, Save, UserPlus, Mail
} from "lucide-react";

// Services & Types
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

// Context & Hooks
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { useProjectRole } from "@/hooks/useProjectRole";

// UI Components
import { Button } from "@/components/ui/Buttons";
import { Chatbot } from "@/components/chatbot/chatbot";
import MemberTable from "@/components/ui/MemberTable";
import ProjectInvitationTable from "@/components/ui/ProjectInvitationTable";
import MemberDetailModalBase from "@/components/ui/MemberDetailModalBase";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import InviteMemberModal from "@/components/ui/InviteMemberModal";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS & TYPES
// =============================================================================

type TabType = "MEMBERS" | "INVITATIONS";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "joinedAt";
const DEFAULT_SORT_DIR = "desc";

const SEARCH_FIELDS = [
    { value: "name", label: "Full Name" },
    { value: "email", label: "Corporate Email" },
    { value: "role", label: "Permission Role" },
    { value: "phone", label: "Mobile Number" },
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

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function ProjectMembersPage() {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS, CONTEXT & PARAMS
    // ---------------------------------------------------------------------------
    
    const { showToast } = useToast();
    const params = useParams();
    const router = useRouter();

    const workspaceId = Number(params.workspaceId);
    const projectId = Number(params.projectId);

    const { activeCompany, isLoading: isAuthLoading, user } = useAuth();
    const companyId = activeCompany?.companyId;

    // Kiem tra phan quyen de bao ve tuyen duong
    const { isGuest } = useProjectRole(projectId);

    // ---------------------------------------------------------------------------
    // 5. STATE MANAGEMENT
    // ---------------------------------------------------------------------------

    // UI States
    const [activeTab, setActiveTab] = useState<TabType>("MEMBERS");
    const [isLoading, setIsLoading] = useState(true);

    // Data States
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);

    // Search & Pagination States
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

    // Modals States
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRoleCode, setInviteRoleCode] = useState("PROJECT_MEMBER");
    const [isInviting, setIsInviting] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
    const [newRole, setNewRole] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailMember, setDetailMember] = useState<ProjectMember | null>(null);

    // Action Confirmation States
    const [confirmConfig, setConfirmConfig] = useState({ 
        isOpen: false, title: "", desc: "", variant: "danger" as any 
    });
    const [onConfirmAction, setOnConfirmAction] = useState<() => Promise<void>>(() => Promise.resolve());

    // ---------------------------------------------------------------------------
    // 6. BUSINESS LOGIC (Handlers)
    // ---------------------------------------------------------------------------

    /**
     * Chan nguoi dung vao trang thanh vien neu khong co quyen (Guest)
     */
    useEffect(() => {
        if (isGuest) {
            router.replace(`/core/workspace/${workspaceId}/project/${projectId}`);
        }
    }, [isGuest, router, workspaceId, projectId]);

    /**
     * Tai du lieu tong hop dua tren Tab dang hoat dong
     */
    const fetchUnifiedData = useCallback(async () => {
        if (!companyId || !workspaceId || !projectId || isGuest) return;
        
        setIsLoading(true);
        try {
            if (activeTab === "MEMBERS") {
                const { name, email, phone, role, ...pagingParams } = searchParams;
                const query = searchValue.trim();
                const isSearching = !!query || !!name || !!email || !!phone || !!role;

                let response: PageResponse<ProjectMember>;

                if (isSearching) {
                    const apiParams = { ...searchParams };
                    if (query) apiParams[searchBy] = query;
                    response = await searchProjectMembers(companyId, workspaceId, projectId, apiParams);
                } else {
                    response = await getProjectMembers(companyId, workspaceId, projectId, pagingParams);
                }

                setMembers(response.content || []);
                updatePagination(response);
            } else {
                const invParams: InvitationSearchParams = {
                    page: searchParams.page,
                    size: searchParams.size,
                    sortBy: "createdAt",
                    sortDir: "desc",
                    status: "PENDING",
                    keyword: searchValue.trim() || undefined,
                };

                const response = await getProjectInvitations(companyId, workspaceId, projectId, invParams);
                setInvitations(response.content || []);
                updatePagination(response);
            }
        } catch (err: any) {
            showToast(err.response?.data?.message || "Failed to synchronize roster data", "error");
        } finally {
            setIsLoading(false);
        }
    }, [companyId, workspaceId, projectId, activeTab, searchParams, searchValue, searchBy, isGuest, showToast]);

    const updatePagination = (data: any) => {
        setPagination({
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            first: data.first,
            last: data.last,
        });
    };

    // Auto sync du lieu khi co su thay doi ve tham so hoac tab (co Debounce)
    useEffect(() => {
        if (!companyId || isAuthLoading) return;
        const timer = setTimeout(() => fetchUnifiedData(), 300);
        return () => clearTimeout(timer);
    }, [fetchUnifiedData, companyId, isAuthLoading]);

    // ---------------------------------------------------------------------------
    // 7. EVENT HANDLERS (UI Interactions)
    // ---------------------------------------------------------------------------

    const handleTabSwitch = (tab: TabType) => {
        setActiveTab(tab);
        setSearchValue("");
        setSearchParams((prev) => ({ ...prev, page: 0 }));
    };

    const handlePaginationChange = (newPage: number) => {
        setSearchParams((prev) => ({ ...prev, page: newPage }));
    };

    const handleSortChange = (field: string) => {
        setSearchParams((prev) => ({
            ...prev,
            sortBy: field,
            sortDir: prev.sortBy === field && prev.sortDir === "desc" ? "asc" : "desc",
            page: 0,
        }));
    };

    const handleSearchInput = (text: string) => {
        setSearchValue(text);
        setSearchParams((prev) => {
            const newParams = { ...prev, page: 0 };
            delete newParams.name; delete newParams.email;
            delete newParams.phone; delete newParams.role;
            return newParams;
        });
    };

    const handleInviteExecution = async () => {
        if (!inviteEmail.trim()) {
            showToast("Target email address is mandatory", "warning");
            return;
        }
        setIsInviting(true);
        try {
            await inviteProjectMember(companyId!, workspaceId, projectId, {
                email: inviteEmail,
                roleCode: inviteRoleCode,
            });
            showToast(`Invitation dispatched to ${inviteEmail}`, "success");
            setInviteEmail("");
            setShowInviteModal(false);
            activeTab !== "INVITATIONS" ? setActiveTab("INVITATIONS") : fetchUnifiedData();
        } catch (err: any) {
            showToast(err.response?.data?.message || "Invitation failure", "error");
        } finally {
            setIsInviting(false);
        }
    };

    const executeConfirmedAction = async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        try {
            await onConfirmAction();
        } catch (err: any) {
            showToast(err.message || "Action execution failed", "error");
        }
    };

    const initiateCancelInvitation = (inv: ProjectInvitation) => {
        setConfirmConfig({
            isOpen: true,
            title: "Revoke Project Invitation",
            desc: `Are you sure you want to revoke the invite for ${inv.email}? The access link will be invalidated immediately.`,
            variant: "warning"
        });
        setOnConfirmAction(() => async () => {
            await cancelProjectInvitation(companyId!, workspaceId, projectId, inv.id);
            showToast("Invitation successfully revoked", "success");
            fetchUnifiedData();
        });
    };

    const initiateRemoveMember = (member: ProjectMember) => {
        if (member.userId === user?.id) {
            showToast("Self-removal is restricted", "error");
            return;
        }
        setConfirmConfig({
            isOpen: true,
            title: "Remove Project Member",
            desc: `Confirm removal of ${member.fullName} from this project? All their assignments will be unlinked.`,
            variant: "danger"
        });
        setOnConfirmAction(() => async () => {
            showToast("Member removal service coming soon", "info");
        });
    };

    const handleUpdateRoleExecution = async () => {
        if (!companyId || !selectedMember) return;
        setIsUpdating(true);
        try {
            await updateProjectMemberRole(companyId, workspaceId, projectId, selectedMember.memberId, newRole);
            showToast("Member permissions updated", "success");
            setShowEditModal(false);
            fetchUnifiedData();
        } catch (err: any) {
            showToast(err.message || "Update failure", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    // ---------------------------------------------------------------------------
    // 8. RENDER HELPERS
    // ---------------------------------------------------------------------------

    const renderStatusBadge = (status: string) => {
        const isPending = status === "PENDING";
        const Icon = isPending ? Clock : CheckCircle;
        return (
            <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm",
                isPending ? "bg-[#FFF0B3] text-[#FF8B00] border-[#FFE380]" : "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
            )}>
                <Icon className="w-3 h-3 stroke-[3]" /> {status}
            </div>
        );
    };

    const renderRoleBadge = (m: ProjectMember) => {
        const isAdmin = m.roleName?.toUpperCase().includes("ADMIN");
        const Icon = isAdmin ? Crown : Shield;
        return (
            <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm",
                isAdmin ? "bg-[#EAE6FF] text-[#403294] border-[#C0B6F2]" : "bg-[#DEEBFF] text-[#0052CC] border-[#B3D4FF]"
            )}>
                <Icon className="w-3 h-3 stroke-[2.5]" /> {m.roleName || "Member"}
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

    if (isGuest) return null;

    if (isAuthLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F5F7] gap-3">
                <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#6B778C]">Syncing Roster</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F5F7] px-6 py-10 font-sans text-[#172B4D]">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
                
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase">Project Roster</h1>
                        <p className="text-[14px] text-[#42526E] font-medium mt-1">Manage corporate access and team permissions for this initiative.</p>
                    </div>
                    <Button
                        onClick={() => setShowInviteModal(true)}
                        className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-black text-[12px] uppercase tracking-widest h-11 px-8 rounded-lg shadow-md active:scale-95 transition-all flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4 stroke-[3]" /> Add Member
                    </Button>
                </div>

                {/* TABS NAVIGATION */}
                <div className="border-b border-[#DFE1E6]">
                    <nav className="-mb-px flex gap-10">
                        <TabButton 
                            active={activeTab === "MEMBERS"} 
                            onClick={() => handleTabSwitch("MEMBERS")}
                            icon={Users} label="Active Members" count={activeTab === "MEMBERS" ? pagination.totalElements : null}
                        />
                        <TabButton 
                            active={activeTab === "INVITATIONS"} 
                            onClick={() => handleTabSwitch("INVITATIONS")}
                            icon={Mail} label="Pending Invites" count={activeTab === "INVITATIONS" ? pagination.totalElements : null}
                            variant="amber"
                        />
                    </nav>
                </div>

                {/* TOOLBAR */}
                <div className="bg-white p-5 rounded-2xl border border-[#DFE1E6] shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    {activeTab === "MEMBERS" && (
                        <div className="relative w-full md:w-48">
                            <select
                                value={searchBy}
                                onChange={(e) => setSearchBy(e.target.value)}
                                className="w-full h-11 pl-4 pr-10 border border-[#DFE1E6] rounded-xl text-[12px] font-black uppercase tracking-widest bg-[#F4F5F7] cursor-pointer outline-none appearance-none"
                            >
                                {SEARCH_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                    )}
                    <div className="relative w-full md:w-[450px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#0052CC] transition-colors" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            placeholder={activeTab === "MEMBERS" ? `Lookup by ${searchBy}...` : "Filter by email address..."}
                            className="w-full pl-12 pr-4 h-11 bg-white border border-[#DFE1E6] rounded-xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-[#2684FF] transition-all"
                        />
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="relative min-h-[400px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col justify-center items-center bg-[#F4F5F7]/50 backdrop-blur-sm z-10 rounded-2xl">
                            <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-60 mb-3" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#6B778C]">Syncing Data</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-[#DFE1E6] shadow-sm overflow-hidden animate-in fade-in duration-500">
                                {activeTab === "MEMBERS" ? (
                                    members.length > 0 ? (
                                        <MemberTable
                                            members={members}
                                            renderStatus={renderStatusBadge}
                                            renderRole={renderRoleBadge}
                                            formatDateTime={formatDateTime}
                                            onViewDetail={(m) => { setDetailMember(m); setShowDetailModal(true); }}
                                            onEdit={(m) => {
                                                if (m.userId === user?.id) return showToast("Cannot modify self", "warning");
                                                setSelectedMember(m);
                                                setNewRole(m.roleName?.toUpperCase().includes("ADMIN") ? "PROJECT_ADMIN" : "PROJECT_MEMBER");
                                                setShowEditModal(true);
                                            }}
                                            onDelete={initiateRemoveMember}
                                            onSort={handleSortChange}
                                            currentSortBy={searchParams.sortBy}
                                            currentSortDir={searchParams.sortDir}
                                            disableEdit={(m) => m.userId === user?.id}
                                            disableDelete={(m) => m.userId === user?.id}
                                        />
                                    ) : <EmptyState message="No project members found." />
                                ) : (
                                    invitations.length > 0 ? (
                                        <ProjectInvitationTable
                                            invitations={invitations}
                                            onCancel={initiateCancelInvitation}
                                            formatDateTime={formatDateTime}
                                        />
                                    ) : <EmptyState message="No pending project invitations." />
                                )}
                            </div>

                            {(activeTab === "MEMBERS" ? members.length : invitations.length) > 0 && (
                                <PaginationFooter pagination={pagination} onPageChange={handlePaginationChange} />
                            )}
                        </div>
                    )}
                </div>

                {/* MODALS SECTION */}
                <InviteMemberModal
                    isOpen={showInviteModal}
                    onClose={() => setShowInviteModal(false)}
                    onInvite={handleInviteExecution}
                    isLoading={isInviting}
                    email={inviteEmail}
                    setEmail={setInviteEmail}
                    roleCode={inviteRoleCode}
                    setRoleCode={setInviteRoleCode}
                    title="Invite to Initiative"
                    description="Onboard teammates to collaborate on this specific project."
                    contextType="project"
                    companyId={companyId}
                />

                <MemberDetailModalBase
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    member={detailMember as any}
                    loading={false}
                    title="Personnel Profile"
                    fields={[
                        { label: "Identity", key: "fullName" },
                        { label: "Corporate Email", key: "email" },
                        { label: "Permission Tier", key: "roleName" },
                        { label: "Onboarding Date", key: "joinedAt" },
                        { label: "Mobile", key: "phoneNumber" },
                    ]}
                />

                <ConfirmationModal
                    isOpen={confirmConfig.isOpen}
                    onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={executeConfirmedAction}
                    isLoading={false}
                    title={confirmConfig.title}
                    description={confirmConfig.desc}
                    modalVariant={confirmConfig.variant}
                />

                {showEditModal && selectedMember && (
                    <EditRoleModal 
                        member={selectedMember} 
                        newRole={newRole} 
                        setNewRole={setNewRole} 
                        onSave={handleUpdateRoleExecution} 
                        onClose={() => setShowEditModal(false)} 
                        isLoading={isUpdating} 
                    />
                )}
                
                <Chatbot />
            </div>
        </div>
    );
}

// =============================================================================
// SUB-COMPONENTS (Layout Consistency)
// =============================================================================

const TabButton = ({ active, onClick, icon: Icon, label, count, variant = "blue" }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "py-4 px-1 border-b-[3px] font-black text-[12px] uppercase tracking-[0.15em] flex items-center gap-2.5 transition-all outline-none",
            active 
                ? "border-[#0052CC] text-[#0052CC]" 
                : "border-transparent text-[#6B778C] hover:text-[#172B4D] hover:border-[#DFE1E6]"
        )}
    >
        <Icon className={cn("w-4 h-4 stroke-[2.5]", active ? "text-[#0052CC]" : "text-[#6B778C]")} />
        {label}
        {count !== null && (
            <span className={cn(
                "px-2 py-0.5 rounded-lg text-[10px] ml-1 shadow-sm",
                active 
                    ? (variant === "blue" ? "bg-[#DEEBFF] text-[#0052CC]" : "bg-[#FFF0B3] text-[#FF8B00]") 
                    : "bg-[#F4F5F7] text-[#6B778C]"
            )}>
                {count}
            </span>
        )}
    </button>
);

const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-24 bg-white border-2 border-dashed border-[#DFE1E6] rounded-2xl">
        <Users className="w-12 h-12 text-[#DFE1E6] mx-auto mb-4 stroke-[1.5]" />
        <p className="text-[14px] font-bold text-[#6B778C] uppercase tracking-widest">{message}</p>
    </div>
);

const PaginationFooter = ({ pagination, onPageChange }: any) => (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2 pt-2 gap-6">
        <p className="text-[11px] font-black text-[#6B778C] uppercase tracking-widest">
            Page <span className="text-[#172B4D]">{pagination.pageNumber + 1}</span> of <span className="text-[#172B4D]">{pagination.totalPages || 1}</span> 
            {" "}(<span className="text-[#0052CC]">{pagination.totalElements}</span> entries)
        </p>
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-[#DFE1E6] shadow-sm">
            <PaginationBtn onClick={() => onPageChange(0)} disabled={pagination.first} icon={ChevronsLeft} />
            <PaginationBtn onClick={() => onPageChange(pagination.pageNumber - 1)} disabled={pagination.first} icon={ChevronLeft} />
            <PaginationBtn onClick={() => onPageChange(pagination.pageNumber + 1)} disabled={pagination.last} icon={ChevronRight} />
            <PaginationBtn onClick={() => onPageChange(pagination.totalPages - 1)} disabled={pagination.last} icon={ChevronsRight} />
        </div>
    </div>
);

const PaginationBtn = ({ onClick, disabled, icon: Icon }: any) => (
    <Button onClick={onClick} disabled={disabled} variant="outline" size="icon" className="h-9 w-9 rounded-lg border-transparent hover:bg-[#F4F5F7] active:scale-90 transition-all">
        <Icon className="w-4.5 h-4.5" />
    </Button>
);

const EditRoleModal = ({ member, newRole, setNewRole, onSave, onClose, isLoading }: any) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#091E42]/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-[#FAFBFC]">
                <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#172B4D]">Permissions Authority</h3>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-all"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
                <div className="space-y-1">
                    <p className="text-[14px] font-medium text-[#42526E]">Assign new authorization level for:</p>
                    <p className="text-[16px] font-black text-[#172B4D]">{member.fullName}</p>
                </div>
                <div className="relative">
                    <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full h-12 pl-4 pr-10 border border-[#DFE1E6] rounded-xl text-[14px] font-bold text-[#172B4D] bg-white focus:ring-2 focus:ring-blue-100 outline-none appearance-none cursor-pointer">
                        <option value="PROJECT_MEMBER">Project Member</option>
                        <option value="PROJECT_ADMIN">Project Administrator</option>
                    </select>
                    <ShieldAlert className="w-4.5 h-4.5 text-[#6B778C] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>
            <div className="px-8 py-5 bg-[#FAFBFC] border-t border-slate-100 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} className="h-10 px-6 rounded-lg text-[12px] font-black uppercase tracking-widest border-slate-200">Cancel</Button>
                <Button onClick={onSave} disabled={isLoading} className="h-10 px-8 bg-[#0052CC] hover:bg-[#0747A6] text-white font-black text-[12px] uppercase tracking-widest rounded-lg shadow-md active:scale-95 transition-all">
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Confirm Change
                </Button>
            </div>
        </div>
    </div>
);