<template>
  <UDashboardPanel id="faculty-application-new">
    <template #header>
      <UDashboardNavbar
        title="Application Workspace"
        icon="i-lucide-file-plus-2"
      >
        <template #right>
          <UButton
            color="neutral"
            variant="ghost"
            to="/faculty/dashboard"
            icon="i-lucide-arrow-left"
          >
            Back to dashboard
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <section class="dashboard-section space-y-6">
        <UCard class="app-surface">
          <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div class="space-y-4">
              <div>
                <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
                  Faculty Application
                </p>
                <h2 class="mt-2 text-3xl font-semibold tracking-tight text-highlighted">
                  Application authoring is the next build target
                </h2>
                <p class="mt-3 max-w-2xl text-sm leading-6 text-muted">
                  The redesigned portal is now ready for the actual application form flow: draft editing, requirement uploads, reviewer responses, and final submission checkpoints.
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <UButton color="primary" icon="i-lucide-layout-dashboard" to="/faculty/dashboard">
                  Return to dashboard
                </UButton>
                <UButton
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-message-circle-more"
                  :to="{ path: '/faculty/dashboard', query: { panel: 'chat' } }"
                >
                  Open application chat
                </UButton>
              </div>
            </div>

            <div class="rounded-[calc(var(--ui-radius)+0.5rem)] border border-default bg-default/90 p-5 shadow-sm">
              <p class="font-reference text-[11px] uppercase tracking-[0.2em] text-dimmed">
                Ready For Next Sprint
              </p>
              <ul class="mt-4 space-y-3 text-sm text-muted">
                <li class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-muted/40 p-3">
                  Multi-step application form with workflow checkpoints
                </li>
                <li class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-muted/40 p-3">
                  Appwrite-backed document uploads with version tracking
                </li>
                <li class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-muted/40 p-3">
                  Submission actions that emit timeline and chat system events
                </li>
              </ul>
            </div>
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>
