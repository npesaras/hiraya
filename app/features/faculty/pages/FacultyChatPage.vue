<script setup lang="ts">
import { formatShortDateTime } from '#shared/utils/formatting'
import FacultyChatThreadList from '~/features/faculty/components/FacultyChatThreadList.vue'
import FacultyConversationPanel from '~/features/faculty/components/FacultyConversationPanel.vue'
import { useFacultyChatWorkspace } from '~/features/faculty/composables/useFacultyChatWorkspace'

const {
  profile,
  filteredThreads,
  activeApplication,
  activeThread,
  activeThreadItem,
  participants,
  messages,
  messageDraft,
  threadSearch,
  mobileThreadsOpen,
  loadingThreads,
  loadingConversation,
  refreshing,
  sending,
  error,
  realtimeConnected,
  hasThreads,
  counterpartName,
  counterpartInitials,
  conversationMeta,
  load,
  refreshWorkspace,
  selectThread,
  sendMessage,
  markRead
} = useFacultyChatWorkspace()

const profileName = computed(() => profile.value?.full_name || 'Faculty account')
const profileDepartment = computed(() => profile.value?.department || 'Faculty applicant')

const activeStatusColor = computed(() => {
  const status = activeApplication.value?.current_status

  if (status === 'Returned for Revision') return 'warning'
  if (status === 'Decision Recorded' || status === 'Closed') return 'success'
  if (status === 'Submitted' || status === 'Under Review' || status === 'Resubmitted') return 'info'
  return 'neutral'
})

const conversationTimestamp = computed(() => {
  return formatShortDateTime(activeThreadItem.value?.latestMessageAt, 'Waiting for the first workflow note')
})

onMounted(() => {
  void load()
})
</script>

