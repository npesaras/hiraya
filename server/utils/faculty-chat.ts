import { ID, Permission, Query, Role, type TablesDB } from 'node-appwrite'
import { createError } from 'h3'
import {
  CHAT_MESSAGE_KINDS,
  type ChatMessage,
  type ChatParticipantSummary,
  type ChatRealtimeDescriptor,
  type ChatThreadListItem,
  type ChatThreadSummary
} from '#shared/utils/chat'
import type { AdminConfig } from '~~/server/utils/appwrite-admin'
import type { FacultyApplicationRow } from '~~/server/utils/faculty'
import type { UserProfileRow } from '~~/server/utils/user-profiles'

export type ApplicationThreadRow = {
  $id: string
  application_id: string
  reference_no?: string
  current_status_snapshot?: string
  latest_message_preview?: string
  latest_message_at?: string
  created_by?: string
  created_at?: string
}

export type ApplicationThreadParticipantRow = {
  $id: string
  thread_id: string
  application_id: string
  participant_user_id?: string
  participant_role?: string
  display_name?: string
  last_read_at?: string
  joined_at?: string
}

export type ApplicationMessageRow = {
  $id: string
  thread_id: string
  application_id: string
  message_kind?: string
  author_user_id?: string
  author_role?: string
  author_name?: string
  body?: string
  created_at?: string
}

function getRealtimeChannel(config: AdminConfig) {
  return `tablesdb.${config.databaseId}.tables.${config.resources.tableIds.applicationMessages}.rows`
}

function getParticipantUserIds(participants: ApplicationThreadParticipantRow[]) {
  return [...new Set(
    participants
      .map((participant) => participant.participant_user_id?.trim())
      .filter((participantUserId): participantUserId is string => Boolean(participantUserId))
  )]
}

function getReadPermissions(userIds: string[]) {
  return userIds.map((userId) => Permission.read(Role.user(userId)))
}

function buildInitials(source: string) {
  return source
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join(' ')
}

function getCounterpartName(
  participants: ApplicationThreadParticipantRow[],
  currentUserId: string
) {
  return participants.find((participant) => {
    return participant.participant_user_id !== currentUserId && participant.display_name?.trim()
  })?.display_name?.trim() || 'FSMES Workflow'
}

function hasUnreadMessages(
  thread: ApplicationThreadRow,
  participants: ApplicationThreadParticipantRow[],
  currentUserId: string
) {
  if (!thread.latest_message_at) {
    return false
  }

  const currentUserParticipant = participants.find((participant) => participant.participant_user_id === currentUserId)

  if (!currentUserParticipant?.last_read_at) {
    return true
  }

  return new Date(thread.latest_message_at).getTime() > new Date(currentUserParticipant.last_read_at).getTime()
}

function toThreadSummary(row: ApplicationThreadRow): ChatThreadSummary {
  return {
    id: row.$id,
    applicationId: row.application_id,
    referenceNo: row.reference_no || null,
    statusSnapshot: row.current_status_snapshot || null,
    latestMessagePreview: row.latest_message_preview || null,
    latestMessageAt: row.latest_message_at || null,
    createdAt: row.created_at || null
  }
}

function toParticipantSummary(
  row: ApplicationThreadParticipantRow,
  currentUserId: string
): ChatParticipantSummary {
  return {
    id: row.$id,
    userId: row.participant_user_id || null,
    role: row.participant_role || 'participant',
    displayName: row.display_name || 'Participant',
    isCurrentUser: row.participant_user_id === currentUserId,
    lastReadAt: row.last_read_at || null,
    joinedAt: row.joined_at || null
  }
}

export function toMessageSummary(row: ApplicationMessageRow): ChatMessage {
  return {
    id: row.$id,
    threadId: row.thread_id,
    applicationId: row.application_id,
    kind: row.message_kind === CHAT_MESSAGE_KINDS.SYSTEM
      ? CHAT_MESSAGE_KINDS.SYSTEM
      : CHAT_MESSAGE_KINDS.USER,
    body: row.body || '',
    authorUserId: row.author_user_id || null,
    authorRole: row.author_role || null,
    authorName: row.author_name || 'FSMES Workflow',
    createdAt: row.created_at || null
  }
}

export function toChatThreadListItem(input: {
  application: FacultyApplicationRow
  thread: ApplicationThreadRow
  participants: ApplicationThreadParticipantRow[]
  currentUserId: string
}): ChatThreadListItem {
  const counterpartName = getCounterpartName(input.participants, input.currentUserId)

  return {
    id: input.thread.$id,
    applicationId: input.application.$id,
    referenceNo: input.application.reference_no || null,
    scholarshipType: input.application.scholarship_type || null,
    statusSnapshot: input.thread.current_status_snapshot || input.application.current_status || null,
    latestMessagePreview: input.thread.latest_message_preview || null,
    latestMessageAt: input.thread.latest_message_at || null,
    counterpartName,
    counterpartInitials: buildInitials(counterpartName) || 'FW',
    unread: hasUnreadMessages(input.thread, input.participants, input.currentUserId)
  }
}

