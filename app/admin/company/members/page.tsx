"use client";
import { useEffect, useState } from "react";
import { Search, Plus, Filter, X, Trash2, Users, Sparkles, Mail, UserPlus, Crown, Shield } from "lucide-react";
import {
  getCompanyMembers,
  inviteMemberToCompany,
  removeCompanyMember,
} from "@/app/api/apiCompany";
import { getCurrentUser } from "@/app/api/apiUser";
import { useToast } from "@/components/ui/ToastProvider";

export default function MembersPage() {
  const { showToast } = useToast();

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
        if (!id)
          throw new Error("Tài khoản của bạn chưa thuộc công ty nào.");
        setCompanyId(id);
      } catch (err: any) {
        showToast(err.message || "Không thể lấy thông tin người dùng.", "error");
      }
    };
    fetchCompanyId();
  }, [showToast]);

  // 🧩 2️⃣ Lấy danh sách thành viên sau khi có companyId
  useEffect(() => {
    if (!companyId) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await getCompanyMembers(companyId);
        setMembers(data);
      } catch (err: any) {
        showToast(err.message || "Không thể tải danh sách thành viên", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [companyId, showToast]);

  // 📨 3️⃣ Gửi lời mời
  const handleInvite = async () => {
    if (!email.trim()) {
      showToast("Vui lòng nhập email thành viên!", "warning");
      return;
    }
    if (!companyId) {
      showToast("Không xác định được công ty.", "error");
      return;
    }

    try {
      await inviteMemberToCompany(companyId, { email, roleId  });
      showToast("Đã gửi lời mời thành viên thành công!", "success");
      setEmail("");
      setRoleId(2);
      setShowInviteModal(false);

      // 🔁 Reload danh sách
      const refreshed = await getCompanyMembers(companyId);
      setMembers(refreshed);
    } catch (err: any) {
      showToast(err.message || "Gửi lời mời thất bại!", "error");
    }
  };

  //  4️⃣ Xóa thành viên
  const handleRemove = async (userId: number) => {
    if (!companyId) return;
    if (!confirm("Bạn có chắc muốn xóa thành viên này?")) return;

    try {
      await removeCompanyMember(companyId, userId);
      showToast("Đã xóa thành viên!", "success");
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (err: any) {
      showToast(err.message || "Không thể xóa thành viên!", "error");
    }
  };

  // 🔍 Lọc danh sách
  const filteredMembers = members.filter(
    (m) =>
      m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🧭 Render
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl p-8 mb-8 shadow-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-white">Quản lý thành viên</h1>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <p className="text-white/80">
                  Thêm, chỉnh sửa hoặc xem danh sách thành viên công ty
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
        <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fadeInUp">
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

        {/* Members Table/Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-gray-600 font-medium">Đang tải danh sách thành viên...</p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-fadeInUp delay-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Thành viên
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Chức vụ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredMembers.map((m, index) => (
                    <tr 
                      key={m.userId} 
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-200 animate-fadeInUp"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={m.avatarUrl || "/default-avatar.png"}
                              alt={m.fullName}
                              className="w-12 h-12 rounded-xl border-2 border-gray-200 object-cover shadow-sm"
                            />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{m.fullName}</div>
                            <div className="text-xs text-gray-500">ID: {m.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {m.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full border border-blue-200">
                          <Shield className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-700">
                            {m.roleName || m.roleCode || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {m.jobTitle || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {m.joinedAt
                          ? new Date(m.joinedAt).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleRemove(m.userId)}
                          className="group p-2.5 text-red-600 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-300 hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy thành viên
            </h3>
            <p className="text-gray-500">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
              {/* Modal Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 p-6">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Mời thành viên mới</h2>
                      <p className="text-white/80 text-sm">Thêm người vào công ty</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@company.com"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 outline-none hover:border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    Vai trò
                  </label>
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 outline-none hover:border-gray-300 cursor-pointer"
                  >
                    <option value={2}>Quản trị viên</option>
                    <option value={3}>Thành viên</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleInvite}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Gửi lời mời
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .bg-grid-white\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}