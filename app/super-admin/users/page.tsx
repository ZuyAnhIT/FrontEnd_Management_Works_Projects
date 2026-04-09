"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Users, Filter, Loader2, UserPlus, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import { useDebounce } from "@/hooks/useDebounce";
import { getGlobalUsers, GlobalUser, UserSearchParams, UserPageResponse } from "@/services/apiUserSystem";
import { UserTable } from "@/components/features/super-admin/users/UserTable"; 
import { cn } from "@/lib/utils";

export default function GlobalUsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  // State dữ liệu
  const [data, setData] = useState<UserPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State lọc & Tìm kiếm
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500); // 500ms theo yêu cầu
  const [status, setStatus] = useState<string>("ALL");
  const [page, setPage] = useState(0);

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
    fetchUsers();
  }, [fetchUsers]);

  // Reset page khi keyword hoặc status thay đổi
  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, status]);

  return (
    <div className="min-h-screen bg-[#F4F5F7] p-8 font-sans text-[#172B4D]">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#0052CC] text-white rounded-2xl shadow-lg shadow-blue-500/20">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Global User Directory</h1>
              <p className="text-[14px] text-[#6B778C] font-medium mt-0.5">Quản lý định danh và quyền hạn người dùng toàn hệ thống.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-[#0052CC] hover:bg-[#0747A6] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md">
            <UserPlus className="w-4 h-4" /> Thêm người dùng
          </button>
        </header>

        {/* FILTER BAR */}
        <div className="bg-white p-4 rounded-2xl border border-[#DFE1E6] shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B778C] group-focus-within:text-[#0052CC] transition-colors" />
            <input
              type="text"
              placeholder="Tìm theo tên, email hoặc SĐT..."
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
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="LOCKED">Tạm khóa</option>
                <option value="DELETED">Đã xóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="bg-white rounded-2xl border border-[#DFE1E6] shadow-sm overflow-hidden min-h-[500px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#6B778C]">Đang đồng bộ dữ liệu...</span>
            </div>
          )}

          {data?.content.length ? (
            <>
              <UserTable users={data.content} onAction={() => {}} />
              
              {/* PAGINATION FOOTER */}
              <div className="p-4 border-t border-[#DFE1E6] bg-[#FAFBFC] flex items-center justify-between">
                <span className="text-[12px] text-[#6B778C] font-medium">
                  Hiển thị <span className="font-bold text-[#172B4D]">{data.content.length}</span> / {data.totalElements} người dùng
                </span>
                <div className="flex items-center gap-2">
                   <button 
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 text-[12px] font-black uppercase tracking-widest bg-white border border-[#DFE1E6] rounded-lg hover:bg-[#F4F5F7] disabled:opacity-50 transition-all"
                   >
                     Trước
                   </button>
                   <span className="text-[12px] font-bold px-4">Trang {page + 1} / {data.totalPages}</span>
                   <button 
                    disabled={data.last}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 text-[12px] font-black uppercase tracking-widest bg-white border border-[#DFE1E6] rounded-lg hover:bg-[#F4F5F7] disabled:opacity-50 transition-all"
                   >
                     Sau
                   </button>
                </div>
              </div>
            </>
          ) : !isLoading && (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <ShieldAlert className="w-16 h-16 text-[#DFE1E6] mb-4" />
              <h3 className="text-lg font-bold text-[#172B4D]">Không tìm thấy người dùng</h3>
              <p className="text-[#6B778C] text-sm mt-1">Thử thay đổi từ khóa hoặc bộ lọc để xem thêm kết quả.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}