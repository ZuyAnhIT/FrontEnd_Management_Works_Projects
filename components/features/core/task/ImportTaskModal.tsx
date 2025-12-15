"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, UploadCloud, FileSpreadsheet, Download, CheckCircle2, 
  Loader2, ArrowRight, AlertTriangle, Save 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/ToastProvider";
import { downloadTemplate, previewImportTasks, saveImportedTasks } from "@/services/apiTask";
import { RawStatusColumn } from "@/services/apiBoard";
import { ProjectMember } from "@/services/apiProject";

// Interface for Preview Row
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

// Interface for Props
export interface ImportTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
  statuses: RawStatusColumn[];
  members: ProjectMember[];
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

// ✅ USING "props" OBJECT AS REQUESTED
export default function ImportTaskModal(props: ImportTaskModalProps) {
  
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const errorCount = previewData.filter(r => !r.isValid || r.errors.length > 0).length;
  // Early return if not open
  if (!props.isOpen) return null;
   // 3. THÊM USE EFFECT NÀY VÀO TRƯỚC return
  useEffect(() => {
    // Chỉ chạy khi đang ở bước 2 (Review)
    if (step === 2) {
      if (errorCount === 0) {
        // Nếu không có lỗi: Hiện thông báo
        setShowSuccessAlert(true);
        
        // Hẹn giờ 2s sau thì tắt
        const timer = setTimeout(() => {
          setShowSuccessAlert(false);
        }, 2000);

        // Clear timeout nếu component unmount hoặc errorCount thay đổi nhanh
        return () => clearTimeout(timer);
      } else {
        // Nếu có lỗi: Tắt thông báo thành công ngay lập tức
        setShowSuccessAlert(false);
      }
    }
  }, [step, errorCount]);
  // --- HANDLERS ---

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate();
      showToast("Sample file downloaded!", "success");
    } catch (error) {
      showToast("Error loading template file.", "error");
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      // ✅ USING props.projectId
      const data = await previewImportTasks(props.projectId, file);
      setPreviewData(data);
      setStep(2);
    } catch (error: any) {
      showToast(error.message || "Error with the file.", "error");
    } finally {
      setIsLoading(false);
    }
  };
  
  // ✅ DYNAMIC ERROR CLEARING LOGIC
  const handleCellChange = (index: number, field: keyof PreviewRow, value: any) => {
    const newData = [...previewData];
    const row = { ...newData[index] };

    // Update value
    row[field] = value as never;

    // Remove error related to this field
    if (row.errors.length > 0) {
      let keyword = "";
      if (field === "assigneeEmail") keyword = "User";
      if (field === "startDate") keyword = "Start Date";
      if (field === "dueDate") keyword = "Due Date";
      if (field === "priority") keyword = "Priority";
      if (field === "title") keyword = "Title"; // ✅ Thêm Title
      if (field === "storyPoints") keyword = "Points"; // ✅ Thêm Metrics
      if (field === "estimatedHours") keyword = "Hours";

      if (field === "startDate" || field === "dueDate") {
         row.errors = row.errors.filter(err => 
             !err.toLowerCase().includes("date") && !err.toLowerCase().includes("before")
         );
      } else if (keyword) {
        row.errors = row.errors.filter(err => !err.toLowerCase().includes(keyword.toLowerCase()));
      }
      
      if (row.errors.length === 0) {
        row.isValid = true;
      }
    }
    newData[index] = row;
    setPreviewData(newData);
  };

  // Triggered when clicking "Save"
  const onSaveClick = () => {
    const hasErrors = previewData.some(row => row.errors.length > 0);
    if (hasErrors) {
      // Show custom confirmation modal instead of window.confirm
      setShowConfirmModal(true);
    } else {
      // If no errors, proceed directly
      handleConfirmImport();
    }
  };

  // Actual Save Logic
  const handleConfirmImport = async () => {
    setShowConfirmModal(false); // Close confirm modal if open
    setIsLoading(true);
    
    try {
      // ✅ USING props.projectId
      await saveImportedTasks(props.projectId, previewData);
      
      showToast("Imported successfully!", "success");
      
      // ✅ USING props methods
      props.onSuccess();
      props.onClose();
      
      // Reset
      setStep(1);
      setFile(null);
      setPreviewData([]);
    } catch (error: any) {
      showToast(error.message || "Failed to save data.", "error");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <>
      {/* MAIN MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className={`bg-white rounded-xl shadow-2xl w-full flex flex-col transition-all duration-300 ${step === 2 ? 'max-w-6xl h-[90vh]' : 'max-w-lg max-h-[90vh]'}`}>
          
          {/* HEADER */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {step === 1 ? "Import Tasks" : "Review & Edit Data"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {step === 1 ? "Upload Excel to start" : `Found ${previewData.length} rows. Please review errors before importing.`}
              </p>
            </div>
            {/* ✅ USING props.onClose */}
            <button onClick={props.onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-hidden p-0 relative">
            
            {/* === STEP 1: UPLOAD === */}
            {step === 1 && (
              <div className="p-6 space-y-6">
                 {/* Template Download Block */}
                 <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 h-fit"><FileSpreadsheet className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-700">Download sample file</h3>
                      <p className="text-xs text-slate-500 mb-2">Use a template file to avoid formatting errors.</p>
                      <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="h-7 text-xs bg-white text-blue-700 border-blue-200 hover:bg-blue-100">
                        <Download className="w-3 h-3 mr-2" /> Download Excel
                      </Button>
                    </div>
                 </div>

                 {/* Upload Box */}
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all"
                 >
                   <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
                   <p className="font-medium text-slate-700">Click to upload Excel</p>
                   <p className="text-xs text-slate-400 mt-1">Max size 5MB</p>
                   <input type="file" 
                      ref={fileInputRef} 
                      onChange={(e) => setFile(e.target.files?.[0] || null)} 
                      accept=".xlsx, .xls" // Chỉ nhận Excel
                      className="hidden" 
                    />
                 </div>

                 {/* Selected File */}
                 {file && (
                   <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                   </div>
                 )}
              </div>
            )}

            {/* === STEP 2: REVIEW TABLE (EDITABLE) === */}
            {step === 2 && (
              <div className="h-full flex flex-col">
                {/* Alert Bar */}
                 {errorCount > 0 ? (
                // Nếu có lỗi: Hiện thông báo đỏ (Luôn hiện)
                <div className="bg-red-50 px-6 py-2 border-b border-red-100 flex items-center gap-2 text-red-700 text-xs font-medium transition-all duration-300">
                  <AlertTriangle className="w-4 h-4" />
                  {errorCount} rows contain errors. Correct them or they will be skipped/nulled.
                </div>
              ) : (
                // Nếu không lỗi: Chỉ hiện khi showSuccessAlert = true
                // Thêm class transition-all để ẩn hiện mượt hơn
                <div 
                  className={`
                    px-6 py-2 border-b flex items-center gap-2 text-xs font-medium transition-all duration-500 ease-in-out
                    ${showSuccessAlert 
                      ? 'bg-green-50 border-green-100 text-green-700 opacity-100 max-h-12' 
                      : 'bg-transparent border-transparent text-transparent opacity-0 max-h-0 py-0 border-0'}
                  `}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Valid data. Ready to import.
                </div>
              )}

                {/* TABLE CONTAINER */}
                <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm font-semibold text-slate-600 uppercase">
                      <tr>
                        <th className="p-2 border-b w-10 text-center">#</th>
                        <th className="p-2 border-b min-w-[200px]">Title</th>
                        <th className="p-2 border-b min-w-[180px]">Assignee Email</th>
                        <th className="p-2 border-b w-32">Status</th>
                        <th className="p-2 border-b w-32">Priority</th>
                        <th className="p-2 border-b w-32">Start Date</th>
                        <th className="p-2 border-b w-32">Due Date</th>
                        <th className="p-2 border-b w-20 text-center">Pts</th>
                        <th className="p-2 border-b w-20 text-center">Hours</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {previewData.map((row, idx) => {
                        const hasError = row.errors.length > 0;
                        return (
                          <React.Fragment key={idx}>
                            <tr className={`group hover:bg-slate-50 transition-colors ${hasError ? 'bg-red-50/50' : ''}`}>
                              <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                              
                              {/* TITLE: Thêm check lỗi */}
                              <td className="p-2">
                                <input 
                                  className={`w-full bg-transparent border rounded px-2 py-1 outline-none transition-all ${
                                    row.errors.some(e => e.includes("Title")) 
                                      ? "border-red-300 bg-red-50 text-red-700" 
                                      : "border-transparent hover:border-slate-300 focus:border-blue-500"
                                  }`}
                                  value={row.title || ""}
                                  onChange={(e) => handleCellChange(idx, "title", e.target.value)}
                                />
                              </td>

                              {/* ✅ ASSIGNEE DROPDOWN (Email + Name on Hover) */}
                              <td className="p-2">
                                <select 
                                  className={`w-full bg-transparent border rounded px-1 py-1 outline-none cursor-pointer ${
                                    // Highlight đỏ nếu lỗi liên quan đến user
                                    row.errors.some(e => e.toLowerCase().includes("user")) 
                                      ? "border-red-300 bg-red-50 text-red-700" 
                                      : "border-transparent hover:border-slate-300 focus:border-blue-500"
                                  }`}
                                  value={row.assigneeEmail || ""}
                                  onChange={(e) => handleCellChange(idx, "assigneeEmail", e.target.value)}
                                  title="Select a project member"
                                >
                                  <option value="">Unassigned</option>
                                  {props.members.map(m => (
                                    <option key={m.userId} value={m.email} title={m.fullName}>
                                      {m.email} ({m.fullName})
                                    </option>
                                  ))}
                                  
                                  {/* Trường hợp: Email trong file CSV không có trong danh sách thành viên */}
                                  {/* Ta vẫn hiển thị nó (nhưng báo lỗi) để user biết giá trị gốc là gì */}
                                  {row.assigneeEmail && 
                                   !props.members.some(m => m.email.toLowerCase() === row.assigneeEmail.toLowerCase()) && (
                                     <option value={row.assigneeEmail} disabled className="bg-red-100 text-red-600">
                                       {row.assigneeEmail} (Invalid/Not Member)
                                     </option>
                                  )}
                                </select>
                              </td>

                              {/* STATUS (Using props.statuses) */}
                              <td className="p-2">
                                <select 
                                  className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1 py-1 outline-none cursor-pointer"
                                  value={row.statusName || ""}
                                  onChange={(e) => handleCellChange(idx, "statusName", e.target.value)}
                                >
                                  {props.statuses.map(s => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                  ))}
                                </select>
                              </td>

                              {/* PRIORITY: Thêm check lỗi */}
                              <td className="p-2">
                                <select 
                                  className={`w-full bg-transparent border rounded px-1 py-1 outline-none cursor-pointer uppercase ${
                                    row.errors.some(e => e.includes("Priority")) 
                                      ? "border-red-300 bg-red-50 text-red-700" 
                                      : "border-transparent hover:border-slate-300 focus:border-blue-500"
                                  }`}
                                  value={row.priority || "MEDIUM"}
                                  onChange={(e) => handleCellChange(idx, "priority", e.target.value)}
                                >
                                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                              </td>
                              {/* START DATE */}
                              <td className="p-2">
                                <input 
                                  type="date"
                                  className={`w-full bg-transparent border rounded px-1 py-1 outline-none ${
                                    // Highlight đỏ nếu lỗi logic ngày tháng
                                    row.errors.some(e => e.toLowerCase().includes("start date")) 
                                      ? "border-red-300 bg-red-50 text-red-700" 
                                      : "border-transparent hover:border-slate-300 focus:border-blue-500"
                                  }`}
                                  value={row.startDate || ""}
                                  onChange={(e) => handleCellChange(idx, "startDate", e.target.value)}
                                />
                              </td>
                              {/* DUE DATE */}
                              <td className="p-2">
                                <input 
                                  type="date"
                                  className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1 py-1 outline-none"
                                  value={row.dueDate || ""}
                                  onChange={(e) => handleCellChange(idx, "dueDate", e.target.value)}
                                />
                              </td>

                              {/* METRICS (Story Points): Thêm check lỗi */}
                              <td className="p-2">
                                <input 
                                  type="number"
                                  className={`w-full text-center bg-transparent border rounded py-1 outline-none ${
                                    row.errors.some(e => e.includes("Points")) 
                                      ? "border-red-300 bg-red-50 text-red-700" 
                                      : "border-transparent hover:border-slate-300 focus:border-blue-500"
                                  }`}
                                  value={row.storyPoints || 0}
                                  onChange={(e) => handleCellChange(idx, "storyPoints", Number(e.target.value))}
                                />
                              </td>

                              {/* METRICS (Hours): Thêm check lỗi */}
                              <td className="p-2">
                                <input 
                                  type="number"
                                  className={`w-full text-center bg-transparent border rounded py-1 outline-none ${
                                    row.errors.some(e => e.includes("Hours")) 
                                      ? "border-red-300 bg-red-50 text-red-700" 
                                      : "border-transparent hover:border-slate-300 focus:border-blue-500"
                                  }`}
                                  value={row.estimatedHours || 0}
                                  onChange={(e) => handleCellChange(idx, "estimatedHours", Number(e.target.value))}
                                />
                              </td>
                            </tr>

                            {/* ERROR MESSAGE ROW */}
                            {hasError && (
                              <tr className="bg-red-50/30">
                                <td colSpan={9} className="px-4 pb-2 pt-0">
                                  <div className="flex flex-wrap gap-2">
                                    {row.errors.map((err, i) => (
                                      <span key={i} className="text-[10px] text-red-600 bg-red-100 px-2 py-0.5 rounded-full flex items-center">
                                        <AlertTriangle className="w-3 h-3 mr-1" /> {err}
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
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <div>
              {step === 2 && (
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-slate-500 text-xs">
                  Back to Upload
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              {/* ✅ USING props.onClose */}
              <Button variant="ghost" onClick={props.onClose} disabled={isLoading}>
                  Cancel
              </Button>
              
              {step === 1 ? (
                <Button onClick={handleFileUpload} disabled={!file || isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  Continue: Review
                </Button>
              ) : (
                <Button onClick={onSaveClick} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save {previewData.length} Tasks
                </Button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* --- CONFIRMATION DIALOG (Small Modal on top) --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Proceed with errors?</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-6">
              Some rows still contain errors. If you continue, invalid fields (like incorrect emails or dates) will be saved as <strong>empty/null</strong> values.
            </p>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Go Back & Fix
              </Button>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleConfirmImport}>
                Yes, Import Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}