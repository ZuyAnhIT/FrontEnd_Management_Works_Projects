"use client";

import React, { useState, useRef, useMemo } from "react";
import { 
  X, UploadCloud, FileSpreadsheet, Download, CheckCircle2, 
  Loader2, ArrowRight, AlertTriangle, Save 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/ToastProvider";
import { downloadTemplate, previewImportTasks, saveImportedTasks } from "@/services/apiTask";
import { RawStatusColumn } from "@/services/apiBoard"; // Import type status

// Định nghĩa kiểu dữ liệu cho dòng Preview
interface PreviewRow {
  rowIndex: number;
  title: string;
  description: string;
  assigneeEmail: string;
  priority: string;
  statusName: string;
  dueDate: string;
  storyPoints: number;
  estimatedHours: number;
  isValid: boolean;
  errors: string[];
}

interface ImportTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
  statuses: RawStatusColumn[]; // Nhận danh sách Status để làm Dropdown
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function ImportTaskModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  statuses
}: ImportTaskModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [step, setStep] = useState<1 | 2>(1); // 1: Upload, 2: Review
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // --- HANDLERS BƯỚC 1 (UPLOAD) ---
  
  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate();
      showToast("Đã tải xuống file mẫu!", "success");
    } catch (error) {
      showToast("Lỗi tải file mẫu.", "error");
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      // Gọi API Preview
      const data = await previewImportTasks(projectId, file);
      setPreviewData(data);
      setStep(2); // Chuyển sang bước Review
    } catch (error: any) {
      showToast(error.message || "Lỗi khi đọc file.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS BƯỚC 2 (REVIEW & EDIT) ---

  // Hàm update giá trị trong bảng (Editable Cell)
 const handleCellChange = (index: number, field: keyof PreviewRow, value: any) => {
    const newData = [...previewData];
    const row = { ...newData[index] };

    // Update value
    row[field] = value as never;

    // Remove error related to this field
    if (row.errors.length > 0) {
      // Map field names to error keywords usually returned by backend
      // Example: 'assigneeEmail' maps to errors containing 'User', 'email'
      let keyword = "";
      if (field === "assigneeEmail") keyword = "User"; // Based on backend error: "User 'abc' is not..."
      if (field === "dueDate") keyword = "date";       // Based on backend error: "Invalid date..."
      if (field === "priority") keyword = "priority";

      // Filter out the error if it matches the edited field
      if (keyword) {
        row.errors = row.errors.filter(err => !err.toLowerCase().includes(keyword.toLowerCase()));
      }
      
      // If no errors left, mark row as valid
      if (row.errors.length === 0) {
        row.isValid = true;
      }
    }

    newData[index] = row;
    setPreviewData(newData);
  };

  const handleConfirmImport = async () => {
    // Check if there are still errors
    const hasErrors = previewData.some(row => row.errors.length > 0);

    if (hasErrors) {
      const confirm = window.confirm(
        "Some rows still have errors. If you proceed, invalid fields (like Email, Date) will be set to empty/null.\n\nDo you want to continue?"
      );
      if (!confirm) return;
    }

    setIsLoading(true);
    try {
      // Send data to backend (Backend will handle null mapping)
      await saveImportedTasks(projectId, previewData);
      showToast("Imported successfully!", "success");
      onSuccess();
      onClose();
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

  // Tính toán có bao nhiêu dòng lỗi
  const errorCount = previewData.filter(r => !r.isValid || r.errors.length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-xl shadow-2xl w-full flex flex-col transition-all duration-300 ${step === 2 ? 'max-w-6xl h-[90vh]' : 'max-w-lg max-h-[90vh]'}`}>
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {step === 1 ? "Import Tasks" : "Review & Edit Data"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 1 ? "Upload CSV to start" : `Found ${previewData.length} rows. Please review errors before importing.`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full">
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
                      <Download className="w-3 h-3 mr-2" /> Download .CSV
                    </Button>
                  </div>
               </div>

               {/* Upload Box */}
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all"
               >
                 <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
                 <p className="font-medium text-slate-700">Click to upload CSV</p>
                 <p className="text-xs text-slate-400 mt-1">Max size 5MB</p>
                 <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0] || null)} accept=".csv" className="hidden" />
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
                <div className="bg-red-50 px-6 py-2 border-b border-red-100 flex items-center gap-2 text-red-700 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4" />
                 {errorCount} rows contain errors. Please correct them directly in the table or upload another file.
                </div>
              ) : (
                <div className="bg-green-50 px-6 py-2 border-b border-green-100 flex items-center gap-2 text-green-700 text-xs font-medium">
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
                          {/* Dòng dữ liệu */}
                          <tr className={`group hover:bg-slate-50 transition-colors ${hasError ? 'bg-red-50/50' : ''}`}>
                            <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                            
                            {/* TITLE (TEXT INPUT) */}
                            <td className="p-2">
                              <input 
                                className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-2 py-1 outline-none transition-all"
                                value={row.title || ""}
                                onChange={(e) => handleCellChange(idx, "title", e.target.value)}
                              />
                            </td>

                            {/* ASSIGNEE (TEXT INPUT - Vì email có thể nhập sai nên cần sửa text) */}
                            <td className="p-2 relative">
                              <input 
                                className={`w-full bg-transparent border rounded px-2 py-1 outline-none transition-all ${
                                  row.errors.some(e => e.toLowerCase().includes("user")) 
                                    ? "border-red-300 bg-red-50 text-red-700 focus:border-red-500" 
                                    : "border-transparent hover:border-slate-300 focus:border-blue-500"
                                }`}
                                value={row.assigneeEmail || ""}
                                onChange={(e) => handleCellChange(idx, "assigneeEmail", e.target.value)}
                                placeholder="example@email.com"
                              />
                            </td>

                            {/* STATUS (DROPDOWN - Lấy từ props) */}
                            <td className="p-2">
                              <select 
                                className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1 py-1 outline-none cursor-pointer"
                                value={row.statusName || ""}
                                onChange={(e) => handleCellChange(idx, "statusName", e.target.value)}
                              >
                                {statuses.map(s => (
                                  <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                              </select>
                            </td>

                            {/* PRIORITY (DROPDOWN) */}
                            <td className="p-2">
                              <select 
                                className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1 py-1 outline-none cursor-pointer uppercase"
                                value={row.priority || "MEDIUM"}
                                onChange={(e) => handleCellChange(idx, "priority", e.target.value)}
                              >
                                {PRIORITIES.map(p => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </select>
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

                            {/* METRICS (NUMBER) */}
                            <td className="p-2">
                              <input 
                                type="number"
                                className="w-full text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded py-1 outline-none"
                                value={row.storyPoints || 0}
                                onChange={(e) => handleCellChange(idx, "storyPoints", Number(e.target.value))}
                              />
                            </td>
                            <td className="p-2">
                              <input 
                                type="number"
                                className="w-full text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded py-1 outline-none"
                                value={row.estimatedHours || 0}
                                onChange={(e) => handleCellChange(idx, "estimatedHours", Number(e.target.value))}
                              />
                            </td>
                          </tr>

                          {/* Dòng hiển thị lỗi (Nếu có) */}
                          {hasError && (
                            <tr className="bg-red-50/30">
                              <td colSpan={8} className="px-4 pb-2 pt-0">
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
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancel
            </Button>
            
            {step === 1 ? (
              <Button onClick={handleFileUpload} disabled={!file || isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                Continue: Review
              </Button>
            ) : (
              <Button onClick={handleConfirmImport} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save {previewData.length} Tasks
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}