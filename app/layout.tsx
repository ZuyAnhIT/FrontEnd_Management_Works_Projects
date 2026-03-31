// =============================================================================
// 1. IMPORT (Thu vien -> Noi bo -> Styles)
// =============================================================================

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Internal Components
import ClientProviders from "./ClientProviders";

// =============================================================================
// 2. CONFIGURATION & TYPES
// =============================================================================

interface RootLayoutProps {
    children: React.ReactNode;
}

// Cau hinh font chu Geist (Sans)
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

// Cau hinh font chu Geist (Mono)
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// Khai bao sieu du lieu (SEO Metadata) cho toan he thong
export const metadata: Metadata = {
    title: "WorkNet - Smart Project Management",
    description: "Manage projects, tasks, and teams efficiently.",
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Root Layout.
 * Bao boc toan bo cay thu muc cua ung dung.
 * Thiet lap ngon ngu, font chu va mau sac nen tang mac dinh cho toan bo he thong.
 */
export default function RootLayout({ children }: RootLayoutProps) {
    
    // ---------------------------------------------------------------------------
    // 4. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <html lang="en">
            <body
                className={`
                    ${geistSans.variable} ${geistMono.variable} 
                    antialiased 
                    bg-[#F4F5F7] text-[#172B4D] 
                    dark:bg-[#091E42] dark:text-[#DFE1E6]
                `}
            >
                <ClientProviders>
                    {children}
                </ClientProviders>
            </body>
        </html>
    );
}