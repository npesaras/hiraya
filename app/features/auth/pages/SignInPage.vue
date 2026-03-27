<script setup lang="ts">
import { getRoleLabel } from '#shared/utils/appwrite'

type AuthMode = 'signin' | 'signup'
type AppwriteHealthResponse = {
  ok: boolean
  configured: boolean
  scope?: 'auth' | 'full'
  message: string
  missing?: string[]
  warnings?: string[]
  checks?: {
    database: boolean
    bucket: boolean
    tables: Record<string, boolean>
  }
}

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { ensureSession, profile, signIn, registerFaculty, routeForRole, messageFromUnknown } = useAuth()
const nuxtApp = useNuxtApp()
const clientReady = ref(false)
const appwriteConfigured = computed(() => (
  clientReady.value
    ? Boolean(nuxtApp.$appwrite?.configured)
    : true
))

const mode = ref<AuthMode>('signin')
const pending = ref(false)
const errorMessage = ref('')
const serverConnectionOk = ref<boolean | null>(null)
const serverConnectionMessage = ref('')

const form = reactive({
  fullName: '',
  department: '',
  email: '',
  password: ''
})

const roleError = computed(() => route.query.error === 'role')

function requiredHealthMessage(result: AppwriteHealthResponse) {
  const missing = result.missing?.length
    ? ` Missing: ${result.missing.join(', ')}`
    : ''

  const warnings = result.warnings?.length
    ? ` Warnings: ${result.warnings.join(' | ')}`
    : ''

  return `${result.message}${missing}${warnings}`
}

async function checkServerConnection() {
  try {
    const result = await $fetch<AppwriteHealthResponse>('/api/health/appwrite', {
      query: {
        scope: 'auth'
      }
    })
    serverConnectionOk.value = result.ok
    serverConnectionMessage.value = requiredHealthMessage(result)
  } catch (cause: unknown) {
    serverConnectionOk.value = false

    if (
      typeof cause === 'object' &&
      cause !== null &&
      'data' in cause &&
        typeof cause.data === 'object' &&
        cause.data !== null &&
        'message' in cause.data &&
        typeof cause.data.message === 'string'
    ) {
      serverConnectionMessage.value = cause.data.message
      return
    }

    if (
      typeof cause === 'object' &&
      cause !== null &&
      'statusMessage' in cause &&
      typeof cause.statusMessage === 'string'
    ) {
      serverConnectionMessage.value = cause.statusMessage
      return
    }

    serverConnectionMessage.value = messageFromUnknown(cause, 'Server cannot connect to Appwrite.')
  }
}

function ensureRoleRoute() {
  const destination = routeForRole(profile.value?.role)

  if (!destination) {
    throw new Error('Your account profile exists but has no valid FSMES role.')
  }

  return destination
}

onMounted(async () => {
  clientReady.value = true
  await checkServerConnection()
  const activeUser = await ensureSession()

  if (!activeUser) {
    return
  }

  try {
    await router.push(ensureRoleRoute())
  } catch {
    await router.push('/signin?error=role')
  }
})

async function submit() {
  await checkServerConnection()

  if (pending.value) {
    return
  }

  if (!appwriteConfigured.value || serverConnectionOk.value !== true) {
    errorMessage.value = serverConnectionOk.value === false
      ? 'Sign-in is blocked until server-to-Appwrite health check passes.'
      : 'Appwrite client is not configured. Check your environment variables.'
    return
  }

  pending.value = true
  errorMessage.value = ''

  try {
    if (mode.value === 'signup') {
      if (!form.fullName.trim()) {
        throw new Error('Full name is required for account registration.')
      }

      await registerFaculty({
        fullName: form.fullName.trim(),
        department: form.department.trim(),
        email: form.email.trim(),
        password: form.password
      })

      toast.add({
        title: 'Account successfully created',
        description: 'You can now sign in using your new faculty account.',
        color: 'success',
        icon: 'i-lucide-circle-check'
      })

      mode.value = 'signin'
      form.fullName = ''
      form.department = ''
      form.password = ''
      return
    }

    await signIn({
      email: form.email.trim(),
      password: form.password
    })

    const destination = ensureRoleRoute()

    toast.add({
      title: 'Welcome back',
      description: `Signed in as ${getRoleLabel(profile.value?.role) || 'FSMES user'}.`,
      color: 'success',
      icon: 'i-lucide-circle-check'
    })

    await router.push(destination)
  } catch (error) {
    errorMessage.value = messageFromUnknown(error, 'Authentication failed. Please try again.')
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UCard class="border-muted bg-default shadow-lg ring-1 ring-muted/60 backdrop-blur">
    <div class="space-y-6">
      <div class="space-y-1">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          FSMES
        </p>
        <h1 class="text-2xl font-semibold text-highlighted">
          Account Access
        </h1>
        <p class="text-sm text-muted">
          Sign in as Faculty or Panelist. Faculty sign-up is available below.
        </p>
      </div>

      <UAlert
        v-if="clientReady && !appwriteConfigured"
        color="warning"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Appwrite is not configured"
        description="Set NUXT_PUBLIC_APPWRITE_ENDPOINT and NUXT_PUBLIC_APPWRITE_PROJECT_ID before using auth."
      />

      <UAlert
        v-if="clientReady && serverConnectionOk === false"
        color="error"
        variant="soft"
        icon="i-lucide-server-crash"
        title="Server-to-Appwrite connection failed"
        :description="serverConnectionMessage"
      />

      <UAlert
        v-if="roleError"
        color="error"
        variant="soft"
        icon="i-lucide-shield-alert"
        title="Role restriction"
        description="Your account role is not mapped to a supported FSMES dashboard."
      />

      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        icon="i-lucide-circle-x"
        :title="errorMessage"
      />

      <div class="grid grid-cols-2 gap-2 rounded-xl border border-muted bg-elevated/40 p-1">
        <UButton
          :variant="mode === 'signin' ? 'solid' : 'ghost'"
          block
          @click="mode = 'signin'"
        >
          Sign in
        </UButton>
        <UButton
          :variant="mode === 'signup' ? 'solid' : 'ghost'"
          block
          @click="mode = 'signup'"
        >
          Faculty sign-up
        </UButton>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <UFormField v-if="mode === 'signup'" label="Full name" required>
          <UInput
            v-model="form.fullName"
            placeholder="Enter your full name"
            icon="i-lucide-user"
          />
        </UFormField>

        <UFormField v-if="mode === 'signup'" label="Department">
          <UInput
            v-model="form.department"
            placeholder="Ex. College of Engineering"
            icon="i-lucide-building-2"
          />
        </UFormField>

        <UFormField label="Email" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="name@msuiit.edu.ph"
            autocomplete="email"
            icon="i-lucide-mail"
          />
        </UFormField>

        <UFormField label="Password" required>
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Enter password"
            autocomplete="current-password"
            icon="i-lucide-key-round"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          :loading="pending"
          :disabled="pending"
          icon="i-lucide-arrow-right"
        >
          {{ mode === 'signup' ? 'Create Faculty Account' : 'Sign in to FSMES' }}
        </UButton>
      </form>
    </div>
  </UCard>
</template>
