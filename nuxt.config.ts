import { resolvePublicAppwriteConfig } from './schemas/appwrite/env'

const publicAppwriteConfig = resolvePublicAppwriteConfig(process.env)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  ui: {
    fonts: false
  },
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },
  runtimeConfig: {
    public: {
      appwriteEndpoint: publicAppwriteConfig.endpoint,
      appwriteProjectId: publicAppwriteConfig.projectId,
      appwriteDatabaseId: publicAppwriteConfig.databaseId,
      appwriteBucketId: publicAppwriteConfig.resources.bucketId,
      appwriteUserProfilesTableId: publicAppwriteConfig.resources.tableIds.userProfiles,
      appwriteApplicationsTableId: publicAppwriteConfig.resources.tableIds.applications,
      appwriteApplicationDocumentsTableId: publicAppwriteConfig.resources.tableIds.applicationDocuments,
      appwritePanelReviewsTableId: publicAppwriteConfig.resources.tableIds.panelReviews,
      appwriteDecisionRecordsTableId: publicAppwriteConfig.resources.tableIds.decisionRecords,
      appwriteStatusHistoryTableId: publicAppwriteConfig.resources.tableIds.statusHistory,
      appwriteActivityLogsTableId: publicAppwriteConfig.resources.tableIds.activityLogs
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit'
      ]
    }
  }
})
