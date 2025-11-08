"use client";
import { useEffect, useState } from "react";
import { Search, Plus, Filter, X, Trash2 } from "lucide-react";
import {
  getCompanyMembers,
  inviteMemberToCompany,
  removeCompanyMember,
} from "@/app/api/apiCompany";
import { useToast } from "@/components/ui/ToastProvider";

export default function MembersPage() {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(2);
  const [companyId, setCompanyId] = useState(1); // ⚙️ demo – lấy từ context / API user thực tế

  // 🧩 Lấy danh sách thành viên khi load trang
  useEffect(() => {
    const fetchMembers = async () => {
      try {
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

  // 📨 Gửi lời mời
  const handleInvite = async () => {
    if (!email) {
      showToast("Vui lòng nhập email thành viên!", "warning");
      return;
    }
    try {
      await inviteMemberToCompany(companyId, { email, roleId });
      showToast("✅ Đã gửi lời mời thành viên thành công!", "success");
      setEmail("");
      setRoleId(2);
      setShowInviteModal(false);
    } catch (err: any) {
      showToast(err.message || " Gửi lời mời thất bại!", "error");
    }
  };

  // ❌ Xóa thành viên
  const handleRemove = async (userId: number) => {
    if (!confirm("Bạn có chắc muốn xóa thành viên này?")) return;
    try {
      await removeCompanyMember(companyId, userId);
      showToast(" Đã xóa thành viên!", "success");
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (err: any) {
      showToast(err.message || " Không thể xóa thành viên!", "error");
    }
  };

  // 🔍 Lọc danh sách theo tên/email
  const filteredMembers = members.filter(
    (m) =>
      m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Quản lý thành viên
          </h1>
          <p className="text-gray-600">
            Thêm, chỉnh sửa hoặc xem danh sách thành viên công ty
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Mời thành viên
        </button>
      </div>

      {/* ===== Thanh tìm kiếm ===== */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm thành viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4" /> Lọc
        </button>
      </div>

      {/* ===== Bảng thành viên ===== */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500 text-center">
            Đang tải danh sách thành viên...
          </div>
        ) : filteredMembers.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">
                  Ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Họ và tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Chức vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày tham gia
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredMembers.map((m) => (
                <tr key={m.userId} className="hover:bg-gray-50">
                  {/* 🖼️ Cột ảnh */}
                  <td className="px-6 py-4">
                    <img
                      src={m.avatarUrl || "/default-avatar.png"}
                      alt={m.fullName}
                      className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                    />
                  </td>

                  {/* 🧑 Cột tên */}
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {m.fullName}
                  </td>

                  {/* 📧 Email */}
                  <td className="px-6 py-4 text-gray-700">{m.email}</td>

                  {/* 🏷 Vai trò */}
                  <td className="px-6 py-4 text-gray-700">{m.roleName}</td>

                  {/* 💼 Chức vụ */}
                  <td className="px-6 py-4 text-gray-700">{m.jobTitle}</td>

                  {/* 📅 Ngày tham gia */}
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(m.joinedAt).toLocaleDateString("vi-VN")}
                  </td>

                  {/* 🗑 Thao tác */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemove(m.userId)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-gray-500 text-center">
            Không tìm thấy thành viên nào.
          </div>
        )}
      </div>


      {/* ===== MODAL MỜI THÀNH VIÊN ===== */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Mời thành viên mới
            </h2>
            <p className="text-gray-500 mb-4 text-sm">
              Nhập email của thành viên bạn muốn mời vào công ty.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email thành viên"
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Vai trò
                </label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(Number(e.target.value))}
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value={2}>Quản trị viên</option>
                  <option value={3}>Thành viên</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleInvite}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Gửi lời mời
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
