<script setup lang="ts">
import PanelistDashboardPage from '~/features/panelist/pages/PanelistDashboardPage.vue'

definePageMeta({
  layout: 'panelist-portal',
  middleware: ['panelist-auth']
})
</script>

<template>
  <PanelistDashboardPage />
</template>
