export const USER_ROLES = {
  FACULTY_APPLICANT: 'faculty_applicant',
  PANELIST_CHECKER: 'panelist_checker'
} as const

export const APPLICATION_STATUSES = [
  'Draft',
  'Submitted',
  'Under Review',
  'Returned for Revision',
  'Resubmitted',
  'Decision Recorded',
  'Closed'
] as const

export const PANEL_OUTCOMES = [
  'Recommended',
  'Not Recommended',
  'Returned for Revision'
] as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]
export type PanelOutcome = (typeof PANEL_OUTCOMES)[number]

export function getDashboardRouteForRole(
  role?: string | null
): '/faculty/dashboard' | '/panelist/dashboard' | null {
  if (role === USER_ROLES.FACULTY_APPLICANT) {
    return '/faculty/dashboard'
  }

  if (role === USER_ROLES.PANELIST_CHECKER) {
    return '/panelist/dashboard'
  }

  return null
}

export function getRoleLabel(role?: string | null): string | null {
  if (role === USER_ROLES.FACULTY_APPLICANT) {
    return 'Faculty'
  }

  if (role === USER_ROLES.PANELIST_CHECKER) {
    return 'Panelist/Checker'
  }

  return null
}
