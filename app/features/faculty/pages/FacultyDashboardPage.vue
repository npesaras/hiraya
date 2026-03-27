<script setup lang="ts">
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
  load
} = useFacultyDashboard()

const statusColor = computed(() => {
  const status = latestApplication.value?.current_status

  if (status === 'Returned for Revision') return 'warning'
  if (status === 'Decision Recorded') return 'success'
  if (status === 'Submitted' || status === 'Under Review' || status === 'Resubmitted') return 'info'
  return 'neutral'
})

const statusLabel = computed(() => latestApplication.value?.current_status || 'Draft (No submission yet)')
const hasReturnedCase = computed(() => latestApplication.value?.current_status === 'Returned for Revision')
const completionPercent = computed(() => {
  if (!checklist.value.length) return 0
  return Math.round((uploadedCount.value / checklist.value.length) * 100)
})

onMounted(load)

function formatActivity(action?: string) {
  if (!action) return 'Workflow event'

  return action
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-2xl border border-muted bg-default p-5 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm text-muted">
            Logged in as
            <span class="font-semibold text-highlighted">{{ profile?.full_name || 'Faculty' }}</span>
          </p>
          <h2 class="text-2xl font-semibold text-highlighted">
            Faculty Dashboard
          </h2>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-file-plus-2"
            to="/faculty/application/new"
          >
            Start / Continue Application
          </UButton>
          <UButton
            variant="soft"
            color="neutral"
            icon="i-lucide-refresh-ccw"
            :loading="loading"
            @click="load"
          >
            Refresh
          </UButton>
        </div>
      </div>
    </header>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="Dashboard data could not be loaded"
      :description="error"
    />

    <div class="grid gap-4 lg:grid-cols-3">
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-muted">
              Current Application Status
            </p>
            <UBadge :color="statusColor" variant="soft">
              {{ statusLabel }}
            </UBadge>
          </div>
        </template>

        <div class="space-y-3 text-sm text-muted">
          <p>
            <span class="font-medium text-highlighted">Reference:</span>
            {{ latestApplication?.reference_no || 'Not generated yet' }}
          </p>
          <p>
            <span class="font-medium text-highlighted">Scholarship type:</span>
            {{ latestApplication?.scholarship_type || 'To be filled on application form' }}
          </p>
          <UAlert
            v-if="hasReturnedCase"
            color="warning"
            variant="soft"
            icon="i-lucide-undo-2"
            title="Returned for revision"
            description="Please review panel notes, update required fields/documents, then resubmit."
          />
        </div>
      </UCard>

      <UCard>
        <template #header>
          <p class="text-sm font-medium text-muted">
            Document Checklist
          </p>
        </template>

        <div class="space-y-3">
          <UProgress :model-value="completionPercent" />
          <p class="text-sm text-muted">
            {{ uploadedCount }}/{{ checklist.length }} uploaded · {{ missingCount }} missing
          </p>
        </div>
      </UCard>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <UCard>
        <template #header>
          <p class="text-sm font-medium text-muted">
            Required Documents Summary
          </p>
        </template>

        <ul class="space-y-3">
          <li
            v-for="item in checklist"
            :key="item.code"
            class="flex items-start justify-between gap-3 rounded-lg border border-muted/70 p-3"
          >
            <div>
              <p class="text-sm font-medium text-highlighted">
                {{ item.label }}
              </p>
              <p class="text-xs text-muted">
                {{ item.uploadedAt ? `Uploaded ${item.uploadedAt}` : 'Pending upload' }}
              </p>
            </div>

            <UBadge :color="item.uploaded ? 'success' : 'warning'" variant="subtle">
              {{ item.uploaded ? 'Uploaded' : 'Missing' }}
            </UBadge>
          </li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <p class="text-sm font-medium text-muted">
            Recent Activity
          </p>
        </template>

        <div v-if="!activities.length" class="rounded-lg border border-dashed border-muted p-4 text-sm text-muted">
          No activity yet. Your submission actions will appear here.
        </div>

        <ul v-else class="space-y-3">
          <li
            v-for="activity in activities"
            :key="activity.$id"
            class="rounded-lg border border-muted/70 p-3"
          >
            <p class="text-sm font-medium text-highlighted">
              {{ formatActivity(activity.action_type) }}
            </p>
            <p class="text-xs text-muted">
              {{ activity.action_summary || 'No additional details provided.' }}
            </p>
          </li>
        </ul>
      </UCard>
    </div>
  </section>
</template>
