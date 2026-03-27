<script setup lang="ts">
const navItems = [
  {
    label: 'Dashboard',
    to: '/panelist/dashboard',
    icon: 'i-lucide-layout-dashboard'
  }
]
</script>

<template>
  <PortalShell
    eyebrow="FSMES Portal"
    title="Panelist Review Workspace"
    role-label="Panelist/Checker"
    :nav-items="navItems"
  >
    <slot />
  </PortalShell>
</template>
