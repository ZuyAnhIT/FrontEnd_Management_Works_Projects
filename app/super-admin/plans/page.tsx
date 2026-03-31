"use client";

// =============================================================================
// 1. IMPORT (Thu vien -> Noi bo -> Utils)
// =============================================================================

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
    Search, Package, CheckCircle, XCircle, Loader2, Filter, 
    ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight 
} from "lucide-react";

// Services & Context
import { 
    searchSystemPlans, getPlanById, createSystemPlan, updateSystemPlan, 
    SystemPlan, SystemPlanSearchParams, PlanDetail 
} from "@/services/apiPlanSystem";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";

// UI Components
import { Button } from "@/components/ui/Buttons";
import FilterPopover from "@/components/ui/FilterPopover";
import PlanTable from "@/components/features/super-admin/plans/PlanTable";
import PlanDetailModal from "@/components/features/super-admin/plans/PlanDetailModal";
import PlanFormModal from "@/components/features/super-admin/plans/PlanFormModal";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. CONSTANTS
// =============================================================================

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "sortOrder"; 
const DEFAULT_SORT_DIR = "asc";

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function SystemPlansPage() {
    
    // ---------------------------------------------------------------------------
    // 4. HOOKS & CONTEXT
    // ---------------------------------------------------------------------------
    
    const { user, isLoading: isAuthLoading } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    // ---------------------------------------------------------------------------
    // 5. STATE MANAGEMENT
    // ---------------------------------------------------------------------------

    // Trang thai du lieu bang
    const [plans, setPlans] = useState<SystemPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Trang thai phan trang
    const [pagination, setPagination] = useState({
        pageNumber: 0, 
        pageSize: DEFAULT_PAGE_SIZE,
        totalElements: 0,
        totalPages: 0,
        last: true,
    });

    // Trang thai tham so tim kiem API
    const [searchParams, setSearchParams] = useState<{
        page: number; 
        size: number; 
        sortBy: string; 
        sortDir: "asc" | "desc"; 
        searchStatus?: string;
    }>({
        page: 0,
        size: DEFAULT_PAGE_SIZE,
        sortBy: DEFAULT_SORT_BY,
        sortDir: DEFAULT_SORT_DIR,
    });

    // Trang thai o tim kiem noi bo
    const [searchValue, setSearchValue] = useState("");
    const [searchBy, setSearchBy] = useState("searchName"); 

    // Trang thai quan ly Modals
    const [selectedPlanDetail, setSelectedPlanDetail] = useState<PlanDetail | null>(null);
    
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [isFormLoading, setIsFormLoading] = useState(false);

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
    
    const fetchPlansData = useCallback(async () => {
        if (!user?.systemRoles?.includes("SYSTEM_ADMIN")) return;
        
        setIsLoading(true);
        try {
            let statusBoolean: boolean | undefined = undefined;
            if (searchParams.searchStatus === "true") statusBoolean = true;
            if (searchParams.searchStatus === "false") statusBoolean = false;

            const apiPayload: SystemPlanSearchParams = {
                page: searchParams.page,
                size: searchParams.size,
                sortBy: searchParams.sortBy,
                sortDir: searchParams.sortDir,
                searchStatus: statusBoolean,
                searchName: searchBy === "searchName" ? searchValue || undefined : undefined,
                searchPlanCode: searchBy === "searchPlanCode" ? searchValue || undefined : undefined,
            };

            const data = await searchSystemPlans(apiPayload);
            setPlans(data.content || []);
            
            setPagination({
                pageNumber: data.pageNumber ?? 0,
                pageSize: data.pageSize ?? DEFAULT_PAGE_SIZE,
                totalElements: data.totalElements ?? 0,
                totalPages: data.totalPages ?? 0,
                last: data.last ?? true,
            });
        } catch (err: any) {
            showToast(err.message || "Failed to retrieve subscription plans.", "error");
            setPlans([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchParams, searchValue, searchBy, showToast, user]);

    // Hieu ung Debounce cho viec goi API
    useEffect(() => {
        if (isAuthLoading) return;
        const timer = setTimeout(() => fetchPlansData(), 300);
        return () => clearTimeout(timer);
    }, [fetchPlansData, isAuthLoading]);

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
    
    const handleFilterUpdate = (field: "searchStatus", value: string | undefined) => {
        setSearchParams(prev => ({ 
            ...prev, 
            [field]: value === "ALL" ? undefined : value, 
            page: 0 
        }));
    };

    // ---------------------------------------------------------------------------
    // 9. EVENT HANDLERS (Thao tac Modal)
    // ---------------------------------------------------------------------------
    
    const handleOpenDetailModal = async (plan: SystemPlan) => {
        setIsDetailModalOpen(true);
        setIsDetailLoading(true);
        try {
            const data = await getPlanById(plan.id);
            setSelectedPlanDetail(data);
        } catch (err: any) {
            showToast(err.message || "Failed to load plan details.", "error");
            setIsDetailModalOpen(false);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleOpenCreateForm = () => {
        setFormMode("create");
        setSelectedPlanDetail(null); 
        setIsFormModalOpen(true);
    };

    const handleOpenEditForm = async (plan: SystemPlan) => {
        setFormMode("edit");
        setIsFormModalOpen(true); 
        setIsFormLoading(true);   
        try {
            const detail = await getPlanById(plan.id);
            setSelectedPlanDetail(detail); 
        } catch (error: any) {
            showToast(error.message || "Failed to load plan for editing.", "error");
            setIsFormModalOpen(false);
        } finally {
            setIsFormLoading(false);
        }
    };

    const handleFormSubmit = async (payload: any) => {
        setIsFormLoading(true);
        try {
            if (formMode === "create") {
                await createSystemPlan(payload);
                showToast("Subscription plan created successfully.", "success");
            } else {
                if (!selectedPlanDetail?.id) throw new Error("Plan identifier is missing.");
                await updateSystemPlan(selectedPlanDetail.id, payload);
                showToast("Subscription plan updated successfully.", "success");
            }
            setIsFormModalOpen(false);
            fetchPlansData(); 
        } catch (error: any) {
            showToast(error.message || "Operation failed to execute.", "error");
        } finally {
            setIsFormLoading(false);
        }
    };

    // ---------------------------------------------------------------------------
    // 10. UI HELPERS
    // ---------------------------------------------------------------------------
    
    const renderStatusBadge = (isActive: boolean) => {
        if (isActive) {
            return (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-[#E3FCEF] text-[#006644] shadow-sm">
                    <CheckCircle className="w-3 h-3 stroke-[3]" /> Active
                </div>
            );
        }
        return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-[#F4F5F7] text-[#42526E] shadow-sm border border-[#DFE1E6]">
                <XCircle className="w-3 h-3 stroke-[3]" /> Inactive
            </div>
        );
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
                        <h1 className="text-2xl font-black text-[#172B4D] tracking-tight uppercase flex items-center gap-3">
                            <div className="p-2 bg-[#E3F2FD] rounded-lg border border-blue-100">
                                <Package className="w-5 h-5 text-[#0052CC] stroke-[2.5]" />
                            </div>
                            Subscription Plans
                        </h1>
                        <p className="text-[14px] text-[#42526E] font-medium mt-2">
                            Manage pricing tiers, resource limits, and availability statuses.
                        </p>
                    </div>
                    
                    <Button 
                        onClick={handleOpenCreateForm}
                        className="bg-[#0052CC] hover:bg-[#0747A6] text-white font-black text-[12px] uppercase tracking-widest h-11 px-6 rounded-lg shadow-md active:scale-95 transition-all flex items-center gap-2"
                    >
                        Create New Plan
                    </Button>
                </div>

                {/* TOOLBAR SECTION */}
                <div className="bg-white p-5 rounded-2xl border border-[#DFE1E6] shadow-sm flex flex-col md:flex-row gap-5 items-center justify-between">
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                            value={searchBy}
                            onChange={(e) => { setSearchBy(e.target.value); handleSearchInput(searchValue); }}
                            className="h-11 pl-4 pr-10 border border-[#DFE1E6] rounded-xl text-[12px] font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-100 focus:border-[#0052CC] bg-[#F4F5F7] text-[#172B4D] outline-none cursor-pointer appearance-none"
                        >
                            <option value="searchName">Plan Name</option>
                            <option value="searchPlanCode">Plan Code</option>
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
                                { label: "Active", value: "true", color: "bg-[#36B37E]" },
                                { label: "Inactive", value: "false", color: "bg-[#6B778C]" }
                            ]}
                            value={searchParams.searchStatus}
                            onChange={(val) => handleFilterUpdate("searchStatus", val)}
                        />
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="relative min-h-[400px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col justify-center items-center bg-[#F4F5F7]/50 backdrop-blur-sm z-10 rounded-2xl">
                            <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80 mb-3" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#6B778C]">Fetching Data...</span>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="bg-white border border-[#DFE1E6] rounded-2xl shadow-sm overflow-hidden">
                                <PlanTable
                                    plans={plans}
                                    renderStatus={renderStatusBadge}
                                    onSort={handleSortChange}
                                    currentSortBy={searchParams.sortBy}
                                    currentSortDir={searchParams.sortDir}
                                    onViewDetail={handleOpenDetailModal}
                                    onEdit={handleOpenEditForm} 
                                />
                            </div>

                            {plans.length > 0 && (
                                <PaginationFooter pagination={pagination} onPageChange={handlePageChange} />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS SECTION */}
            <PlanDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                plan={selectedPlanDetail}
                loading={isDetailLoading}
            />

            <PlanFormModal 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                mode={formMode}
                initialData={selectedPlanDetail}
                onSubmit={handleFormSubmit}
                loading={isFormLoading}
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
                Displaying <span className="text-[#172B4D]">{(pagination.pageNumber || 0) * (pagination.pageSize || 10) + 1}</span> 
                {" "}to <span className="text-[#172B4D]">{Math.min(((pagination.pageNumber || 0) + 1) * (pagination.pageSize || 10), (pagination.totalElements || 0))}</span> 
                {" "}of <span className="text-[#172B4D]">{pagination.totalElements || 0}</span> records
            </p>

            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-[#DFE1E6] shadow-sm">
                <PaginationBtn onClick={() => onPageChange(0)} disabled={pagination.pageNumber === 0} icon={ChevronsLeft} />
                <PaginationBtn onClick={() => onPageChange((pagination.pageNumber || 0) - 1)} disabled={pagination.pageNumber === 0} icon={ChevronLeft} />
                <div className="px-4 text-[11px] font-black uppercase tracking-[0.15em] text-[#0052CC]">
                    Page {(pagination.pageNumber || 0) + 1} / {pagination.totalPages || 1}
                </div>
                <PaginationBtn onClick={() => onPageChange((pagination.pageNumber || 0) + 1)} disabled={pagination.last} icon={ChevronRight} />
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