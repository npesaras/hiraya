<script setup lang="ts">
type PortalNavItem = {
  label: string
  to: string
  icon?: string
}

const props = withDefaults(defineProps<{
  eyebrow: string
  title: string
  roleLabel: string
  navItems?: PortalNavItem[]
}>(), {
  navItems: () => []
})

const route = useRoute()
const { profile, signOut } = useAuth()
const signingOut = ref(false)

const displayName = computed(() => profile.value?.full_name || props.roleLabel)

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
  <div class="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-6xl space-y-6">
      <header class="rounded-2xl border border-muted bg-default p-4 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {{ eyebrow }}
            </p>
            <h1 class="text-xl font-semibold text-highlighted">
              {{ title }}
            </h1>
            <p class="text-sm text-muted">
              Signed in as
              <span class="font-semibold text-highlighted">{{ displayName }}</span>
            </p>
          </div>

          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="subtle">
              {{ roleLabel }}
            </UBadge>
            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-log-out"
              :loading="signingOut"
              @click="handleSignOut"
            >
              Sign out
            </UButton>
          </div>
        </div>

        <nav v-if="navItems.length" class="mt-4 flex flex-wrap gap-2">
          <UButton
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :icon="item.icon"
            :variant="isActive(item.to) ? 'solid' : 'soft'"
            color="neutral"
          >
            {{ item.label }}
          </UButton>
        </nav>
      </header>

      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
