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
  Save,
  ShieldAlert,
} from "lucide-react";

// ⛔️ Sửa đường dẫn nếu bạn chưa di chuyển file
import {
  getWorkspaceMembers,
  inviteMemberToWorkspace,
  getWorkspaceMemberDetail,
  updateWorkspaceMemberStatus,
  updateWorkspaceMemberRole,
  removeWorkspaceMember
} from "@/services/apiWorkspace";

// ✅ Lấy user từ Context
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import MemberDetailModalBase from "@/components/ui/MemberDetailModalBase";
import MemberTable from "@/components/ui/MemberTable";
import InviteMemberModal from "@/components/ui/InviteMemberModal"; 
import ConfirmationModal from "@/components/ui/ConfirmationModal";

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

// ...
  // ✅ 2. SỬA LỖI & BỔ SUNG STATE
  // State cho Modal Sửa (Giống Company)
// ✅ CẬP NHẬT STATE CHO MODAL SỬA
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRole, setNewRole] = useState(""); // <--- STATE MỚI CHO ROLE
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal xem chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMember, setDetailMember] = useState<any | null>(null); // Đổi tên state này (từ selectedMember -> detailMember)
  const [loadingDetail, setLoadingDetail] = useState(false);
// ...
  // ✅ STATE MỚI CHO MODAL XÓA (Copy từ Company)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null);

    
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
          roleCode: m.roleCode || (m.roleName === 'Workspace Administrator' ? 'WORKSPACE_ADMIN' : 'WORKSPACE_MEMBER')
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
     setDetailMember(detail); // ✅ 3. Sửa tên state (từ setSelectedMember -> setDetailMember)
