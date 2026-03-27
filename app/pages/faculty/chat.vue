<script setup lang="ts">
import FacultyChatPage from '~/features/faculty/pages/FacultyChatPage.vue'

definePageMeta({
  layout: 'faculty-portal',
  middleware: ['faculty-auth']
})
</script>

<template>
  <FacultyChatPage />
</template>
