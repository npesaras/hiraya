import { InputFile } from 'node-appwrite/file'
import {
  ID,
  Permission,
  Query,
  Role,
  type Models,
  type Storage,
  type TablesDB,
  type Users
} from 'node-appwrite'
import { createError } from 'h3'
import { USER_ROLES, type ApplicationStatus } from '#shared/utils/appwrite'
import {
  FACULTY_ALLOWED_FILE_EXTENSIONS,
  FACULTY_APPLICATION_STEPS,
  FACULTY_MAX_FILE_SIZE_BYTES,
  FACULTY_REQUIRED_DOCUMENTS,
  createEmptyFacultyApplicationDraft,
  getFacultyRequiredDocument,
  isFacultyApplicationEditable,
  type FacultyApplicationDocumentRecord,
  type FacultyApplicationDraftPayload,
  type FacultyApplicationRecord,
  type FacultyRequiredDocumentCode
} from '#shared/utils/faculty-application'
import type { AdminConfig } from '~~/server/utils/appwrite-admin'
import { getUserProfileByUserId, type UserProfileRow } from '~~/server/utils/user-profiles'

export type FacultyApplicationRow = {
  $id: string
  applicant_id: string
  reference_no?: string
  academic_year?: string
  semester?: string
  scholarship_type?: string
  proposed_program?: string
  institution_name?: string
  study_load?: string
  contact_phone?: string
  purpose_statement?: string
  expected_outcomes?: string
  support_needs?: string
  current_status?: string
  draft_step?: number
  last_saved_at?: string
  submitted_at?: string
  $createdAt?: string
  $updatedAt?: string
}

export type ActivityLogRow = {
  $id: string
  actor_id?: string
  action_type?: string
  action_summary?: string
  created_at?: string
}

export type ApplicationDocumentRow = {
  $id: string
  application_id: string
  requirement_code?: string
  requirement_name?: string
  uploaded_at?: string
  is_current?: boolean
  file_name?: string
  file_id?: string
  mime_type?: string
  file_size?: number
  version_no?: number
}

type UploadFacultyDocumentInput = {
  applicationId: string
  userId: string
  requirementCode: FacultyRequiredDocumentCode
  fileName: string
  fileType: string
  fileData: Uint8Array
}

const SUBMIT_REQUIRED_FIELD_LABELS: Array<{ key: keyof FacultyApplicationDraftPayload, label: string }> = [
  { key: 'academicYear', label: 'Academic year' },
  { key: 'semester', label: 'Semester' },
  { key: 'scholarshipType', label: 'Scholarship type' },
  { key: 'proposedProgram', label: 'Proposed program' },
  { key: 'institutionName', label: 'Institution name' },
  { key: 'studyLoad', label: 'Study load' },
  { key: 'contactPhone', label: 'Contact phone' },
  { key: 'purposeStatement', label: 'Purpose statement' }
]

function getUserResourcePermissions(userId: string) {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId))
  ]
}

function normalizeText(value?: string | null) {
  return value?.trim() || ''
}

function normalizeDraftStep(value?: number | null) {
  if (!value || Number.isNaN(value)) {
    return 1
  }

  return Math.min(FACULTY_APPLICATION_STEPS.length, Math.max(1, Math.round(value)))
}

function sanitizeDraftPayload(input: Partial<FacultyApplicationDraftPayload>): FacultyApplicationDraftPayload {
  const defaults = createEmptyFacultyApplicationDraft()

  return {
    academicYear: normalizeText(input.academicYear ?? defaults.academicYear),
    semester: normalizeText(input.semester ?? defaults.semester),
    scholarshipType: normalizeText(input.scholarshipType ?? defaults.scholarshipType),
    proposedProgram: normalizeText(input.proposedProgram ?? defaults.proposedProgram),
    institutionName: normalizeText(input.institutionName ?? defaults.institutionName),
    studyLoad: normalizeText(input.studyLoad ?? defaults.studyLoad),
    contactPhone: normalizeText(input.contactPhone ?? defaults.contactPhone),
    purposeStatement: normalizeText(input.purposeStatement ?? defaults.purposeStatement),
    expectedOutcomes: normalizeText(input.expectedOutcomes ?? defaults.expectedOutcomes),
    supportNeeds: normalizeText(input.supportNeeds ?? defaults.supportNeeds),
    draftStep: normalizeDraftStep(input.draftStep ?? defaults.draftStep)
  }
}

