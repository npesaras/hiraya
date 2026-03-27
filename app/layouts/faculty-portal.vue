<script setup lang="ts">
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
</script>

<template>
  <PortalShell
    eyebrow="FSMES Portal"
    title="Faculty Scholarship Workflow"
    role-label="Faculty"
    :nav-items="navItems"
  >
    <slot />
  </PortalShell>
</template>
