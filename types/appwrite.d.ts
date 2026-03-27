import type { Account, Client, ID, Query, Storage, TablesDB } from 'appwrite'

export type AppwritePlugin = {
  configured: boolean
  client: Client
  account: Account
  tablesDB: TablesDB
  storage: Storage
  ID: typeof ID
  Query: typeof Query
}

declare module '#app' {
  interface NuxtApp {
    $appwrite?: AppwritePlugin
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $appwrite?: AppwritePlugin
  }
}

export {}
