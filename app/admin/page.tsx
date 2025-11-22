"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import CompanyList from "@/components/features/company/CompanyList";
import CreateCompanyModal from "@/components/features/company/CreateCompanyModal";
import { Building2, Plus } from "lucide-react";

export default function AdminHubPage() {
  const { user, selectCompany, refreshUser, isLoading } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (isLoading || !mounted) return null; // Hoặc loading spinner

  const memberships = user?.companyMemberships || [];

  // Xử lý khi tạo xong: Refresh lại data user để cập nhật danh sách
  const handleCreateSuccess = async () => {
    await refreshUser(); 
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto font-sans">
      
      {/* --- HEADER --- */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {memberships.length > 0 ? "Workspaces Overview" : "Welcome to MyPMS"}
          </h1>
          <p className="text-slate-500 mt-1">
            {memberships.length > 0 
              ? "Select a workspace to manage or start working."
              : "Let's get you started by creating your first organization."}
          </p>
        </div>

        {/* Nút tạo nhanh trên header (Chỉ hiện khi đã có công ty) */}
        {memberships.length > 0 && (
          <button
             onClick={() => setIsCreateModalOpen(true)}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> New Workspace
          </button>
        )}
      </div>

      {/* --- CONTENT --- */}
      {memberships.length > 0 ? (
        // CASE 1: Đã có công ty -> Hiện danh sách
        <CompanyList 
          memberships={memberships}
          onSelect={selectCompany}
          onAddClick={() => setIsCreateModalOpen(true)}
        />
      ) : (
        // CASE 2: Chưa có công ty (Newbie) -> Hiện màn hình Onboarding đẹp
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-center animate-in fade-in slide-in-from-bottom-4">
           <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-blue-600" />
           </div>
           <h2 className="text-xl font-bold text-slate-900 mb-2">No Organization Found</h2>
           <p className="text-slate-500 max-w-md mb-8">
             You are not a member of any organization yet. Create your own company to invite members and manage projects.
           </p>
           <button
             onClick={() => setIsCreateModalOpen(true)}
             className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-1"
           >
             Create My First Company
           </button>
        </div>
      )}

      {/* --- MODAL (Luôn sẵn sàng được gọi) --- */}
      <CreateCompanyModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}