function toDraftData(payload: FacultyApplicationDraftPayload, currentStatus: ApplicationStatus | 'Returned for Revision') {
  return {
    academic_year: payload.academicYear,
    semester: payload.semester,
    scholarship_type: payload.scholarshipType,
    proposed_program: payload.proposedProgram,
    institution_name: payload.institutionName,
    study_load: payload.studyLoad,
    contact_phone: payload.contactPhone,
    purpose_statement: payload.purposeStatement,
    expected_outcomes: payload.expectedOutcomes,
    support_needs: payload.supportNeeds,
    draft_step: payload.draftStep,
    current_status: currentStatus,
    last_saved_at: new Date().toISOString()
  }
}

function buildReferenceNo(userId: string) {
  const now = new Date()
  const stamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0')
  ].join('')
  const suffix = `${userId.slice(-4)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
  return `FSMES-${stamp}-${suffix}`
}

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+/, '')
    .slice(0, 120) || 'document'
}

function getFileExtension(fileName: string) {
  const segments = fileName.toLowerCase().split('.')
  return segments.length > 1 ? segments.pop() || '' : ''
}

function ensureAllowedUpload(fileName: string, fileData: Uint8Array) {
  const extension = getFileExtension(fileName)

  if (!extension || !FACULTY_ALLOWED_FILE_EXTENSIONS.includes(extension as (typeof FACULTY_ALLOWED_FILE_EXTENSIONS)[number])) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unsupported file type. Allowed extensions: ${FACULTY_ALLOWED_FILE_EXTENSIONS.join(', ')}.`
    })
  }

  if (!fileData.byteLength) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Uploaded file is empty.'
    })
  }

  if (fileData.byteLength > FACULTY_MAX_FILE_SIZE_BYTES) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Uploaded file exceeds the 10 MB size limit.'
    })
  }
}

function validateSubmissionDraft(payload: FacultyApplicationDraftPayload) {
  const missingFields = SUBMIT_REQUIRED_FIELD_LABELS
    .filter(({ key }) => !normalizeText(payload[key]))
    .map(({ label }) => label)

  if (missingFields.length > 0) {
    throw createError({
      statusCode: 422,
      statusMessage: `Complete the required fields before submitting: ${missingFields.join(', ')}.`
    })
  }
}

async function createActivityLog(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    actorId: string
    applicationId?: string
    actionType: string
    actionSummary?: string
  }
) {
  await tablesDB.createRow({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.activityLogs,
    rowId: ID.unique(),
    data: {
      application_id: input.applicationId || '',
      actor_id: input.actorId,
      action_type: input.actionType,
      action_summary: input.actionSummary || '',
      created_at: new Date().toISOString()
    }
  })
}

async function createStatusHistoryEntry(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    applicationId: string
    userId: string
    fromStatus: string
    toStatus: ApplicationStatus
    reason?: string
  }
) {
  await tablesDB.createRow({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.statusHistory,
    rowId: ID.unique(),
    data: {
      application_id: input.applicationId,
      changed_by: input.userId,
      from_status: input.fromStatus,
      to_status: input.toStatus,
      reason: input.reason || '',
      changed_at: new Date().toISOString()
    }
  })
}

async function setPreviousDocumentsNotCurrent(
  tablesDB: TablesDB,
  config: AdminConfig,
  rows: ApplicationDocumentRow[]
) {
  for (const row of rows) {
    if (!row.is_current) {
      continue
    }

    await tablesDB.updateRow({
      databaseId: config.databaseId,
      tableId: config.resources.tableIds.applicationDocuments,
      rowId: row.$id,
      data: {
        is_current: false
      }
    })
  }
}

