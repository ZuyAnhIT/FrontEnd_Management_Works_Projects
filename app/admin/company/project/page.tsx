// "use client";
// import { useEffect, useState } from "react";
// import {
//   FolderKanban,
//   Search,
//   Sparkles,
//   Loader2,
//   Link as LinkIcon,
//   Shield,
//   Building,
//   User,
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import { useToast } from "@/components/ui/ToastProvider";
// // ⛔️ SỬA ĐƯỜNG DẪN!
// // import { getCompanyProjects } from "@/services/apiProject"; // Giả sử bạn có API này

// export default function CompanyProjectPage() {
//   const { showToast } = useToast();
//   const { user, isLoading: isAuthLoading } = useAuth();
//   const router = useRouter();

//   const [projects, setProjects] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");

//   const companyId = user?.company?.companyId || null;

//   // 1. Lấy TẤT CẢ dự án trong công ty
//   useEffect(() => {
//     if (isAuthLoading) return;
//     if (!companyId) {
//       setLoading(false);
//       return;
//     }

//     const fetchAllProjects = async () => {
//       try {
//         setLoading(true);
//         // API này cần backend hỗ trợ: Lấy tất cả project theo companyId
//         const data = await getCompanyProjects(companyId);
//         setProjects(data);
//       } catch (err: any) {
//         showToast(err.message || "Không thể tải dự án toàn công ty", "error");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAllProjects();
//   }, [companyId, isAuthLoading, showToast]);

//   const filteredProjects = projects.filter(
//     (p) =>
//       p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       p.projectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       p.workspaceName?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // 2. Hàm "Nhập vai"
//   const handleGoToProject = (workspaceId: number, projectId: number) => {
//     // Chuyển hướng đến trang CORE để làm việc
//     router.push(`/core/workspace/${workspaceId}/project/${projectId}/board`);
//   };

//   if (isAuthLoading || loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="flex items-center justify-between gap-4 mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-1">
//               Kiểm toán Dự án
//             </h1>
//             <p className="text-gray-600">
//               Danh sách tất cả dự án đang hoạt động trong công ty.
//             </p>
//           </div>
//         </div>

//         {/* Search */}
//         <div className="relative mb-6">
//           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Tìm dự án (theo tên, mã, hoặc workspace)..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm"
//           />
//         </div>

//         {/* Bảng kiểm toán */}
//         <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
//                     Dự án
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
//                     Phòng ban (Workspace)
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
//                     Quản lý (Manager)
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
//                     Trạng thái
//                   </th>
//                   <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase"></th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {filteredProjects.map((p) => (
//                   <tr key={p.id} className="hover:bg-gray-50/50">
//                     <td className="px-6 py-4">
//                       <div className="font-semibold text-gray-900">
//                         {p.name}
//                       </div>
//                       <div className="text-xs text-gray-500 font-mono">
//                         {p.projectCode}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2 text-gray-700">
//                         <Building className="w-4 h-4 text-gray-400" />
//                         {p.workspaceName || "N/A"}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2 text-gray-700">
//                         <User className="w-4 h-4 text-gray-400" />
//                         {p.managerName || "Chưa gán"}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 text-xs rounded-full font-semibold ${
//                           p.status === "ACTIVE"
//                             ? "bg-blue-50 text-blue-600"
//                             : "bg-gray-100 text-gray-500"
//                         }`}
//                       >
//                         {p.status || "UNKNOWN"}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <button
//                         onClick={() => handleGoToProject(p.workspaceId, p.id)}
//                         className="group flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium"
//                       >
//                         <LinkIcon className="w-4 h-4" />
//                         Đi đến dự án
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
