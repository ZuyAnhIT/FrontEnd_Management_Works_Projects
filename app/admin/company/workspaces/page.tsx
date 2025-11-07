import { FolderKanban, MoreVertical, Plus } from "lucide-react";

export default function WorkspacePage() {
  const workspaces = [
    { id: 1, name: "Phòng Kỹ thuật", members: 12, projects: 6, manager: "Nguyễn Văn Kỹ" },
    { id: 2, name: "Phòng Marketing", members: 8, projects: 3, manager: "Trần Thị Hương" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Phòng ban / Workspaces</h1>
          <p className="text-gray-600">Quản lý danh sách các phòng ban trong công ty</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Tạo phòng ban mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-white" />
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <h3 className="font-semibold text-lg text-gray-900 mb-1">{ws.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Quản lý: {ws.manager}</p>

            <div className="flex justify-between text-sm text-gray-700">
              <span>Thành viên: <strong>{ws.members}</strong></span>
              <span>Dự án: <strong>{ws.projects}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
