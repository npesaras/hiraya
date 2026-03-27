import { USER_ROLES } from '#shared/utils/appwrite'

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return
  }

  const { ensureSession, profile } = useAuth()
  const sessionUser = await ensureSession()

  if (!sessionUser) {
    return navigateTo('/signin')
  }

  if (!profile.value || profile.value.role !== USER_ROLES.PANELIST_CHECKER) {
    return navigateTo('/signin?error=role')
  }
})
