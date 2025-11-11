"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Search,
  Filter,
  Users,
  Sparkles,
  Mail,
  UserPlus,
  Shield,
  X,
  Eye,
  Loader2,
  Calendar,
  User,
  Crown,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

// ⛔️ Sửa đường dẫn nếu bạn chưa di chuyển file
import {
  getWorkspaceMembers,
  inviteMemberToWorkspace,
  getWorkspaceMemberDetail,
} from "@/services/apiWorkspace";

// ✅ Lấy user từ Context
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";

export default function MembersPage() {
  const { showToast } = useToast();
  const params = useParams();
  const workspaceId = Number(params.workspaceId);

  // ✅ Lấy user từ Context
  const { user, isLoading: isAuthLoading } = useAuth();
  const companyId = user?.company?.companyId || null; // Lấy companyId

  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // ✅ SỬA LỖI: Đổi state sang roleCode (string)
  const [email, setEmail] = useState("");
  const [roleCode, setRoleCode] = useState("WORKSPACE_MEMBER"); // Mặc định là Member

  // ✅ Modal xem chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 🧩 1. Lấy danh sách thành viên workspace
  useEffect(() => {
    if (isAuthLoading) return; // Chờ auth xong
    if (!companyId || !workspaceId) {
      if (!isAuthLoading)
        showToast("Lỗi: Không tìm thấy thông tin công ty/workspace", "error");
      setLoading(false);
      return;
    }

    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await getWorkspaceMembers(companyId, workspaceId);
        // Giả lập status nếu API không có
        const dataWithStatus = data.map((m: any, i: number) => ({
          ...m,
          status: m.status || (i % 2 === 0 ? "ACTIVE" : "PENDING"),
        }));
        setMembers(dataWithStatus);
      } catch (err: any) {
        showToast(err.message || "Không thể tải danh sách thành viên", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [companyId, workspaceId, isAuthLoading, showToast]);

  // 🧩 2. Mở modal xem chi tiết
  const handleViewDetail = async (memberId: number) => {
    if (!companyId || !workspaceId) return;

    try {
      setLoadingDetail(true);
      setShowDetailModal(true); // Mở modal trước
      const detail = await getWorkspaceMemberDetail(
        companyId,
        workspaceId,
        memberId
      );
      setSelectedMember(detail);
    } catch (err: any) {
      showToast(err.message || "Không thể tải chi tiết thành viên.", "error");
      setShowDetailModal(false); // Đóng modal nếu lỗi
    } finally {
      setLoadingDetail(false);
    }
  };

  // 🧩 3. Hàm Mời thành viên
  const handleInvite = async () => {
    if (!email.trim()) {
      showToast("Vui lòng nhập email", "warning");
      return;
    }
    if (!companyId || !workspaceId) {
      showToast("Không xác định được công ty/workspace", "error");
      return;
    }

    try {
      // ✅ SỬA LỖI: Gửi roleCode (string)
      await inviteMemberToWorkspace(companyId, workspaceId, {
        email,
        roleCode,
      });

      showToast("Gửi lời mời thành công!", "success");
      setShowInviteModal(false);
      setEmail("");
      setRoleCode("WORKSPACE_MEMBER"); // Reset về giá trị mặc định

      // Tải lại danh sách
      const data = await getWorkspaceMembers(companyId, workspaceId);
      // Giả lập lại status (nếu cần)
      const dataWithStatus = data.map((m: any, i: number) => ({
        ...m,
        status: m.status || (i % 2 === 0 ? "ACTIVE" : "PENDING"),
      }));
      setMembers(dataWithStatus);
    } catch (err: any) {
      showToast(err.message || "Gửi lời mời thất bại", "error");
    }
  };

  // 🧩 4. HÀNH ĐỘNG MỚI (Tạm để trống)
  const handleEditStatus = (member: any) => {
    showToast(
      `(Demo) Chức năng Sửa cho ${member.fullName} đang phát triển.`,
      "info"
    );
  };

  const handleRemove = (member: any) => {
    if (member.userId === user?.id) {
      showToast("Bạn không thể tự xóa chính mình.", "error");
      return;
    }
    showToast(
      `(Demo) Chức năng Xóa cho ${member.fullName} đang phát triển.`,
      "info"
    );
    // (Logic gọi API xóa khỏi workspace sẽ ở đây)
  };

  // 🧩 5. HELPER: Render Trạng thái (đọc status)
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-sm font-semibold">Hoạt động</span>
          </div>
        );
      case "PENDING":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-sm font-semibold">Đang chờ</span>
          </div>
        );
      case "INACTIVE":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-gray-100 text-gray-600 border-gray-200">
            <XCircle className="w-3.5 h-3.5" />
            <span className="text-sm font-semibold">Tạm khóa</span>
          </div>
        );
      default:
        return null;
    }
  };

  // 🧩 6. HELPER: Định dạng thời gian (Giờ:Phút Ngày/Tháng/Năm)
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "—";
    }
  };

  // 🔍 Lọc danh sách
  const filteredMembers = members.filter(
    (m) =>
      m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🧭 Render
  if (isAuthLoading)
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl p-8 mb-8 shadow-2xl animate-fadeIn">
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
                    Thành viên Workspace
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

        {/* Members Table */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Đang tải danh sách thành viên...
            </p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-fadeInUp">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                      STT
                    </th>
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
                      Trạng thái
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
                  {filteredMembers.map((m, index) => (
                    <tr
                      key={m.memberId}
                      className="hover:bg-blue-50 transition-all"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              m.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                m.fullName
                              )}&background=random`
                            }
                            className="w-10 h-10 rounded-lg border border-gray-200 object-cover"
                            alt={m.fullName}
                          />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {m.fullName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{m.email}</td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${
                            m.roleCode === "WORKSPACE_ADMIN"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {m.roleCode === "WORKSPACE_ADMIN" ? (
                            <Crown className="w-3.5 h-3.5" />
                          ) : (
                            <Shield className="w-3.5 h-3.5" />
                          )}
                          <span className="text-sm font-medium">
                            {m.roleName || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderStatusBadge(m.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {formatDateTime(m.joinedAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleViewDetail(m.memberId)}
                            className="group p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditStatus(m)}
                            disabled={m.userId === user?.id}
                            className="group p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all
                                      disabled:text-gray-300 disabled:hover:bg-transparent"
                            title="Sửa vai trò/trạng thái (Tạm để trống)"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemove(m)}
                            disabled={m.userId === user?.id}
                            className="group p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all
                                       disabled:text-gray-300 disabled:hover:bg-transparent"
                            title="Xóa khỏi workspace (Tạm để trống)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* 🔹 Modal Mời (Thêm từ CÔNG TY) */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
            <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Mời vào Workspace
                    </h2>
                    <p className="text-white/80 text-sm">
                      Thêm thành viên (từ công ty)
                    </p>
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
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@company.com"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vai trò
                </label>
                {/* ✅ SỬA LỖI: Cập nhật <select> để dùng roleCode (string) */}
                <select
                  value={roleCode}
                  onChange={(e) => setRoleCode(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                >
                  <option value="WORKSPACE_ADMIN">Quản trị (Admin)</option>
                  <option value="WORKSPACE_MEMBER">Thành viên (Member)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 border-2 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleInvite}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold"
                >
                  Gửi lời mời
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Modal xem chi tiết */}
      {showDetailModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingDetail ? (
              <div className="py-10 text-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                <p className="text-gray-500">
                  Đang tải thông tin thành viên...
                </p>
              </div>
            ) : selectedMember ? (
              <>
                <div className="flex flex-col items-center text-center mb-5">
                  <img
                    src={
                      selectedMember.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        selectedMember.fullName
                      )}&background=random`
                    }
                    alt={selectedMember.fullName}
                    className="w-20 h-20 rounded-full border-4 border-blue-100 shadow-md mb-3"
                  />
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedMember.fullName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedMember.roleName}
                  </p>
                </div>

                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span>{selectedMember.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-yellow-500" />
                    <span>Vai trò: {selectedMember.roleName || "—"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-500" />
                    <span>
                      Tham gia:{" "}
                      {selectedMember.joinedAt
                        ? new Date(selectedMember.joinedAt).toLocaleDateString(
                            "vi-VN"
                          )
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-purple-500" />
                    <span>ID: {selectedMember.memberId}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-10 text-center text-red-500">
                Không thể tải chi tiết.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