function mapDraftPayloadFromApplication(row?: FacultyApplicationRow | null): FacultyApplicationDraftPayload {
  if (!row) {
    return createEmptyFacultyApplicationDraft()
  }

  return sanitizeDraftPayload({
    academicYear: row.academic_year,
    semester: row.semester,
    scholarshipType: row.scholarship_type,
    proposedProgram: row.proposed_program,
    institutionName: row.institution_name,
    studyLoad: row.study_load,
    contactPhone: row.contact_phone,
    purposeStatement: row.purpose_statement,
    expectedOutcomes: row.expected_outcomes,
    supportNeeds: row.support_needs,
    draftStep: row.draft_step
  })
}

export function mapFacultyApplicationRow(row: FacultyApplicationRow): FacultyApplicationRecord {
  const payload = mapDraftPayloadFromApplication(row)

  return {
    id: row.$id,
    referenceNo: row.reference_no || null,
    currentStatus: (row.current_status as ApplicationStatus) || 'Draft',
    lastSavedAt: row.last_saved_at || null,
    submittedAt: row.submitted_at || null,
    createdAt: row.$createdAt || null,
    updatedAt: row.$updatedAt || null,
    ...payload
  }
}

export function mapFacultyApplicationDocumentRow(row: ApplicationDocumentRow): FacultyApplicationDocumentRecord {
  return {
    id: row.$id,
    applicationId: row.application_id,
    requirementCode: row.requirement_code || '',
    requirementName: row.requirement_name || 'Supporting document',
    fileId: row.file_id || null,
    fileName: row.file_name || null,
    mimeType: row.mime_type || null,
    fileSize: typeof row.file_size === 'number' ? row.file_size : null,
    versionNo: typeof row.version_no === 'number' ? row.version_no : 1,
    isCurrent: Boolean(row.is_current),
    uploadedAt: row.uploaded_at || null
  }
}

export async function requireFacultyProfile(
  tablesDB: TablesDB,
  config: AdminConfig,
  userId: string
): Promise<UserProfileRow> {
  const profile = await getUserProfileByUserId(tablesDB, config, userId)

  if (!profile || profile.role !== USER_ROLES.FACULTY_APPLICANT) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Faculty access is required.'
    })
  }

  return profile
}

export async function upsertFacultyProfile(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    userId: string
    fullName: string
    department?: string
  }
) {
  const existingProfile = await getUserProfileByUserId(tablesDB, config, input.userId)

  if (existingProfile) {
    if (existingProfile.role !== USER_ROLES.FACULTY_APPLICANT) {
      throw createError({
        statusCode: 403,
        statusMessage: 'This account is not provisioned as Faculty.'
      })
    }

    const shouldUpdateName = input.fullName !== existingProfile.full_name
    const shouldUpdateDepartment = (input.department || '') !== (existingProfile.department || '')

    if (!shouldUpdateName && !shouldUpdateDepartment) {
      return existingProfile
    }

    return await tablesDB.updateRow({
      databaseId: config.databaseId,
      tableId: config.resources.tableIds.userProfiles,
      rowId: existingProfile.$id,
      data: {
        full_name: shouldUpdateName ? input.fullName : existingProfile.full_name,
        department: shouldUpdateDepartment ? (input.department || '') : (existingProfile.department || '')
      }
    }) as UserProfileRow
  }

  return await tablesDB.createRow({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.userProfiles,
    rowId: ID.unique(),
    data: {
      user_id: input.userId,
      full_name: input.fullName,
      role: USER_ROLES.FACULTY_APPLICANT,
      department: input.department || ''
    }
  }) as UserProfileRow
}

export async function createFacultyAuthAccount(
  users: Users,
  input: {
    email: string
    password: string
    fullName: string
  }
): Promise<Models.User<Models.Preferences>> {
  return await users.create({
    userId: ID.unique(),
    email: input.email,
    password: input.password,
    name: input.fullName
  })
}

export async function getLatestFacultyApplication(
  tablesDB: TablesDB,
  config: AdminConfig,
  userId: string
): Promise<FacultyApplicationRow | null> {
  const result = await tablesDB.listRows({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applications,
    queries: [
      Query.equal('applicant_id', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(1)
    ]
  })

  return (result.rows[0] as FacultyApplicationRow | undefined) ?? null
}

export async function listFacultyApplications(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    userId: string
    limit?: number
  }
): Promise<FacultyApplicationRow[]> {
  const result = await tablesDB.listRows({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applications,
    queries: [
      Query.equal('applicant_id', input.userId),
      Query.orderDesc('$createdAt'),
      Query.limit(input.limit || 20)
    ]
  })

  return result.rows as FacultyApplicationRow[]
}

