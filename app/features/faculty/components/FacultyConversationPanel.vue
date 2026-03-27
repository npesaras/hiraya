<script setup lang="ts">
import type { ChatMessage, ChatParticipantSummary } from '#shared/utils/chat'
import { formatShortDateTime } from '#shared/utils/formatting'

const props = withDefaults(defineProps<{
  hasApplication?: boolean
  applicationReference?: string | null
  applicationStatus?: string | null
  participants?: ChatParticipantSummary[]
  messages?: ChatMessage[]
  draft?: string
  loading?: boolean
  sending?: boolean
  connected?: boolean
}>(), {
  hasApplication: false,
  applicationReference: null,
  applicationStatus: null,
  participants: () => [],
  messages: () => [],
  draft: '',
  loading: false,
  sending: false,
  connected: false
})

const emit = defineEmits<{
  'update:draft': [value: string]
  send: []
  markRead: []
}>()

const draftModel = computed({
  get: () => props.draft,
  set: (value: string) => emit('update:draft', value)
})

const participantSummary = computed(() => props.participants
  .filter((participant) => !participant.isCurrentUser)
  .map((participant) => participant.displayName)
  .join(', '))

function formatTimestamp(dateLike?: string | null) {
  return formatShortDateTime(dateLike, 'Just now')
}

function onKeyboardSubmit(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault()
    emit('send')
  }
}
</script>

<template>
  <div
    class="flex h-full min-h-0 flex-col"
    @focusin="emit('markRead')"
    @mouseenter="emit('markRead')"
  >
    <div
      v-if="!hasApplication"
      class="flex h-full flex-col items-center justify-center rounded-[calc(var(--ui-radius)+0.25rem)] border border-dashed border-muted bg-muted/40 px-5 py-10 text-center sm:px-6"
    >
      <div class="space-y-3">
        <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UIcon name="i-lucide-message-circle-more" class="size-6" />
        </div>
        <h3 class="text-base font-semibold text-highlighted">
          Chat becomes available after your first application is created.
        </h3>
        <p class="text-sm text-muted">
          Start or continue an application to open your workflow conversation with FSMES reviewers and panelists.
        </p>
        <UButton
          to="/faculty/application/new"
          icon="i-lucide-file-plus-2"
          color="primary"
          class="w-full justify-center sm:w-auto"
        >
          Start application
        </UButton>
      </div>
    </div>

    <template v-else>
      <div class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-muted/50 p-3 sm:p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-1">
            <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
              Application Thread
            </p>
            <p class="text-sm font-semibold text-highlighted">
              {{ applicationReference || 'Pending reference number' }}
            </p>
            <p class="text-xs text-muted">
              {{ applicationStatus || 'Draft' }}
              <span v-if="participantSummary"> · Shared with {{ participantSummary }}</span>
            </p>
          </div>

          <UBadge :color="connected ? 'success' : 'neutral'" variant="soft">
            {{ connected ? 'Live' : 'Syncing' }}
          </UBadge>
        </div>
      </div>

      <div class="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        <div v-if="loading" class="space-y-3">
          <USkeleton class="h-20 rounded-[calc(var(--ui-radius)+0.25rem)]" />
          <USkeleton class="ml-auto h-20 w-4/5 rounded-[calc(var(--ui-radius)+0.25rem)]" />
          <USkeleton class="h-16 w-3/4 rounded-[calc(var(--ui-radius)+0.25rem)]" />
        </div>

        <div v-else-if="!messages.length" class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-dashed border-muted bg-default px-5 py-8 text-center">
          <p class="text-sm font-semibold text-highlighted">
            No messages yet
          </p>
          <p class="mt-2 text-sm text-muted">
            Your conversation history will appear here once the workflow starts exchanging updates.
          </p>
        </div>

        <div v-else class="space-y-3">
          <article
            v-for="message in messages"
            :key="message.id"
            :class="[
              'rounded-[calc(var(--ui-radius)+0.25rem)] border px-4 py-3 shadow-sm',
              message.kind === 'system'
                ? 'border-primary/20 bg-primary/5'
                : message.authorUserId && participants.find((participant) => participant.userId === message.authorUserId)?.isCurrentUser
                  ? 'ml-auto border-primary/30 bg-primary/10'
                  : 'border-default bg-default'
            ]"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-semibold text-highlighted">
                {{ message.kind === 'system' ? 'FSMES Workflow' : message.authorName }}
              </p>
              <p class="font-reference text-[11px] uppercase tracking-[0.16em] text-dimmed">
                {{ formatTimestamp(message.createdAt) }}
              </p>
            </div>

            <p class="mt-2 whitespace-pre-wrap text-sm leading-6 text-default">
              {{ message.body }}
            </p>
          </article>
        </div>
      </div>

      <div class="mt-4 rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-default p-3 shadow-sm">
        <UTextarea
          v-model="draftModel"
          :rows="4"
          autoresize
          placeholder="Write a workflow message. Use Ctrl/Cmd + Enter to send."
          @keydown="onKeyboardSubmit"
        />

        <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="max-w-sm text-xs text-dimmed">
            Messages are stored in your backend and sync live through Appwrite Realtime.
          </p>

          <UButton
            color="primary"
            icon="i-lucide-send"
            :loading="sending"
            :disabled="!draft.trim()"
            class="w-full justify-center sm:w-auto"
            @click="emit('send')"
          >
            Send
          </UButton>
        </div>
      </div>
    </template>
  </div>
</template>