async function updateThreadSnapshot(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    threadId: string
    latestMessagePreview?: string
    latestMessageAt?: string
    statusSnapshot?: string
    permissions?: string[]
  }
) {
  const data = {
    ...(input.latestMessagePreview !== undefined ? { latest_message_preview: input.latestMessagePreview } : {}),
    ...(input.latestMessageAt !== undefined ? { latest_message_at: input.latestMessageAt } : {}),
    ...(input.statusSnapshot !== undefined ? { current_status_snapshot: input.statusSnapshot } : {})
  }

  await tablesDB.updateRow({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applicationThreads,
    rowId: input.threadId,
    data,
    ...(input.permissions ? { permissions: input.permissions } : {})
  })
}

async function createMessageRow(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    applicationId: string
    threadId: string
    kind: ChatMessage['kind']
    body: string
    authorUserId?: string
    authorRole?: string
    authorName: string
    participantUserIds: string[]
    createdAt: string
  }
) {
  return await tablesDB.createRow({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applicationMessages,
    rowId: ID.unique(),
    data: {
      thread_id: input.threadId,
      application_id: input.applicationId,
      message_kind: input.kind,
      ...(input.authorUserId ? { author_user_id: input.authorUserId } : {}),
      ...(input.authorRole ? { author_role: input.authorRole } : {}),
      author_name: input.authorName,
      body: input.body,
      created_at: input.createdAt
    },
    permissions: getReadPermissions(input.participantUserIds)
  }) as ApplicationMessageRow
}

async function findThreadByApplicationId(
  tablesDB: TablesDB,
  config: AdminConfig,
  applicationId: string
): Promise<ApplicationThreadRow | null> {
  const result = await tablesDB.listRows({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applicationThreads,
    queries: [
      Query.equal('application_id', applicationId),
      Query.limit(1)
    ]
  })

  return (result.rows[0] as ApplicationThreadRow | undefined) ?? null
}

export async function listApplicationThreadParticipants(
  tablesDB: TablesDB,
  config: AdminConfig,
  threadId: string
): Promise<ApplicationThreadParticipantRow[]> {
  const result = await tablesDB.listRows({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applicationThreadParticipants,
    queries: [
      Query.equal('thread_id', threadId),
      Query.orderAsc('$createdAt'),
      Query.limit(100)
    ]
  })

  return result.rows as ApplicationThreadParticipantRow[]
}

async function upsertThreadParticipant(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    threadId: string
    applicationId: string
    profile: UserProfileRow
  }
) {
  const existing = await tablesDB.listRows({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applicationThreadParticipants,
    queries: [
      Query.equal('thread_id', input.threadId),
      Query.equal('participant_user_id', input.profile.user_id),
      Query.limit(1)
    ]
  })

  const currentTimestamp = new Date().toISOString()
  const participant = existing.rows[0] as ApplicationThreadParticipantRow | undefined

  if (participant) {
    if (
      participant.display_name === input.profile.full_name &&
      participant.participant_role === input.profile.role
    ) {
      return participant
    }

    return await tablesDB.updateRow({
      databaseId: config.databaseId,
      tableId: config.resources.tableIds.applicationThreadParticipants,
      rowId: participant.$id,
      data: {
        display_name: input.profile.full_name,
        participant_role: input.profile.role,
        last_read_at: participant.last_read_at || currentTimestamp
      }
    }) as ApplicationThreadParticipantRow
  }

  return await tablesDB.createRow({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applicationThreadParticipants,
    rowId: ID.unique(),
    data: {
      thread_id: input.threadId,
      application_id: input.applicationId,
      participant_user_id: input.profile.user_id,
      participant_role: input.profile.role,
      display_name: input.profile.full_name,
      last_read_at: currentTimestamp,
      joined_at: currentTimestamp
    },
    permissions: getReadPermissions([input.profile.user_id])
  }) as ApplicationThreadParticipantRow
}

function formatStatusChangeMessage(application: FacultyApplicationRow) {
  const status = application.current_status || 'Draft'
  const reference = application.reference_no ? ` (${application.reference_no})` : ''
  return `Application${reference} is now marked as ${status}.`
}

async function syncStatusSystemMessage(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    application: FacultyApplicationRow
    thread: ApplicationThreadRow
    participants: ApplicationThreadParticipantRow[]
  }
) {
  const nextStatus = input.application.current_status || 'Draft'

  if (input.thread.current_status_snapshot === nextStatus) {
    return input.thread
  }

  const participantUserIds = getParticipantUserIds(input.participants)
  const currentTimestamp = new Date().toISOString()
  const message = await createMessageRow(tablesDB, config, {
    applicationId: input.application.$id,
    threadId: input.thread.$id,
    kind: CHAT_MESSAGE_KINDS.SYSTEM,
    body: formatStatusChangeMessage(input.application),
    authorName: 'FSMES Workflow',
    participantUserIds,
    createdAt: currentTimestamp
  })

  await updateThreadSnapshot(tablesDB, config, {
    threadId: input.thread.$id,
    latestMessagePreview: message.body || '',
    latestMessageAt: currentTimestamp,
    statusSnapshot: nextStatus
  })

  return {
    ...input.thread,
    current_status_snapshot: nextStatus,
    latest_message_preview: message.body,
    latest_message_at: currentTimestamp
  }
}

