import { Account, Client, ID, Query, Realtime, Storage, TablesDB } from 'appwrite'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const endpoint = config.public.appwriteEndpoint
  const projectId = config.public.appwriteProjectId
  const configured = Boolean(endpoint && projectId)

  const client = new Client()

  if (configured) {
    client
      .setEndpoint(endpoint)
      .setProject(projectId)
  }

  const account = new Account(client)
  const tablesDB = new TablesDB(client)
  const storage = new Storage(client)
  const realtime = new Realtime(client)

  return {
    provide: {
      appwrite: {
        configured,
        client,
        account,
        tablesDB,
        storage,
        realtime,
        ID,
        Query
      }
    }
  }
})
