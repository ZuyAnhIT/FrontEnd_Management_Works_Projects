"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, CheckCircle, XCircle, Loader2, Filter, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

// ✅ Import đầy đủ các hàm API và Interface
import { 
    searchSystemPlans, 
    getPlanById, 
    createSystemPlan, 
    updateSystemPlan, 
    SystemPlan, 
    SystemPlanSearchParams, 
    PlanDetail 
} from "@/services/apiPlanSystem";

import PlanDetailModal from "@/components/features/super-admin/plans/PlanDetailModal";
import PlanFormModal from "@/components/features/super-admin/plans/PlanFormModal"; // ✅ Import Form Modal
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Buttons";
import FilterPopover from "@/components/ui/FilterPopover";
import PlanTable from "@/components/features/super-admin/plans/PlanTable";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "sortOrder"; 
const DEFAULT_SORT_DIR = "asc";

export default function SystemPlansPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    // ===================================================
    // 📊 STATES: DỮ LIỆU BẢNG & PHÂN TRANG
    // ===================================================
    const [plans, setPlans] = useState<SystemPlan[]>([]);
    const [loading, setLoading] = useState(true);

    const [pagination, setPagination] = useState({
        pageNumber: 0, 
        pageSize: DEFAULT_PAGE_SIZE,
        totalElements: 0,
        totalPages: 0,
        last: true,
    });

    const [searchParams, setSearchParams] = useState<{
        page: number; size: number; sortBy: string; sortDir: "asc"|"desc"; searchStatus?: string;
    }>({
        page: 0,
        size: DEFAULT_PAGE_SIZE,
        sortBy: DEFAULT_SORT_BY,
        sortDir: DEFAULT_SORT_DIR,
    });

    const [searchValue, setSearchValue] = useState("");
    const [searchBy, setSearchBy] = useState("searchName"); 

    // ===================================================
    // 📊 STATES: QUẢN LÝ CÁC MODALS (VIEW / CREATE / EDIT)
    // ===================================================
    
    // Dùng chung cho cả Detail Modal và Form Modal (Edit)
    const [selectedPlanDetail, setSelectedPlanDetail] = useState<PlanDetail | null>(null);
    
    // States cho Detail Modal
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // States cho Form Modal (Create / Edit)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [isFormLoading, setIsFormLoading] = useState(false);

    // ===================================================
    // 🛡️ SECURITY: ROUTE GUARD
    // ===================================================
    useEffect(() => {
        if (!isAuthLoading) {
            if (!user || !user.systemRoles?.includes("SYSTEM_ADMIN")) {
                showToast("Access Denied. System Admin privileges required.", "error");
                router.push("/portal"); 
            }
        }
    }, [user, isAuthLoading, router, showToast]);

    // ===================================================
    // 🔄 FETCH DATA LOGIC
    // ===================================================
    const fetchData = useCallback(async () => {
        if (!user?.systemRoles?.includes("SYSTEM_ADMIN")) return;
        
        setLoading(true);
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
            showToast(err.message || "Failed to load plans", "error");
            setPlans([]);
        } finally {
            setLoading(false);
        }
    }, [searchParams, searchValue, searchBy, showToast, user]);

    useEffect(() => {
        if (isAuthLoading) return;
        const t = setTimeout(() => fetchData(), 300);
        return () => clearTimeout(t);
    }, [fetchData, isAuthLoading]);

    // ===================================================
    // ⚙️ HANDLERS TÌM KIẾM & LỌC
    // ===================================================
    const handlePageChange = (newPage: number) => setSearchParams(prev => ({ ...prev, page: newPage }));
    const handleSort = (newSortBy: string) => setSearchParams(prev => ({
        ...prev,
        sortBy: newSortBy,
        sortDir: prev.sortBy === newSortBy && prev.sortDir === "desc" ? "asc" : "desc",
        page: 0,
    }));
    const handleSearchChange = (text: string) => {
        setSearchValue(text);
        setSearchParams(prev => ({ ...prev, page: 0 }));
    };
    const handleFilterChange = (field: "searchStatus", value: string | undefined) => {
        setSearchParams(prev => ({ ...prev, [field]: value === "ALL" ? undefined : value, page: 0 }));
    };

    // ===================================================
    // 🛑 HANDLERS ACTIONS (View, Create, Edit)
    // ===================================================
    
    // 1. Mở Modal Xem chi tiết
    const handleViewDetail = async (plan: SystemPlan) => {
        setIsDetailModalOpen(true);
        setIsDetailLoading(true);
        try {
            const data = await getPlanById(plan.id);
            setSelectedPlanDetail(data);
        } catch (err: any) {
            showToast(err.message || "Failed to load plan details", "error");
            setIsDetailModalOpen(false);
        } finally {
            setIsDetailLoading(false);
        }
    };

    // 2. Mở Modal Form Tạo Mới
    const handleOpenCreateForm = () => {
        setFormMode("create");
        setSelectedPlanDetail(null); // Reset data
        setIsFormModalOpen(true);
    };

    // 3. Mở Modal Form Chỉnh Sửa
    const handleOpenEditForm = async (plan: SystemPlan) => {
        setFormMode("edit");
        setIsFormModalOpen(true); 
        setIsFormLoading(true);   
        try {
            const detail = await getPlanById(plan.id);
            setSelectedPlanDetail(detail); // Load dữ liệu cũ vào form
        } catch (error: any) {
            showToast(error.message || "Failed to load plan for editing", "error");
            setIsFormModalOpen(false);
        } finally {
            setIsFormLoading(false);
        }
    };

    // 4. Xử lý Submit Form (Create/Update)
    const handleFormSubmit = async (payload: any) => {
        setIsFormLoading(true);
        try {
            if (formMode === "create") {
                await createSystemPlan(payload);
                showToast("Plan created successfully!", "success");
            } else {
                if (!selectedPlanDetail?.id) throw new Error("Missing Plan ID");
                await updateSystemPlan(selectedPlanDetail.id, payload);
                showToast("Plan updated successfully!", "success");
            }
            setIsFormModalOpen(false);
            fetchData(); // Làm mới lại bảng sau khi thay đổi
        } catch (error: any) {
            showToast(error.message || "Operation failed", "error");
        } finally {
            setIsFormLoading(false);
        }
    };

    // ===================================================
    // 🎨 HELPERS RENDER
    // ===================================================
    const renderStatusBadge = (isActive: boolean) => {
        if (isActive) return <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle className="w-3 h-3" /> Active</div>;
        return <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"><XCircle className="w-3 h-3" /> Inactive</div>;
    };

    // ===================================================
    // 🖥️ RENDER
    // ===================================================
    if (isAuthLoading || (!user?.systemRoles?.includes("SYSTEM_ADMIN"))) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 p-6 sm:p-8 relative">
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Package className="w-6 h-6 text-blue-600" /> Subscription Plans
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Manage pricing tiers, resource limits, and availability statuses.</p>
                    </div>
                    {/* ✅ Nút gọi hàm mở Form Tạo Mới */}
                    <Button 
                        onClick={handleOpenCreateForm}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-5 rounded-[3px] flex items-center gap-2"
                    >
                        Create New Plan
                    </Button>
                </div>

                {/* TOOLBAR */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={searchBy}
                            onChange={(e) => { setSearchBy(e.target.value); handleSearchChange(searchValue); }}
                            className="h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-slate-50 cursor-pointer"
                        >
                            <option value="searchName">Plan Name</option>
                            <option value="searchPlanCode">Plan Code</option>
                        </select>
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Enter keyword to search..."
                                className="w-full pl-9 pr-4 h-10 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <FilterPopover
                            label="Status"
                            icon={<Filter className="w-4 h-4" />}
                            options={[
                                { label: "Active", value: "true", color: "bg-emerald-500" },
                                { label: "Inactive", value: "false", color: "bg-slate-400" }
                            ]}
                            value={searchParams.searchStatus}
                            onChange={(val) => handleFilterChange("searchStatus", val)}
                        />
                    </div>
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="flex justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <PlanTable
                            plans={plans}
                            renderStatus={renderStatusBadge}
                            onSort={handleSort}
                            currentSortBy={searchParams.sortBy}
                            currentSortDir={searchParams.sortDir}
                            onViewDetail={handleViewDetail}
                            onEdit={handleOpenEditForm} // ✅ Truyền hàm mở Form Sửa
                        />

                        {/* PAGINATION */}
                        {plans.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                <p className="text-sm text-slate-500">
                                    Showing <span className="font-semibold text-slate-900">{(pagination.pageNumber || 0) * (pagination.pageSize || 10) + 1}</span> to <span className="font-semibold text-slate-900">{Math.min(((pagination.pageNumber || 0) + 1) * (pagination.pageSize || 10), (pagination.totalElements || 0))}</span> of <span className="font-semibold text-slate-900">{pagination.totalElements || 0}</span> results
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button onClick={() => handlePageChange(0)} disabled={pagination.pageNumber === 0} variant="outline" size="icon" className="h-8 w-8"><ChevronsLeft className="w-4 h-4" /></Button>
                                    <Button onClick={() => handlePageChange((pagination.pageNumber || 0) - 1)} disabled={pagination.pageNumber === 0} variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
                                    <span className="mx-2 text-sm font-medium text-slate-700">Page {(pagination.pageNumber || 0) + 1} of {pagination.totalPages || 1}</span>
                                    <Button onClick={() => handlePageChange((pagination.pageNumber || 0) + 1)} disabled={pagination.last} variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
                                    <Button onClick={() => handlePageChange((pagination.totalPages || 1) - 1)} disabled={pagination.last} variant="outline" size="icon" className="h-8 w-8"><ChevronsRight className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ✅ Modal: Xem Chi Tiết Gói Cước */}
            <PlanDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                plan={selectedPlanDetail}
                loading={isDetailLoading}
            />

            {/* ✅ Modal: Form Tạo Mới / Chỉnh Sửa */}
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