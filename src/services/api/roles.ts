// Mirrors app/shared/rbac/roles.py's PlatformRole — AIVRA-internal roles,
// independent of any customer organization membership. This is a UX
// convenience for routing/nav only; every admin API call is re-checked
// server-side via require_platform_role(), which is the real boundary.
export const PLATFORM_ADMIN_ROLES = ['aivra_admin', 'aivra_engineer'] as const
export type PlatformAdminRole = (typeof PLATFORM_ADMIN_ROLES)[number]

export function isPlatformAdminRole(role: string | null): role is PlatformAdminRole {
  return role !== null && (PLATFORM_ADMIN_ROLES as readonly string[]).includes(role)
}