// ...
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
  // ...
  // ✅ 4. THAY THẾ HÀM "DEMO"
  
  // Hàm Mở Modal Sửa
  const openEditModal = (member: any) => {
    setSelectedMember(member);
    // ✅ Thay đổi: Reset về rỗng mỗi khi mở modal
    setNewStatus(""); 
    setNewRole(""); 
    setShowEditModal(true);
  };

  // Hàm Submit Cập nhật (Xử lý cả Status và Role)
  const handleUpdateMember = async () => {
    if (!companyId || !workspaceId || !selectedMember) return;

    // Nếu cả 2 đều rỗng (chưa chọn gì) -> đóng modal luôn
    if (newStatus === "" && newRole === "") {
      setShowEditModal(false);
      return;
    }

    setIsUpdating(true);
    try {
      const promises = [];

      // 1. Nếu user chọn Status (khác rỗng) -> Gọi API Status
      if (newStatus !== "") {
        promises.push(
          updateWorkspaceMemberStatus(
            companyId,
            workspaceId,
            selectedMember.memberId,
            { newStatus }
          )
        );
      }

      // 2. Nếu user chọn Role (khác rỗng) -> Gọi API Role
      if (newRole !== "") {
        promises.push(
          updateWorkspaceMemberRole(
            companyId,
            workspaceId,
            selectedMember.memberId,
            newRole
          )
        );
      }
      // Chạy song song các request
      await Promise.all(promises);

      // Refresh danh sách
      const data = await getWorkspaceMembers(companyId, workspaceId);
       const mappedData = data.map((m: any) => ({
            ...m,
            status: m.status || "ACTIVE", 
            roleCode: m.roleCode || (m.roleName === 'Workspace Administrator' ? 'WORKSPACE_ADMIN' : 'WORKSPACE_MEMBER') 
        }));
      setMembers(mappedData);

      showToast("Cập nhật thông tin thành công!", "success");
      setShowEditModal(false);
      setSelectedMember(null);
    } catch (err: any) {
      showToast(err.message || "Cập nhật thất bại!", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // 🧩 5. HÀM MỞ MODAL XÓA (Thay thế cho handleRemove cũ)
  const openDeleteConfirmation = (member: any) => {
    if (member.memberId === member?.id) {
      showToast("Bạn không thể tự xóa chính mình.", "error");
      return;
    }
    setMemberToDelete(member); // Lưu người cần xóa
    setIsDeleteModalOpen(true); // Mở modal
  };

  // 🧩 6. HÀM THỰC HIỆN XÓA (Được gọi bởi Modal)
  const handleConfirmRemove = async () => {
    if (!companyId || !workspaceId || !memberToDelete) return;

    setIsDeleting(true);
    try {
      // Gọi API xóa
      await removeWorkspaceMember(companyId, workspaceId, memberToDelete.memberId);
      
      showToast("Đã xóa thành viên khỏi workspace!", "success");
      
      // Cập nhật UI: Lọc bỏ người vừa xóa
      setMembers((prev) =>
        prev.filter((m) => m.memberId !== memberToDelete.memberId)
      );
      
      setIsDeleteModalOpen(false); // Đóng modal
    } catch (err: any) {
      showToast(err.message || "Không thể xóa thành viên!", "error");
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null);
    }
  };
// ...

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
      case "SUSPENDED":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-sm font-semibold">Tạm khóa</span>
          </div>
        );
      case "REMOVED":
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3.5 h-3.5" />
          <span className="text-sm font-semibold">Đã rời</span>
        </div>
      );
      default:
        return null;
    }
  };

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

        {/* ✅ TABLE: Cập nhật icon Crown/Shield */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" /></div>
        ) : filteredMembers.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-fadeInUp">
            <div className="overflow-x-auto">
              <MemberTable
                members={filteredMembers}
                renderStatus={renderStatusBadge}
                // ✅ Cập nhật logic hiển thị Icon và Style
                renderRole={(m) => {
  const isAdmin = m.roleCode === "WORKSPACE_ADMIN";
  const status = m.status;

  let badgeStyle = "";
  let iconColor = "";
  let IconComponent = isAdmin ? Crown : Shield;

  // 🎯 ƯU TIÊN THEO STATUS
  if (status === "SUSPENDED") {
    // Xám rõ hơn: còn trong hệ thống nhưng đang bị khóa
    badgeStyle = "bg-gray-100 text-gray-600 border-gray-200";
    iconColor = "text-gray-500";
  } 
  else if (status === "REMOVED") {
    // Xám nhạt hơn: đã rời, de-emphasized
    badgeStyle = "bg-gray-50 text-gray-400 border-gray-150";
    iconColor = "text-gray-300";
  } 
  else {
    // 🟢 ACTIVE → theo role
    if (isAdmin) {
      badgeStyle = "bg-yellow-50 text-yellow-700 border-yellow-200";
      iconColor = "text-yellow-600";
    } else {
      badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
      iconColor = "text-blue-600";
    }
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${badgeStyle}`}>
      <IconComponent className={`w-3.5 h-3.5 ${iconColor}`} />
      <span className="text-sm font-semibold">{m.roleName || "—"}</span>
    </div>
  );
}}



                formatDateTime={formatDateTime}
                onViewDetail={(m) => handleViewDetail(m.memberId)}
                onEdit={openEditModal}
                onDelete={openDeleteConfirmation}
                disableEdit={(m) => m.userId === user?.id}
                disableDelete={(m) => m.userId === user?.id}
              />
            </div>
          </div>
        ) : (
          <div className="text-center p-16 bg-white rounded-2xl border-2 border-dashed"><Users className="w-10 h-10 text-gray-400 mx-auto mb-4" /><h3>Không tìm thấy thành viên</h3></div>
        )}
      </div>

      <InviteMemberModal 
        isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} onInvite={handleInvite} isLoading={loading} 
        email={email} setEmail={setEmail} roleId={roleCode === "WORKSPACE_ADMIN" ? 1 : 2} setRoleId={(v) => setRoleCode(v === 1 ? "WORKSPACE_ADMIN" : "WORKSPACE_MEMBER")} 
        title="Mời thành viên" description="Thêm vào workspace" contextType="workspace" 
      />
{/* ✅ MODAL SỬA (UPDATE LOGIC SELECT) */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
            <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 p-6">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Edit className="w-6 h-6 text-white" /></div>
                   <div><h2 className="text-xl font-bold text-white">Cập nhật thành viên</h2><p className="text-white/80 text-sm">{selectedMember.fullName}</p></div>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5 text-white" /></button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Select Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-blue-500" /> Vai trò (Role)</label>
                <div className="relative">
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full appearance-none border-2 border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:border-blue-500 bg-white">
                    {/* ✅ Giá trị rỗng hiển thị mặc định */}
                    <option value="">-- Vui lòng chọn (Giữ nguyên) --</option>
                    <option value="WORKSPACE_MEMBER">Thành viên (Member)</option>
                    <option value="WORKSPACE_ADMIN">Quản trị viên (Admin)</option>
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                     {/* Chỉ hiện icon Crown nếu chọn Admin, còn lại (hoặc rỗng) hiện Shield */}
                     {newRole === 'WORKSPACE_ADMIN' ? <Crown className="w-5 h-5 text-yellow-500" /> : <Shield className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
              </div>

              {/* Select Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Trạng thái (Status)</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500">
                   {/* ✅ Giá trị rỗng hiển thị mặc định */}
                   <option value="">-- Vui lòng chọn (Giữ nguyên) --</option>
                   <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                   <option value="SUSPENDED">Tạm khóa (SUSPENDED)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-semibold">Hủy</button>
                <button onClick={handleUpdateMember} disabled={isUpdating} className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-70">
                   {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="flex items-center gap-2"><Save className="w-4 h-4" /> Lưu thay đổi</div>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 🔹 Modal xem chi tiết */}
      <MemberDetailModalBase
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setDetailMember(null);
        }}
        member={detailMember}
        loading={loadingDetail}
        title="Chi tiết thành viên Workspace"
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
        {/* ✅ MỚI: Modal Xác nhận Xóa (Đặt ở cuối cùng) */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmRemove}
        isLoading={isDeleting}
        title="Xác nhận xóa thành viên"
        description={`Bạn có chắc chắn muốn xóa thành viên "${memberToDelete?.fullName}" (${memberToDelete?.email}) khỏi không gian làm việc này? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}
