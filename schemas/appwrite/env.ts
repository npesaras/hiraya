import {
  APPWRITE_DEFAULT_BUCKET_ID,
  APPWRITE_DEFAULT_TABLE_IDS,
  APPWRITE_TABLE_ID_ENV_KEYS,
  type AppwriteTableKey
} from './tables'

type EnvMap = Record<string, string | undefined>

type ServerEnvRequirement = {
  label: string
  keys: readonly string[]
}

export const REQUIRED_PUBLIC_APPWRITE_ENV_KEYS = [
  'NUXT_PUBLIC_APPWRITE_ENDPOINT',
  'NUXT_PUBLIC_APPWRITE_PROJECT_ID'
] as const

export const REQUIRED_SERVER_APPWRITE_ENV_REQUIREMENTS = [
  {
    label: 'APPWRITE_ENDPOINT or NUXT_PUBLIC_APPWRITE_ENDPOINT',
    keys: ['APPWRITE_ENDPOINT', 'NUXT_PUBLIC_APPWRITE_ENDPOINT']
  },
  {
    label: 'APPWRITE_PROJECT_ID or NUXT_PUBLIC_APPWRITE_PROJECT_ID',
    keys: ['APPWRITE_PROJECT_ID', 'NUXT_PUBLIC_APPWRITE_PROJECT_ID']
  },
  {
    label: 'APPWRITE_API_KEY',
    keys: ['APPWRITE_API_KEY']
  },
  {
    label: 'APPWRITE_DATABASE_ID or NUXT_PUBLIC_APPWRITE_DATABASE_ID',
    keys: ['APPWRITE_DATABASE_ID', 'NUXT_PUBLIC_APPWRITE_DATABASE_ID']
  }
] as const

export function collectMissingEnv(keys: readonly string[], env: EnvMap): string[] {
  return keys.filter((key) => !env[key])
}

export function collectMissingEnvRequirements(
  requirements: readonly ServerEnvRequirement[],
  env: EnvMap
): string[] {
  return requirements
    .filter(({ keys }) => !resolveFirstEnvValue(keys, env))
    .map(({ label }) => label)
}

export function getTrimmedEnvValue(key: string, env: EnvMap): string | undefined {
  const value = env[key]?.trim()
  return value ? value : undefined
}

export function resolveFirstEnvValue(keys: readonly string[], env: EnvMap): string {
  for (const key of keys) {
    const value = getTrimmedEnvValue(key, env)

    if (value) {
      return value
    }
  }

  return ''
}

export function resolveAppwriteResourceIds(env: EnvMap) {
  const tableIds = Object.keys(APPWRITE_DEFAULT_TABLE_IDS).reduce((acc, key) => {
    const tableKey = key as AppwriteTableKey
    const envKey = APPWRITE_TABLE_ID_ENV_KEYS[tableKey]
    acc[tableKey] = getTrimmedEnvValue(envKey, env) || APPWRITE_DEFAULT_TABLE_IDS[tableKey]
    return acc
  }, {} as Record<AppwriteTableKey, string>)

  return {
    tableIds,
    bucketId: getTrimmedEnvValue('NUXT_PUBLIC_APPWRITE_BUCKET_ID', env) || APPWRITE_DEFAULT_BUCKET_ID
  }
}

export function resolvePublicAppwriteConfig(env: EnvMap) {
  return {
    endpoint: getTrimmedEnvValue('NUXT_PUBLIC_APPWRITE_ENDPOINT', env) || '',
    projectId: getTrimmedEnvValue('NUXT_PUBLIC_APPWRITE_PROJECT_ID', env) || ''
  }
}

export function resolveServerAppwriteConfig(env: EnvMap) {
  return {
    endpoint: resolveFirstEnvValue(['APPWRITE_ENDPOINT', 'NUXT_PUBLIC_APPWRITE_ENDPOINT'], env),
    projectId: resolveFirstEnvValue(['APPWRITE_PROJECT_ID', 'NUXT_PUBLIC_APPWRITE_PROJECT_ID'], env),
    apiKey: resolveFirstEnvValue(['APPWRITE_API_KEY'], env),
    databaseId: resolveFirstEnvValue(['APPWRITE_DATABASE_ID', 'NUXT_PUBLIC_APPWRITE_DATABASE_ID'], env),
    resources: resolveAppwriteResourceIds(env)
  }
}
