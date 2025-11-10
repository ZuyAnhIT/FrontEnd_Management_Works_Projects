"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Search,
  Filter,
  Trash2,
  Users,
  Sparkles,
  Mail,
  UserPlus,
  Crown,
  Shield,
  X,
} from "lucide-react";
import {
  getWorkspaceMembers,
  inviteMemberToWorkspace,
} from "@/app/api/apiWorkspace";
import { getCurrentUser } from "@/app/api/apiUser";
import { useToast } from "@/components/ui/ToastProvider";

export default function MembersPage() {
  const { showToast } = useToast();
  const params = useParams();
  const workspaceId = Number(params.workspaceId);

  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(2);
  const [companyId, setCompanyId] = useState<number | null>(null);

  // 🧩 1️⃣ Lấy companyId từ user hiện tại
  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const user = await getCurrentUser();
        const id = user.company?.companyId || null;
        if (!id) throw new Error("Tài khoản của bạn chưa thuộc công ty nào.");
        setCompanyId(id);
      } catch (err: any) {
        showToast(err.message || "Không thể lấy thông tin người dùng.", "error");
      }
    };
    fetchCompanyId();
  }, [showToast]);

  // 🧩 2️⃣ Lấy danh sách thành viên workspace
  useEffect(() => {
    if (!companyId || !workspaceId) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await getWorkspaceMembers(companyId, workspaceId);
        setMembers(data);
      } catch (err: any) {
        showToast(err.message || "Không thể tải danh sách thành viên", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [companyId, workspaceId, showToast]);

  // 📨 3️⃣ Gửi lời mời
  const handleInvite = async () => {
    if (!email.trim()) {
      showToast("Vui lòng nhập email thành viên!", "warning");
      return;
    }
    if (!companyId || !workspaceId) {
      showToast("Không xác định được công ty hoặc workspace.", "error");
      return;
    }

    try {
      await inviteMemberToWorkspace(companyId, workspaceId, { email, roleId });
      showToast("Đã gửi lời mời thành viên thành công!", "success");
      setEmail("");
      setRoleId(2);
      setShowInviteModal(false);

      // 🔁 Reload danh sách
      const refreshed = await getWorkspaceMembers(companyId, workspaceId);
      setMembers(refreshed);
    } catch (err: any) {
      showToast(err.message || "Gửi lời mời thất bại!", "error");
    }
  };


  // 🔍 Lọc danh sách
  const filteredMembers = members.filter(
    (m) =>
      m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-white">
                    Thành viên Workspace #{workspaceId}
                  </h1>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-white/80">
                  Quản lý thành viên của phòng ban này
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="group flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold hover:scale-105"
            >
              <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Mời thành viên
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 hover:border-gray-300 bg-white shadow-sm"
            />
          </div>
          <button className="group flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-sm bg-white font-medium">
            <Filter className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            Lọc
          </button>
        </div>

        {/* Members Table */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <Sparkles className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Đang tải danh sách thành viên...
            </p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                      Thành viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMembers.map((m) => (
                    <tr key={m.memberId} className="hover:bg-blue-50 transition-all">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={m.avatarUrl || "/default-avatar.png"}
                          className="w-10 h-10 rounded-lg border border-gray-200"
                          alt={m.fullName}
                        />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {m.fullName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{m.email}</td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                          <Shield className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">
                            {m.roleName || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {m.joinedAt
                          ? new Date(m.joinedAt).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                       
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 p-16 text-center">
            <Users className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có thành viên nào
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
