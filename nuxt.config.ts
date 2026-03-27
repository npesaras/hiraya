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
      appwriteProjectId: publicAppwriteConfig.projectId
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
