import { Query, type TablesDB } from 'node-appwrite'
import type { AdminConfig } from '~~/server/utils/appwrite-admin'

export type UserProfileRow = {
  $id: string
  user_id: string
  full_name: string
  role: string
  department?: string
  college_or_office?: string
  employee_no?: string
  phone?: string
}

export async function getUserProfileByUserId(
  tablesDB: TablesDB,
  config: AdminConfig,
  userId: string
): Promise<UserProfileRow | null> {
  const result = await tablesDB.listRows({
    databaseId: config.databaseId,
    tableId: config.resources.tableIds.userProfiles,
    queries: [
      Query.equal('user_id', userId),
      Query.limit(1)
    ]
  })

  return (result.rows[0] as UserProfileRow | undefined) ?? null
}
