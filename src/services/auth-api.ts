const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:4000'
).replace(/\/$/, '')

export interface AuthUser {
  id: string
  name: string
  email: string
  createdAt?: string
}

interface ApiErrorResponse {
  success?: false
  message?: string
}

interface AuthResponse {
  success: true
  message: string
  token: string
  user: AuthUser
}

interface CurrentUserResponse {
  success: true
  user: AuthUser
}

export interface RegisterUserInput {
  name: string
  email: string
  password: string
}

export interface LoginUserInput {
  email: string
  password: string
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type':
          'application/json',
        ...options.headers,
      },
    },
  )

  let data: unknown

  try {
    data = await response.json()
  } catch {
    throw new Error(
      'The server returned an invalid response.',
    )
  }

  if (!response.ok) {
    const errorData =
      data as ApiErrorResponse

    throw new Error(
      errorData.message ??
        `Request failed with status ${response.status}.`,
    )
  }

  return data as T
}

export async function registerUser(
  input: RegisterUserInput,
): Promise<AuthResponse> {
  return requestJson<AuthResponse>(
    '/api/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({
        name: input.name.trim(),
        email: input.email
          .trim()
          .toLowerCase(),
        password: input.password,
      }),
    },
  )
}

export async function loginUser(
  input: LoginUserInput,
): Promise<AuthResponse> {
  return requestJson<AuthResponse>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({
        email: input.email
          .trim()
          .toLowerCase(),
        password: input.password,
      }),
    },
  )
}

export async function getCurrentUser(
  token: string,
): Promise<AuthUser> {
  const data =
    await requestJson<CurrentUserResponse>(
      '/api/auth/me',
      {
        method: 'GET',
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    )

  return data.user
}