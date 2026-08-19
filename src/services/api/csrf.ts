// Double-submit CSRF: the backend sets a non-httpOnly `aivra_csrf` cookie
// alongside the httpOnly refresh-token cookie. We read it here and echo it
// back as a header on mutating requests — see app/shared/security/csrf.py
// on the backend for the verification side of this contract.
const CSRF_COOKIE_NAME = 'aivra_csrf'

export function readCsrfToken(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}
