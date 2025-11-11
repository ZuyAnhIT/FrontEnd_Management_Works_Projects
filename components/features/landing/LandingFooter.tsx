// Đây là Server Component, không cần "use client"
export default function LandingFooter() {
  return (
    <footer className="py-10 bg-white border-t border-gray-100 text-center text-gray-500 text-sm">
      © {new Date().getFullYear()} WorkNet. Made with ❤️ in Germany 🇩🇪
    </footer>
  );
}
