export type ProjectStatus = 'draft' | 'active' | 'archived'

export type ProjectSummary = {
  id: string
  name: string
  description: string | null
  status: ProjectStatus | string
  feature_count: number
  layer_count: number
  created_at?: string
  updated_at?: string
}

export type ProjectCreateInput = {
  name: string
  description: string | null
  status: 'draft' | 'active'
}

export type ProjectUpdateInput = Partial<ProjectCreateInput>
