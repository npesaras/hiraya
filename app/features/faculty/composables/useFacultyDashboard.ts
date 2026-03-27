import type { RealtimeSubscription } from 'appwrite'
import {
  CHAT_MESSAGE_KINDS,
  type ChatMessage,
  type ChatParticipantSummary,
  type ChatRealtimeDescriptor,
  type ChatThreadSummary
} from '#shared/utils/chat'

type ApplicationRow = {
  $id: string
  reference_no?: string
  scholarship_type?: string
  current_status?: string
  created_at?: string
  submitted_at?: string
  updated_at?: string
}

type ActivityRow = {
  $id: string
  action_type?: string
  action_summary?: string
  created_at?: string
}

type DocumentRow = {
  requirement_code?: string
  uploaded_at?: string
  is_current?: boolean
}

type LatestChatResponse = {
  ok: boolean
  application: ApplicationRow | null
  thread: ChatThreadSummary | null
  participants: ChatParticipantSummary[]
  messages: ChatMessage[]
  realtime: ChatRealtimeDescriptor | null
}

type LatestMessagesResponse = {
  ok: boolean
  messages: ChatMessage[]
}

type SendMessageResponse = {
  ok: boolean
  message: ChatMessage
}

export type DocumentChecklistItem = {
  code: string
  label: string
  uploaded: boolean
  uploadedAt: string | null
}

const REQUIRED_DOCUMENTS: Array<{ code: string, label: string }> = [
  { code: 'application_letter', label: 'Application Letter' },
  { code: 'curriculum_vitae', label: 'Curriculum Vitae' },
  { code: 'service_record', label: 'Service Record' },
  { code: 'transcript_records', label: 'Transcript of Records' },
  { code: 'study_plan', label: 'Study Plan / Purpose Statement' },
  { code: 'endorsement_form', label: 'IASP Endorsement Form' }
]

