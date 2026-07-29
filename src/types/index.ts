export interface Experience {
  id: string
  job_title: string
  company_name: string
  company_logo_path?: string | null
  experience_type: 'Personal Project' | 'Virtual Experience' | 'Internship' | 'Freelance' | 'Full-Time'
  start_date: string // YYYY-MM-DD
  end_date?: string | null // YYYY-MM-DD
  is_current: boolean
  bullet_points: string[]
  display_order: number
  is_active: boolean
  created_at?: string
}

export type ExperienceFormData = Omit<Experience, 'id' | 'created_at'>
