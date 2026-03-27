import { APPLICATION_STATUSES, type ApplicationStatus } from './appwrite'

export const FACULTY_APPLICATION_STEP_KEYS = [
  'cycle',
  'study-plan',
  'statement',
  'requirements',
  'review'
] as const

export type FacultyApplicationStepKey = (typeof FACULTY_APPLICATION_STEP_KEYS)[number]

export const FACULTY_APPLICATION_STEPS = [
  {
    value: 1,
    key: 'cycle',
    title: 'Application Cycle',
    description: 'Define the academic period and scholarship track.'
  },
  {
    value: 2,
    key: 'study-plan',
    title: 'Study Plan',
    description: 'Capture the proposed program and expected academic direction.'
  },
  {
    value: 3,
    key: 'statement',
    title: 'Applicant Notes',
    description: 'Add the narrative and support details the reviewers need.'
  },
  {
    value: 4,
    key: 'requirements',
    title: 'Requirements',
    description: 'Upload the supporting documents for the application package.'
  },
  {
    value: 5,
    key: 'review',
    title: 'Review & Submit',
    description: 'Confirm the package and send it into the workflow.'
  }
] as const

export const FACULTY_SCHOLARSHIP_TYPES = [
  'Local Graduate Scholarship',
  'International Graduate Scholarship',
  'Short-Term Faculty Development',
  'Research and Conference Support'
] as const

export const FACULTY_APPLICATION_SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  'Midyear'
] as const

export const FACULTY_STUDY_LOAD_OPTIONS = [
  'Full-time',
  'Part-time',
  'Modular / Hybrid'
] as const

export const FACULTY_EDITABLE_APPLICATION_STATUSES = [
  'Draft',
  'Returned for Revision'
] as const satisfies readonly ApplicationStatus[]

export const FACULTY_UPLOAD_ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg'
export const FACULTY_ALLOWED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'] as const
export const FACULTY_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export const FACULTY_REQUIRED_DOCUMENTS = [
  {
    code: 'application_letter',
    label: 'Application Letter',
    description: 'Formal request letter addressed to the FSMES committee.'
  },
  {
    code: 'curriculum_vitae',
    label: 'Curriculum Vitae',
    description: 'Updated faculty CV highlighting academic and service record.'
  },
  {
    code: 'service_record',
    label: 'Service Record',
    description: 'Official service record or employment certification.'
  },
  {
    code: 'transcript_records',
    label: 'Transcript of Records',
    description: 'Latest transcript or equivalent academic record.'
  },
  {
    code: 'study_plan',
    label: 'Study Plan / Purpose Statement',
    description: 'Detailed study plan aligned with the proposed scholarship.'
  },
  {
    code: 'endorsement_form',
    label: 'IASP Endorsement Form',
    description: 'Signed endorsement or office approval form.'
  }
] as const

export type FacultyRequiredDocumentCode = (typeof FACULTY_REQUIRED_DOCUMENTS)[number]['code']

export type FacultyApplicationDraftPayload = {
  academicYear: string
  semester: string
  scholarshipType: string
  proposedProgram: string
  institutionName: string
  studyLoad: string
  contactPhone: string
  purposeStatement: string
  expectedOutcomes: string
  supportNeeds: string
  draftStep: number
}

export type FacultyApplicationRecord = FacultyApplicationDraftPayload & {
  id: string
  referenceNo: string | null
  currentStatus: ApplicationStatus
  lastSavedAt: string | null
  submittedAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type FacultyApplicationDocumentRecord = {
  id: string
  applicationId: string
  requirementCode: FacultyRequiredDocumentCode | string
  requirementName: string
  fileId: string | null
  fileName: string | null
  mimeType: string | null
  fileSize: number | null
  versionNo: number
  isCurrent: boolean
  uploadedAt: string | null
}

export function createEmptyFacultyApplicationDraft(): FacultyApplicationDraftPayload {
  return {
    academicYear: '',
    semester: '',
    scholarshipType: '',
    proposedProgram: '',
    institutionName: '',
    studyLoad: '',
    contactPhone: '',
    purposeStatement: '',
    expectedOutcomes: '',
    supportNeeds: '',
    draftStep: 1
  }
}

export function getFacultyRequiredDocument(code: string) {
  return FACULTY_REQUIRED_DOCUMENTS.find((document) => document.code === code) || null
}

export function isFacultyApplicationEditable(status?: string | null) {
  return FACULTY_EDITABLE_APPLICATION_STATUSES.includes((status || '') as ApplicationStatus)
}

export function isFacultyApplicationSubmitted(status?: string | null) {
  return Boolean(status && APPLICATION_STATUSES.includes(status as ApplicationStatus) && !isFacultyApplicationEditable(status))
}
