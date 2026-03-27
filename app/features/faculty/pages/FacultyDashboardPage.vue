<script setup lang="ts">
import FacultyConversationPanel from '~/features/faculty/components/FacultyConversationPanel.vue'
import { useFacultyDashboard } from '~/features/faculty/composables/useFacultyDashboard'

const route = useRoute()
const { profile } = useAuth()
const {
  latestApplication,
  activities,
  checklist,
  participants,
  messages,
  messageDraft,
  realtimeConnected,
  loading,
  sendingMessage,
  error,
  uploadedCount,
  missingCount,
  completionPercent,
  hasApplication,
  sendMessage,
  markChatRead,
  disconnectRealtime,
  load
} = useFacultyDashboard()

const chatOpen = ref(false)

const statusColor = computed(() => {
  const status = latestApplication.value?.current_status

  if (status === 'Returned for Revision') return 'warning'
  if (status === 'Decision Recorded' || status === 'Closed') return 'success'
  if (status === 'Submitted' || status === 'Under Review' || status === 'Resubmitted') return 'info'
  return 'neutral'
})

const statusLabel = computed(() => latestApplication.value?.current_status || 'Draft (No submission yet)')
const hasReturnedCase = computed(() => latestApplication.value?.current_status === 'Returned for Revision')
const submittedAtLabel = computed(() => {
  if (!latestApplication.value?.submitted_at) {
    return 'Awaiting submission'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(latestApplication.value.submitted_at))
})

const nextStep = computed(() => {
  const status = latestApplication.value?.current_status

  if (!latestApplication.value) {
    return {
      title: 'Start your scholarship application',
      description: 'Create your first application to generate a reference number, upload requirements, and open the workflow conversation.'
    }
  }

  if (status === 'Returned for Revision') {
    return {
      title: 'Revise the returned submission',
      description: 'Review the panel guidance in the activity log and conversation thread, update your requirements, then resubmit.'
    }
  }

  if (status === 'Submitted' || status === 'Resubmitted' || status === 'Under Review') {
    return {
      title: 'Monitor review progress',
      description: 'Your application is already in motion. Use the chat panel for clarifications and keep your documents ready for any requests.'
    }
  }

  if (status === 'Decision Recorded' || status === 'Closed') {
    return {
      title: 'Review the recorded decision',
      description: 'Your application has a recorded outcome. Keep the workflow history and decision trail accessible for future reference.'
    }
  }

  return {
    title: 'Complete the draft package',
    description: 'Finish the core requirements and submit when your checklist shows the package is ready.'
  }
})

onMounted(load)
onBeforeUnmount(disconnectRealtime)

watch(() => route.query.panel, (panel) => {
  if (panel === 'chat') {
    chatOpen.value = true
    void markChatRead()
    return
  }

  chatOpen.value = false
}, {
  immediate: true
})

