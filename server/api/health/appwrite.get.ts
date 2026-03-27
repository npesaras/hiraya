import { getQuery } from 'h3'
import { createAppwriteAdminClient, getAppwriteAdminConfig } from '../../utils/appwrite-admin'

type HealthScope = 'auth' | 'full'

function normalizeScope(value: unknown): HealthScope {
  return value === 'full' ? 'full' : 'auth'
}

export default defineEventHandler(async (event) => {
  const scope = normalizeScope(getQuery(event).scope)
  const config = getAppwriteAdminConfig()

  if (!config.configured) {
    return {
      ok: false,
      configured: false,
      scope,
      message: 'Server Appwrite configuration is incomplete.',
      missing: config.missing,
      warnings: [],
      checks: {
        database: false,
        bucket: false,
        tables: {}
      }
    }
  }

  const requiredTableKeys = scope === 'full'
    ? new Set(['userProfiles', 'applications', 'applicationDocuments', 'activityLogs'])
    : new Set(['userProfiles'])

  const { tablesDB, storage } = createAppwriteAdminClient(config.value)
  const tableChecks: Record<string, boolean> = {}
  const warnings: string[] = []

  try {
    await tablesDB.get({ databaseId: config.value.databaseId })
  } catch (error) {
    return {
      ok: false,
      configured: true,
      scope,
      message: error instanceof Error ? error.message : 'Failed to reach Appwrite database.',
      warnings,
      checks: {
        database: false,
        bucket: false,
        tables: {}
      }
    }
  }

  for (const [key, tableId] of Object.entries(config.value.resources.tableIds)) {
    try {
      await tablesDB.getTable({
        databaseId: config.value.databaseId,
        tableId
      })
      tableChecks[key] = true
    } catch (error) {
      tableChecks[key] = false

      if (requiredTableKeys.has(key)) {
        return {
          ok: false,
          configured: true,
          scope,
          message: error instanceof Error
            ? `Required table "${tableId}" is not reachable: ${error.message}`
            : `Required table "${tableId}" is not reachable.`,
          warnings,
          checks: {
            database: true,
            bucket: false,
            tables: tableChecks
          }
        }
      }

      warnings.push(
        error instanceof Error
          ? `Optional table "${tableId}" is not reachable: ${error.message}`
          : `Optional table "${tableId}" is not reachable.`
      )
    }
  }

  let bucketOk = false

  try {
    await storage.getBucket({ bucketId: config.value.resources.bucketId })
    bucketOk = true
  } catch (error) {
    bucketOk = false

    const message = error instanceof Error
      ? `Storage bucket "${config.value.resources.bucketId}" is not reachable: ${error.message}`
      : `Storage bucket "${config.value.resources.bucketId}" is not reachable.`

    if (scope === 'full') {
      return {
        ok: false,
        configured: true,
        scope,
        message,
        warnings,
        checks: {
          database: true,
          bucket: false,
          tables: tableChecks
        }
      }
    }

    warnings.push(message)
  }

  return {
    ok: true,
    configured: true,
    scope,
    message: scope === 'full'
      ? 'Server can reach Appwrite database, required tables, and storage bucket.'
      : 'Server can reach the Appwrite resources required for authentication.',
    warnings,
    checks: {
      database: true,
      bucket: bucketOk,
      tables: tableChecks
    }
  }
})
