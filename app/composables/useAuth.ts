import type { Models } from 'appwrite'
import {
  USER_ROLES,
  getDashboardRouteForRole,
  type UserRole
} from '#shared/utils/appwrite'

type AuthUser = Models.User<Models.Preferences>

export type UserProfile = {
  $id: string
  user_id: string
  full_name: string
  role: UserRole
  department?: string
  college_or_office?: string
  employee_no?: string
  phone?: string
}

type SignInInput = {
  email: string
  password: string
}

type RegisterFacultyInput = {
  email: string
  password: string
  fullName: string
  department?: string
}

type RegisterFacultyResponse = {
  ok: boolean
  userId: string
  profile: UserProfile
}

type CurrentProfileResponse = {
  ok: boolean
  profile: UserProfile | null
}

function messageFromUnknown(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

function routeForRole(role?: string | null): '/faculty/dashboard' | '/panelist/dashboard' | null {
  return getDashboardRouteForRole(role)
}

export function useAuth() {
  const nuxtApp = useNuxtApp()
  const appwrite = nuxtApp.$appwrite

  const user = useState<AuthUser | null>('auth:user', () => null)
  const profile = useState<UserProfile | null>('auth:profile', () => null)
  const hydrated = useState<boolean>('auth:hydrated', () => false)

  function hasConfiguredClient() {
    return Boolean(appwrite && appwrite.configured)
  }

  async function getRestAuthHeaders() {
    if (!hasConfiguredClient()) {
      throw new Error('Appwrite client is not configured. Set endpoint and project ID env vars.')
    }

    const jwt = await appwrite!.account.createJWT({
      duration: 900
    })

    return {
      Authorization: `Bearer ${jwt.jwt}`
    }
  }

  async function fetchCurrentProfile(): Promise<UserProfile | null> {
    if (!hasConfiguredClient()) {
      return null
    }

    try {
      const result = await $fetch<CurrentProfileResponse>('/api/me/profile', {
        headers: await getRestAuthHeaders()
      })

      return result.profile
    } catch {
      return null
    }
  }

  async function ensureSession(force = false): Promise<AuthUser | null> {
    if (import.meta.server) {
      return user.value
    }

    if (!hasConfiguredClient()) {
      hydrated.value = true
      return null
    }

    if (!force && hydrated.value) {
      return user.value
    }

    try {
      const activeUser = await appwrite!.account.get()
      user.value = activeUser
      profile.value = await fetchCurrentProfile()
      hydrated.value = true
      return activeUser
    } catch {
      user.value = null
      profile.value = null
      hydrated.value = true
      return null
    }
  }

  async function signIn(input: SignInInput): Promise<AuthUser> {
    if (!hasConfiguredClient()) {
      throw new Error('Appwrite client is not configured. Set endpoint and project ID env vars.')
    }

    await appwrite!.account.createEmailPasswordSession({
      email: input.email,
      password: input.password
    })

    const activeUser = await ensureSession(true)

    if (!activeUser) {
      throw new Error('Sign in succeeded but no active session was found.')
    }

    const activeProfile = profile.value || await fetchCurrentProfile()

    if (!activeProfile) {
      await signOut()
      throw new Error('This account is not provisioned in the database yet.')
    }

    if (!routeForRole(activeProfile.role)) {
      await signOut()
      throw new Error('This account role is not mapped to a supported FSMES dashboard.')
    }

    profile.value = activeProfile
    return activeUser
  }

  async function registerFaculty(input: RegisterFacultyInput): Promise<RegisterFacultyResponse> {
    if (!hasConfiguredClient()) {
      throw new Error('Appwrite client is not configured. Set endpoint and project ID env vars.')
    }

    return await $fetch<RegisterFacultyResponse>('/api/auth/faculty/register', {
      method: 'POST',
      body: {
        email: input.email,
        password: input.password,
        fullName: input.fullName,
        department: input.department || ''
      }
    })
  }

  async function signOut() {
    if (!hasConfiguredClient()) {
      user.value = null
      profile.value = null
      hydrated.value = true
      return
    }

    try {
      await appwrite!.account.deleteSession({ sessionId: 'current' })
    } catch {
      // Ignore session-not-found errors.
    } finally {
      user.value = null
      profile.value = null
      hydrated.value = true
    }
  }

  function assertFacultyRole() {
    if (!profile.value || profile.value.role !== USER_ROLES.FACULTY_APPLICANT) {
      throw new Error('This page is available only for Faculty accounts.')
    }
  }

  return {
    user: readonly(user),
    profile: readonly(profile),
    ensureSession,
    signIn,
    registerFaculty,
    signOut,
    assertFacultyRole,
    getRestAuthHeaders,
    routeForRole,
    messageFromUnknown
  }
}