export async function getFacultyApplicationById(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    applicationId: string
    userId: string
  }
): Promise<FacultyApplicationRow> {
  const application = await tablesDB.getRow({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applications,
    rowId: input.applicationId
  }) as FacultyApplicationRow

  if (application.applicant_id !== input.userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have access to this application.'
    })
  }

  return application
}

export async function getFacultyActivityLogs(
  tablesDB: TablesDB,
  config: AdminConfig,
  userId: string
): Promise<ActivityLogRow[]> {
  const result = await tablesDB.listRows({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.activityLogs,
    queries: [
      Query.equal('actor_id', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(5)
    ]
  })

  return result.rows as ActivityLogRow[]
}

export async function getFacultyApplicationDocuments(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    applicationId: string
    userId: string
  }
): Promise<ApplicationDocumentRow[]> {
  await getFacultyApplicationById(tablesDB, config, input)

  const result = await tablesDB.listRows({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applicationDocuments,
    queries: [
      Query.equal('application_id', input.applicationId),
      Query.orderDesc('$createdAt'),
      Query.limit(200)
    ]
  })

  return result.rows as ApplicationDocumentRow[]
}

export async function getFacultyApplicationDraftState(
  tablesDB: TablesDB,
  config: AdminConfig,
  userId: string
) {
  const application = await getLatestFacultyApplication(tablesDB, config, userId)

  if (!application) {
    return {
      application: null,
      documents: [],
      editable: true
    }
  }

  const documents = await getFacultyApplicationDocuments(tablesDB, config, {
    applicationId: application.$id,
    userId
  })

  return {
    application,
    documents,
    editable: isFacultyApplicationEditable(application.current_status)
  }
}

export async function saveFacultyApplicationDraft(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    userId: string
    payload: Partial<FacultyApplicationDraftPayload>
  }
) {
  const payload = sanitizeDraftPayload(input.payload)
  const currentTimestamp = new Date().toISOString()
  const latestApplication = await getLatestFacultyApplication(tablesDB, config, input.userId)

  if (!latestApplication) {
    const created = await tablesDB.createRow({
      databaseId: config.databaseId,
      tableId: config.resources.tableIds.applications,
      rowId: ID.unique(),
      data: {
        applicant_id: input.userId,
        reference_no: buildReferenceNo(input.userId),
        ...toDraftData(payload, 'Draft')
      },
      permissions: getUserResourcePermissions(input.userId)
    }) as FacultyApplicationRow

    await createActivityLog(tablesDB, config, {
      actorId: input.userId,
      applicationId: created.$id,
      actionType: 'application_draft_created',
      actionSummary: `Draft ${created.reference_no || ''} was created.`
    })

    return created
  }

  if (!isFacultyApplicationEditable(latestApplication.current_status)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'The latest application is already in workflow and cannot be edited here.'
    })
  }

  const nextStatus = latestApplication.current_status === 'Returned for Revision'
    ? 'Returned for Revision'
    : 'Draft'

  return await tablesDB.updateRow({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applications,
    rowId: latestApplication.$id,
    data: {
      ...toDraftData(payload, nextStatus),
      last_saved_at: currentTimestamp
    }
  }) as FacultyApplicationRow
}

