import { createError } from 'h3'
import { createAppwriteAdminClient, getAppwriteAdminConfig } from '~~/server/utils/appwrite-admin'
import { createFacultyAuthAccount, upsertFacultyProfile } from '~~/server/utils/faculty'

type RegisterFacultyBody = {
  email?: string
  password?: string
  fullName?: string
  department?: string
}

function trimValue(value?: string) {
  return value?.trim() || ''
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

  const body = await readBody<RegisterFacultyBody>(event)
  const email = trimValue(body.email).toLowerCase()
  const password = body.password || ''
  const fullName = trimValue(body.fullName)
  const department = trimValue(body.department)

  if (!fullName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Full name is required.'
    })
  }

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required.'
    })
  }

  if (!password || password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 8 characters.'
    })
  }

  try {
    const { users, tablesDB } = createAppwriteAdminClient(config.value)
    const account = await createFacultyAuthAccount(users, {
      email,
      password,
      fullName
    })

    const profile = await upsertFacultyProfile(tablesDB, config.value, {
      userId: account.$id,
      fullName,
      department
    })

    return {
      ok: true,
      userId: account.$id,
      profile
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to register faculty account.'

    throw createError({
      statusCode: 400,
      statusMessage: message
    })
  }
})
