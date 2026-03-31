"use client";

// =============================================================================
// 1. IMPORT (Libraries -> Internal -> Styles)
// =============================================================================

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Loader2,
  ArrowRight,
  AlertTriangle,
  Save,
} from "lucide-react";

// Internal Components & Hooks
import { Button } from "@/components/ui/Buttons";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// Internal Services & Interfaces
import {
  downloadTemplate,
  previewImportTasks,
  saveImportedTasks,
} from "@/services/apiTask";
import { RawStatusColumn } from "@/services/apiBoard";
import { ProjectMember } from "@/services/apiProject";

// =============================================================================
// 2. INTERFACES & CONSTANTS
// =============================================================================

interface PreviewRow {
  rowIndex: number;
  title: string;
  description: string;
  assigneeEmail: string;
  priority: string;
  statusName: string;
  startDate: string;
  dueDate: string;
  storyPoints: number;
  estimatedHours: number;
  isValid: boolean;
  errors: string[];
}

export interface ImportTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
  statuses: RawStatusColumn[];
  members: ProjectMember[];
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function ImportTaskModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  statuses,
  members,
}: ImportTaskModalProps) {
  
  // ---------------------------------------------------------------------------
  // 4. HOOKS, REFS & STATE
  // ---------------------------------------------------------------------------
  
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trạng thái luồng xử lý (Step 1: Upload, Step 2: Review)
  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Trạng thái hiển thị Modal phụ & Thông báo
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Tính toán tổng số dòng đang có lỗi
  const errorCount = previewData.filter(
    (r) => !r.isValid || r.errors.length > 0
  ).length;

  // ---------------------------------------------------------------------------
  // 5. EFFECTS
  // ---------------------------------------------------------------------------

  /**
   * Quản lý hiển thị thanh thông báo xanh (Success Alert) ở Bước 2.
   * Tự động ẩn sau 2 giây nếu không còn lỗi nào.
   */
  useEffect(() => {
    if (isOpen && step === 2) {
      if (errorCount === 0) {
        setShowSuccessAlert(true);
        const timer = setTimeout(() => {
          setShowSuccessAlert(false);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        setShowSuccessAlert(false);
      }
    }
  }, [isOpen, step, errorCount]);

  // ---------------------------------------------------------------------------
  // 6. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Xử lý tải file mẫu (Template) từ Backend
   */
  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate();
      showToast("Template downloaded successfully.", "success");
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to download template.";
      showToast(message, "error");
    }
  };

  /**
   * Xử lý gửi file lên Backend để phân tích và trả về dữ liệu xem trước (Preview)
   */
  const handleFileUpload = async () => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const data = await previewImportTasks(projectId, file);
      setPreviewData(data);
      setStep(2);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to process the uploaded file.";
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý thay đổi dữ liệu trực tiếp trên bảng Preview.
   * Chứa logic đánh giá lại lỗi (Clear error) nếu người dùng sửa đúng trường tương ứng.
   */
  const handleCellChange = (
    index: number,
    field: keyof PreviewRow,
    value: any
  ) => {
    const newData = [...previewData];
    const row = { ...newData[index] };

    // 1. Cập nhật giá trị
    row[field] = value as never;

    // 2. Xóa lỗi liên quan đến trường đang được sửa
    if (row.errors.length > 0) {
      let keyword = "";

      if (field === "assigneeEmail") keyword = "User";
      if (field === "startDate") keyword = "Start Date";
      if (field === "dueDate") keyword = "Due Date";
      if (field === "priority") keyword = "Priority";
      if (field === "title") keyword = "Title";
      if (field === "storyPoints") keyword = "Points";
      if (field === "estimatedHours") keyword = "Hours";

      // Xử lý loại trừ lỗi cho trường Ngày tháng (Logic nghiệp vụ gốc)
      if (field === "startDate" || field === "dueDate") {
        row.errors = row.errors.filter(
          (err) =>
            !err.toLowerCase().includes("date") &&
            !err.toLowerCase().includes("before")
        );
      } else if (keyword) {
        // Xóa các lỗi đơn giản chứa từ khóa tương ứng
        row.errors = row.errors.filter(
          (err) => !err.toLowerCase().includes(keyword.toLowerCase())
        );
      }

      // Xác nhận dòng hợp lệ nếu mảng lỗi đã trống
      if (row.errors.length === 0) {
        row.isValid = true;
      }
    }
    
    newData[index] = row;
    setPreviewData(newData);
  };

  /**
   * Xử lý khi nhấn nút "Save". 
   * Kiểm tra nếu còn lỗi thì hiển thị Modal cảnh báo.
   */
  const onSaveClick = () => {
    const hasErrors = previewData.some((row) => row.errors.length > 0);
    if (hasErrors) {
      setShowConfirmModal(true);
    } else {
      handleConfirmImport();
    }
  };

  /**
   * Thực thi gọi API Import dữ liệu chính thức vào hệ thống.
   */
  const handleConfirmImport = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);

    try {
      await saveImportedTasks(projectId, previewData);
      
      showToast("Data imported successfully. Tasks are now available.", "success");
      
      onSuccess();
      onClose();

      // Reset toàn bộ State
      setStep(1);
      setFile(null);
      setPreviewData([]);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to import tasks.";
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 7. RENDER GUARD
  // ---------------------------------------------------------------------------
  
  if (!isOpen) return null;

  // ---------------------------------------------------------------------------
  // 8. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* ==================== MAIN MODAL ==================== */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div
          className={cn(
            "bg-white rounded-2xl shadow-2xl w-full flex flex-col transition-all duration-300 border border-slate-200",
            step === 2 ? "max-w-[90vw] lg:max-w-6xl h-[90vh]" : "max-w-lg max-h-[90vh]"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 rounded-t-2xl">
            <div>
              <h2 className="text-lg font-bold text-[#172B4D] tracking-tight">
                {step === 1 ? "Import Issues" : "Review & Edit Data"}
              </h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {step === 1
                  ? "Upload CSV or Excel file to start"
                  : `Found ${previewData.length} records. Please review errors before saving.`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-md transition-colors active:scale-95"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-hidden p-0 relative">
            
            {/* === STEP 1: UPLOAD === */}
            {step === 1 && (
              <div className="p-6 space-y-6">
                
                {/* Template Download Block */}
                <div className="bg-[#E3F2FD] border border-[#2684FF]/20 rounded-xl p-4 flex gap-4">
                  <div className="bg-white p-2.5 rounded-lg text-[#0052CC] h-fit shrink-0 shadow-sm">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-[#172B4D]">
                      Download Template File
                    </h3>
                    <p className="text-xs text-slate-600 mb-3 mt-1">
                      Ensure your data matches our system format to avoid validation errors.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadTemplate}
                      className="h-8 text-[11px] font-bold uppercase tracking-widest bg-white text-[#0052CC] border-[#2684FF]/30 hover:bg-blue-50 transition-colors"
                      disabled={isLoading}
                    >
                      <Download className="w-3.5 h-3.5 mr-2" /> Download Template
                    </Button>
                  </div>
                </div>

                {/* Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#2684FF] hover:bg-blue-50/50 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all group"
                >
                  <UploadCloud className="w-12 h-12 text-slate-300 group-hover:text-[#0052CC] mb-3 transition-colors" />
                  <p className="font-bold text-[13px] text-[#172B4D]">
                    Click to browse files
                  </p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                    Supported: .CSV, .XLSX (Max 5MB)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    disabled={isLoading}
                  />
                </div>

                {/* Selected File */}
                {file && (
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
                    <span className="text-[13px] font-bold text-slate-700 truncate px-2">
                      {file.name}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      disabled={isLoading}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* === STEP 2: REVIEW TABLE (EDITABLE) === */}
            {step === 2 && (
              <div className="h-full flex flex-col bg-slate-50">
                
                {/* Alert Bar */}
                {errorCount > 0 ? (
                  <div className="bg-red-50 px-6 py-2.5 border-b border-red-100 flex items-center gap-2 text-red-700 text-[12px] font-bold transition-all duration-300 shrink-0 shadow-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {errorCount} rows contain errors. Invalid fields will be skipped or saved as empty if imported now.
                  </div>
                ) : (
                  <div
                    className={cn(
                      "px-6 border-b flex items-center gap-2 text-[12px] font-bold transition-all duration-500 ease-in-out shrink-0 overflow-hidden",
                      showSuccessAlert 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700 opacity-100 py-2.5 shadow-sm" 
                        : "bg-transparent border-transparent text-transparent opacity-0 py-0 h-0"
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    All data is valid and ready to be imported.
                  </div>
                )}

                {/* TABLE CONTAINER */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse text-[12px]">
                    <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm font-black text-slate-500 uppercase tracking-widest text-[10px]">
                      <tr>
                        <th className="p-3 border-b border-slate-200 w-12 text-center bg-slate-100">#</th>
                        <th className="p-3 border-b border-slate-200 min-w-[250px] bg-slate-100">Summary</th>
                        <th className="p-3 border-b border-slate-200 min-w-[200px] bg-slate-100">Assignee Email</th>
                        <th className="p-3 border-b border-slate-200 w-36 bg-slate-100">Status</th>
                        <th className="p-3 border-b border-slate-200 w-32 bg-slate-100">Priority</th>
                        <th className="p-3 border-b border-slate-200 w-36 bg-slate-100">Start Date</th>
                        <th className="p-3 border-b border-slate-200 w-36 bg-slate-100">Due Date</th>
                        <th className="p-3 border-b border-slate-200 w-20 text-center bg-slate-100">Points</th>
                        <th className="p-3 border-b border-slate-200 w-20 text-center bg-slate-100">Hours</th>
                      </tr>
                    </thead>
                    
                    <tbody className="bg-white divide-y divide-slate-100">
                      {previewData.map((row, idx) => {
                        const hasError = row.errors.length > 0;
                        return (
                          <React.Fragment key={idx}>
                            <tr className={cn(
                              "group transition-colors",
                              hasError ? "bg-red-50/30 hover:bg-red-50/50" : "hover:bg-slate-50"
                            )}>
                              {/* INDEX */}
                              <td className={cn(
                                "p-2 text-center font-medium",
                                hasError ? "text-red-400" : "text-slate-400"
                              )}>
                                {idx + 1}
                              </td>

                              {/* TITLE */}
                              <td className="p-2">
                                <input
                                  className={cn(
                                    "w-full bg-transparent border rounded px-2 py-1.5 outline-none transition-all font-medium text-[13px]",
                                    row.errors.some((e) => e.includes("Title"))
                                      ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                                      : "border-transparent hover:border-slate-300 focus:border-[#2684FF] focus:bg-white text-slate-700"
                                  )}
                                  value={row.title || ""}
                                  onChange={(e) => handleCellChange(idx, "title", e.target.value)}
                                  disabled={isLoading}
                                />
                              </td>

                              {/* ASSIGNEE EMAIL */}
                              <td className="p-2">
                                <select
                                  className={cn(
                                    "w-full bg-transparent border rounded px-1.5 py-1.5 outline-none cursor-pointer text-[12px] font-medium",
                                    row.errors.some((e) => e.toLowerCase().includes("user"))
                                      ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500"
                                      : "border-transparent hover:border-slate-300 focus:border-[#2684FF] focus:bg-white text-slate-700"
                                  )}
                                  value={row.assigneeEmail || ""}
                                  onChange={(e) => handleCellChange(idx, "assigneeEmail", e.target.value)}
                                  disabled={isLoading}
                                >
                                  <option value="">Unassigned</option>
                                  {members.map((m) => (
                                    <option key={m.userId} value={m.email} title={m.fullName}>
                                      {m.email} ({m.fullName})
                                    </option>
                                  ))}
                                  {/* Render Invalid Email fallback */}
                                  {row.assigneeEmail && !members.some((m) => m.email.toLowerCase() === row.assigneeEmail.toLowerCase()) && (
                                    <option value={row.assigneeEmail} disabled className="bg-red-100 text-red-600">
                                      {row.assigneeEmail} (Invalid)
                                    </option>
                                  )}
                                </select>
                              </td>

                              {/* STATUS */}
                              <td className="p-2">
                                <select
                                  className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-[#2684FF] focus:bg-white rounded px-1.5 py-1.5 outline-none cursor-pointer text-[12px] font-bold text-slate-600"
                                  value={row.statusName || ""}
                                  onChange={(e) => handleCellChange(idx, "statusName", e.target.value)}
                                  disabled={isLoading}
                                >
                                  {statuses.map((s) => (
                                    <option key={s.id} value={s.name}>
                                      {s.name}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* PRIORITY */}
                              <td className="p-2">
                                <select
                                  className={cn(
                                    "w-full bg-transparent border rounded px-1.5 py-1.5 outline-none cursor-pointer uppercase text-[11px] font-black tracking-wider",
                                    row.errors.some((e) => e.includes("Priority"))
                                      ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500"
                                      : "border-transparent hover:border-slate-300 focus:border-[#2684FF] focus:bg-white text-slate-600"
                                  )}
                                  value={row.priority || "MEDIUM"}
                                  onChange={(e) => handleCellChange(idx, "priority", e.target.value)}
                                  disabled={isLoading}
                                >
                                  {PRIORITIES.map((p) => (
                                    <option key={p} value={p}>
                                      {p}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* START DATE */}
                              <td className="p-2">
                                <input
                                  type="date"
                                  className={cn(
                                    "w-full bg-transparent border rounded px-1.5 py-1.5 outline-none text-[12px] font-medium text-slate-600",
                                    row.errors.some((e) => e.toLowerCase().includes("start date"))
                                      ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500"
                                      : "border-transparent hover:border-slate-300 focus:border-[#2684FF] focus:bg-white"
                                  )}
                                  value={row.startDate || ""}
                                  onChange={(e) => handleCellChange(idx, "startDate", e.target.value)}
                                  disabled={isLoading}
                                />
                              </td>

                              {/* DUE DATE */}
                              <td className="p-2">
                                <input
                                  type="date"
                                  className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-[#2684FF] focus:bg-white rounded px-1.5 py-1.5 outline-none text-[12px] font-medium text-slate-600"
                                  value={row.dueDate || ""}
                                  onChange={(e) => handleCellChange(idx, "dueDate", e.target.value)}
                                  disabled={isLoading}
                                />
                              </td>

                              {/* STORY POINTS */}
                              <td className="p-2">
                                <input
                                  type="number"
                                  className={cn(
                                    "w-full text-center bg-transparent border rounded py-1.5 outline-none text-[12px] font-bold text-slate-600",
                                    row.errors.some((e) => e.includes("Points"))
                                      ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500"
                                      : "border-transparent hover:border-slate-300 focus:border-[#2684FF] focus:bg-white"
                                  )}
                                  value={row.storyPoints || 0}
                                  onChange={(e) => handleCellChange(idx, "storyPoints", Number(e.target.value))}
                                  disabled={isLoading}
                                />
                              </td>

                              {/* ESTIMATED HOURS */}
                              <td className="p-2">
                                <input
                                  type="number"
                                  className={cn(
                                    "w-full text-center bg-transparent border rounded py-1.5 outline-none text-[12px] font-bold text-slate-600",
                                    row.errors.some((e) => e.includes("Hours"))
                                      ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500"
                                      : "border-transparent hover:border-slate-300 focus:border-[#2684FF] focus:bg-white"
                                  )}
                                  value={row.estimatedHours || 0}
                                  onChange={(e) => handleCellChange(idx, "estimatedHours", Number(e.target.value))}
                                  disabled={isLoading}
                                />
                              </td>
                            </tr>

                            {/* ERROR MESSAGE SUB-ROW */}
                            {hasError && (
                              <tr className="bg-red-50/20 border-b border-red-100">
                                <td colSpan={9} className="px-4 pb-3 pt-0">
                                  <div className="flex flex-wrap gap-2">
                                    {row.errors.map((err, i) => (
                                      <span
                                        key={i}
                                        className="text-[10px] font-bold tracking-wide text-red-600 bg-red-100/50 px-2 py-1 rounded-md flex items-center border border-red-200"
                                      >
                                        <AlertTriangle className="w-3 h-3 mr-1.5" />
                                        {err}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-between items-center shrink-0 rounded-b-2xl">
            <div>
              {step === 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep(1);
                    setPreviewData([]);
                    setFile(null);
                  }}
                  className="text-slate-500 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-100"
                  disabled={isLoading}
                >
                  Back to Upload
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
                className="font-bold text-[11px] uppercase tracking-widest text-slate-500"
              >
                Cancel
              </Button>

              {step === 1 ? (
                <Button
                  onClick={handleFileUpload}
                  disabled={!file || isLoading}
                  className="bg-[#0052CC] hover:bg-[#0047B3] text-white font-bold text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Review Data
                </Button>
              ) : (
                <Button
                  onClick={onSaveClick}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Import {previewData.length} Records
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== CONFIRMATION DIALOG ==================== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#172B4D] tracking-tight">
                Import with Errors?
              </h3>
            </div>

            <p className="text-[13px] text-slate-600 mb-6 leading-relaxed">
              Some records still contain validation errors. If you proceed, invalid fields (like incorrect emails or unformatted dates) will be saved as <strong className="text-slate-900">empty values</strong>.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={isLoading}
                className="font-bold text-[11px] uppercase tracking-widest text-slate-600 hover:bg-slate-50"
              >
                Review Again
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] uppercase tracking-widest shadow-sm active:scale-95"
                onClick={handleConfirmImport}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  "Force Import"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Style for scrollbar in this specific component */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </>
  );
}