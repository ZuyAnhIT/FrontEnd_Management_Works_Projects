import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind CSS classes conditionally.
 * Combines 'clsx' for conditional classes and 'tailwind-merge' to resolve conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a full URL for an image path.
 * Handles local previews (blob:), external URLs (http), and relative backend paths.
 * * @param path - The relative path (e.g., "uploads/avatar.jpg") or full URL.
 * @returns The complete URL or null if path is invalid.
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  // 1. If it's a local preview (blob:) or an external link (http...), return as is.
  if (path.startsWith("blob:") || path.startsWith("http")) {
    return path;
  }

  // 2. Determine the Base URL for static assets.
  // We prioritize the environment variable, falling back to localhost.
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

  // Logic: Spring Boot often serves static files at root (e.g., /uploads), not /api/uploads.
  // So if the API_URL ends with "/api", we strip it to get the domain root.
  if (baseUrl.endsWith("/api")) {
    baseUrl = baseUrl.replace(/\/api$/, "");
  }

  // 3. Normalize the path to avoid double slashes (e.g., "localhost/" + "/uploads")
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  return `${baseUrl}/${cleanPath}`;
}