export async function submitFacultyApplication(
  tablesDB: TablesDB,
  config: AdminConfig,
  input: {
    applicationId: string
    userId: string
  }
) {
  const application = await getFacultyApplicationById(tablesDB, config, input)

  if (!isFacultyApplicationEditable(application.current_status)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This application can no longer be submitted from the draft workspace.'
    })
  }

  const payload = mapDraftPayloadFromApplication(application)
  validateSubmissionDraft(payload)

  const documents = await getFacultyApplicationDocuments(tablesDB, config, {
    applicationId: input.applicationId,
    userId: input.userId
  })
  const currentDocuments = documents.filter((document) => document.is_current)
  const missingRequirements = FACULTY_REQUIRED_DOCUMENTS
    .filter((requirement) => !currentDocuments.some((document) => document.requirement_code === requirement.code))
    .map((requirement) => requirement.label)

  if (missingRequirements.length > 0) {
    throw createError({
      statusCode: 422,
      statusMessage: `Upload the remaining requirements before submitting: ${missingRequirements.join(', ')}.`
    })
  }

  const currentTimestamp = new Date().toISOString()
  const nextStatus: ApplicationStatus = application.current_status === 'Returned for Revision'
    ? 'Resubmitted'
    : 'Submitted'
  const updated = await tablesDB.updateRow({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applications,
    rowId: application.$id,
    data: {
      current_status: nextStatus,
      submitted_at: currentTimestamp,
      last_saved_at: currentTimestamp,
      draft_step: FACULTY_APPLICATION_STEPS.length
    }
  }) as FacultyApplicationRow

  await createStatusHistoryEntry(tablesDB, config, {
    applicationId: application.$id,
    userId: input.userId,
    fromStatus: application.current_status || 'Draft',
    toStatus: nextStatus,
    reason: nextStatus === 'Resubmitted'
      ? 'Faculty resubmitted the revised application.'
      : 'Faculty submitted the draft application.'
  })

  await createActivityLog(tablesDB, config, {
    actorId: input.userId,
    applicationId: application.$id,
    actionType: nextStatus === 'Resubmitted' ? 'application_resubmitted' : 'application_submitted',
    actionSummary: `${updated.reference_no || 'Application'} is now ${nextStatus}.`
  })

  return updated
}

export async function uploadFacultyApplicationDocument(
  tablesDB: TablesDB,
  storage: Storage,
  config: AdminConfig,
  input: UploadFacultyDocumentInput
) {
  const application = await getFacultyApplicationById(tablesDB, config, {
    applicationId: input.applicationId,
    userId: input.userId
  })

  if (!isFacultyApplicationEditable(application.current_status)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Documents can only be updated while the application is editable.'
    })
  }

  const requirement = getFacultyRequiredDocument(input.requirementCode)

  if (!requirement) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported document requirement.'
    })
  }

  ensureAllowedUpload(input.fileName, input.fileData)

  const safeFileName = sanitizeFileName(input.fileName)
  const existingDocuments = await getFacultyApplicationDocuments(tablesDB, config, {
    applicationId: input.applicationId,
    userId: input.userId
  })
  const sameRequirementDocuments = existingDocuments.filter((document) => document.requirement_code === input.requirementCode)
  const nextVersion = sameRequirementDocuments.reduce((highest, document) => {
    return Math.max(highest, document.version_no || 0)
  }, 0) + 1

  const uploadedFile = await storage.createFile({
    bucketId: config.resources.bucketId,
    fileId: ID.unique(),
    file: InputFile.fromBuffer(Buffer.from(input.fileData), safeFileName),
    permissions: getUserResourcePermissions(input.userId)
  })

  try {
    await setPreviousDocumentsNotCurrent(tablesDB, config, sameRequirementDocuments)

    const row = await tablesDB.createRow({
      databaseId: config.databaseId,
      tableId: config.resources.tableIds.applicationDocuments,
      rowId: ID.unique(),
      data: {
        application_id: input.applicationId,
        uploaded_by: input.userId,
        requirement_code: requirement.code,
        requirement_name: requirement.label,
        file_id: uploadedFile.$id,
        file_name: uploadedFile.name,
        mime_type: uploadedFile.mimeType || input.fileType,
        file_size: uploadedFile.sizeOriginal,
        version_no: nextVersion,
        is_current: true,
        uploaded_at: new Date().toISOString()
      },
      permissions: getUserResourcePermissions(input.userId)
    }) as ApplicationDocumentRow

    await createActivityLog(tablesDB, config, {
      actorId: input.userId,
      applicationId: input.applicationId,
      actionType: 'application_document_uploaded',
      actionSummary: `${requirement.label} was uploaded as version ${nextVersion}.`
    })

    return row
  } catch (error) {
    await storage.deleteFile({
      bucketId: config.resources.bucketId,
      fileId: uploadedFile.$id
    })

    throw error
  }
}