function formatDate(dateLike?: string): string | null {
  if (!dateLike) {
    return null
  }

  const date = new Date(dateLike)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

function createEmptyChecklist() {
  return REQUIRED_DOCUMENTS.map((item) => ({
    code: item.code,
    label: item.label,
    uploaded: false,
    uploadedAt: null
  }))
}

function normalizeRealtimeMessage(payload: Partial<{
  $id: string
  thread_id: string
  application_id: string
  message_kind: string
  author_user_id: string
  author_role: string
  author_name: string
  body: string
  created_at: string
}>): ChatMessage | null {
  if (!payload.$id || !payload.thread_id || !payload.application_id) {
    return null
  }

  return {
    id: payload.$id,
    threadId: payload.thread_id,
    applicationId: payload.application_id,
    kind: payload.message_kind === CHAT_MESSAGE_KINDS.SYSTEM
      ? CHAT_MESSAGE_KINDS.SYSTEM
      : CHAT_MESSAGE_KINDS.USER,
    body: payload.body || '',
    authorUserId: payload.author_user_id || null,
    authorRole: payload.author_role || null,
    authorName: payload.author_name || 'FSMES Workflow',
    createdAt: payload.created_at || null
  }
}

export function useFacultyDashboard() {
  const nuxtApp = useNuxtApp()
  const { user, ensureSession, getRestAuthHeaders } = useAuth()

  const latestApplication = ref<ApplicationRow | null>(null)
  const activities = ref<ActivityRow[]>([])
  const checklist = ref<DocumentChecklistItem[]>(createEmptyChecklist())
  const thread = ref<ChatThreadSummary | null>(null)
  const participants = ref<ChatParticipantSummary[]>([])
  const messages = ref<ChatMessage[]>([])
  const messageDraft = ref('')
  const chatRealtime = ref<ChatRealtimeDescriptor | null>(null)
  const realtimeConnected = ref(false)
  const loading = ref(false)
  const sendingMessage = ref(false)
  const error = ref<string | null>(null)
  let realtimeSubscription: RealtimeSubscription | null = null

  async function fetchChatBootstrap(): Promise<LatestChatResponse> {
    return await $fetch<LatestChatResponse>('/api/faculty/applications/latest/chat', {
      headers: await getRestAuthHeaders()
    })
  }

  async function fetchActivityRows(): Promise<ActivityRow[]> {
    const result = await $fetch<{ ok: boolean, activities: ActivityRow[] }>('/api/faculty/activity-logs', {
      headers: await getRestAuthHeaders()
    })

    return result.activities
  }

  async function fetchDocumentChecklist(applicationId: string): Promise<DocumentChecklistItem[]> {
    const result = await $fetch<{ ok: boolean, documents: DocumentRow[] }>(`/api/faculty/applications/${applicationId}/documents`, {
      headers: await getRestAuthHeaders()
    })

    const currentDocuments = result.documents.filter((document) => document.is_current)

    return REQUIRED_DOCUMENTS.map((requirement) => {
      const found = currentDocuments.find((document) => document.requirement_code === requirement.code)

      return {
        code: requirement.code,
        label: requirement.label,
        uploaded: Boolean(found),
        uploadedAt: formatDate(found?.uploaded_at)
      }
    })
  }

  async function disconnectRealtime() {
    realtimeConnected.value = false

    if (!realtimeSubscription) {
      return
    }

    await realtimeSubscription.close()
    realtimeSubscription = null
  }

  function upsertMessage(nextMessage: ChatMessage) {
    const currentIndex = messages.value.findIndex((message) => message.id === nextMessage.id)

    if (currentIndex >= 0) {
      messages.value[currentIndex] = nextMessage
    } else {
      messages.value = [...messages.value, nextMessage]
        .sort((left, right) => (left.createdAt || '').localeCompare(right.createdAt || ''))
    }
  }

  async function connectRealtime() {
    await disconnectRealtime()

    if (import.meta.server || !chatRealtime.value || !nuxtApp.$appwrite?.configured) {
      return
    }

    try {
      realtimeSubscription = await nuxtApp.$appwrite.realtime.subscribe(
        chatRealtime.value.channels,
        (event) => {
          const nextMessage = normalizeRealtimeMessage(event.payload)

          if (!nextMessage || nextMessage.threadId !== chatRealtime.value?.threadId) {
            return
          }

          upsertMessage(nextMessage)

          if (thread.value) {
            thread.value = {
              ...thread.value,
              latestMessagePreview: nextMessage.body,
              latestMessageAt: nextMessage.createdAt
            }
          }

          if (nextMessage.authorUserId && nextMessage.authorUserId !== user.value?.$id) {
            void markChatRead()
          }
        },
        chatRealtime.value.queries
      )
      realtimeConnected.value = true
    } catch (cause) {
      realtimeConnected.value = false
      error.value = cause instanceof Error ? cause.message : 'Live chat updates could not be connected.'
    }
  }

  async function refreshMessages() {
    if (!latestApplication.value) {
      messages.value = []
      return
    }

    const result = await $fetch<LatestMessagesResponse>(`/api/faculty/applications/${latestApplication.value.$id}/chat/messages`, {
      headers: await getRestAuthHeaders()
    })

    messages.value = result.messages
  }

  async function markChatRead() {
    if (!latestApplication.value || !thread.value) {
      return
    }

    await $fetch(`/api/faculty/applications/${latestApplication.value.$id}/chat/read`, {
      method: 'POST',
      headers: await getRestAuthHeaders()
    })
  }

  async function sendMessage() {
    if (!latestApplication.value || !thread.value || !messageDraft.value.trim()) {
      return
    }

    sendingMessage.value = true

    try {
      const payload = messageDraft.value
      messageDraft.value = ''

      const result = await $fetch<SendMessageResponse>(`/api/faculty/applications/${latestApplication.value.$id}/chat/messages`, {
        method: 'POST',
        headers: await getRestAuthHeaders(),
        body: {
          message: payload
        }
      })

      upsertMessage(result.message)

      if (thread.value) {
        thread.value = {
          ...thread.value,
          latestMessagePreview: result.message.body,
          latestMessageAt: result.message.createdAt
        }
      }

      await markChatRead()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Message could not be sent.'
    } finally {
      sendingMessage.value = false
    }
  }

  async function load() {
    loading.value = true
    error.value = null

    try {
      const activeUser = user.value || await ensureSession()

      if (!activeUser) {
        latestApplication.value = null
        activities.value = []
        checklist.value = createEmptyChecklist()
        thread.value = null
        participants.value = []
        messages.value = []
        messageDraft.value = ''
        chatRealtime.value = null
        await disconnectRealtime()
        return
      }

      const [activityRows, chatBootstrap] = await Promise.all([
        fetchActivityRows(),
        fetchChatBootstrap()
      ])

      activities.value = activityRows
      latestApplication.value = chatBootstrap.application
      thread.value = chatBootstrap.thread
      participants.value = chatBootstrap.participants
      messages.value = chatBootstrap.messages
      chatRealtime.value = chatBootstrap.realtime

      if (latestApplication.value) {
        checklist.value = await fetchDocumentChecklist(latestApplication.value.$id)
      } else {
        checklist.value = createEmptyChecklist()
      }

      await connectRealtime()
      await markChatRead()
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Failed to load dashboard data.'
      error.value = message
    } finally {
      loading.value = false
    }
  }

  const uploadedCount = computed(() => checklist.value.filter((item) => item.uploaded).length)
  const missingCount = computed(() => checklist.value.length - uploadedCount.value)
  const completionPercent = computed(() => {
    if (!checklist.value.length) return 0
    return Math.round((uploadedCount.value / checklist.value.length) * 100)
  })
  const hasApplication = computed(() => Boolean(latestApplication.value))

  return {
    latestApplication: readonly(latestApplication),
    activities: readonly(activities),
    checklist: readonly(checklist),
    thread: readonly(thread),
    participants: readonly(participants),
    messages: readonly(messages),
    messageDraft,
    realtimeConnected: readonly(realtimeConnected),
    loading: readonly(loading),
    sendingMessage: readonly(sendingMessage),
    error: readonly(error),
    hasApplication,
    uploadedCount,
    missingCount,
    completionPercent,
    load,
    refreshMessages,
    sendMessage,
    markChatRead,
    disconnectRealtime
  }
}
