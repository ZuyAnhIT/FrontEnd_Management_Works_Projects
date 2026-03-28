"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Building, CheckCircle, Lock, Loader2, Filter, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Crown, Star } from "lucide-react";

import { 
    searchSystemCompanies, 
    getCompany360View, 
    suspendCompany,       // ✅ Thêm import API
    activateCompany,      // ✅ Thêm import API
    SystemCompany, 
    SystemCompanySearchParams, 
    Tenant360View 
} from "@/services/apiCompanySystem";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Buttons";
import FilterPopover from "@/components/ui/FilterPopover";
import CompanyTable from "@/components/features/super-admin/companies/CompanyTable";
import CompanyDetailModal from "@/components/features/super-admin/companies/CompanyDetailModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal"; // ✅ Import Modal Xác nhận

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_DIR = "desc";

export default function SystemCompaniesPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    // ===================================================
    // 📊 STATES
    // ===================================================

    // Data & Loading State
    const [companies, setCompanies] = useState<SystemCompany[]>([]);
    const [loading, setLoading] = useState(true);

    // States cho 360 View Modal (Tenant Detail)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTenantData, setSelectedTenantData] = useState<Tenant360View | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // ✅ States cho Confirmation Modal (Khóa/Mở khóa)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState("");
    const [confirmDesc, setConfirmDesc] = useState("");
    const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => Promise.resolve());

    // Pagination State
    const [pagination, setPagination] = useState({
        pageNo: 0,
        pageSize: DEFAULT_PAGE_SIZE,
        totalElements: 0,
        totalPages: 0,
        last: true,
    });

    // API Search Params
    const [searchParams, setSearchParams] = useState<SystemCompanySearchParams>({
        page: 0,
        size: DEFAULT_PAGE_SIZE,
        sortBy: DEFAULT_SORT_BY,
        sortDir: DEFAULT_SORT_DIR,
    });

    // Local UI State cho Search Bar
    const [searchValue, setSearchValue] = useState("");
    const [searchBy, setSearchBy] = useState("searchName");

    // ===================================================
    // 🛡️ SECURITY: ROUTE GUARD (Bảo vệ trang)
    // ===================================================
    useEffect(() => {
        if (!isAuthLoading) {
            // Nếu không có user hoặc không có role SYSTEM_ADMIN -> Đá văng ra ngoài
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
        // Chỉ fetch khi đã verify quyền xong
        if (!user?.systemRoles?.includes("SYSTEM_ADMIN")) return;
        
        setLoading(true);
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
                // Bắt fallback cho cả pageNo hoặc pageNumber đề phòng API trả về key khác
                pageNo: data.pageNo ?? (data as any).pageNumber ?? 0, 
                pageSize: data.pageSize ?? DEFAULT_PAGE_SIZE,
                totalElements: data.totalElements ?? 0,
                totalPages: data.totalPages ?? 0,
                last: data.last ?? true,
            });
        } catch (err: any) {
            showToast(err.message || "Failed to load companies", "error");
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    }, [searchParams, searchValue, searchBy, showToast, user]);

    // Debounce Fetch Trigger
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
    
    const handleFilterChange = (field: "searchStatus" | "searchPlanCode", value: string | undefined) => {
        setSearchParams(prev => ({
            ...prev,
            [field]: value === "ALL" ? undefined : value,
            page: 0
        }));
    };

    // ===================================================
    // 🛑 HANDLERS ACTIONS (View Detail, Suspend, Activate)
    // ===================================================
    
    // Mở chi tiết 360 độ của công ty
    const handleViewDetail = async (company: SystemCompany) => {
        setIsDetailModalOpen(true);
        setIsDetailLoading(true);
        try {
            const data = await getCompany360View(company.id);
            setSelectedTenantData(data);
        } catch (err: any) {
            showToast(err.message || "Failed to load tenant 360 view", "error");
            setIsDetailModalOpen(false); // Đóng modal nếu lỗi
        } finally {
            setIsDetailLoading(false);
        }
    };

    // Mở modal hỏi Khóa (Suspend)
    const handleSuspendClick = (company: SystemCompany) => {
        setConfirmTitle("Suspend Company?");
        setConfirmDesc(`Are you sure you want to suspend "${company.name}"? All users in this company will lose access immediately.`);
        setConfirmAction(() => async () => {
            await suspendCompany(company.id);
            showToast(`Company "${company.name}" suspended successfully.`, "success");
            fetchData(); // Refresh list
        });
        setIsConfirmOpen(true);
    };

    // Mở modal hỏi Mở Khóa (Activate)
    const handleActivateClick = (company: SystemCompany) => {
        setConfirmTitle("Activate Company?");
        setConfirmDesc(`Do you want to reactivate "${company.name}"? Users will be able to log in again.`);
        setConfirmAction(() => async () => {
            await activateCompany(company.id);
            showToast(`Company "${company.name}" activated successfully.`, "success");
            fetchData(); // Refresh list
        });
        setIsConfirmOpen(true);
    };

    // Thực thi API khi bấm Confirm trong Modal
    const executeConfirmAction = async () => {
        setIsProcessingAction(true);
        try {
            await confirmAction();
            setIsConfirmOpen(false);
        } catch (err: any) {
            showToast(err.message || "Action failed.", "error");
        } finally {
            setIsProcessingAction(false);
        }
    };

    // ===================================================
    // 🎨 HELPERS RENDER
    // ===================================================
    const renderStatusBadge = (status: string) => {
        if (status === "ACTIVE") return <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle className="w-3 h-3" /> Active</div>;
        // ✅ Cập nhật hiển thị thành Suspended
        return <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200"><Lock className="w-3 h-3" /> Suspended</div>;
    };

    const renderPlanBadge = (company: SystemCompany) => {
        const plan = company.planCode?.toUpperCase();
        let style = "bg-slate-50 text-slate-700 border border-slate-200";
        let Icon = Building;

        if (plan === "PRO") { style = "bg-blue-50 text-blue-700 border border-blue-200"; Icon = Star; } 
        else if (plan === "MAX") { style = "bg-amber-50 text-amber-800 border-2 border-amber-400 shadow-sm"; Icon = Crown; }

        return (
            <div className="flex flex-col gap-1 items-start">
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${style}`}><Icon className="w-3 h-3" /> {company.planName || plan}</div>
                {company.subscriptionStatus === "ACTIVE" 
                    ? <span className="text-[10px] text-green-600 font-medium">Valid till: {new Date(company.currentPeriodEnd).toLocaleDateString()}</span>
                    : <span className="text-[10px] text-red-500 font-medium">Expired/Past Due</span>
                }
            </div>
        );
    };

    const formatDateTime = (date?: string | null) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    // ===================================================
    // 🖥️ RENDER
    // ===================================================
    if (isAuthLoading || (!user?.systemRoles?.includes("SYSTEM_ADMIN"))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 p-6 sm:p-8 relative">
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Companies Directory</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage all registered companies, subscriptions, and tenant statuses.</p>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={searchBy}
                            onChange={(e) => { setSearchBy(e.target.value); handleSearchChange(searchValue); }}
                            className="h-10 pl-3 pr-8 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-slate-50 cursor-pointer"
                        >
                            <option value="searchName">Company Name</option>
                            <option value="searchCode">Company Code</option>
                            <option value="searchEmail">Email</option>
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
                                { label: "Active", value: "ACTIVE", color: "bg-emerald-500" },
                                // ✅ Đổi value thành SUSPENDED
                                { label: "Suspended", value: "SUSPENDED", color: "bg-red-500" }
                            ]}
                            value={searchParams.searchStatus}
                            onChange={(val) => handleFilterChange("searchStatus", val)}
                        />
                        <FilterPopover
                            label="Plan"
                            icon={<Crown className="w-4 h-4" />}
                            options={[
                                { label: "Free Plan", value: "FREE" },
                                { label: "Pro Plan", value: "PRO" },
                                { label: "Max Plan", value: "MAX" }
                            ]}
                            value={searchParams.searchPlanCode}
                            onChange={(val) => handleFilterChange("searchPlanCode", val)}
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
                        <CompanyTable
                            companies={companies}
                            renderStatus={renderStatusBadge}
                            renderPlan={renderPlanBadge}
                            formatDateTime={formatDateTime}
                            onSort={handleSort}
                            currentSortBy={searchParams.sortBy}
                            currentSortDir={searchParams.sortDir}
                            onViewDetail={handleViewDetail} 
                            onSuspend={handleSuspendClick}    // ✅ Truyền handler Khóa
                            onActivate={handleActivateClick}  // ✅ Truyền handler Mở khóa
                        />

                        {/* PAGINATION */}
                        {companies.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                <p className="text-sm text-slate-500">
                                    Showing <span className="font-semibold text-slate-900">{(pagination.pageNo || 0) * (pagination.pageSize || 10) + 1}</span> to <span className="font-semibold text-slate-900">{Math.min(((pagination.pageNo || 0) + 1) * (pagination.pageSize || 10), (pagination.totalElements || 0))}</span> of <span className="font-semibold text-slate-900">{pagination.totalElements || 0}</span> results
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button onClick={() => handlePageChange(0)} disabled={pagination.pageNo === 0} variant="outline" size="icon" className="h-8 w-8"><ChevronsLeft className="w-4 h-4" /></Button>
                                    <Button onClick={() => handlePageChange((pagination.pageNo || 0) - 1)} disabled={pagination.pageNo === 0} variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
                                    <span className="mx-2 text-sm font-medium text-slate-700">Page {(pagination.pageNo || 0) + 1} of {pagination.totalPages || 1}</span>
                                    <Button onClick={() => handlePageChange((pagination.pageNo || 0) + 1)} disabled={pagination.last} variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
                                    <Button onClick={() => handlePageChange((pagination.totalPages || 1) - 1)} disabled={pagination.last} variant="outline" size="icon" className="h-8 w-8"><ChevronsRight className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal: Tenant 360 View */}
            <CompanyDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                tenant={selectedTenantData}
                loading={isDetailLoading}
            />

            {/* ✅ Modal: Xác nhận Khóa / Mở Khóa */}
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeConfirmAction}
                isLoading={isProcessingAction}
                title={confirmTitle}
                description={confirmDesc}
                confirmText={confirmTitle.includes("Suspend") ? "Suspend" : "Activate"}
                modalVariant={confirmTitle.includes("Suspend") ? "danger" : "info"} 
            />
        </div>
    );
}