function formatActivity(action?: string) {
  if (!action) return 'Workflow event'

  return action
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function openChat() {
  void navigateTo({
    path: '/faculty/dashboard',
    query: {
      ...route.query,
      panel: 'chat'
    }
  }, {
    replace: route.path === '/faculty/dashboard'
  })

  chatOpen.value = true
  void markChatRead()
}

function closeChat() {
  if (route.query.panel === 'chat') {
    const nextQuery = { ...route.query }
    delete nextQuery.panel

    void navigateTo({
      path: route.path,
      query: nextQuery
    }, {
      replace: true
    })
  }

  chatOpen.value = false
}
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="faculty-dashboard-main" class="min-w-0">
      <template #header>
        <UDashboardNavbar
          title="Faculty Dashboard"
          icon="i-lucide-layout-dashboard"
        >
          <template #right>
            <div class="flex items-center gap-2">
              <UButton
                class="xl:hidden"
                color="neutral"
                variant="soft"
                icon="i-lucide-message-circle-more"
                @click="openChat"
              >
                Chat
              </UButton>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-refresh-ccw"
                :loading="loading"
                @click="load"
              >
                Refresh
              </UButton>
              <UButton
                color="primary"
                icon="i-lucide-file-plus-2"
                to="/faculty/application/new"
              >
                Application
              </UButton>
            </div>
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <section class="dashboard-section space-y-6">
          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            icon="i-lucide-triangle-alert"
            title="Dashboard data could not be loaded"
            :description="error"
          />

          <UCard class="app-surface overflow-hidden">
            <div class="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <div class="space-y-5">
                <div class="space-y-2">
                  <p class="text-sm text-muted">
                    Logged in as
                    <span class="font-semibold text-highlighted">{{ profile?.full_name || 'Faculty' }}</span>
                  </p>
                  <div class="flex flex-wrap items-center gap-3">
                    <h2 class="text-3xl font-semibold tracking-tight text-highlighted">
                      Scholarship workflow at a glance
                    </h2>
                    <UBadge :color="statusColor" variant="soft">
                      {{ statusLabel }}
                    </UBadge>
                  </div>
                  <p class="max-w-3xl text-sm leading-6 text-muted">
                    {{ nextStep.description }}
                  </p>
                </div>

                <div class="grid gap-3 sm:grid-cols-3">
                  <div class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-default/90 p-4 shadow-sm">
                    <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
                      Reference
                    </p>
                    <p class="mt-2 text-base font-semibold text-highlighted">
                      {{ latestApplication?.reference_no || 'Not generated yet' }}
                    </p>
                  </div>
                  <div class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-default/90 p-4 shadow-sm">
                    <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
                      Scholarship
                    </p>
                    <p class="mt-2 text-base font-semibold text-highlighted">
                      {{ latestApplication?.scholarship_type || 'Draft package' }}
                    </p>
                  </div>
                  <div class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-default/90 p-4 shadow-sm">
                    <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
                      Submitted
                    </p>
                    <p class="mt-2 text-base font-semibold text-highlighted">
                      {{ submittedAtLabel }}
                    </p>
                  </div>
                </div>

                <UAlert
                  v-if="hasReturnedCase"
                  color="warning"
                  variant="soft"
                  icon="i-lucide-undo-2"
                  title="Returned for revision"
                  description="Review the recent activity and chat guidance, update the flagged items, then submit again."
                />
              </div>

              <div class="space-y-4 rounded-[calc(var(--ui-radius)+0.5rem)] border border-default bg-default/90 p-5 shadow-sm">
                <div>
                  <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
                    Next Action
                  </p>
                  <h3 class="mt-2 text-xl font-semibold text-highlighted">
                    {{ nextStep.title }}
                  </h3>
                </div>

                <div class="space-y-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted">Requirements readiness</span>
                    <span class="font-semibold text-highlighted">{{ completionPercent }}%</span>
                  </div>
                  <UProgress :model-value="completionPercent" />
                  <p class="text-sm text-muted">
                    {{ uploadedCount }}/{{ checklist.length }} uploaded · {{ missingCount }} missing
                  </p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <UButton
                    color="primary"
                    icon="i-lucide-arrow-up-right"
                    to="/faculty/application/new"
                  >
                    Continue workflow
                  </UButton>
                  <UButton
                    color="neutral"
                    variant="soft"
                    icon="i-lucide-message-circle-more"
                    @click="openChat"
                  >
                    Open chat
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>

          <div class="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <UCard>
              <template #header>
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
                      Submission Readiness
                    </p>
                    <h3 class="mt-1 text-lg font-semibold text-highlighted">
                      Required documents
                    </h3>
                  </div>
                  <UBadge color="primary" variant="subtle">
                    {{ uploadedCount }} ready
                  </UBadge>
                </div>
              </template>

              <div class="space-y-3">
                <article
                  v-for="item in checklist"
                  :key="item.code"
                  class="flex items-start justify-between gap-4 rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-default/80 p-4 shadow-sm"
                >
                  <div>
                    <p class="text-sm font-semibold text-highlighted">
                      {{ item.label }}
                    </p>
                    <p class="mt-1 text-xs text-muted">
                      {{ item.uploadedAt ? `Uploaded ${item.uploadedAt}` : 'Pending upload' }}
                    </p>
                  </div>

                  <UBadge :color="item.uploaded ? 'success' : 'warning'" variant="subtle">
                    {{ item.uploaded ? 'Uploaded' : 'Missing' }}
                  </UBadge>
                </article>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <div>
                  <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
                    Quick Actions
                  </p>
                  <h3 class="mt-1 text-lg font-semibold text-highlighted">
                    Keep the workflow moving
                  </h3>
                </div>
              </template>

              <div class="space-y-3">
                <div class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-muted/40 p-4">
                  <p class="text-sm font-semibold text-highlighted">
                    Continue the faculty application
                  </p>
                  <p class="mt-1 text-sm text-muted">
                    Update draft details, finish uploads, and prepare the next submission.
                  </p>
                  <UButton class="mt-3" color="primary" variant="soft" to="/faculty/application/new">
                    Go to application
                  </UButton>
                </div>

                <div class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-muted/40 p-4">
                  <p class="text-sm font-semibold text-highlighted">
                    Review the latest workflow notes
                  </p>
                  <p class="mt-1 text-sm text-muted">
                    Use the activity feed and conversation panel to catch reviewer updates early.
                  </p>
                  <UButton class="mt-3" color="neutral" variant="soft" @click="openChat">
                    Open conversation
                  </UButton>
                </div>
              </div>
            </UCard>
          </div>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
                    Workflow Timeline
                  </p>
                  <h3 class="mt-1 text-lg font-semibold text-highlighted">
                    Recent activity
                  </h3>
                </div>
                <UBadge color="neutral" variant="subtle">
                  {{ activities.length }} items
                </UBadge>
              </div>
            </template>

            <div v-if="!activities.length" class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-dashed border-muted bg-default px-5 py-8 text-sm text-muted">
              No activity yet. Once your application moves through the workflow, updates will be tracked here.
            </div>

            <div v-else class="space-y-3">
              <article
                v-for="activity in activities"
                :key="activity.$id"
                class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-default/80 p-4 shadow-sm"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-semibold text-highlighted">
                    {{ formatActivity(activity.action_type) }}
                  </p>
                  <p class="font-reference text-[11px] uppercase tracking-[0.18em] text-dimmed">
                    {{ activity.created_at ? new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Now' }}
                  </p>
                </div>
                <p class="mt-2 text-sm text-muted">
                  {{ activity.action_summary || 'No additional details provided.' }}
                </p>
              </article>
            </div>
          </UCard>
        </section>
      </template>
    </UDashboardPanel>

    <UDashboardPanel
      id="faculty-dashboard-chat"
      class="hidden xl:flex"
      resizable
      :min-size="24"
      :default-size="32"
      :max-size="38"
    >
      <template #header>
        <div class="border-b border-default px-5 py-4">
          <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
            Realtime Conversation
          </p>
          <h3 class="mt-1 text-lg font-semibold text-highlighted">
            Application chat
          </h3>
        </div>
      </template>

      <template #body>
        <FacultyConversationPanel
          :has-application="hasApplication"
          :application-reference="latestApplication?.reference_no || null"
          :application-status="latestApplication?.current_status || null"
          :participants="participants"
          :messages="messages"
          :draft="messageDraft"
          :loading="loading"
          :sending="sendingMessage"
          :connected="realtimeConnected"
          @update:draft="messageDraft = $event"
          @send="sendMessage"
          @mark-read="markChatRead"
        />
      </template>
    </UDashboardPanel>

    <USlideover
      v-model:open="chatOpen"
      title="Application chat"
      @update:open="(open) => { if (!open) closeChat() }"
    >
      <template #body>
        <FacultyConversationPanel
          :has-application="hasApplication"
          :application-reference="latestApplication?.reference_no || null"
          :application-status="latestApplication?.current_status || null"
          :participants="participants"
          :messages="messages"
          :draft="messageDraft"
          :loading="loading"
          :sending="sendingMessage"
          :connected="realtimeConnected"
          @update:draft="messageDraft = $event"
          @send="sendMessage"
          @mark-read="markChatRead"
        />
      </template>
    </USlideover>
  </div>
</template>
