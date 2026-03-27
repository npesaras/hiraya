<script setup lang="ts">
import FacultyApplicationNewPage from '~/features/faculty/pages/FacultyApplicationNewPage.vue'

definePageMeta({
  layout: 'faculty-portal',
  middleware: ['faculty-auth']
})
</script>

<template>
  <FacultyApplicationNewPage />
</template>