<template>
  <UDashboardPanel id="faculty-chat-workspace" class="min-w-0">
    <template #header>
      <UDashboardNavbar
        title="Faculty Chat"
        icon="i-lucide-messages-square"
      >
        <template #right>
          <div class="flex w-full flex-wrap items-center justify-end gap-2">
            <UButton
              class="w-full justify-center sm:w-auto xl:hidden"
              color="neutral"
              variant="soft"
              icon="i-lucide-panel-left-open"
              @click="mobileThreadsOpen = true"
            >
              Conversations
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-refresh-ccw"
              :loading="refreshing"
              class="w-full justify-center sm:w-auto"
              @click="refreshWorkspace"
            >
              Refresh
            </UButton>
            <UButton
              color="primary"
              icon="i-lucide-file-pen-line"
              class="w-full justify-center sm:w-auto"
              to="/faculty/application/new"
            >
              Application
            </UButton>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <section class="dashboard-section faculty-page-shell space-y-4 xl:space-y-6">
        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-lucide-triangle-alert"
          title="Chat workspace could not be fully loaded"
          :description="error"
        />

        <div class="grid gap-4 xl:grid-cols-[minmax(20rem,22rem)_minmax(0,1fr)] 3xl:grid-cols-[24rem_minmax(0,1fr)]">
          <UCard class="faculty-elevated-card hidden overflow-hidden xl:flex xl:min-h-[calc(100vh-11.5rem)] xl:flex-col">
            <FacultyChatThreadList
              :threads="filteredThreads"
              :active-application-id="activeApplication?.$id || null"
              :search="threadSearch"
              :loading="loadingThreads"
              @update:search="threadSearch = $event"
              @select="selectThread"
            />
          </UCard>

          <UCard class="faculty-elevated-card overflow-hidden">
            <div v-if="!hasThreads && !loadingThreads" class="flex min-h-[32rem] flex-col items-center justify-center px-6 py-10 text-center xl:min-h-[calc(100vh-11.5rem)]">
              <div class="space-y-4">
                <div class="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UIcon name="i-lucide-message-circle-more" class="size-7" />
                </div>
                <div>
                  <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
                    No active thread
                  </p>
                  <h3 class="mt-2 text-2xl font-semibold text-highlighted">
                    Start an application to unlock the workflow conversation
                  </h3>
                  <p class="mt-3 max-w-xl text-sm leading-6 text-muted">
                    Your faculty chat is created from the application workspace and then kept in sync through your backend and Appwrite Realtime.
                  </p>
                </div>
                <UButton
                  to="/faculty/application/new"
                  color="primary"
                  icon="i-lucide-file-plus-2"
                  class="w-full justify-center sm:w-auto"
                >
                  Create application
                </UButton>
              </div>
            </div>

            <div v-else-if="activeApplication || loadingConversation || loadingThreads" class="flex min-h-[32rem] flex-col xl:min-h-[calc(100vh-11.5rem)]">
              <div class="border-b border-default px-4 py-4 sm:px-6">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div class="flex items-start gap-3">
                    <UAvatar
                      :text="counterpartInitials"
                      color="primary"
                      size="xl"
                    />

                    <div class="space-y-2">
                      <div>
                        <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
                          Conversation
                        </p>
                        <h2 class="text-xl font-semibold text-highlighted">
                          {{ counterpartName }}
                        </h2>
                      </div>

                      <div class="flex flex-wrap items-center gap-2">
                        <UBadge :color="realtimeConnected ? 'success' : 'neutral'" variant="soft">
                          {{ realtimeConnected ? 'Live on Realtime' : 'Syncing through backend' }}
                        </UBadge>
                        <UBadge :color="activeStatusColor" variant="subtle">
                          {{ activeApplication?.current_status || 'Draft' }}
                        </UBadge>
                      </div>

                      <p class="text-sm text-muted">
                        {{ conversationMeta }}
                      </p>
                    </div>
                  </div>

                  <div class="flex flex-col items-start gap-3 lg:items-end">
                    <div class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-muted/40 px-4 py-3">
                      <p class="font-reference text-[11px] uppercase tracking-[0.18em] text-dimmed">
                        Latest update
                      </p>
                      <p class="mt-1 text-sm font-semibold text-highlighted">
                        {{ conversationTimestamp }}
                      </p>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                      <UButton
                        color="neutral"
                        variant="soft"
                        icon="i-lucide-panel-left-open"
                        class="xl:hidden"
                        @click="mobileThreadsOpen = true"
                      >
                        Threads
                      </UButton>
                      <UButton
                        color="neutral"
                        variant="soft"
                        icon="i-lucide-file-pen-line"
                        to="/faculty/application/new"
                      >
                        Open application
                      </UButton>
                    </div>
                  </div>
                </div>

                <div class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[calc(var(--ui-radius)+0.35rem)] border border-default bg-muted/35 px-4 py-3">
                  <div>
                    <p class="text-sm font-semibold text-highlighted">
                      {{ profileName }}
                    </p>
                    <p class="text-xs text-muted">
                      {{ profileDepartment }}
                    </p>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <UBadge color="neutral" variant="subtle">
                      {{ participants.length }} participant{{ participants.length === 1 ? '' : 's' }}
                    </UBadge>
                    <UBadge color="primary" variant="soft">
                      {{ activeApplication?.reference_no || 'Pending reference' }}
                    </UBadge>
                  </div>
                </div>
              </div>

              <div class="min-h-0 flex-1 p-4 sm:p-6">
                <FacultyConversationPanel
                  :has-application="Boolean(activeApplication && activeThread)"
                  :application-reference="activeApplication?.reference_no || null"
                  :application-status="activeApplication?.current_status || null"
                  :participants="participants"
                  :messages="messages"
                  :draft="messageDraft"
                  :loading="loadingConversation || loadingThreads"
                  :sending="sending"
                  :connected="realtimeConnected"
                  :show-summary="false"
                  @update:draft="messageDraft = $event"
                  @send="sendMessage"
                  @mark-read="markRead"
                />
              </div>
            </div>

            <div v-else class="flex min-h-[32rem] flex-col items-center justify-center px-6 py-10 text-center xl:min-h-[calc(100vh-11.5rem)]">
              <div class="space-y-3">
                <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UIcon name="i-lucide-circle-alert" class="size-6" />
                </div>
                <h3 class="text-xl font-semibold text-highlighted">
                  Conversation unavailable
                </h3>
                <p class="max-w-xl text-sm leading-6 text-muted">
                  We found your chat threads, but the selected conversation could not be opened yet. Refresh the workspace or pick another thread from the list.
                </p>
                <UButton
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-refresh-ccw"
                  class="w-full justify-center sm:w-auto"
                  @click="refreshWorkspace"
                >
                  Refresh workspace
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </section>
    </template>
  </UDashboardPanel>

  <USlideover
    v-model:open="mobileThreadsOpen"
    title="Conversations"
    :ui="{
      content: 'sm:max-w-md',
      body: 'p-0'
    }"
  >
    <template #body>
      <div class="h-[calc(100vh-5rem)] min-h-0">
        <FacultyChatThreadList
          :threads="filteredThreads"
          :active-application-id="activeApplication?.$id || null"
          :search="threadSearch"
          :loading="loadingThreads"
          @update:search="threadSearch = $event"
          @select="selectThread"
        />
      </div>
    </template>
  </USlideover>
</template>
