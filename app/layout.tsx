import type { Metadata } from "next";
// 1. Đảm bảo Geist_Mono được import
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// 2. Đảm bảo hằng số này tồn tại
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkNet",
  description: "Quản lý dự án thông minh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        // 3. Lỗi xảy ra ở đây vì 'geistMono' không được định nghĩa
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          {/* Sửa thứ tự Provider (Toast bên ngoài) */}
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
