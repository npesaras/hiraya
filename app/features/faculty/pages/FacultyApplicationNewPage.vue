<script setup lang="ts">
import { FACULTY_UPLOAD_ACCEPT } from '#shared/utils/faculty-application'
import { formatFileSize, formatShortDate } from '#shared/utils/formatting'
import { useFacultyApplicationForm } from '~/features/faculty/composables/useFacultyApplicationForm'

const { profile } = useAuth()
const {
  application,
  loading,
  saving,
  submitting,
  loadError,
  formError,
  currentStep,
  draft,
  pendingFiles,
  academicYearOptions,
  semesterOptions,
  scholarshipOptions,
  studyLoadOptions,
  stepItems,
  requiredDocumentItems,
  completionPercent,
  uploadedCount,
  canSubmit,
  lastSavedLabel,
  statusLabel,
  isReadOnly,
  loadDraft,
  saveDraft,
  goToStep,
  goNextStep,
  goPreviousStep,
  uploadRequirement,
  submitApplication
} = useFacultyApplicationForm()

const hasMounted = ref(false)

const applicantDisplayName = computed(() => hasMounted.value
  ? (profile.value?.full_name || 'Faculty applicant')
  : 'Faculty applicant')

const applicantDepartment = computed(() => hasMounted.value
  ? (profile.value?.department || 'Not set yet')
  : 'Not set yet')

const overviewCards = computed(() => [
  {
    label: 'Reference',
    value: application.value?.referenceNo || 'Generated on first save'
  },
  {
    label: 'Last Saved',
    value: lastSavedLabel.value
  },
  {
    label: 'Requirements',
    value: `${uploadedCount.value}/${requiredDocumentItems.value.length} ready`
  }
])

const currentStepMeta = computed(() => stepItems.find((step) => step.value === currentStep.value) || stepItems[0])

const currentStepGuidance = computed(() => {
  if (currentStep.value === 1) {
    return 'Choose the academic year, semester, and scholarship type first so the rest of the workflow context stays consistent.'
  }

  if (currentStep.value === 2) {
    return 'Keep the proposed program and institution specific. Reviewers should quickly understand the academic target and study arrangement.'
  }

  if (currentStep.value === 3) {
    return 'Use the purpose statement to show alignment with faculty development and institutional impact, not just personal preference.'
  }

  if (currentStep.value === 4) {
    return 'Replacing a document creates a new version and keeps the latest file marked as current in the backend.'
  }

  return 'Submission sends the application into the FSMES workflow and locks this workspace into review mode until a revision is requested.'
})

onMounted(() => {
  hasMounted.value = true
  void loadDraft()
})

function handleStepChange(value?: string | number) {
  if (typeof value !== 'number') {
    return
  }

  void goToStep(value)
}
</script>

