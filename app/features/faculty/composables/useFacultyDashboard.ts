import { FACULTY_REQUIRED_DOCUMENTS } from '#shared/utils/faculty-application'
import { formatShortDateOrNull } from '#shared/utils/formatting'

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

type LatestApplicationResponse = {
  ok: boolean
  application: ApplicationRow | null
}

export type DocumentChecklistItem = {
  code: string
  label: string
  uploaded: boolean
  uploadedAt: string | null
}

function createEmptyChecklist() {
  return FACULTY_REQUIRED_DOCUMENTS.map((item) => ({
    code: item.code,
    label: item.label,
    uploaded: false,
    uploadedAt: null
  }))
}

export function useFacultyDashboard() {
  const { user, ensureSession, getRestAuthHeaders } = useAuth()

  const latestApplication = ref<ApplicationRow | null>(null)
  const activities = ref<ActivityRow[]>([])
  const checklist = ref<DocumentChecklistItem[]>(createEmptyChecklist())
  const loading = ref(false)
  const error = ref<string | null>(null)

  function resetDashboardState() {
    latestApplication.value = null
    activities.value = []
    checklist.value = createEmptyChecklist()
  }

  async function fetchLatestApplication(): Promise<ApplicationRow | null> {
    const result = await $fetch<LatestApplicationResponse>('/api/faculty/applications/latest', {
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

    return FACULTY_REQUIRED_DOCUMENTS.map((requirement) => {
      const found = currentDocuments.find((document) => document.requirement_code === requirement.code)

      return {
        code: requirement.code,
        label: requirement.label,
        uploaded: Boolean(found),
        uploadedAt: formatShortDateOrNull(found?.uploaded_at)
      }
    })
  }

  async function load() {
    loading.value = true
    error.value = null

    try {
      const activeUser = user.value || await ensureSession()

      if (!activeUser) {
        resetDashboardState()
        return
      }

      const [nextApplication, nextActivities] = await Promise.all([
        fetchLatestApplication(),
        fetchActivityRows()
      ])

      latestApplication.value = nextApplication
      activities.value = nextActivities
      checklist.value = nextApplication
        ? await fetchDocumentChecklist(nextApplication.$id)
        : createEmptyChecklist()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to load dashboard data.'
    } finally {
      loading.value = false
    }
  }

  const uploadedCount = computed(() => checklist.value.filter((item) => item.uploaded).length)
  const missingCount = computed(() => checklist.value.length - uploadedCount.value)
  const completionPercent = computed(() => {
    if (!checklist.value.length) return 0
    return Math.round((uploadedCount.value / checklist.value.length) * 100)
  })
  const hasApplication = computed(() => Boolean(latestApplication.value))

  return {
    latestApplication: readonly(latestApplication),
    activities: readonly(activities),
    checklist: readonly(checklist),
    loading: readonly(loading),
    error: readonly(error),
    hasApplication,
    uploadedCount,
    missingCount,
    completionPercent,
    load
  }
}
