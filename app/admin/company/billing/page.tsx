import { CreditCard } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Gói dịch vụ & Thanh toán</h1>
      <p className="text-gray-600 mb-6">Theo dõi và quản lý gói VIP của công ty</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="text-sm opacity-80 mb-2">Gói hiện tại</div>
          <div className="text-3xl font-bold mb-1">VIP</div>
          <div className="text-sm opacity-80">Không giới hạn</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Thành viên</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">48/∞</div>
          <div className="text-sm text-green-600">Không giới hạn</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Dung lượng</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">∞</div>
          <div className="text-sm text-green-600">Không giới hạn</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Lịch sử thanh toán
        </h2>
        <div className="text-center py-12 text-gray-500">Chưa có lịch sử thanh toán</div>
      </div>
    </div>
  );
}
