"use client";

import {
  CreditCard,
  CheckCircle2,
  Download,
  Zap,
  Users,
  HardDrive,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button"; // Giả sử có Button component
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Cards"; // Giả sử có Card components
import { Badge } from "@/components/ui/Badge"; // Giả sử có Badge component

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-8">
      <div className="max-w-[1200px] mx-auto px-6 space-y-8">
        {/* 1. HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Billing & Plan
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your subscription and payment history.
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-5 rounded-[3px] flex items-center gap-2">
            <Zap className="w-4 h-4" /> Upgrade Plan
          </Button>
        </div>

        {/* 2. PLAN OVERVIEW (Stats) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan Card (Nổi bật hơn chút) */}
          <Card className="border border-blue-200 shadow-sm bg-blue-50/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-blue-700 uppercase tracking-wider">
                  Current Plan
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 mb-1">
                VIP Enterprise
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Renews on: <strong>Dec 31, 2025</strong>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Members Usage */}
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" /> Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">48</span>
                <span className="text-lg text-slate-400 font-medium">/ ∞</span>
              </div>
              <p className="text-xs text-green-600 font-medium mt-2">
                Unlimited seats available
              </p>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="w-4 h-4" /> Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">
                  21.5 GB
                </span>
                <span className="text-lg text-slate-400 font-medium">/ ∞</span>
              </div>
              <p className="text-xs text-green-600 font-medium mt-2">
                Scale as you grow
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 3. BILLING HISTORY (Table) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-500" /> Billing History
          </h2>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                  <tr>
                    <th className="px-6 py-3">Invoice ID</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 font-mono">
                        {invoice.id}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {invoice.date}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide">
                          <CheckCircle2 className="w-3 h-3" /> {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {invoice.amount}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors">
                          <Download className="w-3.5 h-3.5" /> Download
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
    </div>
  );
}
