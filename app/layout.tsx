import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

// ❌ Xóa hai dòng này vì chúng không tồn tại thật sự
// import { GeistSans } from "geist/font/sans";
// import { GeistMono } from "geist/font/mono";

// ✅ Đặt biến đúng tên, không cần chữ hoa ở giữa
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
        // ✅ Dùng biến đã khai báo đúng tên
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          {/* ✅ ToastProvider nên nằm ngoài AuthProvider */}
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
