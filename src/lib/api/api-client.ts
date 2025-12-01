import { env } from '@/config/env'
import type { ApiError } from '@/types/raffle'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
}

interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
  status: number
  ok: boolean
}

export class ApiRequestError extends Error {
  status: number
  data?: ApiError

  constructor(message: string, status: number, data?: ApiError) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.data = data
  }
}

async function baseFetch<T>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {} } = options

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  }

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        data: null,
        error: data as ApiError,
        status: response.status,
        ok: false
      }
    }

    return {
      data: data as T,
      error: null,
      status: response.status,
      ok: true
    }
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Network error'
      },
      status: 0,
      ok: false
    }
  }
}

export async function publicFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${env.apiUrl}${endpoint}`
  return baseFetch<T>(url, options)
}

export async function authFetch<T>(
  endpoint: string,
  token: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${env.apiUrl}${endpoint}`

  return baseFetch<T>(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token
    }
  })
}

export function throwOnError<T>(response: ApiResponse<T>): T {
  if (!response.ok || response.data === null) {
    throw new ApiRequestError(
      response.error?.message || 'Unknown error',
      response.status,
      response.error ?? undefined
    )
  }
  return response.data
}
