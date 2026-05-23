import { createClient } from '@/lib/supabase/server'
import { DashboardMetrics } from './DashboardMetrics'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  
  const [
    { count: projectsCount },
    { count: caseStudiesCount },
    { count: certsCount },
    { count: expCount }
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('case_studies').select('*', { count: 'exact', head: true }),
    supabase.from('certifications').select('*', { count: 'exact', head: true }),
    supabase.from('experiences').select('*', { count: 'exact', head: true })
  ])

  const stats = {
    projects: projectsCount || 0,
    caseStudies: caseStudiesCount || 0,
    certifications: certsCount || 0,
    experiences: expCount || 0,
    messages: 0 // Placeholder until messages table is integrated
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Welcome back to your control center</p>
      </div>
      
      <DashboardMetrics stats={stats} />
    </div>
  )
}
