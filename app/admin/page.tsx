"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Components)
// =============================================================================

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Building2, Plus, Search, LayoutGrid, Loader2 } from "lucide-react";

// Context & Utils
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// Internal Components
import CompanyList from "@/components/features/company/CompanyList";
import CreateCompanyModal from "@/components/features/company/CreateCompanyModal";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function AdminHubPage() {
  
  // ---------------------------------------------------------------------------
  // 3. HOOKS & CONTEXT
  // ---------------------------------------------------------------------------
  
  const { user, selectCompany, refreshUser, isLoading } = useAuth();

  // ---------------------------------------------------------------------------
  // 4. STATE MANAGEMENT
  // ---------------------------------------------------------------------------

  const [isMounted, setIsMounted] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ---------------------------------------------------------------------------
  // 5. SIDE EFFECTS
  // ---------------------------------------------------------------------------

  // Đảm bảo component chỉ render giao diện đầy đủ sau khi đã mount trên client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ---------------------------------------------------------------------------
  // 6. CALCULATIONS (Data Prep)
  // ---------------------------------------------------------------------------

  const memberships = user?.companyMemberships || [];
  
  // Lọc danh sách tổ chức dựa trên từ khóa tìm kiếm
  const filteredMemberships = useMemo(() => {
    if (!searchTerm.trim()) return memberships;
    return memberships.filter((m) =>
      m.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [memberships, searchTerm]);

  // ---------------------------------------------------------------------------
  // 7. EVENT HANDLERS
  // ---------------------------------------------------------------------------

  // Làm mới dữ liệu người dùng sau khi tạo tổ chức thành công
  const handleCreateSuccess = useCallback(async () => {
    await refreshUser();
    setIsCreateModalOpen(false);
  }, [refreshUser]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // ---------------------------------------------------------------------------
  // 8. RENDER LOGIC
  // ---------------------------------------------------------------------------

  // MÀN HÌNH CHỜ (LOADING STATE)
  if (isLoading || !isMounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F4F5F7]">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin opacity-80" />
           <p className="text-[12px] font-black uppercase tracking-widest text-[#6B778C]">
             Loading Enterprise Hub...
           </p>
        </div>
      </div>
    );
  }

  // MÀN HÌNH CHÍNH
  return (
    <div className="min-h-screen bg-[#F4F5F7] p-6 sm:p-10 font-sans text-[#172B4D]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* KHỐI TIÊU ĐỀ (HEADER SECTION) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
          <div>
            <h1 className="text-3xl font-black text-[#172B4D] tracking-tight uppercase">
              Enterprise Hub
            </h1>
            <p className="text-[#42526E] mt-2 text-[15px] font-medium">
              Manage your organizations and access workspaces from one central place.
            </p>
          </div>

          {/* THANH CÔNG CỤ TÌM KIẾM VÀ THÊM MỚI */}
          {memberships.length > 0 && (
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#0052CC] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search organizations..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "w-full pl-11 pr-4 h-12 bg-white border border-[#DFE1E6] rounded-xl shadow-sm transition-all text-[14px] font-medium",
                    "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0052CC]"
                  )}
                />
              </div>
              
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className={cn(
                  "hidden md:flex items-center justify-center h-12 px-5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl shadow-md active:scale-95 transition-all gap-2",
                  "font-black text-[12px] uppercase tracking-widest"
                )}
                title="Create New Organization"
              >
                <Plus className="w-4.5 h-4.5 stroke-[3]" /> Create
              </button>
            </div>
          )}
        </div>

        {/* KHỐI NỘI DUNG CHÍNH (CONTENT SECTION) */}
        <div className="relative min-h-[400px]">
          {memberships.length > 0 ? (
            
            filteredMemberships.length > 0 ? (
              // HIỂN THỊ DANH SÁCH CÔNG TY
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  <LayoutGrid className="w-4 h-4 opacity-70" />
                  Your Organizations 
                  <span className="bg-[#DFE1E6] text-[#172B4D] px-2 py-0.5 rounded-md ml-1">{filteredMemberships.length}</span>
                </div>
                
                <CompanyList 
                  memberships={filteredMemberships}
                  onSelect={selectCompany}
                  onAddClick={() => setIsCreateModalOpen(true)}
                />
              </div>
            ) : (
              // HIỂN THỊ KHI KHÔNG TÌM THẤY KẾT QUẢ TRONG TÌM KIẾM
              <div className="flex flex-col items-center justify-center py-28 text-center bg-white border border-[#DFE1E6] rounded-3xl shadow-sm">
                <div className="w-20 h-20 bg-[#F4F5F7] rounded-full flex items-center justify-center mb-5 border border-slate-200">
                  <Search className="w-10 h-10 text-[#6B778C] stroke-[1.5]" />
                </div>
                <h3 className="text-xl font-black text-[#172B4D] tracking-tight">No organization found</h3>
                <p className="text-[#6B778C] font-medium max-w-sm mt-2 leading-relaxed">
                  We couldn't find any organization matching "{searchTerm}".
                </p>
                <button 
                  onClick={handleClearSearch}
                  className="mt-6 text-[#0052CC] font-bold text-[13px] uppercase tracking-widest hover:underline active:scale-95 transition-all"
                >
                  Clear search
                </button>
              </div>
            )

          ) : (
            // HIỂN THỊ KHI NGƯỜI DÙNG CHƯA THAM GIA CÔNG TY NÀO (EMPTY STATE)
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-[#DFE1E6] shadow-sm text-center animate-in zoom-in-95 duration-500">
               <div className="relative mb-10">
                 <div className="absolute -inset-4 bg-blue-100/50 rounded-full blur-2xl animate-pulse" />
                 <div className="relative w-28 h-28 bg-gradient-to-br from-[#0052CC] to-[#0747A6] rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 transform rotate-3 hover:rotate-6 transition-transform duration-300 border border-blue-400/20">
                    <Building2 className="w-12 h-12 text-white stroke-[1.5]" />
                 </div>
               </div>
               
               <h2 className="text-3xl font-black text-[#172B4D] tracking-tight mb-4">Welcome to WorkNet</h2>
               <p className="text-[#42526E] font-medium max-w-md text-[16px] leading-relaxed mb-10">
                 It looks like you're not part of any organization yet. <br/>
                 Create your first company to start managing projects.
               </p>
               
               <button
                 onClick={() => setIsCreateModalOpen(true)}
                 className={cn(
                   "group relative flex items-center gap-3 bg-[#0052CC] hover:bg-[#0747A6] text-white px-8 py-4 rounded-xl",
                   "font-black text-[13px] uppercase tracking-widest shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
                 )}
               >
                 <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 stroke-[3]" />
                 <span>Create Organization</span>
               </button>
            </div>
          )}
        </div>

        {/* MODAL TẠO CÔNG TY */}
        <CreateCompanyModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </div>
  );
}