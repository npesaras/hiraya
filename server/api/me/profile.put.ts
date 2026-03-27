import { createError } from 'h3'
import { createAppwriteAdminClient, getAppwriteAdminConfig } from '~~/server/utils/appwrite-admin'
import { requireAppwriteSessionUser } from '~~/server/utils/appwrite-session'
import { upsertFacultyProfile } from '~~/server/utils/faculty'

type UpdateMyProfileBody = {
  fullName?: string
  department?: string
  expectedRole?: string
}

export default defineEventHandler(async (event) => {
  const config = getAppwriteAdminConfig()

  if (!config.configured) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Appwrite configuration is incomplete.',
      data: {
        missing: config.missing
      }
    })
  }

  const sessionUser = await requireAppwriteSessionUser(event)
  const body = await readBody<UpdateMyProfileBody>(event)
  const fullName = body.fullName?.trim() || sessionUser.name?.trim()
  const department = body.department?.trim() || ''

  if (!fullName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Full name is required.'
    })
  }

  if (body.expectedRole && body.expectedRole !== 'faculty_applicant') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only faculty profile provisioning is currently supported.'
    })
  }

  const { tablesDB } = createAppwriteAdminClient(config.value)
  const profile = await upsertFacultyProfile(tablesDB, config.value, {
    userId: sessionUser.$id,
    fullName,
    department
  })

  return {
    ok: true,
    profile
  }
})
