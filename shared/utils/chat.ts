export const CHAT_MESSAGE_KINDS = {
  USER: 'user',
  SYSTEM: 'system'
} as const

export type ChatMessageKind = (typeof CHAT_MESSAGE_KINDS)[keyof typeof CHAT_MESSAGE_KINDS]

export type ChatParticipantSummary = {
  id: string
  userId: string | null
  role: string
  displayName: string
  isCurrentUser: boolean
  lastReadAt: string | null
  joinedAt: string | null
}

export type ChatMessage = {
  id: string
  threadId: string
  applicationId: string
  kind: ChatMessageKind
  body: string
  authorUserId: string | null
  authorRole: string | null
  authorName: string
  createdAt: string | null
}

export type ChatThreadSummary = {
  id: string
  applicationId: string
  referenceNo: string | null
  statusSnapshot: string | null
  latestMessagePreview: string | null
  latestMessageAt: string | null
  createdAt: string | null
}

export type ChatThreadListItem = {
  id: string
  applicationId: string
  referenceNo: string | null
  scholarshipType: string | null
  statusSnapshot: string | null
  latestMessagePreview: string | null
  latestMessageAt: string | null
  counterpartName: string
  counterpartInitials: string
  unread: boolean
}

export type ChatRealtimeDescriptor = {
  channels: string[]
  queries: string[]
  threadId: string
}
