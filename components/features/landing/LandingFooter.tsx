// Đây là Server Component, không cần "use client"
export default function LandingFooter() {
  return (
    <footer className="py-10 bg-white border-t border-gray-100 text-center text-gray-500 text-sm">
      © {new Date().getFullYear()} WorkNet. Made by ❤️ 3S_TC_CANDYHZ, Duc Smile
    </footer>
  );
}
