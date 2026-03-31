"use client";

// =============================================================================
// 1. IMPORT (Thư viện -> Nội bộ -> Utils)
// =============================================================================

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
    Search, Building, CheckCircle, Lock, Loader2, Filter, 
    ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Crown, Star 
} from "lucide-react";

// Services & Context
import { 
    searchSystemCompanies, getCompany360View, suspendCompany, activateCompany, 
    SystemCompany, SystemCompanySearchParams, Tenant360View 
} from "@/services/apiCompanySystem";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";

// UI Components
import { Button } from "@/components/ui/Buttons";
import FilterPopover from "@/components/ui/FilterPopover";
import CompanyTable from "@/components/features/super-admin/companies/CompanyTable";
import CompanyDetailModal from "@/components/features/super-admin/companies/CompanyDetailModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS
// =============================================================================

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_DIR = "desc";

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function SystemCompaniesPage() {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & CONTEXT
    // ---------------------------------------------------------------------------
    
    const { user, isLoading: isAuthLoading } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    // ---------------------------------------------------------------------------
    // 5. STATE MANAGEMENT
    // ---------------------------------------------------------------------------

    // Trang thai du lieu cong ty
    const [companies, setCompanies] = useState<SystemCompany[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Trang thai modal chi tiet 360
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTenantData, setSelectedTenantData] = useState<Tenant360View | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // Trang thai modal xac nhan (Khoa / Mo Khoa)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: "", desc: "", variant: "danger" as any });
    const [onConfirmAction, setOnConfirmAction] = useState<() => Promise<void>>(() => Promise.resolve());

    // Trang thai phan trang
    const [pagination, setPagination] = useState({
        pageNo: 0,
        pageSize: DEFAULT_PAGE_SIZE,
        totalElements: 0,
        totalPages: 0,
        last: true,
    });

    // Trang thai cac tham so tim kiem va loc API
    const [searchParams, setSearchParams] = useState<SystemCompanySearchParams & { searchStatus?: string; searchPlanCode?: string }>({
        page: 0,
        size: DEFAULT_PAGE_SIZE,
        sortBy: DEFAULT_SORT_BY,
        sortDir: DEFAULT_SORT_DIR,
    });

    // Trang thai o tim kiem noi bo
    const [searchValue, setSearchValue] = useState("");
    const [searchBy, setSearchBy] = useState("searchName");

    // ---------------------------------------------------------------------------
    // 6. ROUTE GUARD (Bao ve tuyen duong Super Admin)
    // ---------------------------------------------------------------------------
    
    useEffect(() => {
        if (!isAuthLoading) {
            if (!user || !user.systemRoles?.includes("SYSTEM_ADMIN")) {
                showToast("Access Denied. System Administrator privileges required.", "error");
                router.push("/portal"); 
            }
        }
    }, [user, isAuthLoading, router, showToast]);

    // ---------------------------------------------------------------------------
    // 7. DATA FETCHING
    // ---------------------------------------------------------------------------
    
    const fetchCompaniesData = useCallback(async () => {
        if (!user?.systemRoles?.includes("SYSTEM_ADMIN")) return;
        
        setIsLoading(true);
        try {
            const apiPayload: SystemCompanySearchParams = {
                ...searchParams,
                searchName: searchBy === "searchName" ? searchValue || undefined : undefined,
                searchCode: searchBy === "searchCode" ? searchValue || undefined : undefined,
                searchEmail: searchBy === "searchEmail" ? searchValue || undefined : undefined,
            };

            const data = await searchSystemCompanies(apiPayload);
            setCompanies(data.content || []);
            
            setPagination({
                pageNo: data.pageNo ?? (data as any).pageNumber ?? 0, 
                pageSize: data.pageSize ?? DEFAULT_PAGE_SIZE,
                totalElements: data.totalElements ?? 0,
                totalPages: data.totalPages ?? 0,
                last: data.last ?? true,
            });
        } catch (err: any) {
            showToast(err.message || "Failed to retrieve companies directory.", "error");
            setCompanies([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchParams, searchValue, searchBy, showToast, user]);

    // Hieu ung Debounce cho viec goi API
    useEffect(() => {
        if (isAuthLoading) return;
        const timer = setTimeout(() => fetchCompaniesData(), 300);
        return () => clearTimeout(timer);
    }, [fetchCompaniesData, isAuthLoading]);

    // ---------------------------------------------------------------------------
    // 8. EVENT HANDLERS (Tim kiem & Loc)
    // ---------------------------------------------------------------------------
    
    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => ({ ...prev, page: newPage }));
    };
    
    const handleSortChange = (newSortBy: string) => {
        setSearchParams(prev => ({
            ...prev,
            sortBy: newSortBy,
            sortDir: prev.sortBy === newSortBy && prev.sortDir === "desc" ? "asc" : "desc",
            page: 0,
        }));
    };
    
    const handleSearchInput = (text: string) => {
        setSearchValue(text);
        setSearchParams(prev => ({ ...prev, page: 0 }));
    };
    
    const handleFilterUpdate = (field: "searchStatus" | "searchPlanCode", value: string | undefined) => {
        setSearchParams(prev => ({
            ...prev,
            [field]: value === "ALL" ? undefined : value,
            page: 0
        }));
    };

    // ---------------------------------------------------------------------------
    // 9. EVENT HANDLERS (Thao tac nghiep vu)
    // ---------------------------------------------------------------------------
    
    const handleOpenDetailModal = async (company: SystemCompany) => {
        setIsDetailModalOpen(true);
        setIsDetailLoading(true);
        try {
            const data = await getCompany360View(company.id);
            setSelectedTenantData(data);
        } catch (err: any) {
            showToast(err.message || "Failed to load tenant 360 view.", "error");
            setIsDetailModalOpen(false);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleInitiateSuspend = (company: SystemCompany) => {
        setConfirmConfig({
            title: "Suspend Organization",
            desc: `Are you sure you want to suspend "${company.name}"? All users associated with this tenant will lose platform access immediately.`,
            variant: "danger"
        });
        setOnConfirmAction(() => async () => {
            await suspendCompany(company.id);
            showToast(`Organization "${company.name}" has been suspended.`, "success");
            fetchCompaniesData(); 
        });
        setIsConfirmOpen(true);
    };

    const handleInitiateActivate = (company: SystemCompany) => {
        setConfirmConfig({
            title: "Activate Organization",
            desc: `Do you want to reactivate "${company.name}"? Users will regain their platform access rights.`,
            variant: "info"
        });
        setOnConfirmAction(() => async () => {
            await activateCompany(company.id);
            showToast(`Organization "${company.name}" is now active.`, "success");
            fetchCompaniesData(); 
        });
        setIsConfirmOpen(true);
    };

    const executeConfirmedAction = async () => {
        setIsProcessingAction(true);
        try {
            await onConfirmAction();
            setIsConfirmOpen(false);
        } catch (err: any) {
            showToast(err.message || "Execution failed.", "error");
        } finally {
            setIsProcessingAction(false);
        }
    };

    // ---------------------------------------------------------------------------
    // 10. UI HELPERS
    // ---------------------------------------------------------------------------
    
    const renderStatusBadge = (status: string) => {
        if (status === "ACTIVE") {
            return (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-[#E3FCEF] text-[#006644] shadow-sm">
                    <CheckCircle className="w-3 h-3 stroke-[3]" /> Active
                </div>
            );
        }
        return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-[#FFEBE6] text-[#BF2600] shadow-sm">
                <Lock className="w-3 h-3 stroke-[3]" /> Suspended
            </div>
        );
    };

    const renderPlanBadge = (company: SystemCompany) => {
        const plan = company.planCode?.toUpperCase();
        let style = "bg-[#DFE1E6] text-[#42526E]";
        let Icon = Building;

        if (plan === "PRO") { style = "bg-[#DEEBFF] text-[#0052CC]"; Icon = Star; } 
        else if (plan === "MAX") { style = "bg-[#EAE6FF] text-[#403294]"; Icon = Crown; }

        return (
            <div className="flex flex-col gap-1 items-start">
                <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm", style)}>
                    <Icon className="w-3 h-3 stroke-[2.5]" /> {company.planName || plan}
                </div>
                {company.subscriptionStatus === "ACTIVE" 
                    ? <span className="text-[10px] text-[#36B37E] font-black uppercase tracking-widest">Valid: {new Date(company.currentPeriodEnd).toLocaleDateString()}</span>
                    : <span className="text-[10px] text-[#FF5630] font-black uppercase tracking-widest">Expired / Past Due</span>
                }
            </div>
        );
    };

    const formatDateTime = (date?: string | null) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    // ---------------------------------------------------------------------------
    // 11. RENDER LOGIC
    // ---------------------------------------------------------------------------
    
    if (isAuthLoading || (!user?.systemRoles?.includes("SYSTEM_ADMIN"))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">
                <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans text-[#172B4D] p-6 sm:p-8 relative">
            <div className="max-w-[1600px] mx-auto space-y-8">
                
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div>
                        <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase">Tenant Directory</h1>
                        <p className="text-[14px] text-[#42526E] font-medium mt-1">
                            Monitor organizations, subscriptions, and platform access statuses.
                        </p>
                    </div>
                </div>

                {/* TOOLBAR SECTION */}
                <div className="bg-white p-5 rounded-2xl border border-[#DFE1E6] shadow-sm flex flex-col md:flex-row gap-5 items-center justify-between">
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                            value={searchBy}
                            onChange={(e) => { setSearchBy(e.target.value); handleSearchInput(searchValue); }}
                            className="h-11 pl-4 pr-10 border border-[#DFE1E6] rounded-xl text-[12px] font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-100 focus:border-[#0052CC] bg-[#F4F5F7] text-[#172B4D] outline-none cursor-pointer appearance-none"
                        >
                            <option value="searchName">Company Name</option>
                            <option value="searchCode">Company Code</option>
                            <option value="searchEmail">Admin Email</option>
                        </select>
                        
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#0052CC] transition-colors" />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                placeholder="Enter keyword to lookup..."
                                className="w-full pl-11 pr-4 h-11 bg-white border border-[#DFE1E6] rounded-xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-[#0052CC] transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                        <FilterPopover
                            label="Status"
                            icon={<Filter className="w-4 h-4" />}
                            options={[
                                { label: "Active", value: "ACTIVE", color: "bg-[#36B37E]" },
                                { label: "Suspended", value: "SUSPENDED", color: "bg-[#FF5630]" }
                            ]}
                            value={searchParams.searchStatus}
                            onChange={(val) => handleFilterUpdate("searchStatus", val)}
                        />
                        <FilterPopover
                            label="Plan Tier"
                            icon={<Crown className="w-4 h-4" />}
                            options={[
                                { label: "Free Tier", value: "FREE" },
                                { label: "Pro Tier", value: "PRO" },
                                { label: "Max Tier", value: "MAX" }
                            ]}
                            value={searchParams.searchPlanCode}
                            onChange={(val) => handleFilterUpdate("searchPlanCode", val)}
                        />
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="relative min-h-[400px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col justify-center items-center bg-[#F4F5F7]/50 backdrop-blur-sm z-10 rounded-2xl">
                            <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80 mb-3" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#6B778C]">Fetching Directory...</span>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="bg-white border border-[#DFE1E6] rounded-2xl shadow-sm overflow-hidden">
                                <CompanyTable
                                    companies={companies}
                                    renderStatus={renderStatusBadge}
                                    renderPlan={renderPlanBadge}
                                    formatDateTime={formatDateTime}
                                    onSort={handleSortChange}
                                    currentSortBy={searchParams.sortBy}
                                    currentSortDir={searchParams.sortDir}
                                    onViewDetail={handleOpenDetailModal} 
                                    onSuspend={handleInitiateSuspend}    
                                    onActivate={handleInitiateActivate}  
                                />
                            </div>

                            {companies.length > 0 && (
                                <PaginationFooter pagination={pagination} onPageChange={handlePageChange} />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS SECTION */}
            <CompanyDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                tenant={selectedTenantData}
                loading={isDetailLoading}
            />

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeConfirmedAction}
                isLoading={isProcessingAction}
                title={confirmConfig.title}
                description={confirmConfig.desc}
                confirmText={confirmConfig.title.includes("Suspend") ? "Execute Suspension" : "Execute Activation"}
                modalVariant={confirmConfig.variant} 
            />
        </div>
    );
}

// =============================================================================
// SUB-COMPONENTS (Refactored for Cleanliness)
// =============================================================================

const PaginationFooter = ({ pagination, onPageChange }: any) => {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            <p className="text-[12px] font-bold text-[#6B778C] uppercase tracking-widest">
                Displaying <span className="text-[#172B4D]">{(pagination.pageNo || 0) * (pagination.pageSize || 10) + 1}</span> 
                {" "}to <span className="text-[#172B4D]">{Math.min(((pagination.pageNo || 0) + 1) * (pagination.pageSize || 10), (pagination.totalElements || 0))}</span> 
                {" "}of <span className="text-[#172B4D]">{pagination.totalElements || 0}</span> records
            </p>

            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-[#DFE1E6] shadow-sm">
                <PaginationBtn onClick={() => onPageChange(0)} disabled={pagination.pageNo === 0} icon={ChevronsLeft} />
                <PaginationBtn onClick={() => onPageChange((pagination.pageNo || 0) - 1)} disabled={pagination.pageNo === 0} icon={ChevronLeft} />
                <div className="px-4 text-[11px] font-black uppercase tracking-[0.15em] text-[#0052CC]">
                    Page {(pagination.pageNo || 0) + 1} / {pagination.totalPages || 1}
                </div>
                <PaginationBtn onClick={() => onPageChange((pagination.pageNo || 0) + 1)} disabled={pagination.last} icon={ChevronRight} />
                <PaginationBtn onClick={() => onPageChange((pagination.totalPages || 1) - 1)} disabled={pagination.last} icon={ChevronsRight} />
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