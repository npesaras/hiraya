export type AppwriteColumnDefinition = {
  key: string
  type: 'varchar' | 'text' | 'datetime' | 'integer' | 'boolean'
  size?: number
  required: boolean
}

export const APPWRITE_DEFAULT_BUCKET_ID = 'application_documents'

export const APPWRITE_DEFAULT_TABLE_IDS = {
  userProfiles: 'user_profiles',
  applications: 'applications',
  applicationDocuments: 'application_documents',
  panelReviews: 'panel_reviews',
  decisionRecords: 'decision_records',
  statusHistory: 'status_history',
  activityLogs: 'activity_logs',
  applicationThreads: 'application_threads',
  applicationThreadParticipants: 'application_thread_participants',
  applicationMessages: 'application_messages'
} as const

export type AppwriteTableKey = keyof typeof APPWRITE_DEFAULT_TABLE_IDS

export type AppwriteTableDefinition = {
  key: AppwriteTableKey
  envKey: string
  defaultId: string
  name: string
  columns: AppwriteColumnDefinition[]
}

export const APPWRITE_TABLE_ID_ENV_KEYS = {
  userProfiles: 'NUXT_PUBLIC_APPWRITE_USER_PROFILES_TABLE_ID',
  applications: 'NUXT_PUBLIC_APPWRITE_APPLICATIONS_TABLE_ID',
  applicationDocuments: 'NUXT_PUBLIC_APPWRITE_APPLICATION_DOCUMENTS_TABLE_ID',
  panelReviews: 'NUXT_PUBLIC_APPWRITE_PANEL_REVIEWS_TABLE_ID',
  decisionRecords: 'NUXT_PUBLIC_APPWRITE_DECISION_RECORDS_TABLE_ID',
  statusHistory: 'NUXT_PUBLIC_APPWRITE_STATUS_HISTORY_TABLE_ID',
  activityLogs: 'NUXT_PUBLIC_APPWRITE_ACTIVITY_LOGS_TABLE_ID',
  applicationThreads: 'APPWRITE_APPLICATION_THREADS_TABLE_ID',
  applicationThreadParticipants: 'APPWRITE_APPLICATION_THREAD_PARTICIPANTS_TABLE_ID',
  applicationMessages: 'APPWRITE_APPLICATION_MESSAGES_TABLE_ID'
} as const

