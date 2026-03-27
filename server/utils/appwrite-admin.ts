import { Client, Storage, TablesDB, Users } from 'node-appwrite'
import {
  collectMissingEnvRequirements,
  REQUIRED_SERVER_APPWRITE_ENV_REQUIREMENTS,
  resolveServerAppwriteConfig
} from '~~/schemas/appwrite/env'
import type { AppwriteTableKey } from '~~/schemas/appwrite/tables'

type AppwriteResourceIds = {
  tableIds: Record<AppwriteTableKey, string>
  bucketId: string
}

type AdminConfig = {
  endpoint: string
  projectId: string
  apiKey: string
  databaseId: string
  resources: AppwriteResourceIds
}

export function getAppwriteAdminConfig(env: Record<string, string | undefined> = process.env) {
  const missingServerEnv = collectMissingEnvRequirements(REQUIRED_SERVER_APPWRITE_ENV_REQUIREMENTS, env)

  if (missingServerEnv.length > 0) {
    return {
      configured: false as const,
      missing: missingServerEnv
    }
  }

  return {
    configured: true as const,
    value: resolveServerAppwriteConfig(env) as AdminConfig
  }
}

export function createAppwriteAdminClient(config: AdminConfig) {
  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey)

  return {
    client,
    tablesDB: new TablesDB(client),
    storage: new Storage(client),
    users: new Users(client)
  }
}

export type { AdminConfig, AppwriteResourceIds }
