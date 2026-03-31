"use client";

// =============================================================================
// 1. IMPORT (Thu vien -> Noi bo)
// =============================================================================

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Context & Providers
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { AuthProvider } from "@/context/AuthContext";

// =============================================================================
// 2. INTERFACES & TYPES
// =============================================================================

interface ClientProvidersProps {
    children: React.ReactNode;
}

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Client Providers Wrapper.
 * Bao boc toan bo ung dung voi cac Context can thiet hoat dong tren Client.
 * Thu tu long nhau (Nesting) duoc giu nguyen de dam bao dung logic phu thuoc.
 */
export default function ClientProviders({ children }: ClientProvidersProps) {
    
    // ---------------------------------------------------------------------------
    // 4. CONSTANTS
    // ---------------------------------------------------------------------------
    
    // Lay Google Client ID tu bien moi truong an toan
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    // ---------------------------------------------------------------------------
    // 5. RENDER LOGIC
    // ---------------------------------------------------------------------------

    return (
        <ThemeProvider>
            <LanguageProvider>
                <GoogleOAuthProvider clientId={googleClientId}>
                    <ToastProvider>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </ToastProvider>
                </GoogleOAuthProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}