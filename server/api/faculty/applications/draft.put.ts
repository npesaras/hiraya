import { createError, readBody } from 'h3'
import type { FacultyApplicationDraftPayload } from '#shared/utils/faculty-application'
import { createAppwriteAdminClient, getAppwriteAdminConfig } from '~~/server/utils/appwrite-admin'
import {
  getFacultyApplicationDocuments,
  mapFacultyApplicationDocumentRow,
  mapFacultyApplicationRow,
  requireFacultyProfile,
  saveFacultyApplicationDraft
} from '~~/server/utils/faculty'
import { requireAppwriteSessionUser } from '~~/server/utils/appwrite-session'

export default defineEventHandler(async (event) => {
  const config = getAppwriteAdminConfig()

  if (!config.configured) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Appwrite configuration is incomplete.'
    })
  }

  const body = await readBody<Partial<FacultyApplicationDraftPayload>>(event)
  const sessionUser = await requireAppwriteSessionUser(event)
  const { tablesDB } = createAppwriteAdminClient(config.value)
  await requireFacultyProfile(tablesDB, config.value, sessionUser.$id)

  const application = await saveFacultyApplicationDraft(tablesDB, config.value, {
    userId: sessionUser.$id,
    payload: body || {}
  })
  const documents = await getFacultyApplicationDocuments(tablesDB, config.value, {
    applicationId: application.$id,
    userId: sessionUser.$id
  })

  return {
    ok: true,
    editable: true,
    application: mapFacultyApplicationRow(application),
    documents: documents.map(mapFacultyApplicationDocumentRow)
  }
})
