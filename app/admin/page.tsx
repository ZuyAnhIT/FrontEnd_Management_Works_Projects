"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import CompanyList from "@/components/features/company/CompanyList";
import CreateCompanyModal from "@/components/features/company/CreateCompanyModal";
import { Building2, Plus, Search, LayoutGrid } from "lucide-react";

export default function AdminHubPage() {
  const { user, selectCompany, refreshUser, isLoading } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => setMounted(true), []);

  // Lọc danh sách công ty theo từ khóa tìm kiếm
  const memberships = user?.companyMemberships || [];
  
  const filteredMemberships = useMemo(() => {
    if (!searchTerm) return memberships;
    return memberships.filter((m) =>
      m.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [memberships, searchTerm]);

  const handleCreateSuccess = async () => {
    await refreshUser();
  };

  // Loading State
  if (isLoading || !mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
           <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
           <p className="text-sm font-medium text-slate-500">Loading your hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Enterprise Hub
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Manage your organizations and access workspaces from one central place.
            </p>
          </div>

          {/* Search & Add Button */}
          {memberships.length > 0 && (
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search organizations..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 h-11 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="hidden md:flex items-center justify-center w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95"
                title="Create New Organization"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* --- CONTENT SECTION --- */}
        {memberships.length > 0 ? (
          
          filteredMemberships.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <LayoutGrid className="w-4 h-4" />
                    Your Organizations ({filteredMemberships.length})
                </div>
                
                <CompanyList 
                    memberships={filteredMemberships}
                    onSelect={selectCompany}
                    onAddClick={() => setIsCreateModalOpen(true)}
                />
            </div>
          ) : (
            // Search Empty State
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No organization found</h3>
                <p className="text-slate-500 max-w-xs mt-1">We couldn't find any organization matching "{searchTerm}"</p>
                <button 
                    onClick={() => setSearchTerm("")}
                    className="mt-4 text-blue-600 font-medium hover:underline"
                >
                    Clear search
                </button>
            </div>
          )

        ) : (
          // --- ONBOARDING (Empty State) ---
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm text-center animate-in zoom-in-95 duration-500">
             <div className="relative">
                <div className="absolute -inset-4 bg-blue-100/50 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-8 transform rotate-3 hover:rotate-6 transition-transform">
                   <Building2 className="w-12 h-12 text-white" />
                </div>
             </div>
             
             <h2 className="text-2xl font-bold text-slate-900 mb-3">Welcome to MyPMS</h2>
             <p className="text-slate-500 max-w-md text-lg leading-relaxed mb-10">
               It looks like you're not part of any organization yet. <br/>
               Create your first company to start managing projects.
             </p>
             
             <button
               onClick={() => setIsCreateModalOpen(true)}
               className="group relative flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
             >
               <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
               <span>Create Organization</span>
             </button>
          </div>
        )}

        {/* --- MODAL --- */}
        <CreateCompanyModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </div>
  );
}