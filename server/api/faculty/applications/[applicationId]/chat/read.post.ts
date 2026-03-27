import { createError } from 'h3'
import { createAppwriteAdminClient, getAppwriteAdminConfig } from '~~/server/utils/appwrite-admin'
import { requireAppwriteSessionUser } from '~~/server/utils/appwrite-session'
import { ensureFacultyApplicationThread, markThreadReadForUser } from '~~/server/utils/faculty-chat'
import { getFacultyApplicationById, requireFacultyProfile } from '~~/server/utils/faculty'

export default defineEventHandler(async (event) => {
  const config = getAppwriteAdminConfig()

  if (!config.configured) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Appwrite configuration is incomplete.'
    })
  }

  const applicationId = getRouterParam(event, 'applicationId')

  if (!applicationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Application ID is required.'
    })
  }

  const sessionUser = await requireAppwriteSessionUser(event)
  const { tablesDB } = createAppwriteAdminClient(config.value)
  const profile = await requireFacultyProfile(tablesDB, config.value, sessionUser.$id)
  const application = await getFacultyApplicationById(tablesDB, config.value, {
    applicationId,
    userId: sessionUser.$id
  })
  const threadContext = await ensureFacultyApplicationThread(tablesDB, config.value, {
    application,
    profile
  })
  const participant = await markThreadReadForUser(tablesDB, config.value, {
    threadId: threadContext.thread.$id,
    userId: sessionUser.$id
  })

  return {
    ok: true,
    participant
  }
})
