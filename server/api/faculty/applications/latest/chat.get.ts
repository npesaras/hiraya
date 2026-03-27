import { createError } from 'h3'
import { createAppwriteAdminClient, getAppwriteAdminConfig } from '~~/server/utils/appwrite-admin'
import { requireAppwriteSessionUser } from '~~/server/utils/appwrite-session'
import {
  ensureFacultyApplicationThread,
  listApplicationThreadMessages,
  createFacultyChatRealtimeDescriptor,
  toChatBootstrapPayload
} from '~~/server/utils/faculty-chat'
import { getLatestFacultyApplication, requireFacultyProfile } from '~~/server/utils/faculty'

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
  const application = await getLatestFacultyApplication(tablesDB, config.value, sessionUser.$id)

  if (!application) {
    return {
      ok: true,
      application: null,
      thread: null,
      participants: [],
      messages: [],
      realtime: null
    }
  }

  const threadContext = await ensureFacultyApplicationThread(tablesDB, config.value, {
    application,
    profile
  })
  const messages = await listApplicationThreadMessages(tablesDB, config.value, {
    threadId: threadContext.thread.$id,
    limit: 40
  })

  return {
    ok: true,
    application,
    ...toChatBootstrapPayload({
      currentUserId: sessionUser.$id,
      thread: threadContext.thread,
      participants: threadContext.participants,
      messages,
      realtime: createFacultyChatRealtimeDescriptor(config.value, threadContext.thread.$id)
    })
  }
})