export const APPWRITE_TABLES: AppwriteTableDefinition[] = [
  {
    key: 'userProfiles',
    envKey: APPWRITE_TABLE_ID_ENV_KEYS.userProfiles,
    defaultId: APPWRITE_DEFAULT_TABLE_IDS.userProfiles,
    name: 'User Profiles',
    columns: [
      { key: 'user_id', type: 'varchar', size: 64, required: true },
      { key: 'full_name', type: 'varchar', size: 255, required: true },
      { key: 'role', type: 'varchar', size: 64, required: true },
      { key: 'department', type: 'varchar', size: 255, required: false },
      { key: 'college_or_office', type: 'varchar', size: 255, required: false },
      { key: 'employee_no', type: 'varchar', size: 64, required: false },
      { key: 'phone', type: 'varchar', size: 32, required: false }
    ]
  },
  {
    key: 'applications',
    envKey: APPWRITE_TABLE_ID_ENV_KEYS.applications,
    defaultId: APPWRITE_DEFAULT_TABLE_IDS.applications,
    name: 'Applications',
    columns: [
      { key: 'applicant_id', type: 'varchar', size: 64, required: true },
      { key: 'reference_no', type: 'varchar', size: 64, required: true },
      { key: 'academic_year', type: 'varchar', size: 32, required: true },
      { key: 'semester', type: 'varchar', size: 32, required: true },
      { key: 'scholarship_type', type: 'varchar', size: 128, required: true },
      { key: 'proposed_program', type: 'varchar', size: 255, required: false },
      { key: 'institution_name', type: 'varchar', size: 255, required: false },
      { key: 'study_load', type: 'varchar', size: 64, required: false },
      { key: 'contact_phone', type: 'varchar', size: 32, required: false },
      { key: 'purpose_statement', type: 'text', required: true },
      { key: 'expected_outcomes', type: 'text', required: false },
      { key: 'support_needs', type: 'text', required: false },
      { key: 'current_status', type: 'varchar', size: 64, required: true },
      { key: 'draft_step', type: 'integer', required: true },
      { key: 'last_saved_at', type: 'datetime', required: false },
      { key: 'submitted_at', type: 'datetime', required: false }
    ]
  },
  {
    key: 'applicationDocuments',
    envKey: APPWRITE_TABLE_ID_ENV_KEYS.applicationDocuments,
    defaultId: APPWRITE_DEFAULT_TABLE_IDS.applicationDocuments,
    name: 'Application Documents',
    columns: [
      { key: 'application_id', type: 'varchar', size: 64, required: true },
      { key: 'uploaded_by', type: 'varchar', size: 64, required: true },
      { key: 'requirement_code', type: 'varchar', size: 64, required: true },
      { key: 'requirement_name', type: 'varchar', size: 255, required: true },
      { key: 'file_id', type: 'varchar', size: 64, required: true },
      { key: 'file_name', type: 'varchar', size: 255, required: true },
      { key: 'mime_type', type: 'varchar', size: 128, required: true },
      { key: 'file_size', type: 'integer', required: true },
      { key: 'version_no', type: 'integer', required: true },
      { key: 'is_current', type: 'boolean', required: true },
      { key: 'uploaded_at', type: 'datetime', required: true }
    ]
  },
  {
    key: 'panelReviews',
    envKey: APPWRITE_TABLE_ID_ENV_KEYS.panelReviews,
    defaultId: APPWRITE_DEFAULT_TABLE_IDS.panelReviews,
    name: 'Panel Reviews',
    columns: [
      { key: 'application_id', type: 'varchar', size: 64, required: true },
      { key: 'reviewer_id', type: 'varchar', size: 64, required: true },
      { key: 'review_status', type: 'varchar', size: 64, required: true },
      { key: 'review_notes', type: 'text', required: false },
      { key: 'missing_items', type: 'text', required: false },
      { key: 'reviewed_at', type: 'datetime', required: true }
    ]
  },
  {
    key: 'decisionRecords',
    envKey: APPWRITE_TABLE_ID_ENV_KEYS.decisionRecords,
    defaultId: APPWRITE_DEFAULT_TABLE_IDS.decisionRecords,
    name: 'Decision Records',
    columns: [
      { key: 'application_id', type: 'varchar', size: 64, required: true },
      { key: 'decided_by', type: 'varchar', size: 64, required: true },
      { key: 'panel_outcome', type: 'varchar', size: 64, required: true },
      { key: 'decision_notes', type: 'text', required: false },
      { key: 'decided_at', type: 'datetime', required: true }
    ]
  },
  {
    key: 'statusHistory',
    envKey: APPWRITE_TABLE_ID_ENV_KEYS.statusHistory,
    defaultId: APPWRITE_DEFAULT_TABLE_IDS.statusHistory,
    name: 'Status History',
    columns: [
      { key: 'application_id', type: 'varchar', size: 64, required: true },
      { key: 'changed_by', type: 'varchar', size: 64, required: true },
      { key: 'from_status', type: 'varchar', size: 64, required: true },
      { key: 'to_status', type: 'varchar', size: 64, required: true },
      { key: 'reason', type: 'text', required: false },
      { key: 'changed_at', type: 'datetime', required: true }
    ]
  },
  {
    key: 'activityLogs',
    envKey: APPWRITE_TABLE_ID_ENV_KEYS.activityLogs,
    defaultId: APPWRITE_DEFAULT_TABLE_IDS.activityLogs,
    name: 'Activity Logs',
    columns: [
      { key: 'application_id', type: 'varchar', size: 64, required: false },
      { key: 'actor_id', type: 'varchar', size: 64, required: true },
      { key: 'action_type', type: 'varchar', size: 64, required: true },
      { key: 'action_summary', type: 'text', required: false },
      { key: 'created_at', type: 'datetime', required: true }
    ]
  },
  {
    key: 'applicationThreads',
    envKey: APPWRITE_TABLE_ID_ENV_KEYS.applicationThreads,
    defaultId: APPWRITE_DEFAULT_TABLE_IDS.applicationThreads,
    name: 'Application Threads',
    columns: [
      { key: 'application_id', type: 'varchar', size: 64, required: true },
      { key: 'reference_no', type: 'varchar', size: 64, required: false },
      { key: 'current_status_snapshot', type: 'varchar', size: 64, required: false },
      { key: 'latest_message_preview', type: 'text', required: false },
      { key: 'latest_message_at', type: 'datetime', required: false },
      { key: 'created_by', type: 'varchar', size: 64, required: true },
      { key: 'created_at', type: 'datetime', required: true }
    ]
  },
  {
    key: 'applicationThreadParticipants',
    envKey: APPWRITE_TABLE_ID_ENV_KEYS.applicationThreadParticipants,
    defaultId: APPWRITE_DEFAULT_TABLE_IDS.applicationThreadParticipants,
    name: 'Application Thread Participants',
    columns: [
      { key: 'thread_id', type: 'varchar', size: 64, required: true },
      { key: 'application_id', type: 'varchar', size: 64, required: true },
      { key: 'participant_user_id', type: 'varchar', size: 64, required: false },
      { key: 'participant_role', type: 'varchar', size: 64, required: true },
      { key: 'display_name', type: 'varchar', size: 255, required: true },
      { key: 'last_read_at', type: 'datetime', required: false },
      { key: 'joined_at', type: 'datetime', required: true }
    ]
  },
  {
    key: 'applicationMessages',
    envKey: APPWRITE_TABLE_ID_ENV_KEYS.applicationMessages,
    defaultId: APPWRITE_DEFAULT_TABLE_IDS.applicationMessages,
    name: 'Application Messages',
    columns: [
      { key: 'thread_id', type: 'varchar', size: 64, required: true },
      { key: 'application_id', type: 'varchar', size: 64, required: true },
      { key: 'message_kind', type: 'varchar', size: 32, required: true },
      { key: 'author_user_id', type: 'varchar', size: 64, required: false },
      { key: 'author_role', type: 'varchar', size: 64, required: false },
      { key: 'author_name', type: 'varchar', size: 255, required: true },
      { key: 'body', type: 'text', required: true },
      { key: 'created_at', type: 'datetime', required: true }
    ]
  }
]
