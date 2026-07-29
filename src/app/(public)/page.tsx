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

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    
  const { data: caseStudies } = await supabase
    .from('case_studies')
    .select('*')
    .eq('status', 'published')
    .eq('is_active', true)
    .order('order', { ascending: true })
    .order('created_at', { ascending: false })

  const { data: certifications } = await supabase
    .from('certifications')
    .select('*')
    .order('order', { ascending: true })

  const { data: experiences } = await supabase
    .from('experiences')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  const { data: socialLinks } = await supabase
    .from('social_links')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  const formattedProjects = projects?.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    desc: p.description,
    image: p.thumbnail_path 
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${p.thumbnail_path}`
      : "https://images.unsplash.com/photo-1551288049-bbda38a5f452?auto=format&fit=crop&q=80&w=800",
    githubLink: p.github_link || p.source_url,
    demoLink: p.live_url
  })) || []

  const formattedCaseStudies = caseStudies?.map(c => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    short_description: c.short_description || c.subtitle,
    client: c.client_or_company_name,
    tags: c.tags || [],
    image: c.cover_image_path 
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${c.cover_image_path}`
      : "https://images.unsplash.com/photo-1551288049-bbda38a5f452?auto=format&fit=crop&q=80&w=800",
  })) || []

  const formattedCertifications = certifications?.map(c => {
    let formattedDate = c.date_earned;
    if (c.date_earned) {
      try {
        const d = new Date(c.date_earned);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      } catch (e) {}
    }
    
    return {
      id: c.id,
      title: c.title,
      platform: c.issuing_platform,
      date: formattedDate,
      desc: c.description || '',
    thumbnail: c.thumbnail_path 
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${c.thumbnail_path}`
      : null,
    logo: c.organization_logo_path 
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${c.organization_logo_path}`
      : null,
    pdfUrl: c.pdf_file_path 
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${c.pdf_file_path}`
      : null,
    credentialUrl: c.credential_url,
    credentialId: c.credential_id,
    skills: c.skills_learned || [],
  }}) || []

  const formattedExperiences = experiences?.map((e, index) => {
    let formattedStartDate = e.start_date;
    if (e.start_date) {
      try {
        const d = new Date(e.start_date);
        if (!isNaN(d.getTime())) formattedStartDate = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } catch (err) {}
    }

    let formattedEndDate = e.end_date;
    if (e.end_date && !e.is_current) {
      try {
        const d = new Date(e.end_date);
        if (!isNaN(d.getTime())) formattedEndDate = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } catch (err) {}
    }

    let yearDisplay = e.date_range || 'Unknown';
    if (e.start_date) {
      yearDisplay = e.is_current ? `${formattedStartDate} - Present` : `${formattedStartDate} - ${formattedEndDate || 'Present'}`;
    }

    return {
      id: e.id,
      year: yearDisplay,
      title: e.job_title,
      company: e.company_name,
      experience_type: e.experience_type,
      logo: e.company_logo_path 
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${e.company_logo_path}`
        : null,
      bullet_points: Array.isArray(e.bullet_points) ? e.bullet_points : [],
      side: index % 2 === 0 ? "left" : "right"
    }
  }) || []

  const { data: developerSocialLinks } = await supabase
    .from('developer_social_links')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return <PortfolioClient 
    initialSettings={siteSettings}
    initialProjects={formattedProjects} 
    initialCaseStudies={formattedCaseStudies} 
    initialCertifications={formattedCertifications}
    initialExperiences={formattedExperiences} 
    initialSocialLinks={socialLinks || []}
    initialDeveloperSocialLinks={developerSocialLinks || []}
  />
}
