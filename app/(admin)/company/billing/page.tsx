'use client';
import { useState } from 'react';

export default function BillingPage() {
  const [subscription] = useState({
    plan: 'VIP',
    price: 9999000,
    expiresAt: '15/12/2025',
    status: 'active'
  });
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Thanh toán & Gói dịch vụ</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Nâng cấp gói
        </button>
      </div>

      {/* VIP Package Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Gói hiện tại</p>
            <h2 className="text-3xl font-bold">Gói VIP</h2>
            <p className="text-2xl mt-2">₫{subscription.price.toLocaleString()} / tháng</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Gia hạn</p>
            <p className="text-xl font-semibold">{subscription.expiresAt}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div>
            <p className="text-sm opacity-75">Thành viên</p>
            <p className="text-lg font-semibold">Không giới hạn</p>
          </div>
          <div>
            <p className="text-sm opacity-75">Phòng ban</p>
            <p className="text-lg font-semibold">Không giới hạn</p>
          </div>
          <div>
            <p className="text-sm opacity-75">Dự án</p>
            <p className="text-lg font-semibold">Không giới hạn</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Phương thức thanh toán</h3>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
            + Thêm mới
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="font-medium">Visa •••• 4242</p>
                <p className="text-sm text-gray-500">Hết hạn 12/2026</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
              Mặc định
            </span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Lịch sử thanh toán</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700">
            Xem tất cả
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          <TransactionRow 
            date="15/11/2025"
            description="Gói VIP - Tháng"
            amount={9999000}
            status="success"
          />
          <TransactionRow 
            date="15/10/2025"
            description="Gói VIP - Tháng"
            amount={9999000}
            status="success"
          />
          <TransactionRow 
            date="15/09/2025"
            description="Gói VIP - Tháng"
            amount={9999000}
            status="success"
          />
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ date, description, amount, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          ✓
        </div>
        <div>
          <p className="font-medium text-gray-900">{description}</p>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">₫{amount.toLocaleString()}</p>
        <p className="text-sm text-green-600">Thành công</p>
      </div>
    </div>
  );
}