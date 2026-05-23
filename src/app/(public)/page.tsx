import { createClient } from '@/lib/supabase/server'
import PortfolioClient from './PortfolioClient'

export default async function PublicPage() {
  const supabase = await createClient()
  
  // Fetch site settings
  const { data: siteSettings } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .single()

  // Fetch projects and map them to the format expected by the frontend
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('order', { ascending: true })

  const { data: caseStudies } = await supabase
    .from('case_studies')
    .select('*')
    .order('order', { ascending: true })

  const { data: certifications } = await supabase
    .from('certifications')
    .select('*')
    .order('order', { ascending: true })

  const { data: experiences } = await supabase
    .from('experiences')
    .select('*')
    .order('order', { ascending: true })

  const formattedProjects = projects?.map(p => ({
    id: p.id,
    title: p.title,
    category: p.category,
    desc: p.description,
    image: p.thumbnail_path 
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${p.thumbnail_path}`
      : "https://images.unsplash.com/photo-1551288049-bbda38a5f452?auto=format&fit=crop&q=80&w=800",
    pbix_file_path: p.pbix_file_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/powerbi-files/${p.pbix_file_path}` : null,
    pdf_export_path: p.pdf_export_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/powerbi-files/${p.pdf_export_path}` : null,
  })) || []

  const formattedCaseStudies = caseStudies?.map(c => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    challenge: c.challenge,
    solution: c.solution,
    result: c.key_result,
    tags: c.tags || [],
    image: c.cover_image_path 
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${c.cover_image_path}`
      : "https://images.unsplash.com/photo-1551288049-bbda38a5f452?auto=format&fit=crop&q=80&w=800",
  })) || []

  const formattedCertifications = certifications?.map(c => ({
    id: c.id,
    title: c.title,
    platform: c.issuing_platform,
    date: c.date_earned,
    desc: c.credential_url ? `Credential URL: ${c.credential_url}` : 'View Certificate',
  })) || []

  const formattedExperiences = experiences?.map((e, index) => {
    return {
      year: e.date_range,
      title: e.job_title,
      company: e.company_name,
      desc: e.description,
      side: index % 2 === 0 ? "left" : "right"
    }
  }) || []

  return <PortfolioClient 
    initialSettings={siteSettings}
    initialProjects={formattedProjects} 
    initialCaseStudies={formattedCaseStudies} 
    initialCertifications={formattedCertifications}
    initialExperiences={formattedExperiences} 
  />
}
