// app/core/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Users, FolderKanban, Briefcase, Crown, Sparkles, Building2, Loader2, Target, CreditCard, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
// ✅ Import API Dashboard & Types
import { getDashboardWorkspaces, getDashboardMyTasks, getDashboardMyProjects, getDashboardCompanies, DashboardMyTask, DashboardWorkspace } from "@/services/apiDashboard"; 
// ✅ Import Component UI
import WorkspaceCard from "@/components/features/core/workspace/WorkspaceCard"; 
import DashboardTaskWidget from "@/components/features/dashboard/DashboardTaskWidget"; // Cần tạo
import DashboardProjectWidget from "@/components/features/dashboard/DashboardProjectWidget"; // Cần tạo

// Interface để lưu trữ tất cả dữ liệu
interface DashboardData {
    workspaces: DashboardWorkspace[];
    tasks: DashboardMyTask[];
    projects: any[]; // Dùng any vì đã có DashboardMyProject type trong apiDashboard
    company: any[];
}

// Helper component cho 4 thẻ thống kê trên cùng
function TopStatsCard({ icon: Icon, title, value, color }: any) {
  const colorMap = {
    blue: "bg-blue-500", green: "bg-green-500", purple: "bg-purple-500", orange: "bg-orange-500",
    red: "bg-red-500"
  };
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md border border-gray-200">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorMap[color]} text-white shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}


export default function CoreDashboardPage() {
  const { showToast } = useToast();
  const { user, isLoading: isAuthLoading, role } = useAuth();

  const [data, setData] = useState<DashboardData>({
      workspaces: [], tasks: [], projects: [], company: [],
  });
  const [loading, setLoading] = useState(true);

  // 🧩 Lấy tất cả dữ liệu Dashboard cá nhân
  useEffect(() => {
    if (isAuthLoading) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // 🚀 GỌI TẤT CẢ API CÙNG LÚC
        const [workspacesRes, tasksRes, projectsRes, companyRes] = await Promise.all([
            getDashboardWorkspaces(),
            getDashboardMyTasks(),
            getDashboardMyProjects(),
            getDashboardCompanies(),
        ]);
        
        setData({
            workspaces: workspacesRes || [],
            tasks: tasksRes || [],
            projects: projectsRes || [],
            company: companyRes || [],
        });

      } catch (err: any) {
        showToast(err.message || "Không thể tải dữ liệu tổng quan", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthLoading, showToast]); 

  // Thống kê tổng quan (Tính toán từ data)
  const totalWorkspaces = data.workspaces.length;
  const totalProjects = data.projects.length; 
  const totalTasks = data.tasks.length;
  const company = data.company[0]; 
  const totalMembers = data.workspaces.reduce((sum, ws) => sum + (ws.memberCount || 0), 0); // Giả định API trả về memberCount

  if (isAuthLoading || loading)
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
      </div>
    );
    
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white">
      {/* 🔹 Container chính */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* 1. Hàng Header Chào mừng */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl p-8 shadow-2xl animate-fadeIn mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            Chào mừng trở lại, {user?.fullName || "Người dùng"}! 👋
          </h1>
          <p className="text-white/80 text-lg">
            {company ? `Bạn đang làm việc tại ${company.companyName}` : "Workspace cá nhân của bạn"}
          </p>
          {/* Decorative circles */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* 2. ✅ HÀNG THỐNG KÊ (4 Cột Tách biệt) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeInUp">
            <TopStatsCard icon={Building2} title="Công ty hiện tại" value={company?.companyName || "N/A"} color="blue" />
            <TopStatsCard icon={FolderKanban} title="Total Workspaces" value={totalWorkspaces.toString()} color="green" />
            <TopStatsCard icon={Briefcase} title="Dự án tham gia" value={totalProjects.toString()} color="purple" />
            <TopStatsCard icon={Target} title="Tasks được giao" value={totalTasks.toString()} color="orange" />
        </div>
        
        {/* ----------------------------------------------------------- */}
        {/* 3. KHỐI DANH SÁCH CHI TIẾT (Chia thành 3 Hàng) */}
        {/* ----------------------------------------------------------- */}

        {/* 3a. Khối 1: Tasks của tôi (Quan trọng nhất) */}
        <div className="animate-fadeInUp pt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-600" />
                Tasks Khẩn cấp ({totalTasks})
            </h2>
            {/* Component này sẽ hiển thị bảng task ngắn gọn */}
            <DashboardTaskWidget tasks={data.tasks} loading={loading} />
        </div>

        {/* 3b. Khối 2: Dự án của tôi */}
        <div className="animate-fadeInUp pt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-purple-600" />
                Dự án tôi tham gia ({totalProjects})
            </h2>
            {/* Component này sẽ hiển thị danh sách Project Card */}
            <DashboardProjectWidget projects={data.projects} loading={loading} /> 
        </div>

        {/* 3c. Khối 3: Workspace tôi tham gia */}
        <div className="space-y-4 pt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-gray-600" />
            Workspace của tôi ({totalWorkspaces})
          </h2>
          
          {data.workspaces.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
              <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Bạn chưa tham gia Workspace nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.workspaces.map((ws) => (
                <WorkspaceCard 
                  key={ws.workspaceId}
                  ws={ws}
                  isImpersonating={role === 'COMPANY_ADMIN'} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 🎨 Style cho animation (Thêm từ file cũ) */}
      <style jsx>{`
        .bg-grid-white\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}