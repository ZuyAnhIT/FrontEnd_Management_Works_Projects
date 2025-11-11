import { CreditCard, CheckCircle, Download, Sparkles } from "lucide-react";

// Dữ liệu giả cho lịch sử
const invoices = [
  {
    id: "INV-2025-11",
    date: "11/11/2025",
    amount: "4,577,000₫",
    status: "Paid",
  },
  {
    id: "INV-2025-10",
    date: "11/10/2025",
    amount: "4,577,000₫",
    status: "Paid",
  },
  {
    id: "INV-2025-09",
    date: "11/09/2025",
    amount: "4,577,000₫",
    status: "Paid",
  },
];

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Gói dịch vụ & Thanh toán
            </h1>
            <p className="text-gray-600">
              Theo dõi và quản lý gói VIP của công ty.
            </p>
          </div>
          <button className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold hover:scale-105">
            <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Nâng cấp Gói
          </button>
        </div>

        {/* Thẻ thông tin gói */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gói hiện tại */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-2xl shadow-blue-500/30">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="text-sm opacity-80 mb-2">Gói hiện tại</div>
              <div className="text-3xl font-bold mb-1">VIP Enterprise</div>
              <div className="text-sm opacity-80">Gia hạn ngày: 31/12/2025</div>
            </div>
          </div>
          {/* Thành viên */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-gray-500/5">
            <div className="text-sm text-gray-600 mb-2">
              Thành viên đang sử dụng
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">48 / ∞</div>
            <div className="text-sm text-green-600 font-medium">
              Không giới hạn
            </div>
          </div>
          {/* Dung lượng */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-gray-500/5">
            <div className="text-sm text-gray-600 mb-2">Dung lượng đã dùng</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              21.5 GB / ∞
            </div>
            <div className="text-sm text-green-600 font-medium">
              Không giới hạn
            </div>
          </div>
        </div>

        {/* Lịch sử thanh toán */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-500/5 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Lịch sử thanh toán
            </h2>
          </div>
          {/* Bảng (Table) */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                    Mã HĐ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                    Ngày
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-gray-700">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{invoice.date}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold border border-green-200">
                        <CheckCircle className="w-4 h-4" />
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {invoice.amount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="group flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium">
                        <Download className="w-4 h-4" />
                        Tải về
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
