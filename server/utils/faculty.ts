import { ID, Query, type Models, type TablesDB, type Users } from 'node-appwrite'
import { createError } from 'h3'
import { USER_ROLES } from '#shared/utils/appwrite'
import type { AdminConfig } from '~~/server/utils/appwrite-admin'
import { getUserProfileByUserId, type UserProfileRow } from '~~/server/utils/user-profiles'

export type FacultyApplicationRow = {
  $id: string
  applicant_id: string
  reference_no?: string
  scholarship_type?: string
  current_status?: string
  created_at?: string
  submitted_at?: string
  updated_at?: string
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

  const result = await tablesDB.listRows({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.applicationDocuments,
    queries: [
      Query.equal('application_id', input.applicationId),
      Query.limit(200)
    ]
  })

  return result.rows as ApplicationDocumentRow[]
}
