<template>
  <section class="space-y-4">
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold text-slate-900">
          New Application (Next Step)
        </h2>
      </template>

      <div class="space-y-3 text-sm text-slate-600">
        <p>
          This route is ready for the next implementation phase: application form fields, draft save, and document upload.
        </p>
        <UAlert
          color="info"
          variant="soft"
          icon="i-lucide-info"
          title="Current scope"
          description="Authentication, Appwrite integration, and faculty dashboard are now implemented."
        />
      </div>
    </UCard>
  </section>
</template>
