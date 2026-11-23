import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, it, expect } from 'vitest';

import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  csrfRequestInterceptor,
  readCsrfToken,
} from './csrf';

function cfg(method: string): InternalAxiosRequestConfig {
  return { method, headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
}

afterEach(() => {
  document.cookie = `${CSRF_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
});

describe('csrf', () => {
  it('reads the token from the cookie', () => {
    document.cookie = `${CSRF_COOKIE_NAME}=abc%20123; path=/`;
    expect(readCsrfToken()).toBe('abc 123');
  });

  it('returns null when the cookie is absent', () => {
    expect(readCsrfToken()).toBeNull();
  });

  it.each(['post', 'put', 'patch', 'delete', 'POST'])(
    'adds the header on %s',
    (method) => {
      document.cookie = `${CSRF_COOKIE_NAME}=tok; path=/`;
      const out = csrfRequestInterceptor(cfg(method));
      expect(out.headers.get(CSRF_HEADER_NAME)).toBe('tok');
    }
  );

  it.each(['get', 'head', 'options'])('does not add the header on %s', (method) => {
    document.cookie = `${CSRF_COOKIE_NAME}=tok; path=/`;
    const out = csrfRequestInterceptor(cfg(method));
    expect(out.headers.get(CSRF_HEADER_NAME)).toBeFalsy();
  });

  it('does not add the header when no cookie exists', () => {
    const out = csrfRequestInterceptor(cfg('post'));
    expect(out.headers.get(CSRF_HEADER_NAME)).toBeFalsy();
  });
});
