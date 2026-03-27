import { Account, Client, type Models } from 'node-appwrite'
import { createError, getHeader, type H3Event } from 'h3'
import {
  collectMissingEnvRequirements,
  REQUIRED_SERVER_APPWRITE_ENV_REQUIREMENTS,
  resolveServerAppwriteConfig
} from '~~/schemas/appwrite/env'

function getSessionConfig(env: Record<string, string | undefined> = process.env) {
  const missing = collectMissingEnvRequirements([
    REQUIRED_SERVER_APPWRITE_ENV_REQUIREMENTS[0],
    REQUIRED_SERVER_APPWRITE_ENV_REQUIREMENTS[1]
  ], env)

  if (missing.length > 0) {
    throw createError({
      statusCode: 500,
      statusMessage: `Missing required server Appwrite configuration: ${missing.join(', ')}.`
    })
  }

  return resolveServerAppwriteConfig(env)
}

function getBearerToken(event: H3Event) {
  const authorization = getHeader(event, 'authorization')

  if (!authorization?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing Bearer token.'
    })
  }

  return authorization.slice('Bearer '.length).trim()
}

export async function requireAppwriteSessionUser(event: H3Event): Promise<Models.User<Models.Preferences>> {
  const config = getSessionConfig()
  const jwt = getBearerToken(event)

  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setJWT(jwt)

  const userAgent = getHeader(event, 'user-agent')

  if (userAgent) {
    client.setForwardedUserAgent(userAgent)
  }

  const account = new Account(client)

  try {
    return await account.get()
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired Appwrite session token.'
    })
  }
}
