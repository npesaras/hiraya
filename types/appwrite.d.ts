import type { Account, Realtime } from 'appwrite'

export type AppwritePlugin = {
  configured: boolean
  account: Account
  realtime: Realtime
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
