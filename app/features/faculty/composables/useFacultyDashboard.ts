type ApplicationRow = {
  $id: string
  reference_no?: string
  scholarship_type?: string
  current_status?: string
  created_at?: string
  submitted_at?: string
  updated_at?: string
}

type ActivityRow = {
  $id: string
  action_type?: string
  action_summary?: string
  created_at?: string
}

type DocumentRow = {
  requirement_code?: string
  uploaded_at?: string
  is_current?: boolean
}

export type DocumentChecklistItem = {
  code: string
  label: string
  uploaded: boolean
  uploadedAt: string | null
}

const REQUIRED_DOCUMENTS: Array<{ code: string, label: string }> = [
  { code: 'application_letter', label: 'Application Letter' },
  { code: 'curriculum_vitae', label: 'Curriculum Vitae' },
  { code: 'service_record', label: 'Service Record' },
  { code: 'transcript_records', label: 'Transcript of Records' },
  { code: 'study_plan', label: 'Study Plan / Purpose Statement' },
  { code: 'endorsement_form', label: 'IASP Endorsement Form' }
]

function formatDate(dateLike?: string): string | null {
  if (!dateLike) {
    return null
  }

  const date = new Date(dateLike)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

export function useFacultyDashboard() {
  const { user, ensureSession, getRestAuthHeaders } = useAuth()

  const latestApplication = useState<ApplicationRow | null>('faculty:latest-application', () => null)
  const activities = useState<ActivityRow[]>('faculty:activities', () => [])
  const checklist = useState<DocumentChecklistItem[]>('faculty:checklist', () => [])
  const loading = useState<boolean>('faculty:loading', () => false)
  const error = useState<string | null>('faculty:error', () => null)

  async function fetchLatestApplication(): Promise<ApplicationRow | null> {
    const result = await $fetch<{ ok: boolean, application: ApplicationRow | null }>('/api/faculty/applications/latest', {
      headers: await getRestAuthHeaders()
    })

    return result.application
  }

  async function fetchActivityRows(): Promise<ActivityRow[]> {
    const result = await $fetch<{ ok: boolean, activities: ActivityRow[] }>('/api/faculty/activity-logs', {
      headers: await getRestAuthHeaders()
    })

    return result.activities
  }

  async function fetchDocumentChecklist(applicationId: string): Promise<DocumentChecklistItem[]> {
    const result = await $fetch<{ ok: boolean, documents: DocumentRow[] }>(`/api/faculty/applications/${applicationId}/documents`, {
      headers: await getRestAuthHeaders()
    })

    const currentDocuments = result.documents.filter((document) => document.is_current)

    return REQUIRED_DOCUMENTS.map((requirement) => {
      const found = currentDocuments.find((document) => document.requirement_code === requirement.code)

      return {
        code: requirement.code,
        label: requirement.label,
        uploaded: Boolean(found),
        uploadedAt: formatDate(found?.uploaded_at)
      }
    })
  }

  async function load() {
    loading.value = true
    error.value = null

    try {
      const activeUser = user.value || await ensureSession()

      if (!activeUser) {
        latestApplication.value = null
        activities.value = []
        checklist.value = REQUIRED_DOCUMENTS.map((item) => ({
          code: item.code,
          label: item.label,
          uploaded: false,
          uploadedAt: null
        }))
        return
      }

      latestApplication.value = await fetchLatestApplication()
      activities.value = await fetchActivityRows()

      if (latestApplication.value) {
        checklist.value = await fetchDocumentChecklist(latestApplication.value.$id)
      } else {
        checklist.value = REQUIRED_DOCUMENTS.map((item) => ({
          code: item.code,
          label: item.label,
          uploaded: false,
          uploadedAt: null
        }))
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Failed to load dashboard data.'
      error.value = message
    } finally {
      loading.value = false
    }
  }

  const uploadedCount = computed(() => checklist.value.filter((item) => item.uploaded).length)
  const missingCount = computed(() => checklist.value.length - uploadedCount.value)

  return {
    latestApplication: readonly(latestApplication),
    activities: readonly(activities),
    checklist: readonly(checklist),
    loading: readonly(loading),
    error: readonly(error),
    uploadedCount,
    missingCount,
    load
  }
}
