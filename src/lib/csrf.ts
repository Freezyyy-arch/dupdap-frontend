import type { InternalAxiosRequestConfig } from 'axios';

/** Cookie the backend sets (NOT httpOnly) holding the CSRF token (#767). */
export const CSRF_COOKIE_NAME = 'csrf_token';
/** Header that must echo the cookie value on state-mutating requests (#767). */
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

/** Reads the CSRF cookie from document.cookie; null on the server or if absent. */
export function readCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  for (const part of document.cookie.split(';')) {
    const [rawName, ...rest] = part.trim().split('=');
    if (rawName === CSRF_COOKIE_NAME) {
      const value = rest.join('=');
      try {
        return value ? decodeURIComponent(value) : null;
      } catch {
        return value || null;
      }
    }
  }
  return null;
}

/**
 * Axios request interceptor implementing the double-submit-cookie pattern:
 * copies the CSRF cookie into a header on POST/PUT/PATCH/DELETE requests.
 * Safe methods (GET/HEAD/OPTIONS) are left untouched.
 */
export function csrfRequestInterceptor(
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig {
  const method = (config.method ?? 'get').toLowerCase();
  if (!MUTATING_METHODS.has(method)) return config;
  const token = readCsrfToken();
  if (token) config.headers.set(CSRF_HEADER_NAME, token);
  return config;
}
