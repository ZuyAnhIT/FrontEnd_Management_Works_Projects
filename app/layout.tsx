import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ClientProviders from "./ClientProviders"; // ⭐ Dùng client provider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkNet - Smart Project Management",
  description: "Manage projects, tasks, and teams efficiently.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
