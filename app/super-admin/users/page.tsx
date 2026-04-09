"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Users, Filter, Loader2, UserPlus, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { useDebounce } from "@/hooks/useDebounce";
import { 
  getGlobalUsers, 
  toggleUserStatus, 
  toggleSystemAdminRole, 
  GlobalUser, 
  UserSearchParams, 
  UserPageResponse 
} from "@/services/apiUserSystem";
import { UserTable } from "@/components/features/super-admin/users/UserTable";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { cn } from "@/lib/utils";

export default function GlobalUsersPage() {
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  // =========================================================================
  // DATA & FILTER STATES
  // =========================================================================
  const [data, setData] = useState<UserPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const [status, setStatus] = useState<string>("ALL");
  const [page, setPage] = useState(0);

  // =========================================================================
  // CONFIRMATION MODAL STATES (For Action Protection)
  // =========================================================================
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
    variant: "danger" | "warning" | "info";
    action: () => Promise<void>;
  }>({ isOpen: false, title: "", desc: "", variant: "info", action: async () => {} });
  
  const [isProcessing, setIsProcessing] = useState(false);

  // =========================================================================
  // DATA FETCHING
  // =========================================================================
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: UserSearchParams = {
        keyword: debouncedKeyword || undefined,
        status: status === "ALL" ? undefined : status,
        page: page,
        size: 10,
        sortBy: "createdAt",
        sortDir: "desc"
      };
      const result = await getGlobalUsers(params);
      setData(result);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedKeyword, status, page, showToast]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchUsers();
    }
  }, [fetchUsers, isAuthLoading]);

  // Reset to first page when search filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, status]);

  // =========================================================================
  // ACTION HANDLERS
  // =========================================================================

  // 1. Handle Lock/Unlock Request
  const handleToggleStatusRequest = (user: GlobalUser, newStatus: "ACTIVE" | "LOCKED") => {
    const isLocking = newStatus === "LOCKED";
    setConfirmModal({
      isOpen: true,
      title: isLocking ? "Lock User Account" : "Unlock User Account",
      desc: isLocking 
        ? `Are you sure you want to lock the account for "${user.fullName}"? They will be logged out of all devices and cannot log back in.`
        : `Allow the account for "${user.fullName}" to operate normally again?`,
      variant: isLocking ? "danger" : "info",
      action: async () => {
        await toggleUserStatus(user.id, newStatus);
        showToast(isLocking ? "Account locked successfully." : "Account unlocked successfully.", "success");
        fetchUsers(); 
      }
    });
  };

  // 2. Handle Grant/Revoke Admin Role Request
  const handleToggleRoleRequest = (user: GlobalUser, assignAdmin: boolean) => {
    setConfirmModal({
      isOpen: true,
      title: assignAdmin ? "Grant System Admin Rights" : "Revoke System Admin Rights",
      desc: assignAdmin
        ? `WARNING: You are about to grant full system control to "${user.fullName}". Do you wish to proceed?`
        : `Are you sure you want to revoke System Admin privileges from "${user.fullName}"?`,
      variant: assignAdmin ? "warning" : "danger",
      action: async () => {
        await toggleSystemAdminRole(user.id, assignAdmin);
        showToast(assignAdmin ? "Admin privileges granted." : "Admin privileges revoked.", "success");
        fetchUsers();
      }
    });
  };

  // 3. Execute Confirmed Action
  const executeAction = async () => {
    setIsProcessing(true);
    try {
      await confirmModal.action();
    } catch (err: any) {
      // If the backend rejects the action (e.g., self-harm rule triggered)
      showToast(err.message, "error"); 
    } finally {
      setIsProcessing(false);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F4F5F7] p-8 font-sans text-[#172B4D]">
      <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#0052CC] text-white rounded-2xl shadow-lg shadow-blue-500/20">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Global User Directory</h1>
              <p className="text-[14px] text-[#6B778C] font-medium mt-0.5">Manage identities and permissions across the entire platform.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-[#0052CC] hover:bg-[#0747A6] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md">
            <UserPlus className="w-4 h-4" /> Add New User
          </button>
        </header>

        {/* FILTER BAR */}
        <div className="bg-white p-4 rounded-2xl border border-[#DFE1E6] shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B778C] group-focus-within:text-[#0052CC] transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email, or phone number..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#F4F5F7] border-transparent rounded-xl text-[14px] focus:bg-white focus:border-[#0052CC] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#F4F5F7] px-4 py-1 rounded-xl border border-transparent focus-within:bg-white focus-within:border-[#DFE1E6] transition-all">
              <Filter className="w-4 h-4 text-[#6B778C] mr-2" />
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-transparent border-none py-2 text-[13px] font-bold text-[#42526E] outline-none cursor-pointer min-w-[140px]"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="LOCKED">Locked</option>
                <option value="DELETED">Deleted</option>
              </select>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="bg-white rounded-2xl border border-[#DFE1E6] shadow-sm overflow-hidden min-h-[500px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#6B778C]">Syncing data...</span>
            </div>
          )}

          {data?.content && data.content.length > 0 ? (
            <>
              {/* TABLE COMPONENT WITH INTEGRATED ACTIONS */}
              <UserTable 
                users={data.content} 
                currentUserId={currentUser?.id}
                onToggleStatus={handleToggleStatusRequest}
                onToggleRole={handleToggleRoleRequest}
              />
              
              {/* PAGINATION FOOTER */}
              <div className="p-4 border-t border-[#DFE1E6] bg-[#FAFBFC] flex items-center justify-between">
                <span className="text-[12px] text-[#6B778C] font-medium">
                  Showing <span className="font-bold text-[#172B4D]">{data.content.length}</span> of {data.totalElements} users
                </span>
                <div className="flex items-center gap-2">
                   <button 
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 text-[12px] font-black uppercase tracking-widest bg-white border border-[#DFE1E6] rounded-lg hover:bg-[#F4F5F7] disabled:opacity-50 transition-all"
                   >
                     Prev
                   </button>
                   <span className="text-[12px] font-bold px-4">Page {page + 1} of {data.totalPages}</span>
                   <button 
                    disabled={data.last}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 text-[12px] font-black uppercase tracking-widest bg-white border border-[#DFE1E6] rounded-lg hover:bg-[#F4F5F7] disabled:opacity-50 transition-all"
                   >
                     Next
                   </button>
                </div>
              </div>
            </>
          ) : !isLoading && (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <ShieldAlert className="w-16 h-16 text-[#DFE1E6] mb-4" />
              <h3 className="text-lg font-bold text-[#172B4D]">No Users Found</h3>
              <p className="text-[#6B778C] text-sm mt-1">Try adjusting your keywords or filters to see more results.</p>
            </div>
          )}
        </div>
      </div>

      {/* GLOBAL CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={executeAction}
        isLoading={isProcessing}
        title={confirmModal.title}
        description={confirmModal.desc}
        confirmText="Confirm"
        modalVariant={confirmModal.variant} 
      />

    </div>
  );
}