"use client"
import AuthModal from "@/components/features/auth/AuthModal"

export default function LoginPage() {
  return <AuthModal isOpen={true} onClose={() => (window.location.href = "/")} />
}
