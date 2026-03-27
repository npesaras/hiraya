import { createError, readMultipartFormData } from 'h3'
import type { FacultyRequiredDocumentCode } from '#shared/utils/faculty-application'
import { createAppwriteAdminClient, getAppwriteAdminConfig } from '~~/server/utils/appwrite-admin'
import {
  getFacultyApplicationDocuments,
  mapFacultyApplicationDocumentRow,
  requireFacultyProfile,
  uploadFacultyApplicationDocument
} from '~~/server/utils/faculty'
import { requireAppwriteSessionUser } from '~~/server/utils/appwrite-session'

function readStringPart(data?: Uint8Array) {
  return data ? new TextDecoder().decode(data).trim() : ''
}

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

  const parts = await readMultipartFormData(event)
  const requirementCode = readStringPart(parts?.find((part) => part.name === 'requirementCode')?.data) as FacultyRequiredDocumentCode
  const filePart = parts?.find((part) => part.name === 'file' && part.filename)

  if (!requirementCode || !filePart?.filename || !filePart.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Requirement code and file are required.'
    })
  }

  const sessionUser = await requireAppwriteSessionUser(event)
  const { tablesDB, storage } = createAppwriteAdminClient(config.value)
  await requireFacultyProfile(tablesDB, config.value, sessionUser.$id)

  const document = await uploadFacultyApplicationDocument(tablesDB, storage, config.value, {
    applicationId,
    userId: sessionUser.$id,
    requirementCode,
    fileName: filePart.filename,
    fileType: filePart.type || 'application/octet-stream',
    fileData: filePart.data
  })
  const documents = await getFacultyApplicationDocuments(tablesDB, config.value, {
    applicationId,
    userId: sessionUser.$id
  })

  return {
    ok: true,
    document: mapFacultyApplicationDocumentRow(document),
    documents: documents.map(mapFacultyApplicationDocumentRow)
  }
})
