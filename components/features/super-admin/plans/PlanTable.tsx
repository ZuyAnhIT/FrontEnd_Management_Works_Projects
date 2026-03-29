"use client";

import React from "react";
import {
  ChevronUp,
  ChevronDown,
  Package,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { SystemPlan } from "@/services/apiPlanSystem";

interface PlanTableProps {
  plans: SystemPlan[];
  renderStatus: (isActive: boolean) => React.ReactNode;
  onViewDetail?: (plan: SystemPlan) => void;
  onEdit?: (plan: SystemPlan) => void;
  onSort?: (field: string) => void;
  currentSortBy?: string;
  currentSortDir?: "asc" | "desc";
}

export default function PlanTable({
  plans,
  renderStatus,
  onViewDetail,
  onEdit,
  onSort,
  currentSortBy,
  currentSortDir,
}: PlanTableProps) {
  const renderSortIcon = (field: string) => {
    if (!onSort) return null;
    if (currentSortBy !== field)
      return <ChevronUp className="w-3 h-3 opacity-30" />;
    return currentSortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-blue-600" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-600" />
    );
  };

  const sortableTh = (label: string, field: string, width?: string) => (
    <th
      onClick={() => onSort && onSort(field)}
      className={`px-4 py-3 font-semibold text-slate-500 uppercase text-[11px] tracking-wider select-none cursor-pointer hover:text-blue-600 ${width}`}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {renderSortIcon(field)}
      </div>
    </th>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-10 text-center text-slate-500">
        <p className="text-sm font-medium">
          No plans found matching the criteria.
        </p>
        <p className="text-xs mt-1">
          Try adjusting your search keywords or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              {/* ✅ Thay cột Order bằng cột STT (Không cho phép sort cột này nữa vì nó là frontend tự sinh) */}
              <th className="px-4 py-3 text-center font-semibold text-slate-500 uppercase text-[11px] tracking-wider w-16">
                #
              </th>
              {sortableTh("Plan Name", "name")}
              {sortableTh("Pricing", "monthlyPrice")}
              {sortableTh("Status", "isActive")}
              <th className="px-4 py-3 text-right font-semibold text-slate-500 uppercase text-[11px] tracking-wider w-28">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {plans.map((plan, index) => (
              <tr
                key={plan.id}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                {/* ✅ Hiển thị số thứ tự (index + 1) */}
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-bold border border-slate-200">
                    {index + 1}
                  </span>
                  {/* Nếu bạn muốn hiện ID của Database thì thay {index + 1} bằng {plan.id} */}
                </td>

                {/* Name & Code & Description */}
                <td className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate flex items-center gap-2">
                        {plan.name}
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono uppercase font-bold border border-slate-200">
                          {plan.planCode}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[250px]">
                        {plan.description}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Pricing */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency(plan.monthlyPrice)}{" "}
                      <span className="text-xs text-slate-500 font-normal">
                        /mo
                      </span>
                    </span>
                    {plan.yearlyPrice > 0 && (
                      <span className="text-xs text-slate-500">
                        {formatCurrency(plan.yearlyPrice)}{" "}
                        <span className="text-[10px]">/yr</span>
                      </span>
                    )}
                  </div>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3">{renderStatus(plan.isActive)}</td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onViewDetail && onViewDetail(plan)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="View Plan Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit && onEdit(plan)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                      title="Edit Plan"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