export async function ensureFacultyApplicationThread(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    application: FacultyApplicationRow
    profile: UserProfileRow
  }
) {
  const currentTimestamp = new Date().toISOString()
  let thread = await findThreadByApplicationId(tablesDB, config, input.application.$id)

  if (!thread) {
    thread = await tablesDB.createRow({
      databaseId: config.databaseId,
      tableId: config.resources.tableIds.applicationThreads,
      rowId: ID.unique(),
      data: {
        application_id: input.application.$id,
        reference_no: input.application.reference_no || '',
        current_status_snapshot: '',
        created_by: input.profile.user_id,
        created_at: currentTimestamp
      },
      permissions: getReadPermissions([input.profile.user_id])
    }) as ApplicationThreadRow
  }

  await upsertThreadParticipant(tablesDB, config, {
    threadId: thread.$id,
    applicationId: input.application.$id,
    profile: input.profile
  })

  const participants = await listApplicationThreadParticipants(tablesDB, config, thread.$id)
  const participantUserIds = getParticipantUserIds(participants)

  if (participantUserIds.length > 0) {
    await updateThreadSnapshot(tablesDB, config, {
      threadId: thread.$id,
      ...(thread.latest_message_preview !== undefined ? { latestMessagePreview: thread.latest_message_preview } : {}),
      ...(thread.latest_message_at !== undefined ? { latestMessageAt: thread.latest_message_at } : {}),
      permissions: getReadPermissions(participantUserIds)
    })
  }

  thread = await syncStatusSystemMessage(tablesDB, config, {
    application: input.application,
    thread,
    participants
  })

  return {
    thread,
    participants
  }
}

export async function listApplicationThreadMessages(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    threadId: string
    limit?: number
  }
): Promise<ApplicationMessageRow[]> {
  const result = await tablesDB.listRows({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applicationMessages,
    queries: [
      Query.equal('thread_id', input.threadId),
      Query.orderAsc('$createdAt'),
      Query.limit(input.limit || 50)
    ]
  })

  return result.rows as ApplicationMessageRow[]
}

export async function markThreadReadForUser(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    threadId: string
    userId: string
  }
) {
  const result = await tablesDB.listRows({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applicationThreadParticipants,
    queries: [
      Query.equal('thread_id', input.threadId),
      Query.equal('participant_user_id', input.userId),
      Query.limit(1)
    ]
  })

  const participant = result.rows[0] as ApplicationThreadParticipantRow | undefined

  if (!participant) {
    return null
  }

  return await tablesDB.updateRow({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applicationThreadParticipants,
    rowId: participant.$id,
    data: {
      last_read_at: new Date().toISOString()
    }
  }) as ApplicationThreadParticipantRow
}

export async function createFacultyThreadMessage(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    application: FacultyApplicationRow
    profile: UserProfileRow
    thread: ApplicationThreadRow
    body: string
  }
) {
  const normalizedBody = input.body.trim()

  if (!normalizedBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message body is required.'
    })
  }

  if (normalizedBody.length > 2000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message body must not exceed 2000 characters.'
    })
  }

  const participants = await listApplicationThreadParticipants(tablesDB, config, input.thread.$id)
  const participantUserIds = getParticipantUserIds(participants)

  const currentTimestamp = new Date().toISOString()
  const message = await createMessageRow(tablesDB, config, {
    applicationId: input.application.$id,
    threadId: input.thread.$id,
    kind: CHAT_MESSAGE_KINDS.USER,
    body: normalizedBody,
    authorUserId: input.profile.user_id,
    authorRole: input.profile.role,
    authorName: input.profile.full_name,
    participantUserIds,
    createdAt: currentTimestamp
  })

  await updateThreadSnapshot(tablesDB, config, {
    threadId: input.thread.$id,
    latestMessagePreview: normalizedBody,
    latestMessageAt: currentTimestamp
  })

  await markThreadReadForUser(tablesDB, config, {
    threadId: input.thread.$id,
    userId: input.profile.user_id
  })

  return message
}

export function createFacultyChatRealtimeDescriptor(
  config: AdminConfig,
  threadId: string
): ChatRealtimeDescriptor {
  return {
    channels: [getRealtimeChannel(config)],
    queries: [Query.equal('thread_id', threadId)],
    threadId
  }
}

export function toChatBootstrapPayload(input: {
  currentUserId: string
  thread: ApplicationThreadRow
  participants: ApplicationThreadParticipantRow[]
  messages: ApplicationMessageRow[]
  realtime: ChatRealtimeDescriptor
}) {
  return {
    thread: toThreadSummary(input.thread),
    participants: input.participants.map((participant) => toParticipantSummary(participant, input.currentUserId)),
    messages: input.messages.map(toMessageSummary),
    realtime: input.realtime
  }
}