<template>
  <UDashboardPanel id="faculty-application-new">
    <template #header>
      <UDashboardNavbar
        title="Application Workspace"
        icon="i-lucide-file-pen-line"
      >
        <template #right>
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              to="/faculty/dashboard"
              icon="i-lucide-arrow-left"
              class="w-full justify-center sm:w-auto"
            >
              Back to dashboard
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-message-circle-more"
              :to="{ path: '/faculty/dashboard', query: { panel: 'chat' } }"
              class="w-full justify-center sm:w-auto"
            >
              Open chat
            </UButton>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <section class="dashboard-section space-y-6">
        <UAlert
          v-if="loadError"
          color="error"
          variant="soft"
          icon="i-lucide-triangle-alert"
          title="Application workspace could not be loaded"
          :description="loadError"
        />

        <UAlert
          v-else-if="formError"
          color="warning"
          variant="soft"
          icon="i-lucide-circle-alert"
          title="Action needed"
          :description="formError"
        />

        <UCard class="app-surface overflow-hidden">
          <div class="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <div class="space-y-4">
              <div>
                <p class="font-reference text-[12px] uppercase tracking-[0.2em] text-dimmed">
                  Faculty Application
                </p>
                <div class="mt-2 flex flex-wrap items-center gap-3">
                  <h2 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                    Multi-step scholarship application
                  </h2>
                  <UBadge color="primary" variant="soft">
                    {{ statusLabel }}
                  </UBadge>
                </div>
                <p class="mt-3 max-w-3xl text-sm leading-6 text-muted">
                  Save progress step by step, upload the required supporting files, and submit the package once the workflow checklist is complete.
                </p>
              </div>

              <div class="grid gap-3 md:grid-cols-3">
                <div
                  v-for="card in overviewCards"
                  :key="card.label"
                  class="rounded-[calc(var(--ui-radius)+0.25rem)] border border-default bg-default/90 p-4 shadow-sm"
                >
                  <p class="font-reference text-[12px] uppercase tracking-[0.18em] text-dimmed">
                    {{ card.label }}
                  </p>
                  <p class="mt-2 text-base font-semibold text-highlighted">
                    {{ card.value }}
                  </p>
                </div>
              </div>
            </div>

            <div class="rounded-[calc(var(--ui-radius)+0.5rem)] border border-default bg-default/90 p-5 shadow-sm">
              <p class="font-reference text-[12px] uppercase tracking-[0.18em] text-dimmed">
                Applicant Snapshot
              </p>
              <div class="mt-4 space-y-3">
                <div>
                  <p class="text-sm text-muted">Faculty account</p>
                  <p class="text-base font-semibold text-highlighted">
                    {{ applicantDisplayName }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted">Department</p>
                  <p class="text-base font-semibold text-highlighted">
                    {{ applicantDepartment }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted">Completion</p>
                  <div class="mt-2 flex items-center gap-3">
                    <UProgress class="flex-1" :model-value="completionPercent" />
                    <span class="text-sm font-semibold text-highlighted">{{ completionPercent }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UAlert
          v-if="isReadOnly"
          color="info"
          variant="soft"
          icon="i-lucide-lock"
          title="This application is now read-only"
          description="The latest record is already in the workflow. You can review the submitted details here, but edits and uploads are disabled."
        />

        <div class="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <UCard class="overflow-hidden">
            <template #header>
              <div class="space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p class="font-reference text-[12px] uppercase tracking-[0.18em] text-dimmed">
                      Guided Workflow
                    </p>
                    <h3 class="mt-1 text-xl font-semibold text-highlighted">
                      Complete each section with confidence
                    </h3>
                  </div>

                  <UButton
                    color="neutral"
                    variant="soft"
                    icon="i-lucide-save"
                    :loading="saving"
                    :disabled="loading || isReadOnly"
                    class="w-full justify-center sm:w-auto"
                    @click="saveDraft()"
                  >
                    Save draft
                  </UButton>
                </div>

                <div class="rounded-[calc(var(--ui-radius)+0.3rem)] border border-default bg-muted/40 p-4 md:hidden">
                  <p class="font-reference text-[12px] uppercase tracking-[0.18em] text-dimmed">
                    Step {{ currentStep }} of {{ stepItems.length }}
                  </p>
                  <p class="mt-2 text-base font-semibold text-highlighted">
                    {{ currentStepMeta?.title }}
                  </p>
                  <p class="mt-1 text-sm text-muted">
                    {{ currentStepMeta?.description }}
                  </p>
                </div>

                <UStepper
                  class="hidden md:block"
                  :model-value="currentStep"
                  :items="stepItems"
                  color="primary"
                  @update:model-value="handleStepChange"
                />
              </div>
            </template>

            <div v-if="loading" class="space-y-4">
              <USkeleton class="h-32 rounded-[calc(var(--ui-radius)+0.25rem)]" />
              <USkeleton class="h-32 rounded-[calc(var(--ui-radius)+0.25rem)]" />
            </div>

            <div v-else class="space-y-6">
              <div v-if="currentStep === 1" class="space-y-5">
                <div>
                  <p class="font-reference text-[12px] uppercase tracking-[0.18em] text-dimmed">
                    Step 1
                  </p>
                  <h4 class="mt-1 text-xl font-semibold text-highlighted">
                    Set the application cycle
                  </h4>
                  <p class="mt-2 text-sm leading-6 text-muted">
                    Establish the academic period and scholarship lane first so the rest of the package stays aligned.
                  </p>
                </div>

                <UForm :state="draft" class="grid gap-4 md:grid-cols-2">
                  <UFormField name="academicYear" label="Academic year" required>
                    <USelect
                      v-model="draft.academicYear"
                      :items="academicYearOptions"
                      placeholder="Select academic year"
                      :disabled="isReadOnly"
                    />
                  </UFormField>

                  <UFormField name="semester" label="Semester" required>
                    <USelect
                      v-model="draft.semester"
                      :items="semesterOptions"
                      placeholder="Select semester"
                      :disabled="isReadOnly"
                    />
                  </UFormField>

                  <UFormField name="scholarshipType" label="Scholarship type" required class="md:col-span-2">
                    <USelect
                      v-model="draft.scholarshipType"
                      :items="scholarshipOptions"
                      placeholder="Select scholarship type"
                      :disabled="isReadOnly"
                    />
                  </UFormField>
                </UForm>
              </div>

              <div v-else-if="currentStep === 2" class="space-y-5">
                <div>
                  <p class="font-reference text-[12px] uppercase tracking-[0.18em] text-dimmed">
                    Step 2
                  </p>
                  <h4 class="mt-1 text-xl font-semibold text-highlighted">
                    Describe the study plan
                  </h4>
                  <p class="mt-2 text-sm leading-6 text-muted">
                    Tell the reviewers where you plan to study and how the proposed work fits your faculty development path.
                  </p>
                </div>

                <UForm :state="draft" class="grid gap-4 md:grid-cols-2">
                  <UFormField name="proposedProgram" label="Proposed program" required>
                    <UInput
                      v-model="draft.proposedProgram"
                      placeholder="e.g. Master of Public Administration"
                      :disabled="isReadOnly"
                    />
                  </UFormField>

                  <UFormField name="studyLoad" label="Study load" required>
                    <USelect
                      v-model="draft.studyLoad"
                      :items="studyLoadOptions"
                      placeholder="Select study load"
                      :disabled="isReadOnly"
                    />
                  </UFormField>

                  <UFormField name="institutionName" label="Institution name" required class="md:col-span-2">
                    <UInput
                      v-model="draft.institutionName"
                      placeholder="University or training institution"
                      :disabled="isReadOnly"
                    />
                  </UFormField>

                  <UFormField name="expectedOutcomes" label="Expected outcomes" class="md:col-span-2">
                    <UTextarea
                      v-model="draft.expectedOutcomes"
                      :rows="4"
                      autoresize
                      placeholder="Describe how this scholarship will strengthen teaching, extension, research, or leadership work."
                      :disabled="isReadOnly"
                    />
                  </UFormField>
                </UForm>
              </div>

              <div v-else-if="currentStep === 3" class="space-y-5">
                <div>
                  <p class="font-reference text-[12px] uppercase tracking-[0.18em] text-dimmed">
                    Step 3
                  </p>
                  <h4 class="mt-1 text-xl font-semibold text-highlighted">
                    Add applicant notes
                  </h4>
                  <p class="mt-2 text-sm leading-6 text-muted">
                    Provide the narrative and support notes that will help the committee understand the value and practical needs of the request.
                  </p>
                </div>

                <UForm :state="draft" class="space-y-4">
                  <UFormField name="contactPhone" label="Contact phone" required>
                    <UInput
                      v-model="draft.contactPhone"
                      placeholder="Mobile or office contact number"
                      :disabled="isReadOnly"
                    />
                  </UFormField>

                  <UFormField name="purposeStatement" label="Purpose statement" required>
                    <UTextarea
                      v-model="draft.purposeStatement"
                      :rows="7"
                      autoresize
                      placeholder="Explain the academic or professional purpose of the scholarship request."
                      :disabled="isReadOnly"
                    />
                  </UFormField>

                  <UFormField name="supportNeeds" label="Support needs and remarks">
                    <UTextarea
                      v-model="draft.supportNeeds"
                      :rows="5"
                      autoresize
                      placeholder="Add any workflow notes, timeline considerations, or support requirements."
                      :disabled="isReadOnly"
                    />
                  </UFormField>
                </UForm>
              </div>

              <div v-else-if="currentStep === 4" class="space-y-5">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p class="font-reference text-[12px] uppercase tracking-[0.18em] text-dimmed">
                      Step 4
                    </p>
                    <h4 class="mt-1 text-xl font-semibold text-highlighted">
                      Upload the requirement package
                    </h4>
                    <p class="mt-2 text-sm leading-6 text-muted">
                      Each upload is stored through your backend into Appwrite Storage and versioned in the application records.
                    </p>
                  </div>

                  <UBadge color="primary" variant="subtle">
                    {{ uploadedCount }}/{{ requiredDocumentItems.length }} uploaded
                  </UBadge>
                </div>

                <div class="grid gap-4">
                  <article
                    v-for="item in requiredDocumentItems"
                    :key="item.code"
                    class="rounded-[calc(var(--ui-radius)+0.35rem)] border border-default bg-default/80 p-4 shadow-sm"
                  >
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                          <p class="text-sm font-semibold text-highlighted">
                            {{ item.label }}
                          </p>
                          <UBadge :color="item.uploaded ? 'success' : 'warning'" variant="subtle">
                            {{ item.uploaded ? 'Uploaded' : 'Required' }}
                          </UBadge>
                        </div>
                        <p class="mt-1 text-sm leading-6 text-muted">
                          {{ item.description }}
                        </p>
                      </div>

                      <div v-if="item.uploaded" class="text-left sm:text-right">
                        <p class="font-reference text-[12px] uppercase tracking-[0.16em] text-dimmed">
                          Version {{ item.uploaded.versionNo }}
                        </p>
                        <p class="mt-1 text-sm text-muted">
                          {{ formatShortDate(item.uploaded.uploadedAt, 'Pending') }}
                        </p>
                      </div>
                    </div>

                    <div v-if="item.uploaded" class="mt-4 rounded-[calc(var(--ui-radius)+0.2rem)] border border-default bg-muted/40 p-3">
                      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p class="text-sm font-semibold text-highlighted">
                            {{ item.uploaded.fileName || 'Uploaded file' }}
                          </p>
                          <p class="mt-1 text-xs text-muted">
                            {{ formatFileSize(item.uploaded.fileSize) }} · {{ item.uploaded.mimeType || 'Unknown type' }}
                          </p>
                        </div>
                        <UBadge color="neutral" variant="soft">
                          Current file
                        </UBadge>
                      </div>
                    </div>

                    <div v-if="!isReadOnly" class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div class="w-full md:max-w-sm">
                        <UFileUpload
                          v-model="pendingFiles[item.code]"
                          :accept="FACULTY_UPLOAD_ACCEPT"
                          :preview="false"
                          variant="button"
                          color="neutral"
                          class="w-full"
                          label="Choose replacement file"
                          description="PDF, DOC, DOCX, JPG, JPEG, or PNG. Max 10 MB."
                        />
                      </div>

                      <UButton
                        color="primary"
                        icon="i-lucide-upload"
                        :loading="item.uploading"
                        :disabled="!pendingFiles[item.code]"
                        class="w-full justify-center md:w-auto"
                        @click="uploadRequirement(item.code)"
                      >
                        {{ item.uploaded ? 'Upload new version' : 'Upload document' }}
                      </UButton>
                    </div>
                  </article>
                </div>
              </div>

              <div v-else class="space-y-5">
                <div>
                  <p class="font-reference text-[12px] uppercase tracking-[0.18em] text-dimmed">
                    Step 5
                  </p>
                  <h4 class="mt-1 text-xl font-semibold text-highlighted">
                    Review the package before submission
                  </h4>
                  <p class="mt-2 text-sm leading-6 text-muted">
                    Confirm the data below, make sure the supporting documents are complete, then submit the package into the review workflow.
                  </p>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <div class="rounded-[calc(var(--ui-radius)+0.35rem)] border border-default bg-muted/40 p-4">
                    <p class="font-reference text-[12px] uppercase tracking-[0.18em] text-dimmed">
                      Cycle
                    </p>
                    <div class="mt-3 space-y-2 text-sm text-muted">
                      <p><span class="font-semibold text-highlighted">Academic year:</span> {{ draft.academicYear || 'Pending' }}</p>
                      <p><span class="font-semibold text-highlighted">Semester:</span> {{ draft.semester || 'Pending' }}</p>
                      <p><span class="font-semibold text-highlighted">Scholarship:</span> {{ draft.scholarshipType || 'Pending' }}</p>
                    </div>
                  </div>

                  <div class="rounded-[calc(var(--ui-radius)+0.35rem)] border border-default bg-muted/40 p-4">
                    <p class="font-reference text-[12px] uppercase tracking-[0.18em] text-dimmed">
                      Study Plan
                    </p>
                    <div class="mt-3 space-y-2 text-sm text-muted">
                      <p><span class="font-semibold text-highlighted">Program:</span> {{ draft.proposedProgram || 'Pending' }}</p>
                      <p><span class="font-semibold text-highlighted">Institution:</span> {{ draft.institutionName || 'Pending' }}</p>
                      <p><span class="font-semibold text-highlighted">Load:</span> {{ draft.studyLoad || 'Pending' }}</p>
                    </div>
                  </div>

                  <div class="rounded-[calc(var(--ui-radius)+0.35rem)] border border-default bg-muted/40 p-4 md:col-span-2">
                    <p class="font-reference text-[12px] uppercase tracking-[0.18em] text-dimmed">
                      Narrative
                    </p>
                    <div class="mt-3 space-y-3 text-sm leading-6 text-muted">
                      <p><span class="font-semibold text-highlighted">Contact phone:</span> {{ draft.contactPhone || 'Pending' }}</p>
                      <p><span class="font-semibold text-highlighted">Purpose statement:</span> {{ draft.purposeStatement || 'Pending' }}</p>
                      <p><span class="font-semibold text-highlighted">Expected outcomes:</span> {{ draft.expectedOutcomes || 'Not provided' }}</p>
                      <p><span class="font-semibold text-highlighted">Support needs:</span> {{ draft.supportNeeds || 'Not provided' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-col-reverse gap-3 border-t border-default pt-5 sm:flex-row sm:items-center sm:justify-between">
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-arrow-left"
                  :disabled="currentStep === 1 || saving || loading"
                  class="w-full justify-center sm:w-auto"
                  @click="goPreviousStep"
                >
                  Previous
                </UButton>

                <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <UButton
                    color="neutral"
                    variant="soft"
                    icon="i-lucide-save"
                    :loading="saving"
                    :disabled="loading || isReadOnly"
                    class="w-full justify-center sm:w-auto"
                    @click="saveDraft()"
                  >
                    Save draft
                  </UButton>

                  <UButton
                    v-if="currentStep < 5"
                    color="primary"
                    trailing-icon="i-lucide-arrow-right"
                    :loading="saving"
                    :disabled="loading"
                    class="w-full justify-center sm:w-auto"
                    @click="goNextStep"
                  >
                    Next step
                  </UButton>

                  <UButton
                    v-else
                    color="primary"
                    icon="i-lucide-send"
                    :loading="submitting"
                    :disabled="!canSubmit"
                    class="w-full justify-center sm:w-auto"
                    @click="submitApplication"
                  >
                    Submit application
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>

          <div class="space-y-4">
            <UCard>
              <template #header>
                <div>
                  <p class="font-reference text-[12px] uppercase tracking-[0.18em] text-dimmed">
                    Submission Readiness
                  </p>
                  <h3 class="mt-1 text-lg font-semibold text-highlighted">
                    Package progress
                  </h3>
                </div>
              </template>

              <div class="space-y-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted">Completion</span>
                  <span class="font-semibold text-highlighted">{{ completionPercent }}%</span>
                </div>
                <UProgress :model-value="completionPercent" />
                <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div class="rounded-[calc(var(--ui-radius)+0.2rem)] border border-default bg-muted/40 p-3">
                    <p class="font-reference text-[12px] uppercase tracking-[0.16em] text-dimmed">
                      Status
                    </p>
                    <p class="mt-2 text-base font-semibold text-highlighted">
                      {{ statusLabel }}
                    </p>
                  </div>
                  <div class="rounded-[calc(var(--ui-radius)+0.2rem)] border border-default bg-muted/40 p-3">
                    <p class="font-reference text-[12px] uppercase tracking-[0.16em] text-dimmed">
                      Submitted
                    </p>
                    <p class="mt-2 text-base font-semibold text-highlighted">
                      {{ formatShortDate(application?.submittedAt, 'Pending') }}
                    </p>
                  </div>
                </div>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <div>
                  <p class="font-reference text-[12px] uppercase tracking-[0.18em] text-dimmed">
                    Step Guidance
                  </p>
                  <h3 class="mt-1 text-lg font-semibold text-highlighted">
                    What to focus on now
                  </h3>
                </div>
              </template>

              <p class="text-sm leading-6 text-muted">
                {{ currentStepGuidance }}
              </p>
            </UCard>
          </div>
        </div>
      </section>
    </template>
  </UDashboardPanel>
</template>
