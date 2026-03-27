import { Client, TablesDB } from 'node-appwrite'
import {
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

const tableDefinitions = APPWRITE_TABLE_DEFINITIONS.map((definition) => ({
  ...definition,
  tableId: process.env[definition.envKey] || definition.defaultId
}))

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const tablesDB = new TablesDB(client)

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

async function main() {
  await ensureDatabase()

  for (const definition of tableDefinitions) {
    // Sequential creation avoids API race conditions when provisioning a new project.
    await ensureTable(definition)
  }

  console.log('Database setup script completed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
