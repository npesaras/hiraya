import {
  FACULTY_APPLICATION_SEMESTERS,
  FACULTY_APPLICATION_STEPS,
  FACULTY_REQUIRED_DOCUMENTS,
  FACULTY_SCHOLARSHIP_TYPES,
  FACULTY_STUDY_LOAD_OPTIONS,
  createEmptyFacultyApplicationDraft,
  isFacultyApplicationEditable,
  type FacultyApplicationDocumentRecord,
  type FacultyApplicationDraftPayload,
  type FacultyApplicationRecord,
  type FacultyRequiredDocumentCode
} from '#shared/utils/faculty-application'
import { formatShortDateTime } from '#shared/utils/formatting'

type DraftResponse = {
  ok: boolean
  editable: boolean
  application: FacultyApplicationRecord | null
  documents: FacultyApplicationDocumentRecord[]
}

type UploadDocumentResponse = {
  ok: boolean
  document: FacultyApplicationDocumentRecord
  documents: FacultyApplicationDocumentRecord[]
}

type SubmitResponse = {
  ok: boolean
  application: FacultyApplicationRecord
}

function formatError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function useFacultyApplicationForm() {
  const { profile, getRestAuthHeaders } = useAuth()
  const toast = useToast()

  const application = ref<FacultyApplicationRecord | null>(null)
  const documents = ref<FacultyApplicationDocumentRecord[]>([])
  const editable = ref(true)
  const loading = ref(false)
  const saving = ref(false)
  const submitting = ref(false)
  const loadError = ref<string | null>(null)
  const formError = ref<string | null>(null)
  const currentStep = ref(1)
  const draft = reactive<FacultyApplicationDraftPayload>(createEmptyFacultyApplicationDraft())
  const pendingFiles = reactive<Record<string, File | null>>({})
  const uploadingByRequirement = reactive<Record<string, boolean>>({})

  const academicYearOptions = computed(() => {
    const year = new Date().getFullYear()

    return Array.from({ length: 4 }, (_, index) => {
      const start = year + index
      return `${start}-${start + 1}`
    })
  })

  const semesterOptions = FACULTY_APPLICATION_SEMESTERS.map((value) => ({ label: value, value }))
  const scholarshipOptions = FACULTY_SCHOLARSHIP_TYPES.map((value) => ({ label: value, value }))
  const studyLoadOptions = FACULTY_STUDY_LOAD_OPTIONS.map((value) => ({ label: value, value }))
  const stepItems = FACULTY_APPLICATION_STEPS.map((step) => ({
    value: step.value,
    title: step.title,
    description: step.description
  }))

  function applyApplication(nextApplication: FacultyApplicationRecord | null) {
    application.value = nextApplication

    const nextDraft = nextApplication
      ? {
          academicYear: nextApplication.academicYear,
          semester: nextApplication.semester,
          scholarshipType: nextApplication.scholarshipType,
          proposedProgram: nextApplication.proposedProgram,
          institutionName: nextApplication.institutionName,
          studyLoad: nextApplication.studyLoad,
          contactPhone: nextApplication.contactPhone,
          purposeStatement: nextApplication.purposeStatement,
          expectedOutcomes: nextApplication.expectedOutcomes,
          supportNeeds: nextApplication.supportNeeds,
          draftStep: nextApplication.draftStep
        }
      : createEmptyFacultyApplicationDraft()

    Object.assign(draft, nextDraft)

    if (!draft.contactPhone && profile.value?.phone) {
      draft.contactPhone = profile.value.phone
    }

    currentStep.value = Math.min(FACULTY_APPLICATION_STEPS.length, Math.max(1, draft.draftStep || 1))
  }

  async function loadDraft() {
    loading.value = true
    loadError.value = null

    try {
      const result = await $fetch<DraftResponse>('/api/faculty/applications/draft', {
        headers: await getRestAuthHeaders()
      })

      editable.value = result.editable
      documents.value = result.documents
      applyApplication(result.application)
    } catch (error) {
      loadError.value = formatError(error, 'The application workspace could not be loaded.')
    } finally {
      loading.value = false
    }
  }

  function getStepValidationErrors(step: number) {
    if (!editable.value) {
      return []
    }

    if (step === 1) {
      return [
        !draft.academicYear && 'Academic year is required.',
        !draft.semester && 'Semester is required.',
        !draft.scholarshipType && 'Scholarship type is required.'
      ].filter(Boolean) as string[]
    }

    if (step === 2) {
      return [
        !draft.proposedProgram && 'Proposed program is required.',
        !draft.institutionName && 'Institution name is required.',
        !draft.studyLoad && 'Study load is required.'
      ].filter(Boolean) as string[]
    }

    if (step === 3) {
      return [
        !draft.contactPhone && 'Contact phone is required.',
        !draft.purposeStatement && 'Purpose statement is required.'
      ].filter(Boolean) as string[]
    }

    if (step === 4 && completionPercent.value < 100) {
      return ['Upload all required documents before continuing to review.']
    }

    return []
  }

  async function saveDraft(targetStep = currentStep.value, options: { silent?: boolean } = {}) {
    if (!editable.value && application.value) {
      currentStep.value = targetStep
      return
    }

    saving.value = true
    formError.value = null

    try {
      const result = await $fetch<DraftResponse>('/api/faculty/applications/draft', {
        method: 'PUT',
        headers: await getRestAuthHeaders(),
        body: {
          ...draft,
          draftStep: targetStep
        }
      })

      editable.value = result.editable
      documents.value = result.documents
      applyApplication(result.application)
      currentStep.value = targetStep

      if (!options.silent) {
        toast.add({
          title: 'Draft saved',
          description: 'Your application progress is now stored in Appwrite.',
          color: 'success',
          icon: 'i-lucide-check'
        })
      }
    } catch (error) {
      const message = formatError(error, 'The draft could not be saved.')
      formError.value = message

      if (!options.silent) {
        toast.add({
          title: 'Save failed',
          description: message,
          color: 'error',
          icon: 'i-lucide-triangle-alert'
        })
      }

      throw error
    } finally {
      saving.value = false
    }
  }

  async function goToStep(nextStep: number) {
    const errors = getStepValidationErrors(currentStep.value)

    if (nextStep > currentStep.value && errors.length > 0) {
      formError.value = errors[0]
      toast.add({
        title: 'Complete this step first',
        description: errors[0],
        color: 'warning',
        icon: 'i-lucide-circle-alert'
      })
      return
    }

    await saveDraft(nextStep, { silent: true })
  }

  async function goNextStep() {
    await goToStep(Math.min(FACULTY_APPLICATION_STEPS.length, currentStep.value + 1))
  }

  async function goPreviousStep() {
    await saveDraft(Math.max(1, currentStep.value - 1), { silent: true })
  }

  async function uploadRequirement(requirementCode: FacultyRequiredDocumentCode) {
    const file = pendingFiles[requirementCode]

    if (!file) {
      formError.value = 'Choose a file before uploading.'
      return
    }

    if (!application.value) {
      await saveDraft(Math.max(currentStep.value, 4), { silent: true })
    }

    if (!application.value) {
      formError.value = 'Create a draft first before uploading files.'
      return
    }

    uploadingByRequirement[requirementCode] = true
    formError.value = null

    try {
      const formData = new FormData()
      formData.set('requirementCode', requirementCode)
      formData.set('file', file)

      const result = await $fetch<UploadDocumentResponse>(`/api/faculty/applications/${application.value.id}/documents`, {
        method: 'POST',
        headers: await getRestAuthHeaders(),
        body: formData
      })

      documents.value = result.documents
      pendingFiles[requirementCode] = null
      toast.add({
        title: 'Document uploaded',
        description: `${result.document.requirementName} is now stored in Appwrite Storage.`,
        color: 'success',
        icon: 'i-lucide-upload'
      })
    } catch (error) {
      const message = formatError(error, 'The document upload failed.')
      formError.value = message
      toast.add({
        title: 'Upload failed',
        description: message,
        color: 'error',
        icon: 'i-lucide-triangle-alert'
      })
    } finally {
      uploadingByRequirement[requirementCode] = false
    }
  }

  async function submitApplication() {
    const validationErrors = [
      ...getStepValidationErrors(1),
      ...getStepValidationErrors(2),
      ...getStepValidationErrors(3),
      ...getStepValidationErrors(4)
    ]

    if (validationErrors.length > 0) {
      formError.value = validationErrors[0]
      toast.add({
        title: 'Submission blocked',
        description: validationErrors[0],
        color: 'warning',
        icon: 'i-lucide-circle-alert'
      })
      return
    }

    await saveDraft(FACULTY_APPLICATION_STEPS.length, { silent: true })

    if (!application.value) {
      formError.value = 'Create a draft first before submitting.'
      return
    }

    submitting.value = true
    formError.value = null

    try {
      const result = await $fetch<SubmitResponse>(`/api/faculty/applications/${application.value.id}/submit`, {
        method: 'POST',
        headers: await getRestAuthHeaders()
      })

      editable.value = isFacultyApplicationEditable(result.application.currentStatus)
      applyApplication(result.application)
      toast.add({
        title: result.application.currentStatus === 'Resubmitted' ? 'Application resubmitted' : 'Application submitted',
        description: `Reference ${result.application.referenceNo || ''} is now in the workflow.`,
        color: 'success',
        icon: 'i-lucide-send'
      })
    } catch (error) {
      const message = formatError(error, 'The application could not be submitted.')
      formError.value = message
      toast.add({
        title: 'Submission failed',
        description: message,
        color: 'error',
        icon: 'i-lucide-triangle-alert'
      })
    } finally {
      submitting.value = false
    }
  }

  const currentDocuments = computed(() => documents.value.filter((document) => document.isCurrent))
  const requiredDocumentItems = computed(() => FACULTY_REQUIRED_DOCUMENTS.map((requirement) => {
    const uploaded = currentDocuments.value.find((document) => document.requirementCode === requirement.code)

    return {
      ...requirement,
      uploaded,
      pendingFile: pendingFiles[requirement.code] || null,
      uploading: Boolean(uploadingByRequirement[requirement.code])
    }
  }))
  const uploadedCount = computed(() => requiredDocumentItems.value.filter((item) => item.uploaded).length)
  const completionPercent = computed(() => Math.round((uploadedCount.value / FACULTY_REQUIRED_DOCUMENTS.length) * 100))
  const canSubmit = computed(() => editable.value && completionPercent.value === 100 && !submitting.value && !saving.value)
  const lastSavedLabel = computed(() => formatShortDateTime(application.value?.lastSavedAt, 'Not saved yet'))
  const statusLabel = computed(() => application.value?.currentStatus || 'Draft')
  const isReadOnly = computed(() => !editable.value)

  return {
    application: readonly(application),
    loading: readonly(loading),
    saving: readonly(saving),
    submitting: readonly(submitting),
    loadError: readonly(loadError),
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
  }
}
