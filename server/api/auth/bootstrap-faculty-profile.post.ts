import { createError } from 'h3'
import { createAppwriteAdminClient, getAppwriteAdminConfig } from '~~/server/utils/appwrite-admin'
import { upsertFacultyProfile } from '~~/server/utils/faculty'
import { requireAppwriteSessionUser } from '~~/server/utils/appwrite-session'

type BootstrapBody = {
  fullName?: string
  department?: string
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
  const body = await readBody<BootstrapBody>(event)
  const fullName = body.fullName?.trim() || sessionUser.name?.trim()
  const department = body.department?.trim() || ''

  if (!fullName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Full name is required when creating a new profile.'
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
