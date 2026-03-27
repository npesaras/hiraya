import { createError } from 'h3'
import { createAppwriteAdminClient, getAppwriteAdminConfig } from '~~/server/utils/appwrite-admin'
import { getFacultyApplicationDocuments, requireFacultyProfile } from '~~/server/utils/faculty'
import { requireAppwriteSessionUser } from '~~/server/utils/appwrite-session'

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
  await requireFacultyProfile(tablesDB, config.value, sessionUser.$id)

  const documents = await getFacultyApplicationDocuments(tablesDB, config.value, {
    applicationId,
    userId: sessionUser.$id
  })

  return {
    ok: true,
    documents
  }
})
