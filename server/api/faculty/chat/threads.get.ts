import { createError } from 'h3'
import { createAppwriteAdminClient, getAppwriteAdminConfig } from '~~/server/utils/appwrite-admin'
import { requireAppwriteSessionUser } from '~~/server/utils/appwrite-session'
import {
  ensureFacultyApplicationThread,
  toChatThreadListItem
} from '~~/server/utils/faculty-chat'
import {
  listFacultyApplications,
  requireFacultyProfile
} from '~~/server/utils/faculty'

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
  const profile = await requireFacultyProfile(tablesDB, config.value, sessionUser.$id)
  const applications = await listFacultyApplications(tablesDB, config.value, {
    userId: sessionUser.$id,
    limit: 25
  })

  const threadItems = await Promise.all(applications.map(async (application) => {
    const threadContext = await ensureFacultyApplicationThread(tablesDB, config.value, {
      application,
      profile
    })

    return toChatThreadListItem({
      application,
      thread: threadContext.thread,
      participants: threadContext.participants,
      currentUserId: sessionUser.$id
    })
  }))

  const threads = threadItems.sort((left, right) => {
    const leftTime = left.latestMessageAt || ''
    const rightTime = right.latestMessageAt || ''
    return rightTime.localeCompare(leftTime)
  })

  return {
    ok: true,
    threads,
    activeApplicationId: threads[0]?.applicationId || null
  }
})
