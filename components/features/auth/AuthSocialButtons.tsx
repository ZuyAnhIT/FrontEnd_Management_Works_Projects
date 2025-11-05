"use client";
import { Chrome, Github } from "lucide-react";

export default function AuthSocialButtons() {
  return (
    <div className="mt-4">
      <div className="relative my-3 text-center text-gray-400 text-xs">
        <span className="bg-white px-2">hoặc</span>
        <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200"></div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
        >
          <Chrome className="w-4 h-4 text-blue-500" />
          <span>Google</span>
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
        >
          <Github className="w-4 h-4 text-gray-700" />
          <span>GitHub</span>
        </button>
      </div>
    </div>
  );
}
