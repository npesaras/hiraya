<script setup lang="ts">
import { formatMonthDay, formatShortDate } from '#shared/utils/formatting'
import { useFacultyDashboard } from '~/features/faculty/composables/useFacultyDashboard'

const { profile } = useAuth()
const {
  latestApplication,
  activities,
  checklist,
  loading,
  error,
  uploadedCount,
  missingCount,
  completionPercent,
  load
} = useFacultyDashboard()

const hasMounted = ref(false)

const profileDisplayName = computed(() => hasMounted.value
  ? (profile.value?.full_name || 'Faculty')
  : 'Faculty')

const chatRoute = computed(() => {
  if (!latestApplication.value?.$id) {
    return '/faculty/chat'
  }

  return {
    path: '/faculty/chat',
    query: {
      applicationId: latestApplication.value.$id
    }
  }
})

const overviewCards = computed(() => [
  {
    label: 'Reference',
    value: latestApplication.value?.reference_no || 'Not generated yet'
  },
  {
    label: 'Scholarship',
    value: latestApplication.value?.scholarship_type || 'Draft package'
  },
  {
    label: 'Submitted',
    value: formatShortDate(latestApplication.value?.submitted_at, 'Awaiting submission')
  }
])

const statusColor = computed(() => {
  const status = latestApplication.value?.current_status

  if (status === 'Returned for Revision') return 'warning'
  if (status === 'Decision Recorded' || status === 'Closed') return 'success'
  if (status === 'Submitted' || status === 'Under Review' || status === 'Resubmitted') return 'info'
  return 'neutral'
})

const statusLabel = computed(() => latestApplication.value?.current_status || 'Draft (No submission yet)')
const hasReturnedCase = computed(() => latestApplication.value?.current_status === 'Returned for Revision')

const nextStep = computed(() => {
  const status = latestApplication.value?.current_status

  if (!latestApplication.value) {
    return {
      title: 'Start your scholarship application',
      description: 'Create your first application to generate a reference number, upload requirements, and unlock the dedicated workflow chat workspace.'
    }
  }

  if (status === 'Returned for Revision') {
    return {
      title: 'Revise the returned submission',
      description: 'Review the panel guidance in the activity log and chat workspace, update your requirements, then resubmit.'
    }
  }

  if (status === 'Submitted' || status === 'Resubmitted' || status === 'Under Review') {
    return {
      title: 'Monitor review progress',
      description: 'Your application is already in motion. Use the chat workspace for clarifications and keep your documents ready for any requests.'
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

onMounted(() => {
  hasMounted.value = true
  void load()
})

function formatActivity(action?: string) {
  if (!action) return 'Workflow event'

  return action
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatActivityDate(dateLike?: string | null) {
  return formatMonthDay(dateLike, 'Now')
}
</script>

<template>
  <UDashboardPanel id="faculty-dashboard-main" class="min-w-0">
    <template #header>
      <UDashboardNavbar
        title="Faculty Dashboard"
        icon="i-lucide-layout-dashboard"
      >
        <template #right>
          <div class="flex flex-wrap items-center justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-refresh-ccw"
              :loading="loading"
              class="w-full justify-center sm:w-auto"
              @click="load"
            >
              Refresh
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-message-circle-more"
              class="w-full justify-center sm:w-auto"
              :to="chatRoute"
            >
              Chat
            </UButton>
            <UButton
              color="primary"
              icon="i-lucide-file-plus-2"
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
      <section class="dashboard-section faculty-page-shell space-y-6 xl:space-y-7">
        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-lucide-triangle-alert"
          title="Dashboard data could not be loaded"
          :description="error"
        />

        <UCard class="app-surface faculty-elevated-card overflow-hidden border border-primary/10">
          <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] 2xl:grid-cols-[minmax(0,1.18fr)_23rem]">
            <div class="space-y-5">
              <div class="space-y-2">
                <p class="text-sm text-muted">
                  Logged in as
                  <span class="font-semibold text-highlighted">{{ profileDisplayName }}</span>
                </p>
                <div class="flex flex-wrap items-center gap-3">
                  <h2 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl 2xl:text-[2.5rem]">
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

              <div class="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                <div
                  v-for="card in overviewCards"
                  :key="card.label"
                  class="rounded-[calc(var(--ui-radius)+0.35rem)] border border-default bg-default/92 p-4 shadow-[0_14px_34px_rgb(15_23_42_/_0.05)]"
                >
                  <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
                    {{ card.label }}
                  </p>
                  <p class="mt-2 text-base font-semibold text-highlighted">
                    {{ card.value }}
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

            <div class="space-y-4 rounded-[calc(var(--ui-radius)+0.65rem)] border border-default bg-default/92 p-5 shadow-[0_18px_40px_rgb(15_23_42_/_0.06)]">
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

              <div class="flex flex-col gap-2 sm:flex-row">
                <UButton
                  color="primary"
                  icon="i-lucide-arrow-up-right"
                  class="w-full justify-center sm:w-auto"
                  to="/faculty/application/new"
                >
                  Continue workflow
                </UButton>
                <UButton
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-message-circle-more"
                  class="w-full justify-center sm:w-auto"
                  :to="chatRoute"
                >
                  Open chat
                </UButton>
              </div>
            </div>
          </div>
        </UCard>

        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem] 3xl:grid-cols-[minmax(0,1.15fr)_24rem]">
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
                <UButton class="mt-3 w-full justify-center sm:w-auto" color="primary" variant="soft" to="/faculty/application/new">
                  Go to application
                </UButton>
              </div>

              <div class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-muted/40 p-4">
                <p class="text-sm font-semibold text-highlighted">
                  Open the faculty chat workspace
                </p>
                <p class="mt-1 text-sm text-muted">
                  Review reviewer updates, keep the workflow conversation organized, and respond in realtime from a dedicated page.
                </p>
                <UButton class="mt-3 w-full justify-center sm:w-auto" color="neutral" variant="soft" :to="chatRoute">
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
                  {{ formatActivityDate(activity.created_at) }}
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
</template>
