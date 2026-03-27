import { createError } from 'h3'
import { createAppwriteAdminClient, getAppwriteAdminConfig } from '~~/server/utils/appwrite-admin'
import { getFacultyActivityLogs, requireFacultyProfile } from '~~/server/utils/faculty'
import { requireAppwriteSessionUser } from '~~/server/utils/appwrite-session'

export default defineEventHandler(async (event) => {
  const config = getAppwriteAdminConfig()

  if (!config.configured) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Appwrite configuration is incomplete.'
    })
  }

  const sessionUser = await requireAppwriteSessionUser(event)
  const { tablesDB } = createAppwriteAdminClient(config.value)
  await requireFacultyProfile(tablesDB, config.value, sessionUser.$id)

  const activities = await getFacultyActivityLogs(tablesDB, config.value, sessionUser.$id)

  return {
    ok: true,
    activities
  }
})
