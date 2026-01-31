/**
 * Get the appropriate API URL based on environment
 * 
 * - Build time / SSR: Uses direct backend URL from BACKEND_HTTP_URL
 * - Client side: Uses proxy to avoid CORS and mixed content issues
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present (we'll add it)
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // 1. Reliable Server Check: Only server has non-public env vars
  // If BACKEND_HTTP_URL is available, we are definitely on the server
  if (process.env.BACKEND_HTTP_URL) {
    return `${process.env.BACKEND_HTTP_URL}${cleanPath}`;
  }

  // 2. Standard Server Check (fallback)
  // If window is undefined, we are on server (build or SSR)
  if (typeof window === 'undefined') {
    // Hardcoded fallback to ensure build succeeds even if env var is missing
    return `http://34.131.16.200:3000/api/v1${cleanPath}`;
  }
  
  // 3. Client-side (browser)
  return `/api/proxy${cleanPath}`;
}

/**
 * Fetch wrapper that automatically uses the correct API URL
 */
export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = getApiUrl(path);
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
