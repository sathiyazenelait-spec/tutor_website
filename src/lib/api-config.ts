// Centralized API configuration for TutorSphere
// Defaults to the live Render backend: https://tutor-portal-backend.onrender.com
// Can be customized via VITE_BACKEND_URL or VITE_API_BASE_URL environment variables in Cloudflare Pages.

export const BACKEND_URL =
  (import.meta.env as Record<string, string | undefined>)["VITE_BACKEND_URL"] ||
  (import.meta.env as Record<string, string | undefined>)["VITE_API_BASE_URL"] ||
  "https://tutor-portal-backend.onrender.com";

export const API_BASE = `${BACKEND_URL}/api`;
