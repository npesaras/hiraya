import type { Account, Client, ID, Query, Realtime, Storage, TablesDB } from 'appwrite'

export type AppwritePlugin = {
  configured: boolean
  client: Client
  account: Account
  tablesDB: TablesDB
  storage: Storage
  realtime: Realtime
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
