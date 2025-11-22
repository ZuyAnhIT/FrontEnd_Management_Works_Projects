"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/services/apiUser";
import { useToast } from "@/components/ui/ToastProvider";
import LoadingButton from "@/components/ui/LoadingButton";
import InputField from "@/components/features/auth/InputField";
import { 
  User, Phone, Calendar, Camera, UploadCloud, Loader2, Mail 
} from "lucide-react";

// Hàm tiện ích xử lý URL ảnh (Bạn có thể tách ra file utils.ts nếu muốn)
const getFullImageUrl = (path: string | null | undefined) => {
  if (!path) return null;

  // 1. Nếu là ảnh preview từ máy (blob:...) hoặc ảnh online (http...) thì giữ nguyên
  if (path.startsWith("blob:") || path.startsWith("http")) {
    return path;
  }

  // 2. Cấu hình Domain Backend (Nên lấy từ biến môi trường)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

  // 3. Xử lý chuẩn hóa đường dẫn
  // Loại bỏ dấu / ở đầu nếu có để tránh bị double slash //
  let cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Kiểm tra xem path đã có chữ "uploads" chưa, nếu chưa thì thêm vào
  if (!cleanPath.startsWith("uploads/")) {
      cleanPath = `uploads/${cleanPath}`;
  }

  // Kết quả: http://localhost:8082/uploads/avatars/filename.jpg
  return `${API_URL}/${cleanPath}`;
};

export default function ProfileSettingsPage() {
  const { user, refreshUser, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();
  
  // Ref để kích hoạt input file ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);

  // State Form Text
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "", // Format: YYYY-MM-DD
    gender: "MALE",
  });

  // State xử lý ảnh Avatar
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // =================================================================
  // 1️⃣ LOAD DATA TỪ CONTEXT VÀO FORM
  // =================================================================
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        // Cắt chuỗi ngày giờ nếu API trả về ISO string (2023-01-01T00:00...)
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "", 
        gender: (user.gender as string) || "MALE",
      });

      // ✅ XỬ LÝ URL ẢNH TẠI ĐÂY
      setPreviewUrl(getFullImageUrl(user.avatarUrl)); 
    }
  }, [user]);

  // Cleanup URL preview để tránh memory leak khi component unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);


  // =================================================================
  // 2️⃣ XỬ LÝ CHỌN FILE ẢNH (VALIDATION & PREVIEW)
  // =================================================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🛡️ Validate Size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB", "error");
      return;
    }
    // 🛡️ Validate Type
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (JPG, PNG)", "error");
      return;
    }

    // Tạo Preview ngay lập tức (UX tốt hơn)
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
  };


  // =================================================================
  // 3️⃣ XỬ LÝ SUBMIT FORM
  // =================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Gọi Service cập nhật (gồm cả Text + File)
      // Lưu ý: Hàm này sử dụng logic "Cách 2 (Blob JSON)" bạn đã xác nhận chạy OK
      await updateUserProfile({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender as "MALE" | "FEMALE" | "OTHER",
        avatarFile: selectedFile, // Truyền file vào đây (nếu có)
      });

      showToast("Profile updated successfully!", "success");
      
      // 🔄 Refresh lại AuthContext để Header/Sidebar cập nhật ảnh mới
      await refreshUser();
      
      // Reset file selection state (để input file rỗng)
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      
    } catch (error: any) {
      showToast(error.message || "Update failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Nếu đang load user lần đầu
  if (isAuthLoading || !user) {
    return (
       <div className="flex items-center justify-center h-64 bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
       </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Personal Profile</h1>
        <p className="text-sm text-slate-500">Manage your identity and contact information.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* --- PHẦN 1: ẢNH ĐẠI DIỆN (AVATAR SECTION) --- */}
        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-8">
          
          {/* Vòng tròn Avatar + Overlay */}
          <div 
            className="relative group cursor-pointer shrink-0" 
            onClick={() => fileInputRef.current?.click()}
            title="Change profile picture"
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[4px] border-white shadow-md overflow-hidden bg-slate-200 relative">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    // Fallback nếu ảnh lỗi link
                    e.currentTarget.src = ""; 
                    e.currentTarget.style.display = "none";
                    // Hiển thị lại icon User mặc định (bạn có thể xử lý state riêng nếu muốn kỹ hơn)
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                  <User className="w-14 h-14" />
                </div>
              )}

              {/* Nếu ảnh bị lỗi (display: none ở trên) hoặc chưa có ảnh thì hiện icon này đè lên */}
              {previewUrl && (
                  <div className="absolute inset-0 hidden group-[.image-error]:flex items-center justify-center bg-slate-100 text-slate-400">
                      <User className="w-14 h-14" />
                  </div>
              )}
              
              {/* Overlay tối khi hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center backdrop-blur-[1px]">
                <Camera className="w-8 h-8 text-white drop-shadow-md" />
              </div>
            </div>

            {/* Nút upload icon nhỏ */}
            <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
               <UploadCloud className="w-4 h-4" />
            </div>
          </div>

          {/* Text hướng dẫn */}
          <div className="text-center sm:text-left space-y-1">
            <h3 className="font-semibold text-slate-900 text-lg">Profile Picture</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Supports JPG, PNG, GIF. Max size 5MB. <br/>
              Click the image to upload a new photo.
            </p>
          </div>
          
          {/* Input File Ẩn */}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
          />
        </div>

        {/* --- PHẦN 2: FORM THÔNG TIN (DETAILS SECTION) --- */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Read-only Email */}
          <div className="grid grid-cols-1 gap-1">
             <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" /> Email Address
             </label>
             <div className="h-10 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-md text-slate-500 text-sm cursor-not-allowed">
               {user.email}
               <span className="ml-auto text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">Read-only</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <InputField
              label="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({...form, fullName: e.target.value})}
              icon={<User className="w-4 h-4 text-slate-400"/>}
              placeholder="e.g. Nguyen Van A"
            />

            {/* Phone */}
            <InputField
              label="Phone Number"
              value={form.phoneNumber}
              onChange={(e) => setForm({...form, phoneNumber: e.target.value})}
              icon={<Phone className="w-4 h-4 text-slate-400"/>}
              placeholder="+84 901 234 567"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-slate-400" /> Date of Birth
              </label>
              <input 
                type="date" 
                value={form.dateOfBirth}
                onChange={(e) => setForm({...form, dateOfBirth: e.target.value})}
                className="w-full h-10 px-3 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-slate-700"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">Gender</label>
              <div className="relative">
                <select 
                    value={form.gender}
                    onChange={(e) => setForm({...form, gender: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none bg-white appearance-none cursor-pointer transition-all text-slate-700"
                >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                </select>
                {/* Custom Arrow Icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <LoadingButton 
            text="Save Changes" 
            isLoading={isSaving} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-sm font-medium"
          />
        </div>

      </form>
    </div>
  );
}