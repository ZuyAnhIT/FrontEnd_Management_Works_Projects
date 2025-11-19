"use client";

import { useEffect, useState } from "react";
import { updateUserProfile } from "@/services/apiUser";
import { useToast } from "@/components/ui/ToastProvider";
import { User, Calendar, Phone, Image as ImageIcon, Loader2, AtSign, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Giả sử có
import LoadingButton from "@/components/ui/LoadingButton";

type GenderType = "MALE" | "FEMALE" | "OTHER";

interface ProfileForm {
  fullName: string;
  avatarUrl: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: GenderType;
  email?: string;
}

export default function ProfilePage() {
  const { showToast } = useToast();
  const { user, isLoading: isAuthLoading, refreshUser } = useAuth(); // Thêm refreshUser để cập nhật context sau khi save

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    avatarUrl: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "MALE",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        avatarUrl: user.avatarUrl || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
        gender: (user.gender as GenderType) || "MALE",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      showToast("Full name is required.", "warning");
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile({
        fullName: form.fullName,
        avatarUrl: form.avatarUrl,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
      });
      await refreshUser(); // Cập nhật lại thông tin user trong context
      showToast("Profile updated successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (isAuthLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-500">
      
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        
        {/* Header */}
        <CardHeader className="border-b border-slate-100 px-8 py-6 bg-white">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                 <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                 <CardTitle className="text-xl font-bold text-slate-900">Personal Profile</CardTitle>
                 <p className="text-sm text-slate-500 mt-0.5">Manage your personal information</p>
              </div>
           </div>
        </CardHeader>

        {/* Body */}
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section: Identity */}
            <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                    Identity
                </h3>
                
                {/* Email (Read-only) */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <AtSign className="w-4 h-4 text-slate-400" /> Email
                    </label>
                    <Input 
                        value={form.email} 
                        disabled 
                        className="bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed" 
                    />
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" /> Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input 
                        value={form.fullName} 
                        onChange={(e) => handleChange("fullName", e.target.value)} 
                        placeholder="e.g. John Doe"
                        className="focus:ring-blue-100 focus:border-blue-600"
                    />
                </div>
            </div>

            {/* Section: Contact & Details */}
            <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                    Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" /> Phone
                        </label>
                        <Input 
                            value={form.phoneNumber} 
                            onChange={(e) => handleChange("phoneNumber", e.target.value)} 
                            placeholder="+1 234 567 890"
                        />
                    </div>

                    {/* DOB */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" /> Date of Birth
                        </label>
                        <Input 
                            type="date"
                            value={form.dateOfBirth} 
                            onChange={(e) => handleChange("dateOfBirth", e.target.value)} 
                        />
                    </div>
                    
                    {/* Gender */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" /> Gender
                        </label>
                        <div className="relative">
                            <select 
                                value={form.gender} 
                                onChange={(e) => handleChange("gender", e.target.value as GenderType)}
                                className="w-full h-10 pl-3 pr-8 border border-slate-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 appearance-none cursor-pointer"
                            >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: Avatar */}
            <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                    Avatar
                </h3>
                <div className="flex items-start gap-6">
                    <div className="relative w-24 h-24 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                        {form.avatarUrl ? (
                             <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-300">
                                 <User className="w-10 h-10" />
                             </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                             <ImageIcon className="w-4 h-4 text-slate-400" /> Image URL
                        </label>
                        <Input 
                            value={form.avatarUrl} 
                            onChange={(e) => handleChange("avatarUrl", e.target.value)} 
                            placeholder="https://example.com/avatar.png"
                        />
                        <p className="text-xs text-slate-500">Paste a direct link to an image (JPG, PNG).</p>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
                <LoadingButton
                    type="submit"
                    isLoading={saving}
                    text="Save Changes"
                    loadingText="Saving..."
                    className="bg-blue-600 hover:bg-blue-700 font-bold px-8 shadow-sm"
                />
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}