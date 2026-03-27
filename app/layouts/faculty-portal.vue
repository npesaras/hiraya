<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()
const { profile, signOut } = useAuth()

const signingOut = ref(false)

type FacultyNavItem = {
  key: 'dashboard' | 'application' | 'chat'
  label: string
  description: string
  to: string | {
    path: string
    query?: Record<string, string>
  }
  icon: string
}

const navItems: FacultyNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Overview, status, and workflow progress',
    to: '/faculty/dashboard',
    icon: 'i-lucide-layout-dashboard'
  },
  {
    key: 'application',
    label: 'Application',
    description: 'Continue forms, uploads, and submissions',
    to: '/faculty/application/new',
    icon: 'i-lucide-file-plus-2'
  },
  {
    key: 'chat',
    label: 'Chat',
    description: 'Open your live application conversation',
    to: {
      path: '/faculty/dashboard',
      query: {
        panel: 'chat'
      }
    },
    icon: 'i-lucide-message-circle-more'
  }
]

const profileInitials = computed(() => (profile.value?.full_name || 'Faculty')
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part.charAt(0).toUpperCase())
  .join(' '))

const currentThemeLabel = computed(() => colorMode.value === 'dark' ? 'Dark mode ready' : 'Light mode active')

function isActive(item: FacultyNavItem) {
  if (item.key === 'chat') {
    return route.path === '/faculty/dashboard' && route.query.panel === 'chat'
  }

  if (item.key === 'dashboard') {
    return route.path === '/faculty/dashboard' && route.query.panel !== 'chat'
  }

  return route.path === '/faculty/application/new' || route.path.startsWith('/faculty/application/')
}

async function handleSignOut() {
  signingOut.value = true

  try {
    await signOut()
    await navigateTo('/signin')
  } finally {
    signingOut.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[var(--app-background)]">
    <UDashboardGroup
      storage="local"
      storage-key="faculty-portal"
      class="min-h-screen"
    >
      <UDashboardSidebar
        id="faculty-sidebar"
        resizable
        collapsible
        :default-size="18"
        :min-size="14"
        :max-size="22"
        toggle-side="left"
        mode="drawer"
        :ui="{
          root: 'border-r border-default bg-default/95 backdrop-blur-xl',
          body: 'px-4 py-4',
          footer: 'px-4 py-4'
        }"
      >
        <template #header="{ collapsed }">
          <div class="faculty-sidebar-brand rounded-[calc(var(--ui-radius)+0.55rem)] border border-primary/15 p-4 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <UIcon name="i-lucide-school-2" class="size-5" />
              </div>

              <div v-if="!collapsed" class="min-w-0">
                <p class="font-reference text-[11px] uppercase tracking-[0.22em] text-primary/80">
                  FSMES
                </p>
                <h1 class="truncate text-base font-semibold text-highlighted">
                  Faculty Portal
                </h1>
                <p class="text-xs text-muted">
                  Scholarship workflow workspace
                </p>
              </div>
            </div>
          </div>
        </template>

        <template #default="{ collapsed }">
          <div class="flex h-full min-h-0 flex-col gap-6">
            <div class="rounded-[calc(var(--ui-radius)+0.55rem)] border border-default bg-default/90 p-3 shadow-sm">
              <div class="flex items-center gap-3">
                <UAvatar
                  :text="profileInitials"
                  color="primary"
                  size="lg"
                />

                <div v-if="!collapsed" class="min-w-0">
                  <p class="truncate text-sm font-semibold text-highlighted">
                    {{ profile?.full_name || 'Faculty account' }}
                  </p>
                  <p class="truncate text-xs text-muted">
                    {{ profile?.department || 'Faculty applicant' }}
                  </p>
                  <div class="mt-2">
                    <UBadge color="primary" variant="subtle">
                      Faculty Workspace
                    </UBadge>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div v-if="!collapsed" class="px-2">
                <p class="font-reference text-[11px] uppercase tracking-[0.22em] text-dimmed">
                  Workspace
                </p>
              </div>

              <nav class="space-y-2">
                <UButton
                  v-for="item in navItems"
                  :key="item.key"
                  :to="item.to"
                  :icon="item.icon"
                  :variant="isActive(item) ? 'soft' : 'ghost'"
                  :color="isActive(item) ? 'primary' : 'neutral'"
                  :square="collapsed"
                  block
                  class="faculty-sidebar-link justify-start rounded-[calc(var(--ui-radius)+0.35rem)]"
                  :class="isActive(item) ? 'faculty-sidebar-link-active' : 'faculty-sidebar-link-idle'"
                  :ui="{
                    base: collapsed ? 'size-11 justify-center' : 'min-h-14 justify-start px-3 py-3'
                  }"
                >
                  <span v-if="collapsed" class="sr-only">{{ item.label }}</span>

                  <div v-else class="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold">
                        {{ item.label }}
                      </p>
                      <p class="mt-1 truncate text-xs text-muted">
                        {{ item.description }}
                      </p>
                    </div>

                    <UIcon
                      v-if="isActive(item)"
                      name="i-lucide-chevron-right"
                      class="size-4 shrink-0"
                    />
                  </div>
                </UButton>
              </nav>
            </div>

            <div class="mt-auto space-y-3">
              <div v-if="!collapsed" class="rounded-[calc(var(--ui-radius)+0.55rem)] border border-default bg-muted/40 p-4">
                <p class="font-reference text-[11px] uppercase tracking-[0.22em] text-dimmed">
                  Appearance
                </p>
                <div class="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-highlighted">
                      {{ currentThemeLabel }}
                    </p>
                    <p class="text-xs text-muted">
                      Toggle is ready while we stay light-first.
                    </p>
                  </div>
                  <AppColorModeToggle />
                </div>
              </div>

              <UButton
                color="neutral"
                variant="soft"
                icon="i-lucide-bell-ring"
                :label="collapsed ? undefined : 'Latest activity sync enabled'"
                :square="collapsed"
                block
                class="justify-start rounded-[calc(var(--ui-radius)+0.35rem)]"
                disabled
              />
            </div>
          </div>
        </template>

        <template #footer="{ collapsed }">
          <div class="flex items-center gap-2">
            <AppColorModeToggle v-if="collapsed" />
            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-log-out"
              :label="collapsed ? undefined : 'Sign out'"
              :square="collapsed"
              :loading="signingOut"
              @click="handleSignOut"
            />
          </div>
        </template>
      </UDashboardSidebar>

      <slot />
    </UDashboardGroup>
  </div>
</template>

<style scoped>
.faculty-sidebar-brand {
  background:
    linear-gradient(150deg, rgb(20 184 166 / 0.16), rgb(255 255 255 / 0.96)),
    radial-gradient(circle at top right, rgb(14 165 233 / 0.12), transparent 42%);
}

.faculty-sidebar-link {
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.faculty-sidebar-link:hover {
  transform: translateX(2px);
}

.faculty-sidebar-link-active {
  border: 1px solid rgb(20 184 166 / 0.16);
  background: rgb(255 255 255 / 0.98);
  box-shadow: 0 12px 30px rgb(15 23 42 / 0.08);
}

.faculty-sidebar-link-idle {
  border: 1px solid transparent;
}

.dark .faculty-sidebar-brand {
  background:
    linear-gradient(150deg, rgb(20 184 166 / 0.16), rgb(15 23 42 / 0.92)),
    radial-gradient(circle at top right, rgb(14 165 233 / 0.1), transparent 42%);
}

.dark .faculty-sidebar-link-active {
  background: rgb(15 23 42 / 0.88);
  box-shadow: 0 14px 32px rgb(2 6 23 / 0.32);
}
</style>
