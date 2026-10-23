const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api'

/** Error thrown for any non-2xx response, carrying the backend's field-level validation messages. */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'Unable to reach the server. Make sure the backend is running.')
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    let fieldErrors: Record<string, string> = {}
    try {
      const body = await response.json()
      message = body.message ?? message
      fieldErrors = body.fieldErrors ?? {}
    } catch {
      // Non-JSON error body (e.g. proxy error page); keep the generic message.
    }
    throw new ApiError(response.status, message, fieldErrors)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong'
}
