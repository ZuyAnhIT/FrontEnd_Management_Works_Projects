"use client";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Filter,
  X,
  Trash2,
  Users,
  Sparkles,
  Mail,
  UserPlus,
  Crown,
  Shield,
  Loader2,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  Save,
} from "lucide-react";

// ⛔️ Sửa đường dẫn nếu bạn chưa di chuyển file
import {
  getCompanyMembers,
  inviteMemberToCompany,
  removeCompanyMember,
  updateCompanyMemberStatus,
  getDetailCompanyMembers,
} from "@/services/apiCompany";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import MemberDetailModalBase from "@/components/ui/MemberDetailModalBase";
import MemberTable from "@/components/ui/MemberTable";
import InviteMemberModal from "@/components/ui/InviteMemberModal";



// ✅ 1. Import Modal mới
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function MembersPage() {
  const { showToast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const companyId = user?.company?.companyId || null;

  // State cho Modal Mời
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(3);

  // State cho Modal Sửa
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [isUpdating, setIsUpdating] = useState(false);

  // ✅ 2. State mới cho Modal Xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null);

  // Modal Chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMember, setDetailMember] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);


  // 🧩 1. Lấy danh sách thành viên
  useEffect(() => {
    if (isAuthLoading) return; // Chờ AuthContext load xong
    if (!companyId) {
      setLoading(false);
      return; // Không có companyId, không fetch
    }
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await getCompanyMembers(companyId);
        setMembers(data); // Dùng data thật từ API (đã có status)
      } catch (err: any) {
        showToast(err.message || "Không thể tải danh sách thành viên", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [companyId, isAuthLoading, showToast]);

  // 🧩 2. Xử lý mời
  const handleInvite = async () => {
    if (!email.trim() || !companyId) {
      showToast("Vui lòng nhập email và đảm bảo có companyId", "warning");
      return;
    }
    try {
      await inviteMemberToCompany(companyId, { email, roleId });
      showToast("Đã gửi lời mời thành viên thành công!", "success");
      setEmail("");
      setRoleId(3);
      setShowInviteModal(false);
      const refreshed = await getCompanyMembers(companyId); // Tải lại
      setMembers(refreshed);
    } catch (err: any) {
      showToast(err.message || "Gửi lời mời thất bại!", "error");
    }
  };

  // 🧩 3. ✅ SỬA LẠI: Hàm này chỉ MỞ MODAL Xóa
  const openDeleteConfirmation = (member: any) => {
    if (member.userId === user?.id) {
      showToast("Bạn không thể tự xóa chính mình.", "error");
      return;
    }
    setMemberToDelete(member); // Lưu thông tin người sẽ bị xóa
    setIsDeleteModalOpen(true); // Mở modal
  };

  // 🧩 4. ✅ HÀM MỚI: Logic Xóa (được gọi bởi Modal)
  const handleConfirmRemove = async () => {
    if (!companyId || !memberToDelete) return;

    setIsDeleting(true);
    try {
      await removeCompanyMember(companyId, memberToDelete.userId);
      showToast("Đã xóa thành viên!", "success");
      setMembers((prev) =>
        prev.filter((m) => m.userId !== memberToDelete.userId)
      );
      setIsDeleteModalOpen(false); // Đóng modal
    } catch (err: any) {
      showToast(err.message || "Không thể xóa thành viên!", "error");
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null);
    }
  };

  const handleViewDetails = async (member: any) => {
    setLoadingDetail(true);
    try {
      setDetailMember(member);
      setShowDetailModal(true);
    } catch (err: any) {
      showToast(err.message || "Không thể tải chi tiết thành viên", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSaveMemberDetail = async (memberId: number, updates: any) => {
    try {
      // Ở đây bạn có thể gọi API cập nhật chi tiết nếu backend hỗ trợ
      // hoặc chỉ cập nhật tạm trong state:
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === memberId ? { ...m, ...updates } : m
        )
      );
      showToast("Đã lưu thay đổi chi tiết!", "success");
    } catch (err: any) {
      showToast(err.message || "Không thể lưu thay đổi!", "error");
    }
  };

  const openEditModal = (member: any) => {
    setSelectedMember(member);
    setNewStatus(member.status);
    setShowEditModal(true);
  };

  // 🧩 6. Hàm Submit Cập nhật Trạng thái
  const handleUpdateStatus = async () => {
    if (!companyId || !selectedMember) return;

    setIsUpdating(true);
    try {
      const updatedMember = await updateCompanyMemberStatus(
        companyId,
        selectedMember.userId,
        newStatus
      );
      // Cập nhật lại danh sách members state
      setMembers((prev) =>
        prev.map((m) => (m.userId === updatedMember.userId ? updatedMember : m))
      );
      showToast("Cập nhật trạng thái thành công!", "success");
      setShowEditModal(false);
    } catch (err: any) {
      showToast(err.message || "Cập nhật thất bại!", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // 🧩 7. HELPER: Render Trạng thái (đọc status từ API)
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

  // 🧩 8. HELPER: Định dạng thời gian (Giờ:Phút Ngày/Tháng/Năm)
  const formatDateTime = (date?: string | null): string => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };


  // 🔍 Lọc danh sách
  const filteredMembers = members.filter(
    (m) =>
      m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🧭 Render Loading
  if (isAuthLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-blue-50/40 to-white">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
          <p className="text-gray-600 font-medium">Đang xác thực...</p>
        </div>
      </div>
    );

  // 🧭 Render Trang chính
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
                <h1 className="text-3xl font-bold text-white">
                  Quản lý thành viên
                </h1>
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
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-gray-600 font-medium">
              Đang tải danh sách thành viên...
            </p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-fadeInUp delay-100">
            <div className="overflow-x-auto">
              <MemberTable
                members={filteredMembers}
                renderStatus={renderStatusBadge}
                renderRole={(m) => (
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${m.roleName === "COMPANY_ADMIN"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                  >
                    {m.roleName === "COMPANY_ADMIN" ? (
                      <Crown className="w-3.5 h-3.5" />
                    ) : (
                      <Shield className="w-3.5 h-3.5" />
                    )}
                    <span className="text-sm font-semibold">{m.roleName}</span>
                  </div>
                )}
                formatDateTime={formatDateTime}
                onViewDetail={handleViewDetails}
                onEdit={openEditModal}
                onDelete={openDeleteConfirmation}
                disableEdit={(m) => m.userId === user?.id}
                disableDelete={(m) =>
                  m.userId === user?.id || m.status === "PENDING"
                }
              />

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
            <p className="text-gray-500">
              Thử tìm kiếm với từ khóa khác hoặc mời thành viên mới.
            </p>
          </div>
        )}

        {/* Invite Modal (Giữ nguyên) */}
        <InviteMemberModal
  isOpen={showInviteModal}
  onClose={() => setShowInviteModal(false)}
  onInvite={() => handleInvite()}
  isLoading={loading}
  email={email}
  setEmail={setEmail}
  roleId={roleId}
  setRoleId={setRoleId}
  title="Mời thành viên mới"
  description="Thêm người vào công ty"
  contextType="company"
/>

        {/* ✅ MỚI: Modal Chỉnh sửa Trạng thái */}
        {showEditModal && selectedMember && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
              {/* Modal Header */}
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 p-6">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Edit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Cập nhật trạng thái
                      </h2>
                      <p className="text-white/80 text-sm">
                        {selectedMember.fullName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
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
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Trạng thái mới
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 outline-none hover:border-gray-300 cursor-pointer"
                  >
                    <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                    <option value="INACTIVE">Tạm khóa (INACTIVE)</option>
                    <option value="PENDING">Đang chờ (PENDING)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300
                               disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Lưu thay đổi
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <MemberDetailModalBase
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          member={detailMember}
          loading={loadingDetail}
          title="Chi tiết thành viên công ty"
          showStatus={true}
          fields={[
            { label: "ID thành viên", key: "memberId" },
            { label: "User ID", key: "userId" },
            { label: "Vai trò", key: "roleName" },
            { label: "Chức danh", key: "jobTitle" },
            { label: "Ngày tham gia", key: "joinedAt" },
            { label: "Email", key: "email" },
          ]}
        />


        {/* ✅ MỚI: Modal Xác nhận Xóa */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmRemove}
          isLoading={isDeleting}
          title="Xác nhận Xóa Thành viên"
          description={`Bạn có chắc chắn muốn xóa thành viên "${memberToDelete?.fullName}" (${memberToDelete?.email}) khỏi công ty? Hành động này không thể hoàn tác.`}
        />
      </div>
    </div>
  );
}
