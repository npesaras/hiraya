<script setup lang="ts">
import FacultyDashboardPage from '~/features/faculty/pages/FacultyDashboardPage.vue'

definePageMeta({
  layout: 'faculty-portal',
  middleware: ['faculty-auth']
})
</script>

<template>
  <FacultyDashboardPage />
</template>
