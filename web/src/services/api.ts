import type { ProjectSummary } from '../types/project'

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'
export const PREVIEW_MODE = import.meta.env.VITE_PREVIEW_MODE === 'true'

export type HealthResponse = {
  status: string
  service: string
  version: string
  database: string
}

const previewProjects: ProjectSummary[] = [
  {
    id: 'p-1',
    name: 'حصر الأضرار التجريبي',
    description: 'مساحة عمل تجريبية لمعاينة إدارة الحصر والطبقات.',
    status: 'active',
    feature_count: 8204,
    layer_count: 6,
  },
  {
    id: 'p-2',
    name: 'شبكة المياه',
    description: 'معاينة مشروع مكاني للبنية التحتية ونقاط الخدمة.',
    status: 'active',
    feature_count: 2486,
    layer_count: 8,
  },
  {
    id: 'p-3',
    name: 'بيانات المرافق',
    description: 'مشروع تجريبي لإدارة المرافق والمهام الميدانية.',
    status: 'draft',
    feature_count: 1796,
    layer_count: 4,
  },
]

async function request<T>(path: string): Promise<T> {
  const response = await fetch(API_BASE + path, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('API ' + response.status)
  }

  return response.json() as Promise<T>
}

export const api = {
  health: (): Promise<HealthResponse> =>
    PREVIEW_MODE
      ? Promise.resolve({
          status: 'preview',
          service: 'GitHub Pages Preview',
          version: 'Phase 01',
          database: 'local-server-offline',
        })
      : request<HealthResponse>('/health'),

  projects: (): Promise<ProjectSummary[]> =>
    PREVIEW_MODE
      ? Promise.resolve(previewProjects)
      : request<ProjectSummary[]>('/projects'),
}
