import type { RealtimeSubscription } from 'appwrite'
import {
  CHAT_MESSAGE_KINDS,
  type ChatMessage,
  type ChatParticipantSummary,
  type ChatRealtimeDescriptor,
  type ChatThreadListItem,
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

type ChatThreadsResponse = {
  ok: boolean
  threads: ChatThreadListItem[]
  activeApplicationId: string | null
}

type ChatBootstrapResponse = {
  ok: boolean
  application: ApplicationRow | null
  thread: ChatThreadSummary | null
  participants: ChatParticipantSummary[]
  messages: ChatMessage[]
  realtime: ChatRealtimeDescriptor | null
}

type SendMessageResponse = {
  ok: boolean
  message: ChatMessage
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

export function useFacultyChatWorkspace() {
  const route = useRoute()
  const nuxtApp = useNuxtApp()
  const {
    user,
    profile,
    ensureSession,
    getRestAuthHeaders,
    messageFromUnknown
  } = useAuth()

  const threads = ref<ChatThreadListItem[]>([])
  const activeApplication = ref<ApplicationRow | null>(null)
  const activeThread = ref<ChatThreadSummary | null>(null)
  const participants = ref<ChatParticipantSummary[]>([])
  const messages = ref<ChatMessage[]>([])
  const messageDraft = ref('')
  const threadSearch = ref('')
  const mobileThreadsOpen = ref(false)
  const loadingThreads = ref(false)
  const loadingConversation = ref(false)
  const refreshing = ref(false)
  const sending = ref(false)
  const error = ref<string | null>(null)
  const realtimeConnected = ref(false)
  const realtime = ref<ChatRealtimeDescriptor | null>(null)
  const initialized = ref(false)
  let realtimeSubscription: RealtimeSubscription | null = null

  const activeApplicationId = computed(() => {
    if (typeof route.query.applicationId === 'string' && route.query.applicationId) {
      return route.query.applicationId
    }

    return activeApplication.value?.$id || null
  })

  const filteredThreads = computed(() => {
    const needle = threadSearch.value.trim().toLowerCase()

    if (!needle) {
      return threads.value
    }

    return threads.value.filter((thread) => {
      return [
        thread.referenceNo,
        thread.scholarshipType,
        thread.counterpartName,
        thread.latestMessagePreview,
        thread.statusSnapshot
      ].some((value) => value?.toLowerCase().includes(needle))
    })
  })

  const activeThreadItem = computed(() => {
    return threads.value.find((thread) => thread.applicationId === activeApplicationId.value) || null
  })

  const hasThreads = computed(() => threads.value.length > 0)
  const counterpartName = computed(() => activeThreadItem.value?.counterpartName || 'FSMES Workflow')
  const counterpartInitials = computed(() => activeThreadItem.value?.counterpartInitials || 'FW')
  const conversationMeta = computed(() => {
    const fragments = [
      activeApplication.value?.reference_no,
      activeApplication.value?.scholarship_type,
      activeApplication.value?.current_status
    ].filter(Boolean)

    return fragments.join(' · ') || 'Application conversation'
  })

  function updateThreadListItem(
    applicationId: string,
    updates: Partial<ChatThreadListItem>
  ) {
    threads.value = threads.value.map((thread) => {
      if (thread.applicationId !== applicationId) {
        return thread
      }

      return {
        ...thread,
        ...updates
      }
    }).sort((left, right) => {
      const leftTime = left.latestMessageAt || ''
      const rightTime = right.latestMessageAt || ''
      return rightTime.localeCompare(leftTime)
    })
  }

  function resetConversation() {
    activeApplication.value = null
    activeThread.value = null
    participants.value = []
    messages.value = []
    messageDraft.value = ''
    realtime.value = null
    realtimeConnected.value = false
  }

  async function replaceActiveQuery(applicationId: string | null) {
    const nextQuery = {
      ...route.query
    }

    if (applicationId) {
      nextQuery.applicationId = applicationId
    } else {
      delete nextQuery.applicationId
    }

    await navigateTo({
      path: '/faculty/chat',
      query: nextQuery
    }, {
      replace: true
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

    if (activeThread.value) {
      activeThread.value = {
        ...activeThread.value,
        latestMessagePreview: nextMessage.body,
        latestMessageAt: nextMessage.createdAt
      }
    }

    updateThreadListItem(nextMessage.applicationId, {
      latestMessagePreview: nextMessage.body,
      latestMessageAt: nextMessage.createdAt,
      unread: nextMessage.authorUserId !== user.value?.$id
    })
  }

  async function fetchThreadList() {
    return await $fetch<ChatThreadsResponse>('/api/faculty/chat/threads', {
      headers: await getRestAuthHeaders()
    })
  }

  async function fetchConversation(applicationId: string) {
    return await $fetch<ChatBootstrapResponse>(`/api/faculty/applications/${applicationId}/chat`, {
      headers: await getRestAuthHeaders()
    })
  }

  async function markRead() {
    if (!activeApplication.value || !activeThread.value) {
      return
    }

    await $fetch(`/api/faculty/applications/${activeApplication.value.$id}/chat/read`, {
      method: 'POST',
      headers: await getRestAuthHeaders()
    })

    updateThreadListItem(activeApplication.value.$id, {
      unread: false
    })
  }

  async function connectRealtime() {
    await disconnectRealtime()

    if (import.meta.server || !realtime.value || !nuxtApp.$appwrite?.configured) {
      return
    }

    try {
      realtimeSubscription = await nuxtApp.$appwrite.realtime.subscribe(
        realtime.value.channels,
        (event) => {
          const nextMessage = normalizeRealtimeMessage(event.payload)

          if (!nextMessage || nextMessage.threadId !== realtime.value?.threadId) {
            return
          }

          upsertMessage(nextMessage)

          if (nextMessage.authorUserId && nextMessage.authorUserId !== user.value?.$id) {
            void markRead()
          }
        },
        realtime.value.queries
      )

      realtimeConnected.value = true
    } catch (cause) {
      realtimeConnected.value = false
      error.value = messageFromUnknown(cause, 'Live chat updates could not be connected.')
    }
  }

  async function loadConversation(applicationId: string) {
    loadingConversation.value = true

    try {
      const bootstrap = await fetchConversation(applicationId)

      activeApplication.value = bootstrap.application
      activeThread.value = bootstrap.thread
      participants.value = bootstrap.participants
      messages.value = bootstrap.messages
      realtime.value = bootstrap.realtime
      messageDraft.value = ''

      if (bootstrap.application && bootstrap.thread) {
        updateThreadListItem(bootstrap.application.$id, {
          id: bootstrap.thread.id,
          referenceNo: bootstrap.thread.referenceNo,
          statusSnapshot: bootstrap.thread.statusSnapshot,
          latestMessagePreview: bootstrap.thread.latestMessagePreview,
          latestMessageAt: bootstrap.thread.latestMessageAt,
          unread: false
        })
      }

      await connectRealtime()
      await markRead()
    } catch (cause) {
      resetConversation()
      error.value = messageFromUnknown(cause, 'Conversation could not be loaded.')
    } finally {
      loadingConversation.value = false
    }
  }

  async function load() {
    loadingThreads.value = true
    error.value = null

    try {
      const activeUser = user.value || await ensureSession()

      if (!activeUser) {
        threads.value = []
        resetConversation()
        await disconnectRealtime()
        return
      }

      const response = await fetchThreadList()
      threads.value = response.threads

      const requestedApplicationId = typeof route.query.applicationId === 'string'
        ? route.query.applicationId
        : null
      const preferredApplicationId = requestedApplicationId && response.threads.some((thread) => {
        return thread.applicationId === requestedApplicationId
      })
        ? requestedApplicationId
        : response.activeApplicationId || response.threads[0]?.applicationId || null

      if (!preferredApplicationId) {
        await replaceActiveQuery(null)
        resetConversation()
        return
      }

      if (requestedApplicationId !== preferredApplicationId) {
        await replaceActiveQuery(preferredApplicationId)
      }

      await loadConversation(preferredApplicationId)
    } catch (cause) {
      await disconnectRealtime()
      resetConversation()
      error.value = messageFromUnknown(cause, 'Chat workspace could not be loaded.')
    } finally {
      loadingThreads.value = false
      initialized.value = true
    }
  }

  async function refreshWorkspace() {
    refreshing.value = true

    try {
      await load()
    } finally {
      refreshing.value = false
    }
  }

  async function selectThread(applicationId: string) {
    mobileThreadsOpen.value = false

    if (applicationId === activeApplicationId.value) {
      await loadConversation(applicationId)
      return
    }

    await replaceActiveQuery(applicationId)
  }

  async function sendMessage() {
    if (!activeApplication.value || !activeThread.value || !messageDraft.value.trim()) {
      return
    }

    sending.value = true

    try {
      const payload = messageDraft.value
      messageDraft.value = ''

      const result = await $fetch<SendMessageResponse>(`/api/faculty/applications/${activeApplication.value.$id}/chat/messages`, {
        method: 'POST',
        headers: await getRestAuthHeaders(),
        body: {
          message: payload
        }
      })

      upsertMessage(result.message)
      updateThreadListItem(activeApplication.value.$id, {
        unread: false
      })
      await markRead()
    } catch (cause) {
      error.value = messageFromUnknown(cause, 'Message could not be sent.')
    } finally {
      sending.value = false
    }
  }

  watch(() => route.query.applicationId, (value) => {
    if (!initialized.value) {
      return
    }

    const nextApplicationId = typeof value === 'string' ? value : null

    if (!nextApplicationId) {
      const fallback = threads.value[0]?.applicationId || null

      if (fallback) {
        void replaceActiveQuery(fallback)
      }

      return
    }

    if (nextApplicationId !== activeApplication.value?.$id) {
      void loadConversation(nextApplicationId)
    }
  })

  onBeforeUnmount(() => {
    void disconnectRealtime()
  })

  return {
    profile: readonly(profile),
    threads: readonly(threads),
    filteredThreads,
    activeApplication: readonly(activeApplication),
    activeThread: readonly(activeThread),
    activeThreadItem,
    participants: readonly(participants),
    messages: readonly(messages),
    messageDraft,
    threadSearch,
    mobileThreadsOpen,
    loadingThreads: readonly(loadingThreads),
    loadingConversation: readonly(loadingConversation),
    refreshing: readonly(refreshing),
    sending: readonly(sending),
    error: readonly(error),
    realtimeConnected: readonly(realtimeConnected),
    hasThreads,
    counterpartName,
    counterpartInitials,
    conversationMeta,
    load,
    refreshWorkspace,
    selectThread,
    sendMessage,
    markRead
  }
}
