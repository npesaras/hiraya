<script setup lang="ts">
import type { ChatThreadListItem } from '#shared/utils/chat'
import { formatMonthDay } from '#shared/utils/formatting'

const props = withDefaults(defineProps<{
  threads?: ChatThreadListItem[]
  activeApplicationId?: string | null
  search?: string
  loading?: boolean
}>(), {
  threads: () => [],
  activeApplicationId: null,
  search: '',
  loading: false
})

const emit = defineEmits<{
  select: [applicationId: string]
  'update:search': [value: string]
}>()

const searchModel = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value)
})

function isActiveThread(applicationId: string) {
  return props.activeApplicationId === applicationId
}

function formatThreadDate(dateLike?: string | null) {
  return formatMonthDay(dateLike, 'Now')
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="border-b border-default p-4 sm:p-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
            Messages
          </p>
          <h3 class="mt-1 text-lg font-semibold text-highlighted">
            Application threads
          </h3>
        </div>

        <UBadge color="neutral" variant="subtle">
          {{ threads.length }}
        </UBadge>
      </div>

      <UInput
        v-model="searchModel"
        icon="i-lucide-search"
        placeholder="Search conversations"
        class="mt-4"
      />
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
      <div v-if="loading" class="space-y-3">
        <USkeleton class="h-20 rounded-[calc(var(--ui-radius)+0.35rem)]" />
        <USkeleton class="h-20 rounded-[calc(var(--ui-radius)+0.35rem)]" />
        <USkeleton class="h-20 rounded-[calc(var(--ui-radius)+0.35rem)]" />
      </div>

      <div
        v-else-if="!threads.length"
        class="flex h-full min-h-[18rem] flex-col items-center justify-center rounded-[calc(var(--ui-radius)+0.35rem)] border border-dashed border-muted bg-muted/40 px-5 py-8 text-center"
      >
        <div class="space-y-3">
          <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UIcon name="i-lucide-message-circle-more" class="size-6" />
          </div>
          <h4 class="text-base font-semibold text-highlighted">
            No matching conversations yet
          </h4>
          <p class="text-sm text-muted">
            Once you create an application, your workflow thread will appear here.
          </p>
        </div>
      </div>

      <div v-else class="space-y-3">
        <button
          v-for="thread in threads"
          :key="thread.applicationId"
          type="button"
          class="w-full rounded-[calc(var(--ui-radius)+0.35rem)] border p-4 text-left shadow-sm transition hover:-translate-y-0.5"
          :class="isActiveThread(thread.applicationId)
            ? 'border-primary/25 bg-primary/10 shadow-[0_16px_36px_rgb(15_23_42_/_0.08)]'
            : 'border-default bg-default/95 hover:border-primary/15 hover:bg-default'"
          @click="emit('select', thread.applicationId)"
        >
          <div class="flex items-start gap-3">
            <UAvatar
              :text="thread.counterpartInitials"
              color="primary"
              size="lg"
            />

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-highlighted">
                    {{ thread.counterpartName }}
                  </p>
                  <p class="mt-1 truncate text-xs text-muted">
                    {{ thread.referenceNo || 'Pending reference' }}
                  </p>
                </div>

                <div class="shrink-0 text-right">
                  <p class="font-reference text-[11px] uppercase tracking-[0.16em] text-dimmed">
                    {{ formatThreadDate(thread.latestMessageAt) }}
                  </p>
                  <UBadge
                    v-if="thread.unread"
                    color="primary"
                    variant="solid"
                    class="mt-2"
                  >
                    New
                  </UBadge>
                </div>
              </div>

              <p class="mt-3 line-clamp-2 text-sm text-muted">
                {{ thread.latestMessagePreview || 'No messages yet. Open this thread to start the workflow conversation.' }}
              </p>

              <div class="mt-3 flex flex-wrap items-center gap-2">
                <UBadge color="neutral" variant="subtle">
                  {{ thread.scholarshipType || 'Scholarship workspace' }}
                </UBadge>
                <UBadge color="primary" variant="soft">
                  {{ thread.statusSnapshot || 'Draft' }}
                </UBadge>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
