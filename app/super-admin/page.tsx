// app/super-admin/page.tsx
export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Dashboard Quản Trị Nền Tảng
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Các Card thống kê cơ bản sẽ đặt ở đây */}
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-gray-500 text-sm font-medium">Tổng số Công ty</h3>
          <p className="text-3xl font-bold mt-2 text-blue-600">0</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-gray-500 text-sm font-medium">Tổng số Người dùng</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">0</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-gray-500 text-sm font-medium">Doanh thu tháng này</h3>
          <p className="text-3xl font-bold mt-2 text-purple-600">$0</p>
        </div>
      </div>
    </div>
  );
}