<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()
const { profile, signOut } = useAuth()

const signingOut = ref(false)

const navItems = [
  {
    label: 'Dashboard',
    to: '/faculty/dashboard',
    icon: 'i-lucide-layout-dashboard'
  },
  {
    label: 'Application',
    to: '/faculty/application/new',
    icon: 'i-lucide-file-plus-2'
  }
]

const profileInitials = computed(() => (profile.value?.full_name || 'Faculty')
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part.charAt(0).toUpperCase())
  .join(' '))

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
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
          <div class="flex items-center gap-3 px-4 py-5">
            <div class="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15">
              <UIcon name="i-lucide-school-2" class="size-5" />
            </div>

            <div v-if="!collapsed" class="min-w-0">
              <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
                FSMES Portal
              </p>
              <h1 class="truncate text-base font-semibold text-highlighted">
                Faculty Workspace
              </h1>
            </div>
          </div>
        </template>

        <template #default="{ collapsed }">
          <div class="space-y-6">
            <div class="rounded-[calc(var(--ui-radius)+0.4rem)] border border-default bg-muted/50 p-3">
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
                </div>
              </div>
            </div>

            <nav class="space-y-1">
              <UButton
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                :icon="item.icon"
                :label="collapsed ? undefined : item.label"
                :variant="isActive(item.to) ? 'soft' : 'ghost'"
                :color="isActive(item.to) ? 'primary' : 'neutral'"
                :square="collapsed"
                block
                class="justify-start rounded-[calc(var(--ui-radius)+0.2rem)]"
              />
            </nav>

            <div v-if="!collapsed" class="rounded-[calc(var(--ui-radius)+0.4rem)] border border-default bg-default p-4 shadow-sm">
              <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
                Theme
              </p>
              <div class="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-highlighted">
                    Light-first now, dark-ready later
                  </p>
                  <p class="text-xs text-muted">
                    Current mode: {{ colorMode.value === 'dark' ? 'Dark' : 'Light' }}
                  </p>
                </div>
                <AppColorModeToggle />
              </div>
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
