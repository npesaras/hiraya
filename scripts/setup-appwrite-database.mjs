import { Client, Storage, TablesDB } from 'node-appwrite'
import {
  APPWRITE_BUCKET_DEFAULT_ID,
  APPWRITE_REQUIRED_SERVER_ENV_KEYS,
  APPWRITE_TABLE_DEFINITIONS
} from '../schemas/appwrite/schema.mjs'

if (typeof process.loadEnvFile === 'function') {
  process.loadEnvFile('.env')
}

const missing = APPWRITE_REQUIRED_SERVER_ENV_KEYS.filter((key) => !process.env[key])

if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(', ')}`)
  process.exit(1)
}

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID
const BUCKET_ID = process.env.NUXT_PUBLIC_APPWRITE_BUCKET_ID || APPWRITE_BUCKET_DEFAULT_ID
const BUCKET_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg']

const tableDefinitions = APPWRITE_TABLE_DEFINITIONS.map((definition) => ({
  ...definition,
  tableId: process.env[definition.envKey] || definition.defaultId
}))

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const tablesDB = new TablesDB(client)
const storage = new Storage(client)

function toLegacyColumn(column) {
  if (column.type === 'varchar' || column.type === 'text' || column.type === 'mediumtext' || column.type === 'longtext') {
    return {
      ...column,
      type: 'string',
      size: column.size || 8192
    }
  }

  return column
}

async function createTable(definition, columns) {
  await tablesDB.createTable({
    databaseId: DATABASE_ID,
    tableId: definition.tableId,
    name: definition.name,
    columns
  })
}

async function ensureDatabase() {
  try {
    await tablesDB.create({
      databaseId: DATABASE_ID,
      name: 'FSMES Database'
    })
    console.log(`Created database: ${DATABASE_ID}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`Database create skipped: ${message}`)
  }
}

async function ensureTable(definition) {
  try {
    await tablesDB.getTable({
      databaseId: DATABASE_ID,
      tableId: definition.tableId
    })
    console.log(`Table exists: ${definition.tableId}`)
    return
  } catch {
    // Continue to creation.
  }

  try {
    await createTable(definition, definition.columns)
    console.log(`Created table: ${definition.tableId}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const unsupportedTypeError = message.includes('Invalid type for attribute') && message.includes(': varchar')

    if (!unsupportedTypeError) {
      console.log(`Table create skipped (${definition.tableId}): ${message}`)
      return
    }

    try {
      const legacyColumns = definition.columns.map(toLegacyColumn)
      await createTable(definition, legacyColumns)
      console.log(`Created table with legacy string fallback: ${definition.tableId}`)
    } catch (fallbackError) {
      const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
      console.log(`Table create skipped (${definition.tableId}): ${fallbackMessage}`)
    }
  }
}

async function createMissingColumn(tableId, column) {
  switch (column.type) {
    case 'varchar':
      try {
        await tablesDB.createVarcharColumn({
          databaseId: DATABASE_ID,
          tableId,
          key: column.key,
          size: column.size || 255,
          required: column.required
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)

        if (!message.includes('Invalid type for attribute')) {
          throw error
        }

        await tablesDB.createStringColumn({
          databaseId: DATABASE_ID,
          tableId,
          key: column.key,
          size: column.size || 255,
          required: column.required
        })
      }
      return

    case 'text':
      try {
        await tablesDB.createTextColumn({
          databaseId: DATABASE_ID,
          tableId,
          key: column.key,
          required: column.required
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)

        if (!message.includes('Invalid type for attribute')) {
          throw error
        }

        await tablesDB.createStringColumn({
          databaseId: DATABASE_ID,
          tableId,
          key: column.key,
          size: column.size || 8192,
          required: column.required
        })
      }
      return

    case 'datetime':
      await tablesDB.createDatetimeColumn({
        databaseId: DATABASE_ID,
        tableId,
        key: column.key,
        required: column.required
      })
      return

    case 'integer':
      await tablesDB.createIntegerColumn({
        databaseId: DATABASE_ID,
        tableId,
        key: column.key,
        required: column.required
      })
      return

    case 'boolean':
      await tablesDB.createBooleanColumn({
        databaseId: DATABASE_ID,
        tableId,
        key: column.key,
        required: column.required
      })
      return

    default:
      throw new Error(`Unsupported column type: ${column.type}`)
  }
}

async function ensureColumns(definition) {
  const existingColumns = await tablesDB.listColumns({
    databaseId: DATABASE_ID,
    tableId: definition.tableId
  })
  const existingKeys = new Set(existingColumns.columns.map((column) => column.key))

  for (const column of definition.columns) {
    if (existingKeys.has(column.key)) {
      continue
    }

    try {
      await createMissingColumn(definition.tableId, column)
      console.log(`Added column ${column.key} to ${definition.tableId}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.log(`Column create skipped (${definition.tableId}.${column.key}): ${message}`)
    }
  }
}

async function ensureBucket() {
  const bucketConfig = {
    bucketId: BUCKET_ID,
    name: 'Application Documents',
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 10 * 1024 * 1024,
    allowedFileExtensions: BUCKET_ALLOWED_EXTENSIONS,
    encryption: true,
    antivirus: true,
    transformations: true
  }

  try {
    await storage.createBucket(bucketConfig)
    console.log(`Created bucket: ${BUCKET_ID}`)
    return
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`Bucket create skipped (${BUCKET_ID}): ${message}`)
  }

  try {
    await storage.updateBucket(bucketConfig)
    console.log(`Updated bucket settings: ${BUCKET_ID}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`Bucket update skipped (${BUCKET_ID}): ${message}`)
  }
}

async function main() {
  await ensureDatabase()

  for (const definition of tableDefinitions) {
    // Sequential provisioning avoids API race conditions.
    await ensureTable(definition)
    await ensureColumns(definition)
  }

  await ensureBucket()

  console.log('Database setup script completed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
