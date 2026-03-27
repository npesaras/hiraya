import { createAppwriteAdminClient, getAppwriteAdminConfig } from '~~/server/utils/appwrite-admin'
import { requireAppwriteSessionUser } from '~~/server/utils/appwrite-session'
import { getUserProfileByUserId } from '~~/server/utils/user-profiles'

export default defineEventHandler(async (event) => {
  const config = getAppwriteAdminConfig()

  if (!config.configured) {
    return {
      ok: false,
      profile: null,
      missing: config.missing
    }
  }

  const sessionUser = await requireAppwriteSessionUser(event)
  const { tablesDB } = createAppwriteAdminClient(config.value)
  const profile = await getUserProfileByUserId(tablesDB, config.value, sessionUser.$id)

  return {
    ok: true,
    profile
  }
})
