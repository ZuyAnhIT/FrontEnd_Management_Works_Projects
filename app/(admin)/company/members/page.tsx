'use client';
import { useState } from 'react';

export default function CompanyMembersPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [members] = useState([
    { id: '1', name: 'Nguyễn Văn Admin', email: 'admin@company.com', role: 'COMPANY_ADMIN', status: 'active', joinedAt: '2024-01-15' },
    { id: '2', name: 'Trần Thị Hương', email: 'huong@company.com', role: 'WORKSPACE_ADMIN', status: 'active', joinedAt: '2024-02-10' },
    { id: '3', name: 'Lê Văn Bình', email: 'binh@company.com', role: 'MEMBER', status: 'active', joinedAt: '2024-03-05' },
  ]);
  
  const roleLabels: Record<string, string> = {
    COMPANY_ADMIN: 'Quản trị Công ty',
    WORKSPACE_ADMIN: 'Quản trị Workspace',
    MEMBER: 'Thành viên',
    GUEST: 'Khách'
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Thành viên</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả thành viên trong công ty</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          + Mời thành viên
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard title="Tổng thành viên" value="48" color="blue" />
        <StatsCard title="Đang hoạt động" value="45" color="green" />
        <StatsCard title="Đang mời" value="3" color="orange" />
        <StatsCard title="Quản trị viên" value="5" color="purple" />
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <input
            type="search"
            placeholder="Tìm kiếm thành viên..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thành viên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng ban</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {roleLabels[member.role]}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  6 phòng ban
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    Đang hoạt động
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-700 mr-3">Chỉnh sửa</button>
                  <button className="text-red-600 hover:text-red-700">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteMemberModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}

function StatsCard({ title, value, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600'
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  );
}

function InviteMemberModal({ onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Mời thành viên</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="MEMBER">Thành viên</option>
              <option value="WORKSPACE_ADMIN">Quản trị Workspace</option>
              <option value="COMPANY_ADMIN">Quản trị Công ty</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Gửi lời mời
          </button>
        </div>
      </div>
    </div>
  );
}