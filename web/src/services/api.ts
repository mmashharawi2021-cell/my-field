import type { TokenPair, UserProfile } from '../types/auth'
import type { ProjectCreateInput, ProjectSummary, ProjectUpdateInput } from '../types/project'
import { session } from './session'
import { managementPreview } from './managementPreview'

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'
export const PREVIEW_MODE = import.meta.env.VITE_PREVIEW_MODE === 'true'

export type HealthResponse = {
  status: string
  service: string
  version: string
  database: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const previewUser: UserProfile = {
  id: 'preview-user',
  username: 'preview@myfield.local',
  full_name: 'My Field Preview',
  role: 'super_admin',
  is_active: true,
}

let previewProjects: ProjectSummary[] = [
  {
    id: 'p-1',
    name: 'حصر الأضرار التجريبي',
    description: 'مساحة عمل تجريبية لمعاينة إدارة الحصر والطبقات.',
    status: 'active',
    feature_count: 8204,
    layer_count: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p-2',
    name: 'شبكة المياه',
    description: 'معاينة مشروع مكاني للبنية التحتية ونقاط الخدمة.',
    status: 'active',
    feature_count: 2486,
    layer_count: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p-3',
    name: 'بيانات المرافق',
    description: 'مشروع تجريبي لإدارة المرافق والمهام الميدانية.',
    status: 'draft',
    feature_count: 1796,
    layer_count: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

function makePreviewId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'preview-' + Date.now().toString(36)
}

async function parseError(response: Response): Promise<ApiError> {
  let message = 'حدث خطأ أثناء الاتصال بالخادم'

  try {
    const body = await response.json() as { detail?: string | { msg: string }[] | { message?: string; current_version?: number } }
    if (typeof body.detail === 'string') message = body.detail
    else if (Array.isArray(body.detail)) message = body.detail.map((item) => item.msg).join('، ')
    else if (body.detail?.message) message = body.detail.message + (body.detail.current_version ? ` (v${body.detail.current_version})` : '')
  } catch {
    // Keep generic message.
  }

  if (response.status === 401) message = 'بيانات الدخول غير صحيحة أو انتهت الجلسة'
  if (response.status === 403) message = 'ليست لديك صلاحية لتنفيذ هذا الإجراء'
  if (response.status === 404) message = 'العنصر المطلوب غير موجود'

  return new ApiError(message, response.status)
}

async function rawRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(API_BASE + path, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  })

  if (!response.ok) throw await parseError(response)
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = session.getRefreshToken()
  if (!refreshToken) return false

  try {
    const tokens = await rawRequest<TokenPair>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    session.setTokens(tokens.access_token, tokens.refresh_token)
    return true
  } catch {
    session.clear()
    return false
  }
}

export async function authorizedRequest<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const accessToken = session.getAccessToken()

  try {
    return await rawRequest<T>(path, {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {}),
      },
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && retry && await refreshTokens()) {
      return authorizedRequest<T>(path, options, false)
    }

    if (error instanceof ApiError && error.status === 401) {
      session.clear()
    }

    throw error
  }
}

export const api = {
  health: (): Promise<HealthResponse> =>
    PREVIEW_MODE
      ? Promise.resolve({
          status: 'preview',
          service: 'GitHub Pages Preview',
          version: 'Phase 04',
          database: 'local-server-offline',
        })
      : rawRequest<HealthResponse>('/health'),

  auth: {
    login: (username: string, password: string): Promise<TokenPair> => {
      if (PREVIEW_MODE) {
        return Promise.resolve({
          access_token: 'preview-access-token',
          refresh_token: 'preview-refresh-token',
          token_type: 'bearer',
        })
      }

      return rawRequest<TokenPair>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
    },

    me: (): Promise<UserProfile> =>
      PREVIEW_MODE
        ? Promise.resolve(previewUser)
        : authorizedRequest<UserProfile>('/auth/me'),
  },

  projects: {
    list: (): Promise<ProjectSummary[]> =>
      PREVIEW_MODE
        ? Promise.all(previewProjects.filter((project) => project.status !== 'archived').map(async (project) => ({
            ...project, layer_count: (await managementPreview.layers(project.id)).length, feature_count: 0,
          })))
        : authorizedRequest<ProjectSummary[]>('/projects'),

    create: (payload: ProjectCreateInput): Promise<ProjectSummary> => {
      if (PREVIEW_MODE) {
        const now = new Date().toISOString()
        const project: ProjectSummary = {
          id: makePreviewId(),
          ...payload,
          feature_count: 0,
          layer_count: 0,
          created_at: now,
          updated_at: now,
        }
        previewProjects = [project, ...previewProjects]
        return Promise.resolve(project)
      }

      return authorizedRequest<ProjectSummary>('/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    update: (id: string, payload: ProjectUpdateInput): Promise<ProjectSummary> => {
      if (PREVIEW_MODE) {
        const index = previewProjects.findIndex((project) => project.id === id)
        if (index < 0) return Promise.reject(new ApiError('المشروع غير موجود', 404))

        const updated: ProjectSummary = {
          ...previewProjects[index],
          ...payload,
          updated_at: new Date().toISOString(),
        }
        previewProjects = previewProjects.map((project) => project.id === id ? updated : project)
        return Promise.resolve(updated)
      }

      return authorizedRequest<ProjectSummary>('/projects/' + id, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    },

    archive: async (id: string): Promise<void> => {
      if (PREVIEW_MODE) {
        previewProjects = previewProjects.map((project) =>
          project.id === id
            ? { ...project, status: 'archived', updated_at: new Date().toISOString() }
            : project,
        )
        return
      }

      await authorizedRequest<void>('/projects/' + id, { method: 'DELETE' })
    },
  },
}
