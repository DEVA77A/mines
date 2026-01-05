// Shared API base URL resolver for deployments (Render/Vercel/local)

function stripTrailingSlash(url) {
  return String(url || '').replace(/\/+$/, '');
}

/**
 * Resolve the backend API base URL.
 *
 * Priority:
 * 1) Build-time env var REACT_APP_API_URL (recommended for Render/Vercel)
 * 2) Heuristic for Render: replace "frontend" -> "backend" in hostname
 * 3) Same-origin (works if a reverse proxy/rewrites are configured)
 * 4) Local dev fallback
 */
export function resolveApiBaseUrl() {
  const envUrl = stripTrailingSlash(process.env.REACT_APP_API_URL);
  if (envUrl) return envUrl;

  // In production builds, never default to localhost (causes timeouts/CORS in deployed sites)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;

    if (host && host.includes('onrender.com') && host.includes('frontend')) {
      return stripTrailingSlash(`https://${host.replace('frontend', 'backend')}`);
    }

    // If rewrites/proxy are configured, same-origin relative API calls can work
    return stripTrailingSlash(window.location.origin);
  }

  return 'http://localhost:8000';
}

export const API_BASE_URL = resolveApiBaseUrl();
